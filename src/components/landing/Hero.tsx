'use client'

import { useEffect, useState } from 'react'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16">
      <div className={`space-y-6 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h1 className="text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
          The Parlay Layer for Polymarket
        </h1>
        <p className="text-xl text-slate-300 leading-relaxed">
          Build multi-market parlays with real on-chain markets. Non-custodial,
          transparent.
        </p>
        <div className="flex gap-4 pt-4">
          <a
            href="/app"
            className="group inline-flex items-center justify-center rounded-lg border border-[#7C5CFF]/50 bg-[#7C5CFF] px-6 py-3 text-base font-medium text-white hover:bg-[#6B4CE6] hover:border-[#7C5CFF] transition-all shadow-lg shadow-[#7C5CFF]/20 hover:shadow-[#7C5CFF]/40 hover:scale-105 animate-pulse-slow"
          >
            <span className="relative">
              Launch App
              <span className="absolute inset-0 rounded-lg bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </span>
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-base font-medium text-white hover:bg-white/10 transition-all hover:scale-105"
          >
            View docs
          </a>
        </div>
      </div>
      <div className={`relative rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'} hover:border-white/10 hover:shadow-[#7C5CFF]/20 overflow-hidden group`}>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF]/0 via-[#7C5CFF]/5 to-[#7C5CFF]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer pointer-events-none"></div>
        <div className="relative space-y-4 z-10">
          <div className="text-sm font-medium text-slate-400 mb-4">
            Parlay Preview
          </div>
          <div className="space-y-2">
            {[
              { label: 'BTC > $80k by Dec 31', price: '0.65' },
              { label: 'ETH > $5k by Dec 31', price: '0.72' },
              { label: 'SOL > $200 by Dec 31', price: '0.58' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm animate-fade-in"
                style={{ animationDelay: `${idx * 200}ms` }}
              >
                <span className="text-slate-300">{item.label}</span>
                <span className="text-[#3BE4FF] font-semibold animate-pulse-slow">
                  YES @ {item.price}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Combined odds</span>
              <span className="text-lg font-semibold text-[#7C5CFF] animate-pulse-slow">
                2.15x
              </span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-400">Stake</span>
              <span className="text-lg font-semibold">$100</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-slate-400">Expected payout</span>
              <span className="text-lg font-semibold text-[#3BE4FF] animate-pulse-slow">
                $215
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
