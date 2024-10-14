import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployMockDaiToken } from '../../helpers/deploy-helpers'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const mockDai = await deployMockDaiToken(deployer)
  ContractsJsonHelper.writeAddress({
    group: 'mockTokens',
    name: 'mockDAI',
    value: mockDai.address,
    network: network.name,
  })

  // const mockDefiraliat = await deployMockDefiraliatToken(deployer)
  // ContractsJsonHelper.writeAddress({
  //   group: 'mockTokens',
  //   name: 'mockDefiraliaT',
  //   value: mockDefiraliat.address,
  //   network: network.name,
  // })
  // const mockZSpy = await deployMockZSpyToken(deployer)
  // ContractsJsonHelper.writeAddress({
  //   group: 'mockTokens',
  //   name: 'mockzSPY',
  //   value: mockZSpy.address,
  //   network: network.name,
  // })

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
