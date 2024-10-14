import { parseEther } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Lending__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const { contracts, tokens, campaign } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { zSPY } = tokens
  const { Lending } = contracts
  const { DefiraliaDai } = campaign

  const lending = await Lending__factory.connect(Lending, deployer)

  let positions = await lending.queryUserPositions(deployer.address)
  console.log(positions)

  // Burn and Withdraw, then Close Position
  const tx = await lending.burnAndWithdraw(
    1,
    zSPY,
    parseEther('100000') /* more than max */,
    DefiraliaDai,
    parseEther('100000') /* more than max */,
  )
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  // POSITIONS
  positions = await lending.queryUserPositions(deployer.address)
  console.log(positions)

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
