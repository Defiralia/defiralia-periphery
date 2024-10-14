import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { CompetitionVault__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'

const canWithdraw = true

;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const {
    campaign: { CompetitionVault },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!CompetitionVault) {
    throw new Error('CompetitionVault address is not found')
  }

  const competitionVault = CompetitionVault__factory.connect(
    CompetitionVault,
    deployer,
  )

  const tx = await competitionVault.updateWithdrawFlag(canWithdraw)
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
