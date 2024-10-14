import { Contract } from 'ethers'
import { ethers, network, upgrades } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployDexManager } from '../../helpers/deploy-helpers'
import { AddressMap__factory } from '../../typechain-types'
import { PARAMETERS } from '../constants'
import { proxyOptions } from '../constants/proxyOptions'

export const executeDeployDexManager = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const {
    library: { Decimal },
  } = ContractsJsonHelper.load({ network: network.name })

  const {
    contracts: { AddressMap },
  } = ContractsJsonHelper.load({
    network: network.name,
  })
  if (!AddressMap) {
    throw new Error('AddressMap address is not found')
  }

  const { nonfungiblePositionManager, swapRouter } = PARAMETERS[network.name]
  if (!nonfungiblePositionManager || !swapRouter) {
    throw new Error('Missing parameters')
  }

  const dexManager = await deployDexManager({
    deployer,
    linkLibraryAddresses: {
      'contracts/libraries/Decimal.sol:Decimal': Decimal,
    },
    upgrades,
    args: [AddressMap, nonfungiblePositionManager, swapRouter],
    options: proxyOptions,
  })

  const addressMap = await AddressMap__factory.connect(AddressMap, deployer)
  await addressMap.setAddressToList(9, dexManager.address)

  const contracs: { [c: string]: Contract } = {
    DexManager: dexManager,
  }

  for (const c of Object.entries(contracs)) {
    ContractsJsonHelper.writeAddress({
      group: 'contracts',
      name: c[0],
      value: c[1].address,
      network: network.name,
    })
  }

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
}
