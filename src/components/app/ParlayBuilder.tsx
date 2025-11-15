'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import TransactionModal from './TransactionModal'

export interface ParlayLeg {
  marketId: string
  outcomeIndex: number
  question: string
  outcomeLabel: string
  price: number // используем yesPrice/noPrice
  odds: number // decimal odds
}

interface ParlayBuilderProps {
  legs: ParlayLeg[]
  onRemoveLeg: (index: number) => void
  onClearLegs: () => void
  onCreateParlay: (parlay: {
    id: string
    createdAt: string
    stake: number
    kTotal: number
    expectedPayout: number
    legs: ParlayLeg[]
  }) => void
}

export default function ParlayBuilder({
  legs,
  onRemoveLeg,
  onClearLegs,
  onCreateParlay,
}: ParlayBuilderProps) {
  const { address, isConnected } = useAccount()
  const [stake, setStake] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [showTransactionModal, setShowTransactionModal] = useState(false)

  // Calculate total odds and expected payout
  const kTotal = legs.length > 0
    ? legs.reduce((acc, leg) => acc * (leg.odds || 1), 1)
    : 1

  const numericStake = parseFloat(stake) || 0
  const expectedPayout = numericStake * kTotal

  const handleCreateParlay = () => {
    const numericStake = parseFloat(stake)
    if (!numericStake || numericStake <= 0) {
      setError('Enter a valid stake')
      return
    }

    if (legs.length === 0) {
      setError('Add at least one leg')
      return
    }

    // Если кошелек не подключен - показываем ошибку
    if (!isConnected || !address) {
      setError('Please connect your wallet first to create a parlay')
      return
    }

    // Если кошелек подключен - показываем модальное окно подтверждения
    setShowTransactionModal(true)
    setError(null)
  }

  const handleTransactionConfirm = () => {
    const numericStake = parseFloat(stake)
    const parlay = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      stake: numericStake,
      kTotal,
      expectedPayout,
      legs: [...legs],
    }

    console.log('[PARLAY] Creating parlay', parlay)
    onCreateParlay(parlay)
    setStake('')
    onClearLegs()
    setError(null)
  }

  return (
    <div className="rounded-xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6 shadow-lg shadow-black/40">
      <h2 className="text-xl font-semibold mb-4">Parlay Builder</h2>

      {legs.length === 0 ? (
        <div className="text-sm text-slate-400 mb-4">
          Add legs from the markets list to build your parlay
        </div>
      ) : (
        <div className="space-y-3 mb-4">
          {legs.map((leg, index) => (
            <div
              key={`${leg.marketId}-${leg.outcomeIndex}-${index}`}
              className="flex items-start justify-between p-3 rounded-lg border border-white/10 bg-white/5"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">
                  {leg.question}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {leg.outcomeLabel} @ {(leg.odds || 0).toFixed(2)}x
                </div>
              </div>
              <button
                onClick={() => onRemoveLeg(index)}
                className="ml-2 text-red-400 hover:text-red-300 text-sm"
                title="Remove leg"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {legs.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border border-white/10 bg-white/5">
          <div className="text-sm text-slate-300">
            <div className="flex justify-between mb-1">
              <span>Total odds (k):</span>
              <span className="font-semibold">{kTotal.toFixed(2)}x</span>
            </div>
            {numericStake > 0 && (
              <div className="flex justify-between mt-2 pt-2 border-t border-white/10">
                <span>Potential payout:</span>
                <span className="font-semibold text-green-400">
                  ${expectedPayout.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">
            Stake (USDC)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={stake}
            onChange={(e) => {
              setStake(e.target.value)
              setError(null)
            }}
            placeholder="0.00"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C5CFF] focus:border-transparent"
          />
        </div>

        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        <button
          onClick={handleCreateParlay}
          disabled={legs.length === 0 || !stake || parseFloat(stake) <= 0}
          className="w-full rounded-lg bg-[#7C5CFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6B4CE6] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Create Parlay
        </button>
      </div>

      <TransactionModal
        open={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        onConfirm={handleTransactionConfirm}
        stake={numericStake}
        kTotal={kTotal}
        expectedPayout={expectedPayout}
        legsCount={legs.length}
      />
    </div>
  )
}
