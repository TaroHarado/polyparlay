'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

interface DebugStatus {
  ok: boolean
  db?: string
  marketsApi?: string
  env?: {
    nodeVersion: string
    hasDatabaseUrl: boolean
    hasAppUrl: boolean
    hasWalletConnectId: boolean
  }
  error?: string
}

export default function DebugPage() {
  const [status, setStatus] = useState<DebugStatus | null>(null)
  const [markets, setMarkets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { address, isConnected } = useAccount()

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [statusRes, marketsRes] = await Promise.all([
          fetch('/api/debug/status'),
          fetch('/api/markets'),
        ])

        const statusJson: DebugStatus = await statusRes.json()
        setStatus(statusJson)

        if (marketsRes.ok) {
          const marketsJson = await marketsRes.json()
          setMarkets(marketsJson.markets?.slice(0, 5) ?? [])
        }
      } catch (e) {
        setStatus({
          ok: false,
          error: e instanceof Error ? e.message : 'Failed to fetch debug data',
        })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Debug Dashboard</h1>
        <p className="text-sm text-slate-400">
          System status and smoke test for polyexp
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-medium">Backend Status</h2>
        {loading ? (
          <p className="text-sm text-slate-300">Loading...</p>
        ) : status ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  status.ok ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium">
                Overall: {status.ok ? 'OK' : 'ERROR'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  status.db === 'ok' ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-sm">Database: {status.db || 'unknown'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  status.marketsApi === 'ok' ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              <span className="text-sm">
                Markets API: {status.marketsApi || 'unknown'}
              </span>
            </div>
            {status.env && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-xs text-slate-400 mb-2">Environment:</div>
                <div className="text-xs space-y-1 font-mono">
                  <div>Node: {status.env.nodeVersion}</div>
                  <div>
                    DATABASE_URL:{' '}
                    {status.env.hasDatabaseUrl ? '✓' : '✗'}
                  </div>
                  <div>
                    NEXT_PUBLIC_APP_URL:{' '}
                    {status.env.hasAppUrl ? '✓' : '✗'}
                  </div>
                  <div>
                    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID:{' '}
                    {status.env.hasWalletConnectId ? '✓' : '✗'}
                  </div>
                </div>
              </div>
            )}
            {status.error && (
              <div className="mt-4 pt-4 border-t border-red-500/50">
                <div className="text-xs text-red-400">Error: {status.error}</div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-300">Failed to load status</p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-medium">
          Sample Markets (/api/markets)
        </h2>
        {markets.length > 0 ? (
          <ul className="space-y-3 text-sm">
            {markets.map((m) => (
              <li
                key={m.id}
                className="border-b border-white/5 pb-3 last:border-0 last:pb-0"
              >
                <div className="font-medium mb-1">{m.question}</div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>ID: {m.id}</div>
                  <div>Status: {m.status}</div>
                  <div>Ends: {new Date(m.endTime).toLocaleString()}</div>
                  {m.outcomes && (
                    <div>Outcomes: {m.outcomes.join(' / ')}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-300">No markets loaded yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-medium">Wallet Connection</h2>
        {isConnected && address ? (
          <div className="space-y-2">
            <p className="text-sm">
              Status:{' '}
              <span className="text-green-400 font-medium">Connected</span>
            </p>
            <p className="text-sm">
              Address:{' '}
              <span className="font-mono text-xs">{address}</span>
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-300">Wallet not connected.</p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-4 text-lg font-medium">Quick Links</h2>
        <div className="space-y-2 text-sm">
          <a
            href="/api/health"
            target="_blank"
            className="block text-[#7C5CFF] hover:text-[#6B4CE6] transition"
          >
            /api/health
          </a>
          <a
            href="/api/markets"
            target="_blank"
            className="block text-[#7C5CFF] hover:text-[#6B4CE6] transition"
          >
            /api/markets
          </a>
          <a
            href="/api/debug/status"
            target="_blank"
            className="block text-[#7C5CFF] hover:text-[#6B4CE6] transition"
          >
            /api/debug/status
          </a>
          <a
            href="/app"
            className="block text-[#7C5CFF] hover:text-[#6B4CE6] transition"
          >
            /app (Main application)
          </a>
        </div>
      </section>
    </main>
  )
}

