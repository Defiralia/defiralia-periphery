import { parseEther } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Factory__factory, DefiraliaToken__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'

const STRART = Math.floor(Date.now() / 1000)
const DURAION = 126230400 // 4years
const DISTRIBUTION_AMOUNT = parseEther('200000')

;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const { contracts, tokens } = ContractsJsonHelper.load({
    network: network.name,
  })

  const { DefiraliaT } = tokens
  const { Factory, RewardDistributor } = contracts

  console.log('Transfer Distributing Amount to RewardDistributor')

  const defiraliatContract = await DefiraliaToken__factory.connect(DefiraliaT, deployer)
  await defiraliatContract
    .transfer(RewardDistributor, DISTRIBUTION_AMOUNT)
    .then((tx) => tx.wait())

  console.log('balanceOf: ' + (await defiraliatContract.balanceOf(RewardDistributor)))

  const factory = Factory__factory.connect(Factory, deployer)

  const tx = await factory.updateDistributionSchedule([
    {
      startTime: STRART,
      endTime: STRART + DURAION,
      distributionAmount: DISTRIBUTION_AMOUNT,
    },
  ])
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
