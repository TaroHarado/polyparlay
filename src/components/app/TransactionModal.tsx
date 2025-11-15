'use client'

import { useEffect, useState } from 'react'

interface TransactionModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  stake: number
  kTotal: number
  expectedPayout: number
  legsCount: number
}

export default function TransactionModal({
  open,
  onClose,
  onConfirm,
  stake,
  kTotal,
  expectedPayout,
  legsCount,
}: TransactionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm')

  useEffect(() => {
    if (!open) {
      setStep('confirm')
      setIsProcessing(false)
    }
  }, [open])

  const handleConfirm = async () => {
    setIsProcessing(true)
    setStep('processing')

    // Симуляция обработки транзакции
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setStep('success')
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onConfirm()
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl border border-white/10 bg-[#111] p-6 shadow-2xl">
        {step === 'confirm' && (
          <>
            <h3 className="mb-4 text-lg font-semibold text-white">
              Confirm Parlay
            </h3>
            <div className="mb-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Legs:</span>
                <span className="font-medium">{legsCount}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Stake:</span>
                <span className="font-medium">${stake.toFixed(2)} USDC</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total odds:</span>
                <span className="font-medium text-[#7C5CFF]">{kTotal.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-slate-200">
                <span className="font-medium">Potential payout:</span>
                <span className="font-semibold text-green-400">
                  ${expectedPayout.toFixed(2)} USDC
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-[#7C5CFF] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#6B4CE6] transition disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#7C5CFF] border-t-transparent"></div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Processing Transaction
            </h3>
            <p className="text-sm text-slate-400">
              Please wait while we process your parlay...
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center">
            <div className="mb-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-6 w-6 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-white">
              Transaction Confirmed
            </h3>
            <p className="text-sm text-slate-400">
              Your parlay has been created successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

