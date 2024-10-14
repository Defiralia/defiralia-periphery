import { ethers } from 'hardhat'

export const deployTokens = async () => {
  const TokenMock = await ethers.getContractFactory('TokenMock')
  const defiraliat = await TokenMock.deploy('Defiralia Token', 'DefiraliaT', 18)
  const dai = await TokenMock.deploy('Stable Coin', 'DAI', 18)

  return { defiraliat, dai }
}
