import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import {
  RewardDistributor__factory,
  Staking__factory,
  DefiraliaToken__factory,
} from '../../typechain-types'
import { PARAMETERS, getExplorerLink } from '../constants'
;(async () => {
  console.log(`------- Start -------`)
  const deployer = (await ethers.getSigners())[0]
  const alice = (await ethers.getSigners())[1]

  const { treasury } = PARAMETERS[network.name]
  if (!treasury) {
    throw new Error('Missing parameters')
  }

  const { contracts, tokens } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { DefiraliaT, zSPY } = tokens
  const { Staking, RewardDistributor } = contracts

  const rewardDistributor = await RewardDistributor__factory.connect(
    RewardDistributor,
    deployer,
  )

  const defiraliatContract = await DefiraliaToken__factory.connect(DefiraliaT, deployer)
  console.log(
    'RewardDistributor Balance: ' +
      (await defiraliatContract.balanceOf(RewardDistributor)),
  )

  // anyone can call this function
  const tx = await rewardDistributor.distribute()
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)

  console.log(
    'RewardDistributor Balance: ' +
      (await defiraliatContract.balanceOf(RewardDistributor)),
  )
  console.log('Staking Balance: ' + (await defiraliatContract.balanceOf(Staking)))
  console.log('Treasury Balance: ' + (await defiraliatContract.balanceOf(treasury)))

  const staking = await Staking__factory.connect(Staking, deployer)

  console.log('zSPY PoolInfo')
  console.log(await staking.queryPoolInfo(zSPY))

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
