import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { DexManager__factory } from '../../typechain-types'
import { PARAMETERS } from '../constants'

export const executeSetPool = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const { tokens, contracts } = ContractsJsonHelper.load({
    network: network.name,
  })

  const { DefiraliaT, zSPY } = tokens
  const { DexManager } = contracts

  const { spyPool, defiraliatPool } = PARAMETERS[network.name]
  if (!spyPool || !defiraliatPool) {
    throw new Error('Missing parameters')
  }

  const dexManager = await DexManager__factory.connect(DexManager, deployer)
  await (
    await dexManager.setPool(zSPY, spyPool, {
      gasLimit: 1000000,
    })
  ).wait()

  console.log(await dexManager.queryPool(zSPY))

  await (
    await dexManager.setPool(DefiraliaT, defiraliatPool, {
      gasLimit: 1000000,
    })
  ).wait()

  console.log(await dexManager.queryPool(DefiraliaT))

  console.log(`------- Finished -------`)
}
