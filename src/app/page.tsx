import Hero from '@/components/landing/Hero'
import WhySection from '@/components/landing/WhySection'
import HowItWorks from '@/components/landing/HowItWorks'
import LiveMarketsPreview from '@/components/landing/LiveMarketsPreview'
import FAQ from '@/components/landing/FAQ'

export default async function LandingPage() {
  return (
    <main className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 space-y-24">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#7C5CFF]/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#3BE4FF]/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }}></div>
      </div>
      
      <Hero />
      <WhySection />
      <HowItWorks />
      <LiveMarketsPreview />
      <FAQ />
    </main>
  )
}
