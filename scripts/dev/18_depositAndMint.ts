import { parseEther } from 'ethers/lib/utils'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { Lending__factory, MintableERC20__factory } from '../../typechain-types'
import { getExplorerLink } from '../constants'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const { contracts, tokens, campaign } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { zSPY } = tokens
  const { Lending, CollateralManager } = contracts
  const { DefiraliaDai } = campaign

  const lending = await Lending__factory.connect(Lending, deployer)

  let positions = await lending.queryUserPositions(deployer.address)
  console.log(positions)

  const DAI = await MintableERC20__factory.connect(DefiraliaDai, deployer)

  console.log(await DAI.balanceOf(CollateralManager))

  // Check Dex Price
  const mintAmount = parseEther('100')
  const collateralAmount = parseEther('100000')
  const approveTx = await DAI.approve(CollateralManager, collateralAmount, {
    gasLimit: 100000,
  })
  console.log(`${getExplorerLink(network.name)}${approveTx.hash}`)
  await approveTx.wait()

  const tx = await lending.depositAndMint(
    1,
    zSPY,
    mintAmount,
    DefiraliaDai,
    collateralAmount,
    { isShort: false, amountOutMinimum: 0, sqrtPriceLimitX96: 0 },
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
