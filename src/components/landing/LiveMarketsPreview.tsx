'use client'

import { useEffect, useRef, useState } from 'react'

interface Market {
  id: string
  question: string
  outcomes: string[] | string | null | undefined
  endTime: string
  status: string
  volume: number | null
  liquidity: number | null
}

function renderOutcomes(outcomes: any): string {
  if (Array.isArray(outcomes)) {
    return outcomes.join(' / ')
  }
  if (typeof outcomes === 'string') {
    try {
      const parsed = JSON.parse(outcomes)
      if (Array.isArray(parsed)) {
        return parsed.join(' / ')
      }
    } catch {
      // Not JSON, use as-is
    }
    return outcomes
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

export default function LiveMarketsPreview() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    async function fetchMarkets() {
      try {
        const res = await fetch('/api/markets')
        if (res.ok) {
          const data = await res.json()
          setMarkets(data.markets || [])
        }
      } catch (error) {
        console.error('Error fetching markets:', error)
      }
    }

    fetchMarkets()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const displayMarkets = markets.slice(0, 8)

  return (
    <section ref={sectionRef} className="py-16">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-3xl font-bold transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
          Live Markets Preview
        </h2>
        <a
          href="/app"
          className={`inline-flex items-center justify-center rounded-lg border border-[#7C5CFF]/50 bg-[#7C5CFF] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B4CE6] hover:border-[#7C5CFF] transition-all hover:scale-105 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
          style={{ transitionDelay: '200ms' }}
        >
          Build parlay
        </a>
      </div>
      <div className={`rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {displayMarkets.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No markets available at the moment
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-slate-400">
                  <th className="pb-2">Question</th>
                  <th className="pb-2">Ends</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody>
                {displayMarkets.map((market, idx) => (
                  <tr
                    key={market.id}
                    className={`hover:bg-white/5 transition-all duration-300 rounded-lg ${
                      visible
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 -translate-x-4'
                    }`}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    <td className="py-3 pr-4">
                      <div className="font-medium">{market.question}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {renderOutcomes(market.outcomes)}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">
                      {new Date(market.endTime).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-all ${
                          market.status === 'open'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse-slow'
                            : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}
                      >
                        {market.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-300">
                      {market.volume
                        ? `$${market.volume.toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}`
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
