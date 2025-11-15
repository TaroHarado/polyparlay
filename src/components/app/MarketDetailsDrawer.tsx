'use client'

import { useEffect, useState } from 'react'
import type { MarketBook, Ticker } from '@/server/polymarket/clobClient'
import { normalizeOutcomes } from '@/lib/markets'

interface MarketDetailsDrawerProps {
  open: boolean
  onClose: () => void
  market: {
    id: string
    question: string
    outcomes: string[] | string | null | undefined
  } | null
  defaultOutcomeIndex?: number
}

export default function MarketDetailsDrawer({
  open,
  onClose,
  market,
  defaultOutcomeIndex = 0,
}: MarketDetailsDrawerProps) {
  const [selectedOutcomeIndex, setSelectedOutcomeIndex] = useState(
    defaultOutcomeIndex
  )
  const [ticker, setTicker] = useState<Ticker | null>(null)
  const [book, setBook] = useState<MarketBook | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !market) {
      setTicker(null)
      setBook(null)
      return
    }

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        const [tickerRes, bookRes] = await Promise.all([
          fetch(
            `/api/markets/${market.id}/ticker?outcomeIndex=${selectedOutcomeIndex}`
          ),
          fetch(
            `/api/markets/${market.id}/book?outcomeIndex=${selectedOutcomeIndex}`
          ),
        ])

        if (tickerRes.ok) {
          const tickerData: Ticker = await tickerRes.json()
          setTicker(tickerData)
        }

        if (bookRes.ok) {
          const bookData: MarketBook = await bookRes.json()
          setBook(bookData)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [open, market, selectedOutcomeIndex])

  if (!open || !market) return null

  const maxSize = Math.max(
    ...(book?.bids.map((b) => b.size) || []),
    ...(book?.asks.map((a) => a.size) || [])
  )

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0A0A0F] border border-white/10 rounded-t-xl sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{market.question}</h2>
            <div className="text-xs text-slate-400 mt-1">
              {(() => {
                const outcomes = normalizeOutcomes(market.outcomes)
                return outcomes.length ? outcomes.join(' / ') : '-'
              })()}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Outcome tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          {(() => {
            const outcomes = normalizeOutcomes(market.outcomes)
            return outcomes.slice(0, 2).map((outcome, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedOutcomeIndex(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  selectedOutcomeIndex === idx
                    ? 'bg-[#7C5CFF] text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {outcome}
              </button>
            ))
          })()}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading && !ticker && (
            <div className="text-center py-8 text-slate-400">Loading...</div>
          )}

          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {ticker && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="text-xs text-slate-400 mb-1">Best Bid</div>
                <div className="text-lg font-semibold text-green-400">
                  {ticker.bestBid !== null
                    ? `${ticker.bestBid.toFixed(3)} (${Math.round(ticker.bestBid * 100)}%)`
                    : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="text-xs text-slate-400 mb-1">Best Ask</div>
                <div className="text-lg font-semibold text-red-400">
                  {ticker.bestAsk !== null
                    ? `${ticker.bestAsk.toFixed(3)} (${Math.round(ticker.bestAsk * 100)}%)`
                    : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="text-xs text-slate-400 mb-1">Mid Price</div>
                <div className="text-lg font-semibold text-[#3BE4FF]">
                  {ticker.midPrice !== null
                    ? `${ticker.midPrice.toFixed(3)} (${Math.round(ticker.midPrice * 100)}%)`
                    : '—'}
                </div>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="text-xs text-slate-400 mb-1">Implied Prob</div>
                <div className="text-lg font-semibold">
                  {ticker.midPrice !== null
                    ? `${Math.round(ticker.midPrice * 100)}%`
                    : '—'}
                </div>
              </div>
            </div>
          )}

          {/* Orderbook */}
          {book && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Orderbook</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Bids */}
                <div>
                  <div className="text-xs text-green-400 font-medium mb-2">
                    Bids
                  </div>
                  <div className="space-y-1">
                    {book.bids.length > 0 ? (
                      book.bids.map((bid, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex-1 flex items-center gap-2">
                            <div
                              className="h-4 bg-green-500/20 rounded"
                              style={{
                                width: `${(bid.size / maxSize) * 100}%`,
                              }}
                            />
                            <span className="text-green-400 font-mono">
                              {bid.price.toFixed(4)}
                            </span>
                          </div>
                          <span className="text-slate-300 font-mono">
                            {bid.size.toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500">No bids</div>
                    )}
                  </div>
                </div>

                {/* Asks */}
                <div>
                  <div className="text-xs text-red-400 font-medium mb-2">
                    Asks
                  </div>
                  <div className="space-y-1">
                    {book.asks.length > 0 ? (
                      book.asks.map((ask, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-slate-300 font-mono">
                            {ask.size.toFixed(2)}
                          </span>
                          <div className="flex-1 flex items-center gap-2 justify-end">
                            <span className="text-red-400 font-mono">
                              {ask.price.toFixed(4)}
                            </span>
                            <div
                              className="h-4 bg-red-500/20 rounded"
                              style={{
                                width: `${(ask.size / maxSize) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500">No asks</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

