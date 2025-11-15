import { prisma } from '@/lib/prisma'
import { getOutcomePrices } from '@/server/polymarket/clobClient'
import { buildOrdersForParlay } from '@/server/polymarket/clobOrderBuilder'
import { tradingConfig } from '@/server/config/tradingConfig'
import {
  getUserPositionsForMarkets,
  getMarketResolutions,
} from '@/server/polymarket/dataApiClient'

export type ParlayStatus =
  | 'draft'
  | 'pending_signature'
  | 'active'
  | 'won'
  | 'lost'
  | 'failed'

export interface ParlayLegInput {
  marketId: string
  outcomeIndex: number
}

export interface CalculatedLeg {
  marketId: string
  outcomeIndex: number
  priceUsed: number // 0..1
  odds: number // 1 / price
}

export interface ParlayCalculationResult {
  legs: CalculatedLeg[]
  kTotal: number
  expectedPayout: number
}

/**
 * Calculate parlay odds based on current market prices
 */
export async function calculateParlayOdds(
  legs: ParlayLegInput[],
  stake: number
): Promise<ParlayCalculationResult> {
  if (!legs.length) {
    throw new Error('Parlay must have at least one leg')
  }
  if (stake <= 0) {
    throw new Error('Stake must be greater than zero')
  }

  const calculatedLegs: CalculatedLeg[] = []

  for (const leg of legs) {
    const prices = await getOutcomePrices(leg.marketId)

    const outcome = prices.find((p) => p.outcomeIndex === leg.outcomeIndex)
    if (!outcome) {
      throw new Error(
        `No price info for market ${leg.marketId}, outcome ${leg.outcomeIndex}`
      )
    }

    // Для первой версии возьмём bestAskPrice как цену покупки.
    const price = outcome.bestAskPrice ?? outcome.bestBidPrice
    if (!price || price <= 0) {
      throw new Error(
        `Not enough liquidity for market ${leg.marketId}, outcome ${leg.outcomeIndex}`
      )
    }

    const odds = 1 / price

    calculatedLegs.push({
      marketId: leg.marketId,
      outcomeIndex: leg.outcomeIndex,
      priceUsed: price,
      odds,
    })
  }

  const kTotal = calculatedLegs.reduce((acc, leg) => acc * leg.odds, 1)
  const expectedPayout = stake * kTotal

  return {
    legs: calculatedLegs,
    kTotal,
    expectedPayout,
  }
}

/**
 * Validate parlay prices, liquidity, and slippage limits
 */
export async function validateParlayPricesAndLiquidity(
  legs: ParlayLegInput[],
  stake: number,
  maxSlippageBps: number
) {
  // 1. Использовать calculateParlayOdds, чтобы получить текущие цены и odds
  const { legs: calculatedLegs, kTotal, expectedPayout } =
    await calculateParlayOdds(legs, stake)

  // 2. Проверить fair-границы
  for (const leg of calculatedLegs) {
    if (
      leg.priceUsed >= tradingConfig.MAX_FAIR_PRICE ||
      leg.priceUsed <= tradingConfig.MIN_FAIR_PRICE
    ) {
      throw new Error(
        `Price for market ${leg.marketId} is too extreme (${leg.priceUsed.toFixed(
          4
        )}). Refusing to create parlay.`
      )
    }
  }

  // 3. Проверить минимальный размер ордера:
  //    Для простоты можно считать, что stake распределяется равномерно по ногам.
  const perLegStake = stake / calculatedLegs.length
  if (perLegStake < tradingConfig.MIN_ORDER_SIZE_USDC) {
    throw new Error(
      `Stake per leg (${perLegStake.toFixed(
        2
      )} USDC) is below minimum allowed (${tradingConfig.MIN_ORDER_SIZE_USDC} USDC).`
    )
  }

  // Возвращаем расчёт для дальнейшего использования
  return { calculatedLegs, kTotal, expectedPayout, perLegStake }
}

/**
 * Create a parlay and prepare unsigned orders
 */
export async function createParlayWithOrders(
  userAddress: string,
  stake: number,
  legsInput: ParlayLegInput[],
  maxSlippageBps: number
) {
  if (!userAddress) throw new Error('userAddress is required')

  // базовые проверки
  if (legsInput.length < 1) throw new Error('At least one leg is required')
  if (legsInput.length > 6) throw new Error('Too many legs in parlay')
  if (stake <= 0) throw new Error('Stake must be greater than zero')

  // Валидация цен и ликвидности
  const {
    calculatedLegs,
    kTotal,
    expectedPayout,
    perLegStake,
  } = await validateParlayPricesAndLiquidity(legsInput, stake, maxSlippageBps)

  // создаём Parlay + ParlayLegs в БД
  const parlay = await prisma.parlay.create({
    data: {
      userAddress,
      stake,
      kTotal,
      expectedPayout,
      maxSlippageBps,
      status: 'pending_signature',
      legs: {
        create: calculatedLegs.map((leg) => ({
          marketId: leg.marketId,
          outcomeIndex: leg.outcomeIndex,
          priceUsed: leg.priceUsed,
          size: stake,
        })),
      },
    },
    include: {
      legs: true,
    },
  })

  // Build unsigned orders for signing (с проверкой slippage)
  const unsignedOrders = await buildOrdersForParlay({
    legs: calculatedLegs,
    stake,
    userAddress,
    maxSlippageBps,
    perLegStake,
  })

  return {
    parlay,
    calculatedLegs,
    unsignedOrders,
  }
}

/**
 * Get all parlays for a user
 */
export async function getUserParlays(userAddress: string) {
  if (!userAddress) throw new Error('userAddress is required')

  const parlays = await prisma.parlay.findMany({
    where: { userAddress },
    orderBy: { createdAt: 'desc' },
    include: {
      legs: true,
    },
  })

  return parlays
}

/**
 * Update parlay status based on market resolution
 * Checks Data API to see which legs won/lost and calculates actual payout
 */
export async function updateParlayStatusFromResolution(parlayId: string) {
  const parlay = await prisma.parlay.findUnique({
    where: { id: parlayId },
    include: { legs: true },
  })

  if (!parlay) {
    throw new Error('Parlay not found')
  }

  if (parlay.status !== 'active') {
    // уже обработан/не актуален
    return parlay
  }

  const marketIds = parlay.legs.map((l) => l.marketId)
  const resolutions = await getMarketResolutions(marketIds)

  // проверяем: все ли эти рынки уже resolved
  const unresolved = resolutions.filter((r) => !r.resolved)
  if (unresolved.length > 0) {
    // ещё рано — просто выходим
    return parlay
  }

  // теперь узнаём, какие исходы победили
  // и какова позиция юзера по этим рыкам
  const positions = await getUserPositionsForMarkets(
    parlay.userAddress,
    marketIds
  )

  // логика win/loss:
  let allWin = true

  for (const leg of parlay.legs) {
    const res = resolutions.find((r) => r.marketId === leg.marketId)
    if (!res) continue

    // если выигравший исход != исходу leg — весь parlay проиграл
    if (res.outcomeIndex !== leg.outcomeIndex) {
      allWin = false
      break
    }
  }

  let actualPayout = 0
  let resolvedAt: Date | undefined = undefined

  if (allWin) {
    // считаем payout по позициям
    for (const leg of parlay.legs) {
      const pos = positions.find(
        (p) => p.marketId === leg.marketId && p.outcomeIndex === leg.outcomeIndex
      )
      if (pos) {
        // Используем payout если есть, иначе value как approximation
        actualPayout += pos.payout ?? pos.value ?? 0
      }
    }

    const resolvedTimes = resolutions
      .map((r) => r.resolvedAt)
      .filter(Boolean) as Date[]
    resolvedAt =
      resolvedTimes.length > 0
        ? new Date(Math.max(...resolvedTimes.map((d) => d.getTime())))
        : new Date()
  } else {
    actualPayout = 0
    resolvedAt = new Date()
  }

  const realizedPnl = actualPayout - parlay.stake

  const updated = await prisma.parlay.update({
    where: { id: parlay.id },
    data: {
      status: allWin ? 'won' : 'lost',
      actualPayout,
      realizedPnl,
      resolvedAt,
    },
    include: { legs: true },
  })

  return updated
}

