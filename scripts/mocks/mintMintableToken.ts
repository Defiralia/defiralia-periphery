import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { MintableERC20__factory } from '../../typechain-types'
;(async () => {
  console.log(`------- Start -------`)
  const deployer = (await ethers.getSigners())[0]
  const value = '10000000000000000000000000' // 10000000
  console.log('Mint to:', deployer.address)
  console.log('Amount:', Number(value) / 10 ** 18)

  const { mockTokens } = ContractsJsonHelper.load({
    network: network.name,
  })
  const txDai = await MintableERC20__factory.connect(
    mockTokens.mockDAI,
    deployer,
  ).mint(value, { gasLimit: 1000000 })
  await txDai.wait()
  console.log('Mock DAI Minted. txHash:', txDai.hash)

  // const txDefiraliat = await MintableERC20__factory.connect(
  //   mockTokens.mockDefiraliaT,
  //   deployer,
  // ).mint(value, { gasLimit: 1000000 })
  // await txDefiraliat.wait()
  // console.log('Mock DefiraliaT Minted. txHash:', txDefiraliat.hash)

  // const txSPY = await ZAsset__factory.connect(
  //   mockTokens.mockzSPY,
  //   deployer,
  // ).mint(deployer.address, value, { gasLimit: 1000000 })
  // await txSPY.wait()
  // console.log('Mock zSPY Minted. txHash:', txSPY.hash)

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
