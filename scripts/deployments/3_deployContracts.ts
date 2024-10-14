import { Contract } from 'ethers'
import { ethers, network, upgrades } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import {
  deployAddressMap,
  deployCollateralManager,
  deployCollateralOracle,
  deployFactory,
  deployLending,
  deployPriceOracle,
  deployStaking,
} from '../../helpers/deploy-helpers'
import { PARAMETERS } from '../constants'
import { proxyOptions } from '../constants/proxyOptions'

export const executeDeployContracts = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const { library } = ContractsJsonHelper.load({ network: network.name })

  const { PositionLogic, Decimal, MathUtils } = library

  const {
    tokens: { DefiraliaT },
    campaign: { DefiraliaDai },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!DefiraliaT || !DefiraliaDai) {
    throw new Error('Missing parameters')
  }
  const { treasury } = PARAMETERS[network.name]
  if (!treasury) {
    throw new Error('Missing parameters')
  }

  const addressMap = await deployAddressMap({
    deployer,
    upgrades,
    args: [DefiraliaT, DefiraliaDai],
    options: proxyOptions,
  })
  console.log('addressMap: ' + addressMap.address)
  await addressMap.setAddressToList(1, DefiraliaT)
  await addressMap.setAddressToList(2, DefiraliaDai)
  await addressMap.setAddressToList(10, treasury)

  const factory = await deployFactory({
    deployer,
    linkLibraryAddresses: {
      'contracts/libraries/Decimal.sol:Decimal': Decimal,
    },
    upgrades,
    args: [addressMap.address],
    options: proxyOptions,
  })
  console.log('factory: ' + factory.address)
  await addressMap.setAddressToList(3, factory.address)

  const lending = await deployLending({
    deployer,
    linkLibraryAddresses: {
      'contracts/logics/PositionLogic.sol:PositionLogic': PositionLogic,
    },
    upgrades,
    args: [addressMap.address],
    options: proxyOptions,
  })
  console.log('lending: ' + lending.address)
  await addressMap.setAddressToList(4, lending.address)

  const collateralManager = await deployCollateralManager({
    deployer,
    upgrades,
    args: [addressMap.address],
    options: proxyOptions,
  })
  console.log('collateralManager: ' + collateralManager.address)
  await addressMap.setAddressToList(5, collateralManager.address)

  const staking = await deployStaking({
    deployer,
    linkLibraryAddresses: {
      'contracts/libraries/Decimal.sol:Decimal': Decimal,
    },
    upgrades,
    args: [addressMap.address],
    options: proxyOptions,
  })
  console.log('staking: ' + staking.address)
  await addressMap.setAddressToList(6, staking.address)

  const priceOracle = await deployPriceOracle({
    deployer,
    upgrades,
    args: [addressMap.address],
    options: proxyOptions,
  })
  console.log('priceOracle: ' + priceOracle.address)
  await addressMap.setAddressToList(7, priceOracle.address)

  const collateralOracle = await deployCollateralOracle({
    deployer,
    upgrades,
    args: [addressMap.address],
    options: proxyOptions,
  })
  console.log('collateralOracle: ' + collateralOracle.address)
  await addressMap.setAddressToList(8, collateralOracle.address)

  const contracs: { [c: string]: Contract } = {
    AddressMap: addressMap,
    Factory: factory,
    Lending: lending,
    CollateralManager: collateralManager,
    Staking: staking,
    PriceOracle: priceOracle,
    CollateralOracle: collateralOracle,
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
