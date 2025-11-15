import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/parlays/:id/attach-orders
 * Attach CLOB orders to a parlay and mark it as active
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const parlayId = params.id
    const body = await req.json()
    const { orders } = body as {
      orders: Array<{
        clobOrderId?: string
        marketId: string
        side: string
        price: number
        size: number
        status?: string
        raw?: any
      }>
    }

    if (!Array.isArray(orders)) {
      return NextResponse.json({ error: 'Invalid orders format' }, { status: 400 })
    }

    // Check if parlay exists
    const parlay = await prisma.parlay.findUnique({
      where: { id: parlayId },
    })

    if (!parlay) {
      return NextResponse.json({ error: 'Parlay not found' }, { status: 404 })
    }

    // Create order snapshots
    const orderSnapshots = await Promise.all(
      orders.map((order) =>
        prisma.orderSnapshot.create({
          data: {
            parlayId,
            marketId: order.marketId,
            clobOrderId: order.clobOrderId || null,
            side: order.side,
            price: order.price,
            size: order.size,
            status: order.status || 'pending',
            raw: order.raw || null,
          },
        })
      )
    )

    // Update parlay status to active
    await prisma.parlay.update({
      where: { id: parlayId },
      data: { status: 'active' },
    })

    return NextResponse.json(
      {
        parlayId,
        status: 'active',
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
    console.error('Error attaching orders to parlay:', err)
    return NextResponse.json(
      { error: err.message ?? 'Failed to attach orders' },
      { status: 500 }
    )
  }
}

