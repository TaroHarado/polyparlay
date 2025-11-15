import { getOutcomePrices } from './clobClient'
import type { CalculatedLeg } from '@/server/parlay/parlayService'

export interface UnsignedOrder {
  price: string // Decimal string
  size: string // Decimal string
  side: 'BUY' | 'SELL'
  market: string // Market/condition ID
  outcome: number // Outcome index
  maker: string // User address
  expiration: number // Unix timestamp
  nonce: number // Unique nonce
}

export interface ParlayLegWithPrice {
  marketId: string
  outcomeIndex: number
  priceUsed: number
  size: number
}

/**
 * Build unsigned CLOB orders for a parlay with slippage checking
 */
export async function buildOrdersForParlay({
  legs,
  stake,
  userAddress,
  maxSlippageBps,
  perLegStake,
}: {
  legs: CalculatedLeg[]
  stake: number
  userAddress: string
  maxSlippageBps: number
  perLegStake: number
}): Promise<UnsignedOrder[]> {
  const orders: UnsignedOrder[] = []
  const now = Math.floor(Date.now() / 1000)
  const expiration = now + 60 * 60 * 24 * 7 // 7 days from now

  for (let i = 0; i < legs.length; i++) {
    const leg = legs[i]
    const nonce = Date.now() + i // Simple nonce generation

    // Получаем актуальную цену из CLOB
    const prices = await getOutcomePrices(leg.marketId)
    const outcome = prices.find((p) => p.outcomeIndex === leg.outcomeIndex)

    if (!outcome) {
      throw new Error(
        `No price info for market ${leg.marketId}, outcome ${leg.outcomeIndex}`
      )
    }

    // Используем bestAskPrice как текущую цену покупки
    const currentPrice = outcome.bestAskPrice ?? outcome.bestBidPrice
    if (!currentPrice || currentPrice <= 0) {
      throw new Error(
        `Not enough liquidity for market ${leg.marketId}, outcome ${leg.outcomeIndex}`
      )
    }

    // Проверка slippage
    const diff = Math.abs(currentPrice - leg.priceUsed)
    const allowedDiff = (maxSlippageBps / 10_000) * leg.priceUsed

    if (diff > allowedDiff) {
      throw new Error(
        `Price moved too much for market ${leg.marketId} (old=${leg.priceUsed.toFixed(
          4
        )}, new=${currentPrice.toFixed(4)}). Slippage limit ${(
          maxSlippageBps / 100
        ).toFixed(2)}% exceeded.`
      )
    }

    // Используем актуальную цену для ордера
    const price = currentPrice.toString()
    const size = stake.toString()

    orders.push({
      price,
      size,
      side: 'BUY',
      market: leg.marketId,
      outcome: leg.outcomeIndex,
      maker: userAddress,
      expiration,
      nonce,
    })
  }

  return orders
}

