'use client'

import { useEffect, useRef, useState } from 'react'

export default function HowItWorks() {
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

  const steps = [
    {
      number: '1',
      title: 'Select markets',
      description: 'Choose multiple Polymarket markets to combine into a parlay.',
    },
    {
      number: '2',
      title: 'We calculate odds & payout',
      description:
        'Our engine fetches real-time prices and computes combined odds automatically.',
    },
    {
      number: '3',
      title: 'You sign real Polymarket orders',
      description:
        'Each leg becomes a real order on Polymarket. Sign with your wallet.',
    },
    {
      number: '4',
      title: 'We track your parlays',
      description:
        'Monitor your active parlays and get notified when markets resolve.',
    },
  ]

  return (
    <section id="how-it-works" ref={sectionRef} className="py-16">
      <h2 className={`text-3xl font-bold text-center mb-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`group rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40 transition-all duration-500 hover:scale-105 hover:border-[#7C5CFF]/50 hover:shadow-[#7C5CFF]/20 ${
              visible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: `${idx * 100}ms` }}
          >
            <div className="w-12 h-12 rounded-full bg-[#7C5CFF]/20 border border-[#7C5CFF]/50 flex items-center justify-center text-xl font-bold text-[#7C5CFF] mb-4 animate-pulse-slow relative group-hover:scale-110 transition-transform">
              {step.number}
              <div className="absolute inset-0 rounded-full bg-[#7C5CFF]/30 animate-ping opacity-75"></div>
            </div>
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
