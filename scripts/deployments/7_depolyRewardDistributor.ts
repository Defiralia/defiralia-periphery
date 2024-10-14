import { Contract } from 'ethers'
import { ethers, network, upgrades } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployRewardDistributor } from '../../helpers/deploy-helpers'
import { AddressMap__factory } from '../../typechain-types'
import { proxyOptions } from '../constants/proxyOptions'

export const executeDepolyRewardDistributor = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const {
    contracts: { AddressMap },
  } = ContractsJsonHelper.load({
    network: network.name,
  })
  if (!AddressMap) {
    throw new Error('AddressMap address is not found')
  }

  const rewardDistributor = await deployRewardDistributor({
    deployer,
    upgrades,
    args: [AddressMap],
    options: proxyOptions,
  })

  const contracs: { [c: string]: Contract } = {
    RewardDistributor: rewardDistributor,
  }

  for (const c of Object.entries(contracs)) {
    ContractsJsonHelper.writeAddress({
      group: 'contracts',
      name: c[0],
      value: c[1].address,
      network: network.name,
    })
  }

  const addressMap = await AddressMap__factory.connect(AddressMap, deployer)

  await addressMap.setAddressToList(11, rewardDistributor.address)
  console.log(await addressMap.readAddressList(11))

  // export const CONTRACT_REWARD_DISTRIBUTOR = 11

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
}
