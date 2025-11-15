'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'

export default function WalletConnect() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const { connectors, connect, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => setMounted(true), [])

  // Debug logs
  useEffect(() => {
    console.log('[WALLET] isConnected:', isConnected, 'address:', address)
    console.log(
      '[WALLET] available connectors:',
      connectors.map((c) => ({ id: c.id, name: c.name, ready: c.ready }))
    )
  }, [isConnected, address, connectors])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open || !mounted) return
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.wallet-connect-dropdown')) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open, mounted])

  if (!mounted) return null

  if (isConnected && address) {
    const short = `${address.slice(0, 6)}...${address.slice(-4)}`
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="text-emerald-400">Connected: {short}</span>
        <button
          onClick={() => disconnect()}
          className="rounded-md border border-white/10 px-2 py-1 text-slate-200 hover:bg-white/5 transition"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="relative wallet-connect-dropdown">
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400">Not connected</span>
        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-md bg-[#7C5CFF] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#6B4CE6] transition"
        >
          Connect Wallet
        </button>
      </div>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-white/10 bg-[#111] p-2 text-xs shadow-lg z-50">
          {connectors
            .filter((c) =>
              ['MetaMask', 'Rabby Wallet', 'Phantom', 'Injected'].includes(
                c.name
              )
            )
            .map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  console.log(
                    '[WALLET] Connecting with',
                    connector.id,
                    connector.name
                  )
                  connect({ connector })
                  setOpen(false)
                }}
                disabled={isPending}
                className="block w-full rounded px-2 py-1 text-left hover:bg-white/10 disabled:opacity-40 transition"
              >
                {connector.name}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

