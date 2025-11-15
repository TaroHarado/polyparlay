import { NextRequest, NextResponse } from 'next/server'
import { fetchMarketsFromGamma } from '@/server/polymarket/gammaClient'

/**
 * GET /api/debug/gamma/markets
 * Debug endpoint to fetch raw markets data from Gamma API
 */
export async function GET(_req: NextRequest) {
  try {
    const raw = await fetchMarketsFromGamma({
      status: 'open',
      limit: 20,
    })

    // важно: не нормализованный ответ, а то, что вернул Gamma
    return NextResponse.json(
      {
        source: 'https://gamma-api.polymarket.com/markets',
        count: raw.length,
        markets: raw,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[GAMMA_DEBUG] Failed to fetch raw markets:', err)
    return NextResponse.json(
      { error: err?.message ?? 'Failed to fetch raw markets' },
      { status: 500 }
    )
  }
}

