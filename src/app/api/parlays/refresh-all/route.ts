import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateParlayStatusFromResolution } from '@/server/parlay/parlayService'

/**
 * POST /api/parlays/refresh-all?userAddress=...
 * Refresh all active parlays for a user
 */
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json(
        { error: 'userAddress is required' },
        { status: 400 }
      )
    }

    // Find all active parlays for this user
    const activeParlays = await prisma.parlay.findMany({
      where: {
        userAddress,
        status: 'active',
      },
      select: {
        id: true,
      },
    })

    // Refresh each parlay
    const results = await Promise.allSettled(
      activeParlays.map((p) => updateParlayStatusFromResolution(p.id))
    )

    const updated = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r.status === 'fulfilled' ? r.value : null))
      .filter(Boolean)

    const errors = results
      .filter((r) => r.status === 'rejected')
      .map((r) => (r.status === 'rejected' ? r.reason : null))
      .filter(Boolean)

    return NextResponse.json(
      {
        updated: updated.length,
        total: activeParlays.length,
        errors: errors.length,
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[PARLAY] Error refreshing all parlays:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to refresh parlays' },
      { status: 500 }
    )
  }
}

