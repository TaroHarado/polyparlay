import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@polymarket/clob-client'
import { getOutcomePrices } from '@/server/polymarket/clobClient'

/**
 * POST /api/parlays/:id/submit-orders
 * Submit signed CLOB orders to Polymarket and update parlay status
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parlayId = params.id
    const body = await req.json()
    const { signedOrders } = body as {
      signedOrders: Array<{
        price: string
        size: string
        side: string
        market: string
        outcome: number
        maker: string
        expiration: number
        nonce: number
        signature?: string
        [key: string]: any
      }>
    }

    if (!Array.isArray(signedOrders) || signedOrders.length === 0) {
      return NextResponse.json(
        { error: 'Invalid signedOrders format' },
        { status: 400 }
      )
    }

    // Check if parlay exists
    const parlay = await prisma.parlay.findUnique({
      where: { id: parlayId },
      include: { legs: true },
    })

    if (!parlay) {
      return NextResponse.json({ error: 'Parlay not found' }, { status: 404 })
    }

    if (parlay.status !== 'pending_signature') {
      return NextResponse.json(
        { error: `Parlay is not in pending_signature status (current: ${parlay.status})` },
        { status: 400 }
      )
    }

    // Дополнительный slippage-чек перед отправкой
    const maxSlippageBps = parlay.maxSlippageBps
    for (const leg of parlay.legs) {
      const prices = await getOutcomePrices(leg.marketId)
      const outcome = prices.find((p) => p.outcomeIndex === leg.outcomeIndex)

      if (outcome) {
        const currentPrice = outcome.bestAskPrice ?? outcome.bestBidPrice
        if (currentPrice && currentPrice > 0) {
          const diff = Math.abs(currentPrice - leg.priceUsed)
          const allowedDiff = (maxSlippageBps / 10_000) * leg.priceUsed

          if (diff > allowedDiff) {
            return NextResponse.json(
              {
                error:
                  'Market moved too much, please recreate parlay with updated prices.',
              },
              { status: 422 }
            )
          }
        }
      }
    }

    // Initialize CLOB client
    const clob = createClient()

    // Submit each order to Polymarket
    const orderResults = []
    const orderSnapshots = []

    for (let i = 0; i < signedOrders.length; i++) {
      const signedOrder = signedOrders[i]
      const leg = parlay.legs[i]

      if (!leg) {
        console.error(`[PARLAY] No leg found for order ${i}`)
        continue
      }

      try {
        // Submit order to Polymarket CLOB
        const orderResult = await clob.submitOrder(signedOrder)

        // Create order snapshot
        const snapshot = await prisma.orderSnapshot.create({
          data: {
            parlayId,
            marketId: leg.marketId,
            clobOrderId: orderResult.id || null,
            side: signedOrder.side,
            price: parseFloat(signedOrder.price),
            size: parseFloat(signedOrder.size),
            status: 'pending',
            raw: orderResult as any,
          },
        })

        orderResults.push(orderResult)
        orderSnapshots.push(snapshot)
      } catch (error) {
        console.error(`[PARLAY] Error submitting order ${i}:`, error)
        // Create failed snapshot
        await prisma.orderSnapshot.create({
          data: {
            parlayId,
            marketId: leg.marketId,
            clobOrderId: null,
            side: signedOrder.side,
            price: parseFloat(signedOrder.price),
            size: parseFloat(signedOrder.size),
            status: 'failed',
            raw: { error: error instanceof Error ? error.message : 'Unknown error' } as any,
          },
        })

        // If any order fails, mark parlay as failed
        await prisma.parlay.update({
          where: { id: parlayId },
          data: { status: 'failed' },
        })

        throw new Error(
          `Failed to submit order ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    // If all orders submitted successfully, mark parlay as active
    await prisma.parlay.update({
      where: { id: parlayId },
      data: { status: 'active' },
    })

    return NextResponse.json(
      {
        parlayId,
        status: 'active',
        submittedOrders: orderResults.length,
        orderSnapshots: orderSnapshots.map((os) => ({
          id: os.id,
          clobOrderId: os.clobOrderId,
          marketId: os.marketId,
          side: os.side,
          price: os.price,
          size: os.size,
          status: os.status,
        })),
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[PARLAY] Error submitting orders:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to submit orders' },
      { status: 500 }
    )
  }
}

