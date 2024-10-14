import { executeDeployDefiraliaVestingWallet } from './deployments/1_deployDefiraliaVestingWallet'
import { executeDeployLibrary } from './deployments/2_deployLibrary'
import { executeDeployContracts } from './deployments/3_deployContracts'
import { executeDeployDexManager } from './deployments/4_deployDexManager'
import { executeDeployAsset } from './deployments/5_deployAsset'
import { executeDeployPriceAggregator } from './deployments/6_deployPriceAggregator'
import { executeDepolyRewardDistributor } from './deployments/7_depolyRewardDistributor'
;(async () => {
  console.log(`===== start setup deployments =====`)

  await executeDeployDefiraliaVestingWallet()
  await executeDeployLibrary()
  await executeDeployContracts()
  await executeDeployDexManager()
  await executeDeployAsset()
  await executeDeployPriceAggregator()
  await executeDepolyRewardDistributor()

  console.log(`===== end setup deployments =====`)
})()
