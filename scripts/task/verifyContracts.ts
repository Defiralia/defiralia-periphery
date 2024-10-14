// import { task } from 'hardhat/config'
// import { HardhatRuntimeEnvironment } from 'hardhat/types'
// import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'

// // yarn hardhat dev:verify-contracts --network sepolia
// task('dev:verify-contracts', 'verifyContractst').setAction(
//   async ({}, hre: HardhatRuntimeEnvironment) => {
//     console.log(`------- Start -------`)

//     const { ethers, network } = hre
//     const deployer = (await ethers.getSigners())[0]
//     const { contracts, library } = ContractsJsonHelper.load({
//       network: network.name,
//     })

//     const {
//       Factory,
//       Lending,
//       CollateralManager,
//       Staking,
//       PriceOracle,
//       CollateralOracle,
//       DexManager,
//       AddressMap,
//     } = contracts
//     const { PositionLogic, Decimal, MathUtils } = library

//     console.log('Factory')
//     await hre.run('verify:verify', {
//       address: Factory,
//       constructorArguments: [AddressMap],
//       contract: 'contracts/Factory.sol:Factory',
//       libraries: {
//         Decimal,
//       },
//     })

//     console.log('Lending')
//     await hre.run('verify:verify', {
//       address: Lending,
//       constructorArguments: [AddressMap],
//       contract: 'contracts/Lending.sol:Lending',
//       libraries: {
//         PositionLogic,
//       },
//     })

//     console.log('CollateralManager')
//     await hre.run('verify:verify', {
//       address: CollateralManager,
//       constructorArguments: [AddressMap],
//       contract: 'contracts/CollateralManager.sol:CollateralManager',
//     })

//     console.log('Staking')
//     await hre.run('verify:verify', {
//       address: Staking,
//       constructorArguments: [AddressMap],
//       contract: 'contracts/Staking.sol:Staking',
//       libraries: {
//         Decimal,
//       },
//     })

//     console.log('PriceOracle')
//     await hre.run('verify:verify', {
//       address: PriceOracle,
//       constructorArguments: [],
//       contract: 'contracts/PriceOracle.sol:PriceOracle',
//     })

//     console.log('CollateralOracle')
//     await hre.run('verify:verify', {
//       address: CollateralOracle,
//       constructorArguments: [AddressMap],
//       contract: 'contracts/CollateralOracle.sol:CollateralOracle',
//     })

//     console.log('DexManager')
//     await hre.run('verify:verify', {
//       address: DexManager,
//       constructorArguments: [AddressMap],
//       contract: 'contracts/DexManager.sol:DexManager',
//       libraries: {
//         Decimal,
//       },
//     })

//     console.log(`------- Finished -------`)
//   },
// )
