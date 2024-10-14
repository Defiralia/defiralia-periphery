import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Staking__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'
;(async () => {
  console.log(`------- Start -------`)
  const deployer = (await ethers.getSigners())[0]

  const {
    tokens: { zSPY },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!zSPY) {
    throw new Error('zSPY address is not found')
  }

  const { contracts } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { Staking } = contracts

  const staking = await Staking__factory.connect(Staking, deployer)

  const tx = await staking.adjustPremium([zSPY])
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  const info = await staking.queryPoolInfo(zSPY)
  console.log(info)

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
