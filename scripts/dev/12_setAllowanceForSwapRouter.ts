import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { DexManager__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'

export const executeSetAllowanceForSwapRouter = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const { contracts, tokens } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { zSPY } = tokens
  const { DexManager } = contracts

  // Check Dex Price
  const dexManager = await DexManager__factory.connect(DexManager, deployer)

  const tx = await dexManager.setAllowanceForSwapRouter(zSPY)

  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  console.log(`------- Finished -------`)
}
