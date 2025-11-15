import { DEMO_MODE } from '@/config/demo'

const DATA_API_BASE_URL = 'https://data-api.polymarket.com'

/**
 * Helper function to fetch JSON from an API endpoint
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`[DATA_API] Error fetching ${url}:`, error)
    throw error
  }
}

export interface UserPosition {
  marketId: string
  outcomeIndex: number
  size: number // сколько у юзера
  value: number // текущая стоимость позиции (в USDC)
  payout: number // итоговый payout после резолва, если доступно
  realizedPnl?: number
}

export interface MarketResolution {
  marketId: string
  outcomeIndex: number // выигравший исход
  resolved: boolean
  resolvedAt?: Date
}

/**
 * Get user positions from Data API
 * TODO: Check actual endpoint from Polymarket Data API documentation
 * Expected endpoint: /positions?user={address} or similar
 */
export async function getUserPositions(address: string): Promise<any> {
  try {
    // TODO: Replace with actual endpoint from Polymarket Data API docs
    const url = `${DATA_API_BASE_URL}/positions?user=${address}`
    return await fetchJson<any>(url)
  } catch (error) {
    console.error(`[DATA_API] Error fetching positions for ${address}:`, error)
    throw new Error(`Failed to fetch positions for user ${address}`)
  }
}

/**
 * Get user positions for specific markets
 */
export async function getUserPositionsForMarkets(
  address: string,
  marketIds: string[]
): Promise<UserPosition[]> {
  try {
    // TODO: Verify actual endpoint structure from Polymarket Data API docs
    // Possible endpoints:
    // - /positions?user={address}&markets={marketIds.join(',')}
    // - /positions?user={address} (then filter client-side)
    const url = `${DATA_API_BASE_URL}/positions?user=${address}`
    const data = await fetchJson<any>(url)

    // Parse response - structure may vary
    // Expected: array of positions with marketId, outcomeIndex, size, value, payout
    const positions: UserPosition[] = []

    if (Array.isArray(data)) {
      for (const pos of data) {
        // TODO: Adjust field names based on actual API response
        const marketId = pos.marketId || pos.conditionId || pos.market
        if (marketIds.includes(marketId)) {
          positions.push({
            marketId,
            outcomeIndex: pos.outcomeIndex ?? pos.outcome ?? 0,
            size: parseFloat(pos.size || pos.quantity || '0'),
            value: parseFloat(pos.value || pos.currentValue || '0'),
            payout: parseFloat(pos.payout || pos.finalValue || pos.value || '0'),
            realizedPnl: pos.realizedPnl
              ? parseFloat(pos.realizedPnl)
              : undefined,
          })
        }
      }
    } else if (data.positions && Array.isArray(data.positions)) {
      // Alternative structure: { positions: [...] }
      for (const pos of data.positions) {
        const marketId = pos.marketId || pos.conditionId || pos.market
        if (marketIds.includes(marketId)) {
          positions.push({
            marketId,
            outcomeIndex: pos.outcomeIndex ?? pos.outcome ?? 0,
            size: parseFloat(pos.size || pos.quantity || '0'),
            value: parseFloat(pos.value || pos.currentValue || '0'),
            payout: parseFloat(pos.payout || pos.finalValue || pos.value || '0'),
            realizedPnl: pos.realizedPnl
              ? parseFloat(pos.realizedPnl)
              : undefined,
          })
        }
      }
    }

    return positions
  } catch (error) {
    console.error(
      `[DATA_API] Error fetching positions for ${address}, markets ${marketIds.join(',')}:`,
      error
    )
    // Return empty array on error rather than throwing
    return []
  }
}

/**
 * Get market resolutions from Data API or Gamma API
 */
export async function getMarketResolutions(
  marketIds: string[]
): Promise<MarketResolution[]> {
  try {
    // TODO: Verify actual endpoint from Polymarket Data API docs
    // Possible approaches:
    // 1. Use Gamma API /markets with status filter
    // 2. Use Data API /markets/resolutions
    // 3. Fetch individual markets

    const resolutions: MarketResolution[] = []

    // For now, fetch from Gamma API (we already have this)
    // TODO: Consider using Data API if it has a dedicated resolutions endpoint
    const gammaUrl = `https://gamma-api.polymarket.com/markets?ids=${marketIds.join(',')}`
    const markets = await fetchJson<any[]>(gammaUrl)

    for (const market of markets || []) {
      const marketId = market.id || market.conditionId
      if (!marketIds.includes(marketId)) continue

      const status = market.status || market.marketStatus || 'open'
      const resolved = status === 'resolved' || status === 'finalized' || status === 'closed'

      // TODO: Verify exact field names for winning outcome
      // Possible fields: winningOutcome, winningOutcomes, resolvedOutcome
      let winningOutcomeIndex = 0
      if (resolved) {
        if (market.winningOutcome !== undefined) {
          winningOutcomeIndex = market.winningOutcome
        } else if (market.winningOutcomes && Array.isArray(market.winningOutcomes)) {
          winningOutcomeIndex = market.winningOutcomes[0] ?? 0
        } else if (market.resolvedOutcome !== undefined) {
          winningOutcomeIndex = market.resolvedOutcome
        }
      }

      let resolvedAt: Date | undefined
      if (resolved) {
        // TODO: Verify exact field name for resolution time
        const resolutionTime =
          market.resolvedAt ||
          market.resolutionTime ||
          market.endDate ||
          market.closedAt
        if (resolutionTime) {
          resolvedAt = new Date(resolutionTime)
        }
      }

      resolutions.push({
        marketId,
        outcomeIndex: winningOutcomeIndex,
        resolved,
        resolvedAt,
      })
    }

    return resolutions
  } catch (error) {
    console.error(
      `[DATA_API] Error fetching market resolutions for ${marketIds.join(',')}:`,
      error
    )
    // Return empty resolutions on error
    return marketIds.map((id) => ({
      marketId: id,
      outcomeIndex: 0,
      resolved: false,
    }))
  }
}

/**
 * Get user trades from Data API
 * TODO: Verify actual endpoint from Polymarket Data API documentation
 * Expected endpoint: /trades?user={address} or similar
 */
export async function getUserTrades(address: string): Promise<any> {
  try {
    // TODO: Replace with actual endpoint from Polymarket Data API docs
    const url = `${DATA_API_BASE_URL}/trades?user=${address}`
    return await fetchJson<any>(url)
  } catch (error) {
    console.error(`[DATA_API] Error fetching trades for ${address}:`, error)
    throw new Error(`Failed to fetch trades for user ${address}`)
  }
}
