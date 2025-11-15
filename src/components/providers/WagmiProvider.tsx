'use client'

import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http } from 'wagmi'
import { mainnet, polygon } from 'wagmi/chains'
import { injected, metaMask } from 'wagmi/connectors'
import { useState } from 'react'

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  const [config] = useState(() =>
    createConfig({
      chains: [mainnet, polygon],
      connectors: [injected(), metaMask()],
      transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
      },
    })
  )

  return (
    <WagmiProviderBase config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProviderBase>
  )
}

