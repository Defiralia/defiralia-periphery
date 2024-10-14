import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Lending__factory, MintableERC20__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'

export const executeOpenPositionForInitialLiquidity = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const {
    tokens: { zSPY },
    campaign: { DefiraliaDai },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!zSPY || !DefiraliaDai) {
    throw new Error('Missing parameters')
  }

  const { contracts } = ContractsJsonHelper.load({
    network: network.name,
  })

  const { Lending, CollateralManager } = contracts

  const lending = await Lending__factory.connect(Lending, deployer)

  const amount = ethers.utils.parseEther('1000000')

  const DAI = await MintableERC20__factory.connect(DefiraliaDai, deployer)

  console.log(await DAI.balanceOf(CollateralManager))

  // Check Dex Price
  const approveTx = await DAI.approve(CollateralManager, amount, {
    gasLimit: 100000,
  })
  console.log(`${getExplorerLink(network.name)}${approveTx.hash}`)
  await approveTx.wait()

  console.log('Open Position')

  const tx = await lending.openPosition(
    zSPY,
    DefiraliaDai,
    amount,
    2000,
    { isShort: false, amountOutMinimum: 0, sqrtPriceLimitX96: 0 },
    {
      gasLimit: 1000000,
    },
  )
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  console.log(await DAI.balanceOf(CollateralManager))

  // POSITIONS
  console.log(await lending.queryUserPositions(deployer.address))

  console.log(`------- Finished -------`)
}
