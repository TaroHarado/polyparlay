import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import { WagmiProvider } from '@/components/providers/WagmiProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'polyparlay.fun — Parlay Layer for Polymarket',
  description: 'Build parlays on Polymarket with real on-chain markets, non-custodial.',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icon.png',
    shortcut: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" style={{ scrollBehavior: 'smooth' }}>
      <body className={`${inter.variable} min-h-screen bg-[#050509] text-slate-100`}>
        <WagmiProvider>
          <header className="border-b border-white/5">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <a href="/" className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="polyparlay.fun"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-lg"
                />
                <span className="text-lg font-semibold tracking-tight">
                  polyparlay.fun
                </span>
              </a>
              <nav className="flex items-center gap-4 text-sm text-slate-300">
                <a href="/app" className="hover:text-white transition-colors">
                  Launch app
                </a>
                <a href="/how-it-works" className="hover:text-white transition-colors">
                  How it works
                </a>
                <a href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </a>
                <a
                  href="https://x.com/polyparlay_fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="https://pump.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  pump.fun
                </a>
              </nav>
            </div>
          </header>
          {children}
        </WagmiProvider>
      </body>
    </html>
  )
}
