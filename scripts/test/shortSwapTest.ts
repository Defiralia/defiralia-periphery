import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import {
  DexManagerTest__factory,
  MintableERC20__factory,
} from '../../typechain-types'

// yarn hardhat dev:short-swap-test --network sepolia
task('dev:short-swap-test', 'Short Swap Test').setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    console.log(`------- Start -------`)

    const { ethers, network } = hre
    const deployer = (await ethers.getSigners())[0]
    const { mockTokens, testContracts } = ContractsJsonHelper.load({
      network: network.name,
    })

    const { mockDAI, mockzSPY } = mockTokens
    const { DexManagerTest } = testContracts

    const dexManagerTest = await DexManagerTest__factory.connect(
      DexManagerTest,
      deployer,
    )

    const SPY = await MintableERC20__factory.connect(mockzSPY, deployer)
    const DAI = await MintableERC20__factory.connect(mockDAI, deployer)

    const amount = 100000000000000000n

    console.log(await SPY.balanceOf(dexManagerTest.address))
    await (await SPY.transfer(dexManagerTest.address, amount)).wait()

    console.log(await SPY.balanceOf(deployer.address))
    console.log(await DAI.balanceOf(deployer.address))
    console.log(await SPY.balanceOf(dexManagerTest.address))

    const tx = await dexManagerTest.shortSwapTest(
      mockzSPY,
      deployer.address,
      amount,
      {
        isShort: true,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      },
      {
        gasLimit: 1000000,
      },
    )

    console.log('https://sepolia.etherscan.io/tx/' + tx.hash)
    await tx.wait()

    console.log(await SPY.balanceOf(deployer.address))
    console.log(await DAI.balanceOf(deployer.address))
    console.log(await SPY.balanceOf(dexManagerTest.address))

    console.log(`------- Finished -------`)
  },
)
