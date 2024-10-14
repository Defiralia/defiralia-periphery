import { DeployProxyOptions } from '@openzeppelin/hardhat-upgrades/dist/utils'
import { parseEther } from 'ethers/lib/utils'
import { ethers, upgrades } from 'hardhat'
import {
  CONTRACT_COLLATERAL_MANAGER,
  CONTRACT_COLLATERAL_ORACLE,
  CONTRACT_DEX_MANAGER,
  CONTRACT_FACTORY,
  CONTRACT_LENDING,
  CONTRACT_PRICE_ORACLE,
  CONTRACT_REWARD_DISTRIBUTOR,
  CONTRACT_STAKING,
  CONTRACT_TREASURY,
  TOKEN_BASE,
  TOKEN_DefiraliaT,
  longEmissionTimes,
  shortEmissionTimes,
} from './constant'
import { deployLibrary } from './library'
import { deployTokens } from './tokens'

const proxyOptions: DeployProxyOptions = {
  initializer: 'initializeTest',
  kind: 'uups',
  unsafeAllow: ['external-library-linking'],
}

const commonSettings = async () => {
  const [owner, alice, bob, treasury] = await ethers.getSigners()

  const treasuryAddress = treasury.address

  // Library
  const { decimal, mathUtils, positionLogic } = await deployLibrary()

  // Tokens
  const { defiraliat, dai } = await deployTokens()

  // AddressMap
  const AddressMap = await ethers.getContractFactory('AddressMapTest')
  const addressMap = await upgrades.deployProxy(
    AddressMap,
    [defiraliat.address, dai.address],
    proxyOptions,
  )

  // Contracts
  const Factory = await ethers.getContractFactory('FactoryTest', {
    libraries: {
      Decimal: decimal.address,
    },
  })
  const Lending = await ethers.getContractFactory('LendingTest', {
    libraries: {
      PositionLogic: positionLogic.address,
    },
  })
  const CollateralManager = await ethers.getContractFactory(
    'CollateralManagerTest',
  )
  const Staking = await ethers.getContractFactory('StakingTest', {
    libraries: {
      Decimal: decimal.address,
    },
  })
  const CollateralOracle = await ethers.getContractFactory(
    'CollateralOracleTest',
  )
  const PriceOracle = await ethers.getContractFactory('PriceOracleTest')
  const RewardDistributor = await ethers.getContractFactory(
    'RewardDistributorTest',
  )

  // Mocks
  const PriceAggregatorMock = await ethers.getContractFactory(
    'PriceAggregatorMock',
  )
  const DexManagerMock = await ethers.getContractFactory('DexManagerMock', {
    libraries: {
      Decimal: decimal.address,
    },
  })

  // Deploy Contract
  const factory = await upgrades.deployProxy(
    Factory,
    [addressMap.address],
    proxyOptions,
  )
  const lending = await upgrades.deployProxy(
    Lending,
    [addressMap.address],
    proxyOptions,
  )
  const collateralManager = await upgrades.deployProxy(
    CollateralManager,
    [addressMap.address],
    proxyOptions,
  )
  const collateralOracle = await upgrades.deployProxy(
    CollateralOracle,
    [addressMap.address],
    proxyOptions,
  )
  const priceOracle = await upgrades.deployProxy(
    PriceOracle,
    [addressMap.address],
    proxyOptions,
  )

  const staking = await upgrades.deployProxy(
    Staking,
    [addressMap.address],
    proxyOptions,
  )

  const dexManagerMock = await DexManagerMock.deploy()
  const zatPriceAggregatorMock = await PriceAggregatorMock.deploy(10000000000)
  const daiPriceAggregatorMock = await PriceAggregatorMock.deploy(100000000)

  // Set AddressMap
  await addressMap.setAddressToList(CONTRACT_FACTORY, factory.address)
  await addressMap.setAddressToList(CONTRACT_LENDING, lending.address)
  await addressMap.setAddressToList(
    CONTRACT_COLLATERAL_MANAGER,
    collateralManager.address,
  )
  await addressMap.setAddressToList(CONTRACT_STAKING, staking.address)
  await addressMap.setAddressToList(CONTRACT_PRICE_ORACLE, priceOracle.address)
  await addressMap.setAddressToList(
    CONTRACT_COLLATERAL_ORACLE,
    collateralOracle.address,
  )
  await addressMap.setAddressToList(
    CONTRACT_DEX_MANAGER,
    dexManagerMock.address,
  )
  await addressMap.setAddressToList(CONTRACT_TREASURY, treasuryAddress)
  await addressMap.setAddressToList(TOKEN_DefiraliaT, defiraliat.address)
  await addressMap.setAddressToList(TOKEN_BASE, dai.address)

  // Reward Distributor depends on DefiraliaT and Factory in constructor
  const rewardDistributor = await upgrades.deployProxy(
    RewardDistributor,
    [addressMap.address],
    proxyOptions,
  )
  await addressMap.setAddressToList(
    CONTRACT_REWARD_DISTRIBUTOR,
    rewardDistributor.address,
  )

  // Deploy ZAssetMock
  const zatTx = await (await factory.createAssetTest('Defiralia Asset', 'ZAT')).wait()
  const spyTx = await (
    await factory.createAssetTest('Defiralia SPY Asset', 'zSPY')
  ).wait()
  const tslaTx = await (
    await factory.createAssetTest('Defiralia SPY Asset', 'zSPY')
  ).wait()

  // @ts-ignore
  const zatAddr = zatTx.events[1].args.asset
  // @ts-ignore
  const spyAddr = spyTx.events[1].args.asset
  // @ts-ignore
  const tslaAddr = tslaTx.events[1].args.asset

  const ZAsset = await ethers.getContractFactory('ZAssetMock')
  const zat = ZAsset.attach(zatAddr)
  const spy = ZAsset.attach(spyAddr)
  const tsla = ZAsset.attach(tslaAddr)

  // Set Mock Value
  await priceOracle.setPriceAggregator(
    zat.address,
    zatPriceAggregatorMock.address,
  )
  await priceOracle.setPriceAggregator(
    dai.address,
    daiPriceAggregatorMock.address,
  )
  await dexManagerMock.setMockPrice(defiraliat.address, 50e8)
  await dexManagerMock.setMockPrice(zat.address, 106e8)
  await dexManagerMock.setMockPrice(dai.address, 1e8)
  await dexManagerMock.setMockAddresses(defiraliat.address, dai.address)
  await dexManagerMock.setPool(
    zat.address,
    '0x0000000000000000000000000000000000000001',
  )

  return {
    owner,
    alice,
    bob,
    positionLogic,
    defiraliat,
    zat,
    spy,
    tsla,
    dai,
    factory,
    lending,
    collateralManager,
    staking,
    collateralOracle,
    priceOracle,
    zatPriceAggregatorMock,
    daiPriceAggregatorMock,
    dexManagerMock,
    addressMap,
    treasuryAddress,
    rewardDistributor,
  }
}

export const collateralManagerFixture = async () => {
  const { alice, bob, zat, dai, lending, collateralManager } =
    await commonSettings()
  await dai.mint(alice.address, parseEther('1000'))
  return { alice, bob, zat, dai, lending, collateralManager }
}

export const lendingFixture = async () => {
  const {
    owner,
    alice,
    bob,
    positionLogic,
    zat,
    dai,
    factory,
    lending,
    collateralManager,
    staking,
    collateralOracle,
    zatPriceAggregatorMock,
    addressMap,
    treasuryAddress,
    rewardDistributor,
  } = await commonSettings()

  // Mint Tokens
  await dai.mint(owner.address, parseEther('10000'))
  await dai.mint(alice.address, parseEther('10000'))
  await factory.mintAssetTest(zat.address, bob.address, parseEther('10000'))

  // Set asset
  await factory.enableAsset(zat.address, 10, 200, 1500)
  await collateralOracle.registerCollateral(dai.address, 1000)

  return {
    alice,
    bob,
    positionLogic,
    factory,
    zat,
    dai,
    lending,
    collateralManager,
    staking,
    collateralOracle,
    zatPriceAggregatorMock,
    treasuryAddress,
    rewardDistributor,
  }
}

export const stakingFixture = async () => {
  const {
    alice,
    defiraliat,
    zat,
    dai,
    staking,
    zatPriceAggregatorMock,
    priceOracle,
    dexManagerMock,
    addressMap,
  } = await commonSettings()

  const [, , , , factory, lending] = await ethers.getSigners()
  const dummyToken1 = '0x0000000000000000000000000000000000000001' // < dai
  const dummyToken2 = '0xF000000000000000000000000000000000000000' // > dai

  await priceOracle.setPriceAggregator(
    dummyToken1,
    zatPriceAggregatorMock.address,
  )
  await priceOracle.setPriceAggregator(
    dummyToken2,
    zatPriceAggregatorMock.address,
  )
  await dexManagerMock.setMockPrice(dummyToken1, 106e8)
  await dexManagerMock.setMockPrice(dummyToken2, 106e8)

  // Set AddressMap
  await addressMap.setAddressToList(CONTRACT_FACTORY, factory.address)
  await addressMap.setAddressToList(CONTRACT_LENDING, lending.address)

  return {
    alice,
    zat,
    dai,
    defiraliat,
    dummyToken1,
    dummyToken2,
    factory,
    lending,
    staking,
  }
}

export const factoryFixture = async () => {
  const {
    alice,
    defiraliat,
    zat,
    spy,
    tsla,
    dai,
    factory,
    lending,
    staking,
    collateralOracle,
    priceOracle,
    zatPriceAggregatorMock,
    addressMap,
    rewardDistributor,
    treasuryAddress,
  } = await commonSettings()

  const dummyToken = '0x0000000000000000000000000000000000000009'

  // Set AddressMap
  await addressMap.setAddressToList(CONTRACT_PRICE_ORACLE, priceOracle.address)
  // Set Mock Value
  await priceOracle.setPriceAggregator(
    spy.address,
    zatPriceAggregatorMock.address,
  )
  await priceOracle.setPriceAggregator(
    dummyToken,
    zatPriceAggregatorMock.address,
  )

  return {
    alice,
    zat,
    spy,
    tsla,
    dai,
    defiraliat,
    dummyToken,
    factory,
    lending,
    staking,
    collateralOracle,
    treasury: treasuryAddress,
    rewardDistributor,
  }
}

export const collateralOracleFixture = async () => {
  const { alice, zat, tsla, dai, collateralOracle } = await commonSettings()

  return {
    alice,
    zat,
    tsla,
    dai,
    collateralOracle,
  }
}

export const priceOracleFixture = async () => {
  const { zat, spy, priceOracle, zatPriceAggregatorMock } =
    await commonSettings()

  return {
    zat,
    spy,
    priceOracle,
    zatPriceAggregatorMock,
  }
}

export const rewardDistributorFixture = async () => {
  const { zat, defiraliat, factory, rewardDistributor, alice, owner } =
    await commonSettings()

  return {
    zat,
    defiraliat,
    factory,
    rewardDistributor,
    alice,
    owner,
  }
}

export const defiraliaTokenFixture = async () => {
  const { owner } = await commonSettings()
  const DefiraliaToken = await ethers.getContractFactory('DefiraliaToken')
  const defiraliat = await DefiraliaToken.deploy()

  return {
    defiraliat,
    owner,
  }
}

export const defiraliatVestingWalletFixture = async () => {
  const { owner } = await commonSettings()
  const [, preSeed, seed1, seed2, team] = await ethers.getSigners()

  const DefiraliaToken = await ethers.getContractFactory('DefiraliaToken')
  const defiraliat = await DefiraliaToken.deploy()

  const DefiraliaVestingWallet = await ethers.getContractFactory('DefiraliaVestingWallet')
  const currentTimestamp = Date.now()
  const vestingWalletForPreseed = await DefiraliaVestingWallet.deploy(
    defiraliat.address,
    preSeed.address,
    shortEmissionTimes,
  )
  const vestingWalletForSeed1 = await DefiraliaVestingWallet.deploy(
    defiraliat.address,
    seed1.address,
    longEmissionTimes,
  )
  const vestingWalletForSeed2 = await DefiraliaVestingWallet.deploy(
    defiraliat.address,
    seed2.address,
    longEmissionTimes,
  )
  const vestingWalletForTeam = await DefiraliaVestingWallet.deploy(
    defiraliat.address,
    team.address,
    longEmissionTimes,
  )

  return {
    defiraliat,
    owner,
    preSeed,
    seed1,
    seed2,
    team,
    vestingWalletForPreseed,
    vestingWalletForSeed1,
    vestingWalletForSeed2,
    vestingWalletForTeam,
    currentTimestamp,
  }
}
