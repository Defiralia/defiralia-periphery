import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import {
  DexManager__factory,
  Lending__factory,
  MintableERC20__factory,
} from '../../typechain-types'
import { getExplorerLink } from '../constants'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const { contracts, tokens, campaign } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { zSPY } = tokens
  const { Lending, CollateralManager, DexManager } = contracts
  const { DefiraliaDai } = campaign

  const lending = await Lending__factory.connect(Lending, deployer)

  const amount = ethers.utils.parseEther('100')

  const DAI = await MintableERC20__factory.connect(DefiraliaDai, deployer)

  // Check Dex Price
  const dexManager = await DexManager__factory.connect(DexManager, deployer)
  console.log('zSPY Price: ' + (await dexManager.queryPoolPrice(zSPY)))

  // Open Short Position
  console.log(
    'CollateralManager Balance: ' + (await DAI.balanceOf(CollateralManager)),
  )
  await (await DAI.approve(CollateralManager, amount)).wait()
  const tx = await lending.openPosition(
    zSPY,
    DefiraliaDai,
    amount,
    2000,
    { isShort: true, amountOutMinimum: 0, sqrtPriceLimitX96: 0 },
    {
      gasLimit: 1000000,
    },
  )
  console.log(`${getExplorerLink(network.name)}${tx.hash}`)
  await tx.wait()

  console.log(await DAI.balanceOf(CollateralManager))

  // POSITIONS
  console.log(await lending.queryUserPositions(deployer.address))

  console.log(`------- Finished -------`)
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
