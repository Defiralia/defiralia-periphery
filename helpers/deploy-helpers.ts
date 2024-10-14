import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { HardhatUpgrades } from '@openzeppelin/hardhat-upgrades'
import {
  DeployProxyOptions,
  UpgradeProxyOptions,
} from '@openzeppelin/hardhat-upgrades/dist/utils'
import {
  AddressMap,
  AddressMap__factory,
  CLPriceAggregator,
  CLPriceAggregator__factory,
  CollateralManager,
  CollateralManager__factory,
  CollateralOracle,
  CollateralOracle__factory,
  CompetitionVault,
  CompetitionVault__factory,
  Decimal,
  Decimal__factory,
  DexManager,
  DexManager__factory,
  Factory,
  Lending,
  Lending__factory,
  MathUtils,
  MathUtils__factory,
  MintableERC20,
  MintableERC20__factory,
  PositionLogicTest__factory,
  PositionLogic__factory,
  PriceAggregatorMock,
  PriceAggregatorMock__factory,
  PriceOracle,
  PriceOracle__factory,
  RewardDistributor,
  RewardDistributor__factory,
  Staking,
  ZAssetMock,
  ZAssetMock__factory,
  DefiraliaDai,
  DefiraliaDai__factory,
  DefiraliaToken,
  DefiraliaToken__factory,
  DefiraliaVestingWallet,
  DefiraliaVestingWallet__factory,
} from '../typechain-types'
import { DexManagerLibraryAddresses } from '../typechain-types/factories/contracts/DexManager__factory'
import {
  FactoryLibraryAddresses,
  Factory__factory,
} from '../typechain-types/factories/contracts/Factory__factory'
import { LendingLibraryAddresses } from '../typechain-types/factories/contracts/Lending__factory'
import {
  StakingLibraryAddresses,
  Staking__factory,
} from '../typechain-types/factories/contracts/Staking__factory'
import { PositionLogicTestLibraryAddresses } from '../typechain-types/factories/contracts/libraries/PositionLogicTest__factory'
import { PositionLogicLibraryAddresses } from '../typechain-types/factories/contracts/libraries/PositionLogic__factory'

type CommonArgs = {
  deployer: SignerWithAddress
  upgrades: HardhatUpgrades
  args?: any[]
  options?: DeployProxyOptions
}

type UpgradeCommonArgs = {
  deployer: SignerWithAddress
  upgrades: HardhatUpgrades
  args?: any[]
  options?: UpgradeProxyOptions
}

export const deployAddressMap = async ({
  deployer,
  upgrades,
  args,
  options,
}: CommonArgs & { args: Parameters<AddressMap['initialize']> }) => {
  const instance = (await upgrades.deployProxy(
    new AddressMap__factory(deployer),
    args,
    options,
  )) as AddressMap
  await instance.deployTransaction.wait()
  return instance
}

export const deployFactory = async ({
  deployer,
  linkLibraryAddresses,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<Factory['initialize']>
  linkLibraryAddresses: FactoryLibraryAddresses
}) => {
  const instance = (await upgrades.deployProxy(
    new Factory__factory(linkLibraryAddresses, deployer),
    args,
    options,
  )) as Factory
  await instance.deployTransaction.wait()
  return instance
}

export const deployLending = async ({
  deployer,
  linkLibraryAddresses,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<Factory['initialize']>
  linkLibraryAddresses: LendingLibraryAddresses
}) => {
  const instance = (await upgrades.deployProxy(
    new Lending__factory(linkLibraryAddresses, deployer),
    args,
    options,
  )) as Lending
  await instance.deployTransaction.wait()
  return instance
}

export const depolyPositionLogic = async ({
  deployer,
  linkLibraryAddresses,
  params,
}: {
  deployer: SignerWithAddress
  linkLibraryAddresses: PositionLogicLibraryAddresses
  params: Parameters<PositionLogic__factory['deploy']>
}) => {
  const instance = await new PositionLogic__factory(
    linkLibraryAddresses,
    deployer,
  ).deploy(...params)
  await instance.deployTransaction.wait()
  return instance
}

export const depolyPositionLogicTest = async ({
  deployer,
  linkLibraryAddresses,
  params,
}: {
  deployer: SignerWithAddress
  linkLibraryAddresses: PositionLogicTestLibraryAddresses
  params: Parameters<PositionLogicTest__factory['deploy']>
}) => {
  const instance = await new PositionLogicTest__factory(
    linkLibraryAddresses,
    deployer,
  ).deploy(...params)
  await instance.deployTransaction.wait()
  return instance
}

export const deployCollateralManager = async ({
  deployer,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<Factory['initialize']>
}) => {
  const instance = (await upgrades.deployProxy(
    new CollateralManager__factory(deployer),
    args,
    options,
  )) as CollateralManager
  await instance.deployTransaction.wait()
  return instance
}

export const deployStaking = async ({
  deployer,
  linkLibraryAddresses,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<Factory['initialize']>
  linkLibraryAddresses: StakingLibraryAddresses
}) => {
  const instance = (await upgrades.deployProxy(
    new Staking__factory(linkLibraryAddresses, deployer),
    args,
    options,
  )) as Staking
  await instance.deployTransaction.wait()
  return instance
}

export const deployCollateralOracle = async ({
  deployer,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<Factory['initialize']>
}) => {
  const instance = (await upgrades.deployProxy(
    new CollateralOracle__factory(deployer),
    args,
    options,
  )) as CollateralOracle
  await instance.deployTransaction.wait()
  return instance
}
export const deployPriceOracle = async ({
  deployer,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<Factory['initialize']>
}) => {
  const instance = (await upgrades.deployProxy(
    new PriceOracle__factory(deployer),
    args,
    options,
  )) as PriceOracle
  await instance.deployTransaction.wait()
  return instance
}

export const deployDexManager = async ({
  deployer,
  linkLibraryAddresses,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<DexManager['initialize']>
  linkLibraryAddresses: DexManagerLibraryAddresses
}) => {
  const instance = (await upgrades.deployProxy(
    new DexManager__factory(linkLibraryAddresses, deployer),
    args,
    options,
  )) as DexManager
  await instance.deployTransaction.wait()
  return instance
}

export const deployPriceAggregator = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<CLPriceAggregator__factory['deploy']>
}): Promise<CLPriceAggregator> => {
  const instance = await new CLPriceAggregator__factory(deployer).deploy(
    ...params,
  )
  await instance.deployTransaction.wait()
  return instance
}

export const deployRewardDistributor = async ({
  deployer,
  upgrades,
  args,
  options,
}: CommonArgs & {
  args: Parameters<RewardDistributor['initialize']>
}) => {
  const instance = (await upgrades.deployProxy(
    new RewardDistributor__factory(deployer),
    args,
    options,
  )) as RewardDistributor
  await instance.deployTransaction.wait()
  return instance
}

export const deployDecimal = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<Decimal__factory['deploy']>
}): Promise<Decimal> => {
  const instance = await new Decimal__factory(deployer).deploy(...params)
  await instance.deployTransaction.wait()
  return instance
}

export const deployMathUtils = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<MathUtils__factory['deploy']>
}): Promise<MathUtils> => {
  const instance = await new MathUtils__factory(deployer).deploy(...params)
  await instance.deployTransaction.wait()
  return instance
}

export const deployDefiraliat = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<DefiraliaToken__factory['deploy']>
}): Promise<DefiraliaToken> => {
  const instance = await new DefiraliaToken__factory(deployer).deploy(...params)
  await instance.deployTransaction.wait()
  return instance
}

export const deployDefiraliaVestingWallet = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<DefiraliaVestingWallet__factory['deploy']>
}): Promise<DefiraliaVestingWallet> => {
  const instance = await new DefiraliaVestingWallet__factory(deployer).deploy(
    ...params,
  )
  await instance.deployTransaction.wait()
  return instance
}

// ========== MOCK ==========

export const deployPriceAggregatorMock = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<PriceAggregatorMock__factory['deploy']>
}): Promise<PriceAggregatorMock> => {
  const instance = await new PriceAggregatorMock__factory(deployer).deploy(
    ...params,
  )
  await instance.deployTransaction.wait()
  return instance
}

export const deployMintableERC20 = async (args: {
  deployer: SignerWithAddress
  params: Parameters<MintableERC20__factory['deploy']>
}): Promise<MintableERC20> => {
  const instance = await new MintableERC20__factory(args.deployer).deploy(
    ...args.params,
  )
  await instance.deployTransaction.wait()
  return instance
}

export const deployMockDaiToken = async (deployer: SignerWithAddress) =>
  await deployMintableERC20({
    deployer,
    params: ['Mock DAI Token', 'MOCK DAI', 18],
  })

export const deployMockDefiraliatToken = async (deployer: SignerWithAddress) =>
  await deployMintableERC20({
    deployer,
    params: ['Mock DefiraliaT Token', 'MOCK DefiraliaT', 18],
  })

export const deployZAssetMock = async (args: {
  deployer: SignerWithAddress
  params: Parameters<ZAssetMock__factory['deploy']>
}): Promise<ZAssetMock> => {
  const instance = await new ZAssetMock__factory(args.deployer).deploy(
    ...args.params,
  )
  await instance.deployTransaction.wait()
  return instance
}

export const deployMockZSpyToken = async (deployer: SignerWithAddress) =>
  await deployZAssetMock({
    deployer,
    params: ['Mock zSPY Token', 'zSPY'],
  })

// ========== Competition Campaign ==========

export const deployDefiraliaDai = async ({
  deployer,
}: {
  deployer: SignerWithAddress
}): Promise<DefiraliaDai> => {
  const instance = await new DefiraliaDai__factory(deployer).deploy()
  await instance.deployTransaction.wait()
  return instance
}

export const deployCompetitionVault = async ({
  deployer,
  params,
}: {
  deployer: SignerWithAddress
  params: Parameters<CompetitionVault__factory['deploy']>
}): Promise<CompetitionVault> => {
  const instance = await new CompetitionVault__factory(deployer).deploy(
    ...params,
  )
  await instance.deployTransaction.wait()
  return instance
}
