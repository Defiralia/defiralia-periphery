import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployCompetitionVault } from '../../helpers/deploy-helpers'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const {
    campaign: { DefiraliaDai },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!DefiraliaDai) {
    throw new Error('DefiraliaDai address is not found')
  }

  const competitionVault = await deployCompetitionVault({
    deployer,
    params: [DefiraliaDai],
  })
  ContractsJsonHelper.writeAddress({
    group: 'campaign',
    name: 'CompetitionVault',
    value: competitionVault.address,
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
