import { NextRequest, NextResponse } from 'next/server'
import { updateParlayStatusFromResolution } from '@/server/parlay/parlayService'

/**
 * POST /api/parlays/:id/refresh
 * Refresh parlay status based on market resolutions
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parlayId = params.id

    const parlay = await updateParlayStatusFromResolution(parlayId)

    return NextResponse.json({ parlay }, { status: 200 })
  } catch (err: any) {
    console.error('[PARLAY] Error refreshing parlay:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to refresh parlay' },
      { status: 500 }
    )
  }
}

