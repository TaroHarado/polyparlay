'use client'

import { useState } from 'react'
import MarketsList, { type MarketsListProps } from '@/components/app/MarketsList'
import ParlayBuilder from '@/components/app/ParlayBuilder'
import MyParlays from '@/components/app/MyParlays'
import WalletConnect from '@/components/app/WalletConnect'

type ParlayLegUI = {
  marketId: string
  question: string
  outcomeIndex: number
  outcomeLabel: string
  price: number // используем yesPrice/noPrice
  odds: number // decimal odds
}

type SimParlay = {
  id: string
  createdAt: string
  stake: number
  kTotal: number
  expectedPayout: number
  legs: ParlayLegUI[]
}

export default function AppPage() {
  const [legs, setLegs] = useState<ParlayLegUI[]>([])
  const [parlays, setParlays] = useState<SimParlay[]>([])

  const handleAddLeg: MarketsListProps['onAddLeg'] = (leg) => {
    console.log('[APP] onAddLeg called', leg)
    // Check if leg already exists
    const exists = legs.some(
      (l) => l.marketId === leg.marketId && l.outcomeIndex === leg.outcomeIndex
    )
    if (!exists) {
      const newLegs = [...legs, leg]
      console.log('[APP] Adding leg, total legs:', newLegs.length)
      setLegs(newLegs)
    } else {
      console.log('[APP] Leg already exists, skipping')
    }
  }

  const handleRemoveLeg = (index: number) => {
    setLegs(legs.filter((_, i) => i !== index))
  }

  const handleClearLegs = () => {
    setLegs([])
  }

  const handleCreateParlay = (parlay: SimParlay) => {
    console.log('[APP] onCreateParlay called', parlay)
    const newParlays = [parlay, ...parlays]
    console.log('[APP] Adding parlay, total parlays:', newParlays.length)
    setParlays(newParlays)
  }

  return (
    <main className="mx-auto flex max-w-6xl gap-6 px-4 py-8">
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Markets</h1>
          <WalletConnect />
        </div>
        <MarketsList onAddLeg={handleAddLeg} />
      </div>
      <div className="w-[360px] space-y-4">
        <ParlayBuilder
          legs={legs}
          onRemoveLeg={handleRemoveLeg}
          onClearLegs={handleClearLegs}
          onCreateParlay={handleCreateParlay}
        />
        <MyParlays parlays={parlays} />
      </div>
    </main>
  )
}
