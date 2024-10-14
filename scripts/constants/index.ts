export const ZERO_ADDRESS =
  '0000000000000000000000000000000000000000000000000000000000000000'

type Parameters = {
  daiUsdPriceFeed: string
  spyUsdPriceFeed: string
  treasury: string
  governance: string // TODO: contract or eoa or gnosis safe
  nonfungiblePositionManager: string
  swapRouter: string
  spyPool: string
  defiraliatPool: string
}

export const PARAMETERS: { [key in string]: Parameters } = {
  arbitrumGoerli: {
    daiUsdPriceFeed: '0x103b53E977DA6E4Fa92f76369c8b7e20E7fb7fe1',
    spyUsdPriceFeed: '0x2eE9BFB2D319B31A573EA15774B755715988E99D', // ARB/USD
    treasury: '0xeE1C92133EaA99FaAC6e96C9F91F0ac780308baf',
    governance: '0xD5b1b8bC7249697cccF5Ede209a8a068cc51d934',
    nonfungiblePositionManager: '0xdEB6987Db763AE7df44f88Ae69afB051CE396BBa',
    swapRouter: '0x4257dd9e5317B0AB788cF6a71B9Dd5Dd09774858',
    spyPool: '0x2E1cFB6ba7E2Ec651a8b4B6e90b0390F4dff108b',
    defiraliatPool: '0x49F4Bb8e79B159c9b76F2503Fa59d8e5e73D3A5c',
  },
  sepolia: {
    daiUsdPriceFeed: '0x14866185B1962B63C3Ea9E03Bc1da838bab34C19',
    spyUsdPriceFeed: '0x4b531A318B0e44B549F3b2f824721b3D0d51930A',
    treasury: '0xeE1C92133EaA99FaAC6e96C9F91F0ac780308baf',
    governance: '0xD5b1b8bC7249697cccF5Ede209a8a068cc51d934',
    nonfungiblePositionManager: '0xee3cEfb846Db75Df4546472f405feA0B83eA5A35',
    swapRouter: '0x0d865609Fbfd0d64b11AEeb871F08A0D7BCbd85C',
    spyPool: '0x52Fd4C791fcB0238DeC38F3b66B2ac50bED2bbe2',
    defiraliatPool: '0xdC2ad6107520cF52EaCf2D8B89E3AC21364c25d4',
  },
}

export const getExplorerLink = (network: string) => {
  switch (network) {
    case 'arbitrum':
      return 'https://arbiscan.io/tx/'
    case 'arbitrumGoerli':
      return 'https://goerli.arbiscan.io//tx/'
    case 'sepolia':
      return 'https://sepolia.etherscan.io/tx/'
    default:
      return ''
  }
}
