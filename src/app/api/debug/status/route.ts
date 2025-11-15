import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/debug/status
 * Debug endpoint to check system status
 */
export async function GET(_req: NextRequest) {
  try {
    // проверка БД
    let dbOk = false
    try {
      await prisma.$queryRaw`SELECT 1 as result`
      dbOk = true
    } catch (err) {
      console.error('[DEBUG] Database connection failed:', err)
    }

    // быстрая проверка markets (без падения, если Gamma умер)
    let marketsOk = false
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : 'http://localhost:3000')
      const res = await fetch(`${baseUrl}/api/markets`, {
        cache: 'no-store',
      })
      marketsOk = res.ok
    } catch (err) {
      console.error('[DEBUG] Markets API check failed:', err)
      marketsOk = false
    }

    return NextResponse.json(
      {
        ok: true,
        db: dbOk ? 'ok' : 'error',
        marketsApi: marketsOk ? 'ok' : 'error',
        env: {
          nodeVersion: process.version,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
          hasWalletConnectId: !!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    console.error('[DEBUG] Status check failed:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err?.message ?? 'Unknown error',
      },
      { status: 500 }
    )
  }
}

