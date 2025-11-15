import type { WalletClient } from 'viem'

/**
 * Adapter to convert viem WalletClient to ethers-like signer interface
 * for @polymarket/clob-client compatibility
 */
export function walletClientToEthersLikeSigner(walletClient: WalletClient) {
  if (!walletClient.account) {
    throw new Error('WalletClient must have an account')
  }

  return {
    getAddress: async () => walletClient.account!.address,

    // clob-client inside calls _signTypedData(domain, types, value)
    _signTypedData: async (domain: any, types: any, value: any) => {
      // viem/wagmi v2: signTypedData expects { domain, types, primaryType, message }
      // primaryType is inside types, need to determine it correctly
      const primaryType = Object.keys(types).find(
        (key) => key !== 'EIP712Domain'
      )

      if (!primaryType) {
        throw new Error('Unable to determine primaryType for typed data')
      }

      return walletClient.signTypedData({
        account: walletClient.account!,
        domain,
        types,
        primaryType,
        message: value,
      } as any)
    },
  }
}

