import { NextRequest, NextResponse } from 'next/server'
import { getMarketBook } from '@/server/polymarket/clobClient'

/**
 * GET /api/markets/:id/book
 * Get orderbook for a market outcome
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id
    const { searchParams } = new URL(req.url)
    const outcomeIndex = parseInt(searchParams.get('outcomeIndex') || '0', 10)

    if (isNaN(outcomeIndex) || outcomeIndex < 0) {
      return NextResponse.json(
        { error: 'Invalid outcomeIndex' },
        { status: 400 }
      )
    }

    const book = await getMarketBook(marketId, outcomeIndex)

    return NextResponse.json(book, { status: 200 })
  } catch (err: any) {
    console.error('Error fetching orderbook:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to fetch orderbook' },
      { status: 500 }
    )
  }
}

