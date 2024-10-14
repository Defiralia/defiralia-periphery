import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployDefiraliaDai } from '../../helpers/deploy-helpers'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const defiraliaDai = await deployDefiraliaDai({ deployer })
  ContractsJsonHelper.writeAddress({
    group: 'campaign',
    name: 'DefiraliaDai',
    value: defiraliaDai.address,
    network: network.name,
  })

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
