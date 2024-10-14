import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import { TokenMock, ZAsset } from '../typechain-types'
import { collateralManagerFixture } from './shared/fixtures'

describe('CollateralManager', function () {
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let zat: ZAsset
  let dai: TokenMock
  let lending: Contract
  let collateralManager: Contract

  let DAI: string
  let ZASSET: string

  let res

  beforeEach('Load fixture', async () => {
    ;({ alice, bob, zat, dai, lending, collateralManager } = await loadFixture(
      collateralManagerFixture,
    ))

    DAI = dai.address
    ZASSET = zat.address
  })

  const increaseCollateral = async (
    amount: BigNumber,
  ): Promise<ContractTransaction> => {
    await dai.connect(alice).approve(collateralManager.address, amount)
    return lending
      .connect(alice)
      .increaseCollateralTest(DAI, amount, alice.address)
  }

  describe('increaseCollateral', () => {
    describe('Normal Case', () => {
      it('once', async () => {
        const amount = parseEther('1')
        res = await increaseCollateral(amount)

        expect(await dai.balanceOf(collateralManager.address)).to.equal(amount)
        expect(
          await collateralManager.totalUserCollaterals(alice.address, DAI),
        ).to.be.equal(amount)
        expect(await collateralManager.totalCollaterals(DAI)).to.be.equal(
          amount,
        )
      })
      it('some', async () => {
        const amount = parseEther('1')
        // 1
        await increaseCollateral(amount)
        // 2
        await increaseCollateral(amount)

        expect(
          await collateralManager.totalUserCollaterals(alice.address, DAI),
        ).to.be.equal(amount.mul(2))
        expect(await collateralManager.totalCollaterals(DAI)).to.be.equal(
          amount.mul(2),
        )
      })
    })
  })

  describe('decreaseCollateral', () => {
    describe('Normal Case', () => {
      it('return to owner', async () => {
        const amount = parseEther('1')
        await increaseCollateral(amount)

        // withdraw and return to alice
        res = await lending
          .connect(alice)
          .decreaseCollateralTest(DAI, amount, alice.address, alice.address)

        // decrease collateral amount
        expect(
          await collateralManager.totalUserCollaterals(alice.address, DAI),
        ).to.be.equal(0)
        expect(await collateralManager.totalCollaterals(DAI)).to.be.equal(0)
      })
      it('return to other', async () => {
        const amount = parseEther('1')
        await increaseCollateral(amount)

        // withdraw and return to bob
        res = await lending
          .connect(alice)
          .decreaseCollateralTest(DAI, amount, alice.address, bob.address)

        // increase bob's balance
        await expect(await dai.balanceOf(bob.address)).to.be.equal(amount)
      })
    })
    describe('Error Case', () => {
      it('ExceedCollateralAmount', async () => {
        const amount = parseEther('1')
        await increaseCollateral(amount)

        await expect(
          lending.connect(alice).decreaseCollateralTest(
            DAI,
            amount.add(1), // exceed amount
            alice.address,
            alice.address,
          ),
        ).to.be.revertedWithCustomError(
          collateralManager,
          'ExceedCollateralAmount',
        )
      })
    })
  })
})
