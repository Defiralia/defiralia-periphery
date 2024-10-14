import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Factory__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'

const WEIGHT = 100
const LIQUIDATION_DISCOUNT = 200
const MIN_COLLATERAL_RATIO = 1400 // 140%

export const executeEnableAsset = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const { contracts } = ContractsJsonHelper.load({
    network: network.name,
  })
  const {
    tokens: { zSPY },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!zSPY) {
    throw new Error('zSPY address is not found')
  }

  const { Factory } = contracts

  const factory = Factory__factory.connect(Factory, deployer)

  const tx = await factory.enableAsset(
    zSPY,
    WEIGHT,
    LIQUIDATION_DISCOUNT,
    MIN_COLLATERAL_RATIO,
    {
      gasLimit: 5000000,
    },
  )
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  console.log(`------- Finished -------`)
}
