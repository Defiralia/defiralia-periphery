import { parseEther } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { DefiraliaDai__factory } from '../../typechain-types'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const { campaign } = ContractsJsonHelper.load({
    network: network.name,
  })

  const { DefiraliaDai } = campaign

  const defiraliaDai = DefiraliaDai__factory.connect(DefiraliaDai, deployer)

  await defiraliaDai.ownerMint(parseEther('50000000'))

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
