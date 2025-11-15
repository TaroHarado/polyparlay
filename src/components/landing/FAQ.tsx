'use client'

import { useEffect, useRef, useState } from 'react'

export default function FAQ() {
  const [visible, setVisible] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
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

  const faqs = [
    {
      question: 'How does polyparlay.fun work?',
      answer:
        'polyparlay.fun lets you combine multiple Polymarket markets into a single parlay. Each leg is a real order on Polymarket, executed through their CLOB API. Your funds stay in your wallet throughout the process.',
    },
    {
      question: 'Is my money safe?',
      answer:
        'Yes. polyparlay.fun is non-custodial. We never hold your funds. All orders are signed directly from your wallet and executed on Polymarket. We only orchestrate the order creation and tracking.',
    },
    {
      question: 'What happens if a market closes before my parlay is created?',
      answer:
        'Our system checks market status before creating parlays. If a market is no longer open, you won\'t be able to add it to your parlay. We also validate market status when calculating odds.',
    },
    {
      question: 'How are parlay odds calculated?',
      answer:
        'We fetch real-time prices from Polymarket\'s CLOB API for each leg. The combined odds (kTotal) is the product of all individual leg odds. Expected payout = stake × kTotal.',
    },
    {
      question: 'Can I cancel a parlay?',
      answer:
        'Once orders are placed on Polymarket, they follow Polymarket\'s order cancellation rules. You can cancel individual orders through Polymarket if they haven\'t been filled yet.',
    },
  ]

  return (
    <section id="faq" ref={sectionRef} className="py-16">
      <h2 className={`text-3xl font-bold text-center mb-12 transition-all duration-1000 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        FAQ
      </h2>
      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className={`rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40 transition-all duration-500 hover:border-white/10 hover:scale-[1.02] cursor-pointer ${
              visible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-8'
            }`}
            style={{ transitionDelay: `${idx * 100}ms` }}
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <span className="text-[#7C5CFF]">Q{idx + 1}:</span>
                  {faq.question}
                </h3>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-400 leading-relaxed pt-2">{faq.answer}</p>
                </div>
              </div>
              <div className="text-[#7C5CFF] text-xl font-bold transition-transform duration-300">
                {openIndex === idx ? '−' : '+'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
