import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Factory__factory } from '../../typechain-types'

export const executeDeployAsset = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const {
    contracts: { Factory },
  } = ContractsJsonHelper.load({
    network: network.name,
  })

  const factory = await Factory__factory.connect(Factory, deployer)
  const tx = await (
    await factory.createAsset('zSPY Token', 'zSPY', {
      gasLimit: 1000000,
    })
  ).wait()

  // @ts-ignore
  const spy = tx.events[1].args.asset

  if (!spy) {
    throw new Error('zSPY is not deployed')
  }

  console.log('zSPY: ' + spy)

  ContractsJsonHelper.writeAddress({
    group: 'tokens',
    name: 'zSPY',
    value: spy,
    network: network.name,
  })
  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
}
