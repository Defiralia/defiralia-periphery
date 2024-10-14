import { executeRegisterCollateral } from './dev/10_registerCollateral'
import { executeOpenPositionForInitialLiquidity } from './dev/11_openPositionForInitialLiquidity'
import { executeSetAllowanceForSwapRouter } from './dev/12_setAllowanceForSwapRouter'
import { executeSetPool } from './dev/8_setPool'
import { executeEnableAsset } from './dev/9_enableAsset'
;(async () => {
  console.log(`===== start setup dev =====`)

  await executeSetPool()
  await executeEnableAsset()
  await executeRegisterCollateral()
  await executeOpenPositionForInitialLiquidity()
  await executeSetAllowanceForSwapRouter()

  console.log(`===== end setup dev =====`)
})()
