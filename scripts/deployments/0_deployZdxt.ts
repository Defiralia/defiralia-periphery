import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployDefiraliat } from '../../helpers/deploy-helpers'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const defiraliat = await deployDefiraliat({
    deployer,
    params: [],
  })

  ContractsJsonHelper.writeAddress({
    group: 'tokens',
    name: 'DefiraliaT',
    value: defiraliat.address,
    network: network.name,
  })
  console.log('deployed DefiraliaT.')

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
