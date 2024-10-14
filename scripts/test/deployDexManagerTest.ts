import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from 'ethers'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { DexManagerTest } from '../../typechain-types'
import {
  DexManagerTestLibraryAddresses,
  DexManagerTest__factory,
} from '../../typechain-types/factories/contracts/test/DexManagerTest__factory'

// yarn hardhat dev:deploy-dex-manager-test --network sepolia --sr 0x5Ec61D1e2D5d817247fb931a225F4A1FFAfdfF3E --npm 0x4d8c6b8dC19e63128541357598bCBe3f97Ec291e
task('dev:deploy-dex-manager-test', 'Deploy Contracts Test')
  .addParam('sr', 'Swap Router')
  .addParam('npm', 'Nonfungible Position Manager')
  .setAction(async (args, hre: HardhatRuntimeEnvironment) => {
    console.log(`------- Start -------`)

    const { ethers, network } = hre
    const deployer = (await ethers.getSigners())[0]

    const { library } = ContractsJsonHelper.load({ network: network.name })

    const { AddressMap, Decimal, MathUtils } = library

    const dexManagerTest = await deployDexManagerTest({
      deployer,
      linkLibraryAddresses: {
        'contracts/library/Decimal.sol:Decimal': Decimal,
      },
      params: [AddressMap, args.npm, args.sr],
    })

    const contracs: { [c: string]: Contract } = {
      DexManagerTest: dexManagerTest,
    }

    for (const c of Object.entries(contracs)) {
      ContractsJsonHelper.writeAddress({
        group: 'testContracts',
        name: c[0],
        value: c[1].address,
        network: hre.network.name,
      })
    }

    console.log(`------- Finished -------`)
    console.log(ContractsJsonHelper.load({ network: network.name }))
  })

export const deployDexManagerTest = async ({
  deployer,
  linkLibraryAddresses,
  params,
}: {
  deployer: SignerWithAddress
  linkLibraryAddresses: DexManagerTestLibraryAddresses
  params: Parameters<DexManagerTest__factory['deploy']>
}): Promise<DexManagerTest> => {
  const instance = await new DexManagerTest__factory(
    linkLibraryAddresses,
    deployer,
  ).deploy(...params)
  await instance.deployTransaction.wait()
  return instance
}
