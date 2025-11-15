'use client'

import { useEffect, useRef, useState } from 'react'

export default function WhySection() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

  const features = [
    {
      title: 'Real Markets & Real Orders',
      description:
        'Every parlay leg is a real Polymarket position. No synthetic markets, no off-chain bets.',
      icon: '✓',
      gradient: 'from-green-500/20 to-emerald-500/20',
    },
    {
      title: 'Non-Custodial by Design',
      description:
        'Your funds stay in your wallet. We orchestrate orders, but never hold your assets.',
      icon: '🔒',
      gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
      title: 'Smart Parlay Engine',
      description:
        'Automatic odds calculation, liquidity checks, and real-time market data integration.',
      icon: '⚡',
      gradient: 'from-purple-500/20 to-pink-500/20',
    },
  ]

  return (
    <section ref={sectionRef} className="py-16">
      <h2 className={`text-3xl font-bold text-center mb-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        Why polyparlay.fun?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className={`rounded-xl border border-white/5 bg-gradient-to-br ${feature.gradient} p-6 shadow-lg shadow-black/40 hover:border-white/10 transition-all duration-500 hover:scale-105 hover:shadow-xl ${
              visible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${idx * 150}ms` }}
          >
            <div className="text-4xl mb-4 animate-bounce-slow hover:scale-110 transition-transform">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
