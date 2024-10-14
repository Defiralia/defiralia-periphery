import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { CollateralOracle__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'

const MULTIPLIER = 1000

export const executeRegisterCollateral = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const { contracts, campaign } = ContractsJsonHelper.load({
    network: network.name,
  })

  const { CollateralOracle } = contracts
  const { DefiraliaDai } = campaign

  const collateralOracle = CollateralOracle__factory.connect(
    CollateralOracle,
    deployer,
  )

  const tx = await collateralOracle.registerCollateral(DefiraliaDai, MULTIPLIER)
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)

  console.log(`------- Finished -------`)
}
