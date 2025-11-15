import { NextRequest, NextResponse } from 'next/server'
import {
  createParlayWithOrders,
  getUserParlays,
  type ParlayLegInput,
} from '@/server/parlay/parlayService'
import { tradingConfig } from '@/server/config/tradingConfig'

/**
 * POST /api/parlays
 * Create a new parlay and prepare unsigned orders
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userAddress, stake, legs, maxSlippageBps } = body as {
      userAddress: string
      stake: number
      legs: ParlayLegInput[]
      maxSlippageBps?: number
    }

    if (!userAddress || !Array.isArray(legs)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Используем переданный maxSlippageBps или дефолт из конфига
    const slippageBps =
      maxSlippageBps !== undefined
        ? Math.max(10, Math.min(2000, maxSlippageBps)) // Clamp между 10 и 2000 bps
        : tradingConfig.DEFAULT_MAX_SLIPPAGE_BPS

    const { parlay, calculatedLegs, unsignedOrders } =
      await createParlayWithOrders(userAddress, stake, legs, slippageBps)

    return NextResponse.json(
      {
        parlayId: parlay.id,
        status: parlay.status,
        stake: parlay.stake,
        kTotal: parlay.kTotal,
        expectedPayout: parlay.expectedPayout,
        calculatedLegs,
        unsignedOrders,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('[PARLAY] Error creating parlay:', err)
    // Return appropriate status code based on error type
    const statusCode =
      err.message?.includes('Price moved too much') ||
      err.message?.includes('Stake per leg') ||
      err.message?.includes('too extreme')
        ? 422
        : 500
    return NextResponse.json(
      { error: err.message ?? 'Failed to create parlay' },
      { status: statusCode }
    )
  }
}

/**
 * GET /api/parlays
 * Get parlays for a user
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userAddress = searchParams.get('userAddress')

  if (!userAddress) {
    return NextResponse.json(
      { error: 'userAddress is required' },
      { status: 400 }
    )
  }

  try {
    const parlays = await getUserParlays(userAddress)

    return NextResponse.json(
      {
        parlays: parlays.map((p) => ({
          id: p.id,
          status: p.status,
          stake: p.stake,
          kTotal: p.kTotal,
          expectedPayout: p.expectedPayout,
          actualPayout: p.actualPayout,
          realizedPnl: p.realizedPnl,
          resolvedAt: p.resolvedAt?.toISOString() || null,
          createdAt: p.createdAt,
          legs: p.legs,
        })),
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[PARLAY] Error fetching parlays:', err)
    return NextResponse.json(
      { error: 'Failed to fetch parlays' },
      { status: 500 }
    )
  }
}

