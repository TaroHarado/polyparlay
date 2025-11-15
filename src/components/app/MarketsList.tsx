'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import MarketDetailsDrawer from './MarketDetailsDrawer'
import { normalizeOutcomes } from '@/lib/markets'

interface Market {
  id: string
  question: string
  outcomes: string[] | string | null | undefined
  endTime: string
  status: string
  volume: number | null
  liquidity: number | null
  yesPrice?: number | null
  noPrice?: number | null
  yesOdds?: number | null
  noOdds?: number | null
}

function renderOutcomes(outcomes: any): string {
  if (Array.isArray(outcomes)) {
    return outcomes.join(' / ')
  }

  if (typeof outcomes === 'string') {
    // пробуем распарсить JSON-строку
    try {
      const parsed = JSON.parse(outcomes)
      if (Array.isArray(parsed)) {
        return parsed.join(' / ')
      }
      return String(parsed)
    } catch {
      // не JSON — просто покажем как есть
      return outcomes
    }
  }

  if (!outcomes) {
    return '-'
  }

  try {
    return String(outcomes)
  } catch {
    return '-'
  }
}

interface Ticker {
  marketId: string
  outcomeIndex: number
  bestBid: number | null
  bestAsk: number | null
  midPrice: number | null
}

export interface MarketsListProps {
  onAddLeg: (leg: {
    marketId: string
    outcomeIndex: number
    question: string
    outcomeLabel: string
    price: number
    odds: number
  }) => void
}

export default function MarketsList({ onAddLeg }: MarketsListProps) {
  const { address, isConnected } = useAccount()
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tickers, setTickers] = useState<Record<string, Ticker>>({})
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  
  const canAdd = Boolean(isConnected && address)

  // Fetch markets
  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true)
        const res = await fetch('/api/markets')
        if (!res.ok) {
          throw new Error('Failed to fetch markets')
        }
        const data = await res.json()
        setMarkets(data.markets || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchMarkets()
  }, [])

  // Fetch tickers periodically
  useEffect(() => {
    if (markets.length === 0) return

    async function fetchTickers() {
      const tickerPromises = markets
        .filter((m) => m.status === 'open')
        .map(async (market) => {
          try {
            const res = await fetch(
              `/api/markets/${market.id}/ticker?outcomeIndex=0`
            )
            if (res.ok) {
              const ticker: Ticker = await res.json()
              return { marketId: market.id, ticker }
            }
          } catch (err) {
            console.error(`Error fetching ticker for ${market.id}:`, err)
          }
          return null
        })

      const results = await Promise.all(tickerPromises)
      const newTickers: Record<string, Ticker> = {}
      results.forEach((result) => {
        if (result) {
          newTickers[result.marketId] = result.ticker
        }
      })
      setTickers((prev) => ({ ...prev, ...newTickers }))
    }

    fetchTickers()
    const interval = setInterval(fetchTickers, 8000) // Update every 8 seconds

    return () => clearInterval(interval)
  }, [markets])

  if (loading) {
    return (
      <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40">
        <div className="text-center py-8 text-slate-400">Loading markets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40">
        <div className="text-center py-8 text-red-400">
          Error: {error}
          <button
            onClick={() => window.location.reload()}
            className="ml-4 text-[#7C5CFF] hover:text-[#6B4CE6]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40">
        <h2 className="text-xl font-semibold mb-4">Markets</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-y-2">
            <thead>
              <tr className="text-left text-slate-400">
                <th className="pb-2">Question</th>
                <th className="pb-2">Price & Odds</th>
                <th className="pb-2">Ends</th>
                <th className="pb-2">Status</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {markets.map((market) => {
                const outcomes = normalizeOutcomes(market.outcomes)
                const yesLabel = outcomes[0] ?? 'Yes'
                const noLabel = outcomes[1] ?? 'No'
                const isOpen = market.status === 'open'
                
                // Use enriched prices from API or fallback to tickers
                const yesPrice = market.yesPrice ?? null
                const noPrice =
                  market.noPrice ??
                  (yesPrice != null ? 1 - yesPrice : null)
                const yesOdds =
                  market.yesOdds ??
                  (yesPrice && yesPrice > 0 ? 1 / yesPrice : null)
                const noOdds =
                  market.noOdds ??
                  (noPrice && noPrice > 0 ? 1 / noPrice : null)

                return (
                  <tr
                    key={market.id}
                    className="hover:bg-white/5 transition-colors rounded-lg"
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium">{market.question}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {outcomes.length ? outcomes.join(' / ') : '-'}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-300">
                      {yesPrice != null ? (
                        <div>
                          <div>
                            YES: {(yesPrice * 100).toFixed(1)}% (k=
                            {yesOdds?.toFixed(2) ?? '-'})
                          </div>
                          {noPrice != null && (
                            <div className="text-slate-400">
                              NO: {(noPrice * 100).toFixed(1)}% (k=
                              {noOdds?.toFixed(2) ?? '-'})
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">No data</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(market.endTime).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          isOpen
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {market.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        <button
                          onClick={() => setSelectedMarket(market)}
                          className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-medium text-slate-300 hover:bg-white/10 transition"
                          title="View details"
                        >
                          ℹ️
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!yesPrice || !yesOdds) {
                              console.warn('[UI] Cannot add YES leg: missing price or odds')
                              return
                            }
                            const leg = {
                              marketId: market.id,
                              question: market.question,
                              outcomeIndex: 0,
                              outcomeLabel: yesLabel,
                              price: yesPrice,
                              odds: yesOdds,
                            }
                            console.log('[UI] Add YES leg', leg)
                            onAddLeg(leg)
                          }}
                          disabled={!yesPrice || !yesOdds}
                          className="inline-flex items-center justify-center rounded-lg border border-green-500/50 bg-green-600/20 px-3 py-1.5 text-xs font-medium text-green-400 hover:bg-green-600/30 hover:border-green-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add {yesLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!noPrice || !noOdds) {
                              console.warn('[UI] Cannot add NO leg: missing price or odds')
                              return
                            }
                            const leg = {
                              marketId: market.id,
                              question: market.question,
                              outcomeIndex: 1,
                              outcomeLabel: noLabel,
                              price: noPrice,
                              odds: noOdds,
                            }
                            console.log('[UI] Add NO leg', leg)
                            onAddLeg(leg)
                          }}
                          disabled={!noPrice || !noOdds}
                          className="inline-flex items-center justify-center rounded-lg border border-red-500/50 bg-red-600/20 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-600/30 hover:border-red-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add {noLabel}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MarketDetailsDrawer
        open={selectedMarket !== null}
        onClose={() => setSelectedMarket(null)}
        market={selectedMarket}
      />
    </>
  )
}
