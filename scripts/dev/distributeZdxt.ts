import BigNumber from 'bignumber.js'
import { parseEther } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { IMulticall3__factory, DefiraliaToken__factory } from '../../typechain-types'

// TODO: confirm addresses
const allocationInfo = [
  {
    label: 'preSeed',
    address: '0x9B313E845fc867013b28C7789cFb6f25537e7D09',
    allocation: 5,
  },
  // TODO: Seed is supposed to be multiple.
  // e.g. If investors are three, it should be seed1, seed2, seed3.
  {
    label: 'seed1',
    address: '0x7Bc298151fd6257413E38c321F2F9341CDeAa27f',
    allocation: 10,
  },
  {
    label: 'seed2',
    address: '0xC17EE5d0c1CF5E9267425a9D42625D2B4b909877',
    allocation: 10,
  },
  {
    label: 'lm',
    address: '0xb19913FE0a9014A20331d537891CFE0672541828',
    allocation: 30,
  },
  {
    label: 'slp',
    address: '0xEc044F57A5a7c2FC3880858A9985efC363a6E0db',
    allocation: 10,
  },
  {
    label: 'lock',
    address: '0xeB1fA7DC51202b180DcBFB412eFF3F25B30Ae8D7',
    allocation: 10,
  },
  {
    label: 'treasury',
    address: '0xB8C97e04B5509121862b338B13fD92b4abDf17d0',
    allocation: 9,
  },
  {
    label: 'team',
    address: '0x1C407209D55F158d5695D64F8bC81f945A9a2377',
    allocation: 16,
  },
]

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11'

// yarn hardhat dev:distribute-defiraliat --network sepolia
task('dev:distribute-defiraliat', 'Distribute DefiraliaT').setAction(
  async ({}, hre: HardhatRuntimeEnvironment) => {
    console.log(`------- Start -------`)

    const { ethers, network } = hre
    const deployer = (await ethers.getSigners())[0]
    const calcAllocation = (total: BigNumber, numerator: number) => {
      const res = total.multipliedBy(
        new BigNumber(numerator).div(new BigNumber(100)),
      )
      return res
    }

    const {
      tokens: { DefiraliaT },
    } = ContractsJsonHelper.load({ network: network.name })
    if (!DefiraliaT) {
      throw new Error('DefiraliaT address is not found')
    }
    const defiraliat = DefiraliaToken__factory.connect(DefiraliaT, deployer)

    const multicall = IMulticall3__factory.connect(MULTICALL3, deployer)

    const total = new BigNumber(
      (await defiraliat.totalSupply()).toString(),
    ).shiftedBy(-18)
    console.log('totalSupply:', total.toString())

    console.log('Calc allocation')
    let totalAmount = new BigNumber(0)
    const calculatedAllocationInfo = allocationInfo.map((info) => {
      const amount = calcAllocation(total, info.allocation)
      console.log(`${info.label}: ${amount.toString()}`)
      console.log(`address: ${info.address}`)
      totalAmount = totalAmount.plus(amount)
      return {
        ...info,
        amount: amount.toString(),
      }
    })

    // check sum of each params should be total
    if (!totalAmount.eq(total)) {
      throw new Error('sum of each params should be totalSupply')
    }

    const approveTx = await defiraliat.approve(MULTICALL3, parseEther('1000000'), {
      from: deployer.address,
    })
    await approveTx.wait()
    console.log('Approved.')

    console.log('Distributon start.')
    const transferCalldata = calculatedAllocationInfo.map((info) => {
      return {
        target: defiraliat.address,
        callData: defiraliat.interface.encodeFunctionData('transferFrom', [
          deployer.address,
          info.address,
          parseEther(info.amount),
        ]),
        allowFailure: false,
      }
    })

    const tx = await multicall
      .connect(deployer)
      .aggregate3(transferCalldata, { from: deployer.address })
    await tx.wait()
    console.log('Distributon finished.')

    // check balance
    console.log(`Balance Check`)
    const balanceOfCalldata = calculatedAllocationInfo.map((info) => ({
      target: defiraliat.address,
      callData: defiraliat.interface.encodeFunctionData('balanceOf', [info.address]),
      allowFailure: false,
    }))

    const result = await multicall.callStatic.aggregate3(balanceOfCalldata)
    result.forEach(({ returnData, success }, index) => {
      if (!success) throw new Error('balance check failed')
      const info = calculatedAllocationInfo[index]
      console.log(
        `${info.label}: ${new BigNumber(returnData).shiftedBy(-18).toString()}`,
      )
    })

    console.log(`------- Finished -------`)
    console.log(ContractsJsonHelper.load({ network: network.name }))
  },
)
