import { DEMO_MODE } from '@/config/demo'

const CLOB_BASE_URL = 'https://clob.polymarket.com'

/**
 * Helper function to fetch JSON from CLOB API
 */
async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${CLOB_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  })

  if (!res.ok) {
    const text = await res.text()
    console.error(`[CLOB] API error (${res.status}): ${text}`)
    throw new Error(`CLOB API error (${res.status}): ${text}`)
  }

  return res.json() as Promise<T>
}

export interface OutcomePrice {
  outcomeIndex: number
  bestBidPrice: number | null // 0..1
  bestAskPrice: number | null // 0..1
}

export interface OrderBookLevel {
  price: number
  size: number
}

export interface OrderBookSide {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export interface MarketBook {
  marketId: string
  outcomeIndex: number // какой именно исход
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
}

export interface Ticker {
  marketId: string
  outcomeIndex: number
  bestBid: number | null
  bestAsk: number | null
  midPrice: number | null
  lastPrice?: number | null
}

/**
 * CLOB API response structure (based on Polymarket CLOB documentation)
 * TODO: Verify exact structure from https://docs.polymarket.com/developers/CLOB
 * Expected structure may vary - this is a best-guess implementation
 */
interface CLOBBookResponse {
  bids?: Array<{ price: string; size: string }>
  asks?: Array<{ price: string; size: string }>
  [key: string]: any
}

interface CLOBMarketResponse {
  conditionId?: string
  outcomes?: Array<{
    outcomeIndex?: number
    book?: CLOBBookResponse
    [key: string]: any
  }>
  [key: string]: any
}

/**
 * Returns best bid/ask prices for each outcome of a market.
 * @param marketId - Market ID or condition ID (as stored in Market.id)
 * @returns Array of OutcomePrice for each outcome
 */
export async function getOutcomePrices(marketId: string): Promise<OutcomePrice[]> {
  try {
    // TODO: Verify exact endpoint from Polymarket CLOB docs
    // Possible endpoints:
    // - /book?token_id={tokenId}
    // - /markets/{conditionId}
    // - /book/{conditionId}
    // Using /book endpoint as it's common in CLOB APIs
    const response = await fetchJson<CLOBMarketResponse>(`/book?token_id=${marketId}`)

    // Alternative: if the API returns a different structure, we might need:
    // const response = await fetchJson<CLOBMarketResponse>(`/markets/${marketId}`)

    // If response has outcomes array
    if (response.outcomes && Array.isArray(response.outcomes)) {
      return response.outcomes.map((outcome, index) => {
        const outcomeIndex = outcome.outcomeIndex ?? index
        const book = outcome.book || response

        // Extract best bid (highest price) and best ask (lowest price)
        const bids = book.bids || []
        const asks = book.asks || []

        const bestBidPrice =
          bids.length > 0 ? parseFloat(bids[0]?.price || '0') : null
        const bestAskPrice =
          asks.length > 0 ? parseFloat(asks[0]?.price || '0') : null

        return {
          outcomeIndex,
          bestBidPrice: bestBidPrice && bestBidPrice > 0 ? bestBidPrice : null,
          bestAskPrice: bestAskPrice && bestAskPrice > 0 ? bestAskPrice : null,
        }
      })
    }

    // Fallback: if response is a single book structure
    // TODO: Adjust based on actual CLOB API response format
    const book = response as CLOBBookResponse
    const bids = book.bids || []
    const asks = book.asks || []

    const bestBidPrice = bids.length > 0 ? parseFloat(bids[0]?.price || '0') : null
    const bestAskPrice = asks.length > 0 ? parseFloat(asks[0]?.price || '0') : null

    // For binary markets (YES/NO), return two outcomes
    return [
      {
        outcomeIndex: 0,
        bestBidPrice: bestBidPrice && bestBidPrice > 0 ? bestBidPrice : null,
        bestAskPrice: bestAskPrice && bestAskPrice > 0 ? bestAskPrice : null,
      },
      {
        outcomeIndex: 1,
        bestBidPrice: bestBidPrice ? 1 - bestBidPrice : null,
        bestAskPrice: bestAskPrice ? 1 - bestAskPrice : null,
      },
    ]
  } catch (error) {
    console.error(`[CLOB] Error fetching outcome prices for market ${marketId}:`, error)
    throw new Error(`Failed to fetch prices for market ${marketId}`)
  }
}

/**
 * Get full orderbook for a specific market outcome
 * @param marketId - Market ID or condition ID
 * @param outcomeIndex - Outcome index (0 for YES, 1 for NO, etc.)
 * @returns MarketBook with bids and asks
 */
export async function getMarketBook(
  marketId: string,
  outcomeIndex: number
): Promise<MarketBook> {
  if (DEMO_MODE) {
    console.log('[CLOB] DEMO MODE: Skipping real API call')
    return {
      marketId,
      outcomeIndex,
      bids: [],
      asks: [],
    }
  }

  try {
    // TODO: Verify exact endpoint from Polymarket CLOB docs
    // Using /book endpoint - may need adjustment based on actual API structure
    const path = `/book?token_id=${marketId}`
    
    if (process.env.NODE_ENV !== 'production') {
      console.log(
        '[CLOB] Fetching orderbook from',
        `${CLOB_BASE_URL}${path}`,
        'for market:',
        marketId,
        'outcome:',
        outcomeIndex
      )
    }
    
    const response = await fetchJson<CLOBMarketResponse>(path)

    let bids: OrderBookLevel[] = []
    let asks: OrderBookLevel[] = []

    // Try to extract book for specific outcome
    if (response.outcomes && Array.isArray(response.outcomes)) {
      const outcome = response.outcomes.find(
        (o) => (o.outcomeIndex ?? response.outcomes!.indexOf(o)) === outcomeIndex
      )
      const book = outcome?.book || response

      bids = (book.bids || [])
        .slice(0, 20) // Limit to top 20 levels
        .map((bid: { price: string; size: string }) => ({
          price: parseFloat(bid.price || '0'),
          size: parseFloat(bid.size || '0'),
        }))
        .filter((bid: OrderBookLevel) => bid.price > 0 && bid.size > 0)
        .sort((a: OrderBookLevel, b: OrderBookLevel) => b.price - a.price) // Highest first

      asks = (book.asks || [])
        .slice(0, 20) // Limit to top 20 levels
        .map((ask: { price: string; size: string }) => ({
          price: parseFloat(ask.price || '0'),
          size: parseFloat(ask.size || '0'),
        }))
        .filter((ask: OrderBookLevel) => ask.price > 0 && ask.size > 0)
        .sort((a: OrderBookLevel, b: OrderBookLevel) => a.price - b.price) // Lowest first
    } else {
      // Fallback: single book structure
      const book = response as CLOBBookResponse
      bids = (book.bids || [])
        .slice(0, 20)
        .map((bid: { price: string; size: string }) => ({
          price: parseFloat(bid.price || '0'),
          size: parseFloat(bid.size || '0'),
        }))
        .filter((bid: OrderBookLevel) => bid.price > 0 && bid.size > 0)
        .sort((a: OrderBookLevel, b: OrderBookLevel) => b.price - a.price)

      asks = (book.asks || [])
        .slice(0, 20)
        .map((ask: { price: string; size: string }) => ({
          price: parseFloat(ask.price || '0'),
          size: parseFloat(ask.size || '0'),
        }))
        .filter((ask: OrderBookLevel) => ask.price > 0 && ask.size > 0)
        .sort((a: OrderBookLevel, b: OrderBookLevel) => a.price - b.price)
    }

    return {
      marketId,
      outcomeIndex,
      bids,
      asks,
    }
  } catch (error) {
    console.error(
      `[CLOB] Error fetching orderbook for market ${marketId}, outcome ${outcomeIndex}:`,
      error
    )
    throw new Error(
      `Failed to fetch orderbook for market ${marketId}, outcome ${outcomeIndex}`
    )
  }
}

/**
 * Get ticker (best bid/ask/mid) for a specific market outcome
 * @param marketId - Market ID or condition ID
 * @param outcomeIndex - Outcome index (0 for YES, 1 for NO, etc.)
 * @returns Ticker with best bid, ask, mid price
 */
export async function getTicker(
  marketId: string,
  outcomeIndex: number
): Promise<Ticker> {
  try {
    const book = await getMarketBook(marketId, outcomeIndex)

    const bestBid = book.bids.length > 0 ? book.bids[0].price : null
    const bestAsk = book.asks.length > 0 ? book.asks[0].price : null
    const midPrice =
      bestBid !== null && bestAsk !== null ? (bestBid + bestAsk) / 2 : null

    // TODO: Fetch lastPrice from Data API if available
    const lastPrice = null

    return {
      marketId,
      outcomeIndex,
      bestBid,
      bestAsk,
      midPrice,
      lastPrice,
    }
  } catch (error) {
    console.error(
      `[CLOB] Error fetching ticker for market ${marketId}, outcome ${outcomeIndex}:`,
      error
    )
    // Возвращаем пустой ticker вместо throw, чтобы не ломать обогащение других рынков
    return {
      marketId,
      outcomeIndex,
      bestBid: null,
      bestAsk: null,
      midPrice: null,
      lastPrice: null,
    }
  }
}

