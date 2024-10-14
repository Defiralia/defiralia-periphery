import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Contract, ContractTransaction } from 'ethers'
import { parseEther } from 'ethers/lib/utils'
import {
  PositionLogic,
  PriceAggregatorMock,
  TokenMock,
  ZAsset,
} from '../typechain-types'
import { CONTRACT_TREASURY, PROTOCOL_FEE } from './shared/constant'
import { lendingFixture } from './shared/fixtures'

describe('Lending', function () {
  let alice: SignerWithAddress
  let bob: SignerWithAddress
  let positionLogic: PositionLogic
  let factory: Contract
  let zat: ZAsset
  let dai: TokenMock
  let lending: Contract
  let collateralManager: Contract
  let staking: Contract
  let collateralOracle: Contract
  let zatPriceAggregatorMock: PriceAggregatorMock
  let treasuryAddress: string

  let res: ContractTransaction

  beforeEach('Load fixture', async () => {
    ;({
      alice,
      bob,
      positionLogic,
      factory,
      zat,
      dai,
      lending,
      collateralManager,
      treasuryAddress,
      staking,
      collateralOracle,
      zatPriceAggregatorMock,
    } = await loadFixture(lendingFixture))

    // // Mint Tokens
    // await dai.mint(alice.address, parseEther('1000'))
    // await factory.mintAssetTest(zat.address, bob.address, parseEther('1000'))
  })

  describe('Initialize', () => {
    describe('Normal Case', () => {
      it('constractor', async () => {
        expect(await lending.positionIndex()).to.be.equal(1)
        expect(await lending.getProtocolFeeRate()).to.be.equal(PROTOCOL_FEE)
        expect(await lending.feeReciverRole()).to.be.equal(CONTRACT_TREASURY)
      })
    })
  })

  describe('updateProtocolFee', () => {
    describe('Normal Case', () => {
      it('updateProtocolFee', async () => {
        const res = await lending.updateProtocolFee(10)
        expect(await lending.getProtocolFeeRate()).to.be.equal(10)
        await expect(res).to.emit(lending, 'UpdateProtocolFee').withArgs(10)
      })
    })
    describe('Error Case', () => {
      it('AccessControl', async () => {
        await expect(lending.connect(alice).updateProtocolFee(10)).to.be
          .reverted
      })
      it('ExceedMaxProtocolFee', async () => {
        await expect(
          lending.updateProtocolFee(101),
        ).to.be.revertedWithCustomError(lending, 'ExceedMaxProtocolFee')
      })
    })
  })

  describe('setFeeReciverRole', () => {
    describe('Normal Case', () => {
      it('setFeeReciverRole', async () => {
        const res = await lending.setFeeReciverRole(1)
        expect(await lending.feeReciverRole()).to.be.equal(1)
        await expect(res).to.emit(lending, 'SetFeeReciverRole').withArgs(1)
      })
    })
    describe('Error Case', () => {
      it('NotFound', async () => {
        await expect(
          lending.setFeeReciverRole(999),
        ).to.be.revertedWithCustomError(lending, 'NotFound')
      })
      it('AccessControl', async () => {
        await expect(lending.connect(alice).setFeeReciverRole(1)).to.be.reverted
      })
    })
  })

  describe('registerAsset', () => {
    describe('Normal Case', () => {
      it('registerAsset', async () => {
        await factory.registerAssetTest(dai.address, 200, 1500)
        const res = await lending.assetConfigs(dai.address)
        expect(res.liquidationDiscount).to.equal(200)
        expect(res.minCollateralRatio).to.equal(1500)
      })
    })
    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(
          lending.registerAsset(dai.address, 200, 1500),
        ).to.be.revertedWithCustomError(lending, 'OnlyRole')
      })
      it('ExceedLimitLiquidationDiscount', async () => {
        await expect(
          factory.registerAssetTest(dai.address, 1000, 1200),
        ).to.be.revertedWithCustomError(
          lending,
          'ExceedLimitLiquidationDiscount',
        )
      })
      it('InvalidMinCollateralRatio', async () => {
        await expect(
          factory.registerAssetTest(dai.address, 200, 1100),
        ).to.be.revertedWithCustomError(lending, 'InvalidMinCollateralRatio')
        await expect(
          factory.registerAssetTest(dai.address, 200, 2000),
        ).to.be.revertedWithCustomError(lending, 'InvalidMinCollateralRatio')
      })
      it('ExistAssetConfig', async () => {
        await expect(
          factory.registerAssetTest(zat.address, 200, 1400),
        ).to.be.revertedWithCustomError(lending, 'ExistAssetConfig')
      })
    })
  })

  describe('updateAsset', () => {
    describe('Normal Case', () => {
      it('updateAsset', async () => {
        await lending.updateAsset(zat.address, 300, 1400)
        const res = await lending.assetConfigs(zat.address)
        expect(res.liquidationDiscount).to.equal(300)
        expect(res.minCollateralRatio).to.equal(1400)
      })
    })
    describe('Error Case', () => {
      it('AccessControl', async () => {
        await expect(lending.connect(alice).updateAsset(zat.address, 300, 1200))
          .to.be.reverted
      })
      it('ExceedLimitLiquidationDiscount', async () => {
        await expect(
          lending.updateAsset(zat.address, 1000, 1200),
        ).to.be.revertedWithCustomError(
          lending,
          'ExceedLimitLiquidationDiscount',
        )
      })
      it('InvalidMinCollateralRatio', async () => {
        await expect(
          lending.updateAsset(zat.address, 200, 1100),
        ).to.be.revertedWithCustomError(lending, 'InvalidMinCollateralRatio')
        await expect(
          lending.updateAsset(zat.address, 200, 2000),
        ).to.be.revertedWithCustomError(lending, 'InvalidMinCollateralRatio')
      })
      it('NoAssetRegistered', async () => {
        await expect(
          lending.updateAsset(dai.address, 200, 1400),
        ).to.be.revertedWithCustomError(lending, 'NoAssetRegistered')
      })
    })
  })

  describe('suspendAsset', () => {
    describe('Normal Case', () => {
      it('suspendAsset', async () => {
        await lending.suspendAsset(zat.address)
        const res = await lending.assetConfigs(zat.address)
        expect(res.isSuspended).to.equal(true)
      })
    })
  })

  describe('unsuspendAsset', () => {
    describe('Normal Case', () => {
      it('unsuspendAsset', async () => {
        await lending.unsuspendAsset(zat.address)
        const res = await lending.assetConfigs(zat.address)
        expect(res.isSuspended).to.equal(false)
      })
    })
  })

  describe('registerRevoke', () => {
    describe('Normal Case', () => {
      it('registerRevoke', async () => {
        await lending.testSetMigration(zat.address, 50 * 1e8)
        const res = await lending.assetConfigs(zat.address)
        expect(res.liquidationDiscount).to.equal(200)
        expect(res.minCollateralRatio).to.equal(1000)
        expect(res.endPrice).to.equal(50 * 1e8)
      })
    })
    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(
          lending.registerRevoke(zat.address, 50 * 1e8),
        ).to.be.revertedWithCustomError(lending, 'OnlyRole')
      })
    })
  })

  const openPosition = async (
    amount: BigNumber,
    collateralRate: number,
    isShort: boolean,
  ): Promise<ContractTransaction> => {
    await dai.connect(alice).approve(collateralManager.address, amount)
    return lending
      .connect(alice)
      .openPosition(zat.address, dai.address, amount, collateralRate, {
        isShort,
        amountOutMinimum: 0,
        sqrtPriceLimitX96: 0,
      })
  }

  describe('OpenPosition', () => {
    describe('Normal Case', () => {
      it('long position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        res = await openPosition(amount, collateralRate, false)

        // 1000 DAI = 10 ZAT, collateralRate is 200%
        const mintAmount = parseEther('5')

        // check event
        await expect(res)
          .to.emit(lending, 'OpenPosition')
          .withArgs(
            1,
            alice.address,
            zat.address,
            mintAmount,
            dai.address,
            amount,
            collateralRate,
            false,
          )

        // check collateral is transfered to CollateralManager
        expect(await dai.balanceOf(collateralManager.address)).to.equal(amount)
        expect(await zat.balanceOf(alice.address)).to.equal(mintAmount)

        // check position is open
        expect(
          await lending.testHasPosition(
            alice.address,
            zat.address,
            dai.address,
            false,
          ),
        ).to.equal(true)

        // check position status
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.owner).to.equal(alice.address)
        expect(position.collateral).to.equal(dai.address)
        expect(position.collateralAmount).to.equal(amount)
        expect(position.asset).to.equal(zat.address)
        expect(position.assetAmount).to.equal(mintAmount)
        expect(position.isShort).to.equal(false)
        expect(position.isClosed).to.equal(false)
        expect(position.liquidatedAmount).to.equal(0)
      })
      it('short position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        res = await openPosition(amount, collateralRate, true)

        const mintAmount = parseEther('5')

        // check event
        await expect(res)
          .to.emit(lending, 'OpenPosition')
          .withArgs(
            1,
            alice.address,
            zat.address,
            mintAmount,
            dai.address,
            amount,
            collateralRate,
            true,
          )

        // dai alice -> CollateralManager
        expect(await dai.balanceOf(collateralManager.address)).to.equal(amount)

        // 5ZAT => dex => 530DAI
        const originalAmount = parseEther('10000')
        const swapedDai = parseEther('530')
        expect(await dai.balanceOf(alice.address)).to.equal(
          originalAmount.sub(amount).add(swapedDai),
        )

        // mint & stake sLP
        expect(
          (await staking.testGetReward(alice.address, zat.address)).bondAmount,
        ).to.equal(mintAmount)

        // check position is open
        expect(
          await lending.testHasPosition(
            alice.address,
            zat.address,
            dai.address,
            true,
          ),
        ).to.equal(true)

        // check position status
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.owner).to.equal(alice.address)
        expect(position.collateral).to.equal(dai.address)
        expect(position.collateralAmount).to.equal(amount)
        expect(position.asset).to.equal(zat.address)
        expect(position.assetAmount).to.equal(mintAmount)
        expect(position.isShort).to.equal(true)
        expect(position.isClosed).to.equal(false)
        expect(position.liquidatedAmount).to.equal(0)
      })
    })
    describe('Error Case', () => {
      it('AmountNotAllowZero', async () => {
        await dai.connect(alice).approve(collateralManager.address, 1000)
        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, 0, 2000, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(positionLogic, 'AmountNotAllowZero')
      })
      it('ExistSameAssetPosition', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await dai.connect(alice).approve(collateralManager.address, amount)
        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, amount, collateralRate, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(lending, 'ExistSameAssetPosition')
      })
      it('CollateralNotAvailable[isRevoed]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000

        // revoke collateral
        await (await collateralOracle.revokeCollateralAsset(dai.address)).wait()

        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, amount, collateralRate, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('CollateralNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await collateralOracle.suspendCollateralAsset(dai.address)
        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, amount, collateralRate, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('NoAssetRegistered', async () => {
        await expect(
          lending
            .connect(alice)
            .openPosition(
              '0x0000000000000000000000000000000000000001',
              dai.address,
              parseEther('1000'),
              2000,
              {
                isShort: false,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0,
              },
            ),
        ).to.be.revertedWithCustomError(lending, 'NoAssetRegistered')
      })
      it('AssetNotAvailable[endPrice > 0]', async () => {
        // set end price
        await (await lending.testSetMigration(zat.address, 100e8)).wait()

        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, parseEther('1000'), 2000, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('AssetNotAvailable[isSuspended]', async () => {
        await lending.suspendAsset(zat.address)
        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, parseEther('1000'), 2000, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('InvalidCollateralRatio', async () => {
        const amount = parseEther('1000')
        await dai.connect(alice).approve(collateralManager.address, amount)
        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, amount, 1499, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWithCustomError(positionLogic, 'InvalidCollateralRatio')
      })
      it('Pausable: paused', async () => {
        await lending.pause()

        const amount = parseEther('1000')
        const collateralRate = 2000
        await dai.connect(alice).approve(collateralManager.address, amount)
        await expect(
          lending
            .connect(alice)
            .openPosition(zat.address, dai.address, amount, collateralRate, {
              isShort: false,
              amountOutMinimum: 0,
              sqrtPriceLimitX96: 0,
            }),
        ).to.be.revertedWith('Pausable: paused')
      })
    })
  })

  const deposit = async (
    depositAmount: BigNumber,
  ): Promise<ContractTransaction> => {
    await dai.connect(alice).approve(collateralManager.address, depositAmount)
    return lending.connect(alice).deposit(1, dai.address, depositAmount)
  }

  describe('Deposit', () => {
    describe('Normal Case', () => {
      it('deposit to position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // deposit
        const depositAmount = parseEther('100')
        res = await deposit(depositAmount)

        // check event
        await expect(res)
          .to.emit(lending, 'Deposit')
          .withArgs(1, dai.address, depositAmount)

        // check collateral
        const collateralAmount = await collateralManager.totalUserCollaterals(
          alice.address,
          dai.address,
        )
        await expect(collateralAmount).to.equal(amount.add(depositAmount))
      })
    })
    describe('Error Case', async () => {
      it('PositionClosed', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // set postion closed
        await lending.testSetPositionClosed(1)

        // Deposit for closed position
        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)
        await expect(
          lending.connect(alice).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'PositionClosed')
      })
      it('OnlyPositionOwner', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)
        await expect(
          lending.connect(bob).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWithCustomError(lending, 'OnlyPositionOwner')
      })
      it('WrongCollateral', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)
        await expect(
          lending.connect(alice).deposit(1, zat.address, depositAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'WrongCollateral')
      })
      it('AmountNotAllowZero', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)

        await expect(
          lending.connect(alice).deposit(1, dai.address, 0),
        ).to.be.revertedWithCustomError(positionLogic, 'AmountNotAllowZero')
      })
      it('AssetNotAvailable[endPrice > 0]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // set end price
        await lending.testSetMigration(zat.address, 100e8)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)

        await expect(
          lending.connect(alice).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('AssetNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.suspendAsset(zat.address)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)

        await expect(
          lending.connect(alice).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('CollateralNotAvailable[isRevoed]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await collateralOracle.revokeCollateralAsset(dai.address)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)

        await expect(
          lending.connect(alice).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('CollateralNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await collateralOracle.suspendCollateralAsset(dai.address)

        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)
        await expect(
          lending.connect(alice).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('Pausable: paused', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // pause
        await lending.pause()

        // deposit
        const depositAmount = parseEther('100')
        await dai
          .connect(alice)
          .approve(collateralManager.address, depositAmount)
        await expect(
          lending.connect(alice).deposit(1, dai.address, depositAmount),
        ).to.be.revertedWith('Pausable: paused')
      })
    })
  })

  const withdraw = async (
    withdrawAmount: BigNumber,
  ): Promise<ContractTransaction> => {
    return lending.connect(alice).withdraw(1, dai.address, withdrawAmount)
  }

  describe('Withdraw', () => {
    describe('Normal Case', () => {
      it('withdraw', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const withdrawAmount = parseEther('100')
        res = await withdraw(withdrawAmount)

        await expect(res)
          .to.emit(lending, 'Withdraw')
          .withArgs(1, dai.address, withdrawAmount)

        // withdraw collateral to alice
        const originalAmount = parseEther('10000')
        expect(await dai.balanceOf(alice.address)).to.equal(
          originalAmount.sub(amount).add(withdrawAmount),
        )

        // sub from porsition
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.collateralAmount).to.equal(amount.sub(withdrawAmount))
      })
      it('position close', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // burn all assets
        const burnAmount = parseEther('5')
        await lending.connect(alice).burn(1, zat.address, burnAmount)
        const positionBefore = await lending.connect(alice).queryPosition(1)
        expect(positionBefore.index).to.equal(1)
        expect(positionBefore.assetAmount).to.equal(0)
        expect(positionBefore.isClosed).to.equal(false)

        // withdraw all collateral & close position
        const withdrawAmount = parseEther('992.5')
        res = await withdraw(withdrawAmount)

        const positionAfter = await lending.connect(alice).queryPosition(1)
        expect(positionAfter.index).to.equal(1)
        expect(positionAfter.collateralAmount).to.equal(0)
        expect(positionAfter.isClosed).to.equal(true)
        expect(
          await lending.testHasPosition(
            alice.address,
            zat.address,
            dai.address,
            false,
          ),
        ).to.equal(false)
      })
      it('revoked asset', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // set end price
        await (await lending.testSetMigration(zat.address, 100e8)).wait()

        const withdrawAmount = parseEther('100')
        res = await withdraw(withdrawAmount)

        await expect(res)
          .to.emit(lending, 'Withdraw')
          .withArgs(1, dai.address, withdrawAmount)
      })
      it('withdraw exceed amount', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // burn all assets
        const burnAmount = parseEther('5')
        await lending.connect(alice).burn(1, zat.address, burnAmount)

        const withdrawAmount = parseEther('1000') // max: 992.5
        res = await withdraw(withdrawAmount)

        await expect(res)
          .to.emit(lending, 'Withdraw')
          .withArgs(1, dai.address, parseEther('992.5')) // withdraw max amount
      })
    })
    describe('Error Case', async () => {
      it('PositionClosed', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // set postion closed
        await lending.testSetPositionClosed(1)

        const withdrawAmount = parseEther('100')
        await expect(withdraw(withdrawAmount)).to.be.revertedWithCustomError(
          positionLogic,
          'PositionClosed',
        )
      })
      it('OnlyPositionOwner', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const withdrawAmount = parseEther('100')
        // check position owner
        await expect(
          lending.connect(bob).withdraw(1, dai.address, withdrawAmount),
        ).to.be.revertedWithCustomError(lending, 'OnlyPositionOwner')
      })
      it('WrongCollateral', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const withdrawAmount = parseEther('100')
        await expect(
          lending.connect(alice).withdraw(1, zat.address, withdrawAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'WrongCollateral')
      })
      it('AmountNotAllowZero', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await expect(
          lending.connect(alice).withdraw(1, dai.address, 0),
        ).to.be.revertedWithCustomError(positionLogic, 'AmountNotAllowZero')
      })
      it('InvalidCollateralRatio', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const withdrawAmount = parseEther('500') // over minCollateralRatio
        await expect(
          lending.connect(alice).withdraw(1, dai.address, withdrawAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'InvalidCollateralRatio')
      })
      it('Pausable: paused', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // pause
        await lending.pause()

        const withdrawAmount = parseEther('100')
        await expect(
          lending.connect(alice).withdraw(1, dai.address, withdrawAmount),
        ).to.be.revertedWith('Pausable: paused')
      })
    })
  })

  const mint = async (
    mintAmount: BigNumber,
    isShort: boolean,
  ): Promise<ContractTransaction> => {
    return lending.connect(alice).mint(1, zat.address, mintAmount, {
      isShort,
      amountOutMinimum: 0,
      sqrtPriceLimitX96: 0,
    })
  }

  describe('Mint', () => {
    describe('Normal Case', () => {
      it('long', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const mintAmount = parseEther('1')
        res = await mint(mintAmount, false)
        await expect(res)
          .to.emit(lending, 'Mint')
          .withArgs(1, zat.address, mintAmount)

        // increase asset amount
        const originalAmount = parseEther('5')
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.assetAmount).to.equal(originalAmount.add(mintAmount))
      })
      it('short', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, true)

        const mintAmount = parseEther('1')
        res = await mint(mintAmount, true)

        // increase bond amount
        const originalAmount = parseEther('5')
        expect(
          (await staking.testGetReward(alice.address, zat.address)).bondAmount,
        ).to.equal(originalAmount.add(mintAmount))
      })
    })
    describe('Error Case', async () => {
      it('PositionClosed', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // set postion closed
        await lending.testSetPositionClosed(1)

        // Mint for closed position
        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'PositionClosed')
      })
      it('OnlyPositionOwner', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(bob).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(lending, 'OnlyPositionOwner')
      })
      it('WrongAsset', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, dai.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'WrongAsset')
      })
      it('AmountNotAllowZero', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await expect(
          lending.connect(alice).mint(1, zat.address, 0, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'AmountNotAllowZero')
      })
      it('InvalidShortParams', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: true,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'InvalidShortParams')
      })
      it('AssetNotAvailable[endPrice > 0]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.testSetMigration(zat.address, 100e8)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('AssetNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.suspendAsset(zat.address)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('CollateralNotAvailable[isRevoed]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await collateralOracle.revokeCollateralAsset(dai.address)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('CollateralNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)
        await collateralOracle.suspendCollateralAsset(dai.address)

        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('InvalidCollateralRatio', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await expect(
          lending.connect(alice).mint(1, zat.address, parseEther('5'), {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWithCustomError(positionLogic, 'InvalidCollateralRatio')
      })
      it('Pausable: paused', async () => {
        // OpenPosition
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // pause
        await lending.pause()

        // mint
        const mintAmount = parseEther('1')
        await expect(
          lending.connect(alice).mint(1, zat.address, mintAmount, {
            isShort: false,
            amountOutMinimum: 0,
            sqrtPriceLimitX96: 0,
          }),
        ).to.be.revertedWith('Pausable: paused')
      })
    })
  })

  const burn = async (burnAmount: BigNumber): Promise<ContractTransaction> => {
    return lending.connect(alice).burn(1, zat.address, burnAmount)
  }

  describe('Burn', () => {
    describe('Normal Case', () => {
      it('long position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const burnAmount = parseEther('5')
        res = await burn(burnAmount)

        await expect(res)
          .to.emit(lending, 'Burn')
          .withArgs(1, zat.address, burnAmount)

        // collect protocol fee
        expect(await dai.balanceOf(treasuryAddress)).to.equal(parseEther('7.5'))
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.collateralAmount).to.equal(parseEther('992.5'))
      })
      it('short position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, true)

        const burnAmount = parseEther('5')
        await factory.mintAssetTest(zat.address, alice.address, burnAmount) // alice need to get zAsset
        await lending.connect(alice).burn(1, zat.address, burnAmount)

        // burn sLP
        expect(
          (await staking.testGetReward(alice.address, zat.address)).bondAmount,
        ).to.equal(0)
      })
      it('revoked asset[position is not closed]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.testSetMigration(zat.address, 80e8)

        const burnAmount = parseEther('5')
        res = await burn(burnAmount)

        // collect protocol fee
        expect(await dai.balanceOf(treasuryAddress)).to.equal(parseEther('6'))

        // withdraw collateral [80 * 5 = 400]
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.collateralAmount).to.equal(parseEther('600'))
      })
      it('revoked asset[position is closed]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.testSetMigration(zat.address, 200e8)

        const burnAmount = parseEther('5')
        res = await burn(burnAmount)

        // collect protocol fee
        expect(await dai.balanceOf(treasuryAddress)).to.equal(parseEther('15'))

        // close position
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.collateralAmount).to.equal(0)
        expect(position.isClosed).to.equal(true)
        expect(
          await lending.testHasPosition(
            alice.address,
            zat.address,
            dai.address,
            false,
          ),
        ).to.equal(false)
      })
      it('Burn exceed amount', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const burnAmount = parseEther('5')
        res = await burn(burnAmount.add(parseEther('1'))) // burn excced amount

        await expect(res)
          .to.emit(lending, 'Burn')
          .withArgs(1, zat.address, burnAmount) // burn max amount
      })
    })
    describe('Error Case', () => {
      it('WrongAsset', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const burnAmount = parseEther('5')
        await expect(
          lending.connect(alice).burn(1, dai.address, burnAmount),
        ).to.be.revertedWithCustomError(positionLogic, 'WrongAsset')
      })
      it('AmountNotAllowZero', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await expect(
          lending.connect(alice).burn(1, zat.address, 0),
        ).to.be.revertedWithCustomError(positionLogic, 'AmountNotAllowZero')
      })
      it('OnlyPositionOwner', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const burnAmount = parseEther('5')
        await expect(
          lending.connect(bob).burn(1, zat.address, burnAmount),
        ).to.be.revertedWithCustomError(lending, 'OnlyPositionOwner')
      })
      it('Pausable: paused', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // pause
        await lending.pause()

        const burnAmount = parseEther('5')
        await expect(
          lending.connect(alice).burn(1, zat.address, burnAmount),
        ).to.be.revertedWith('Pausable: paused')
      })
    })
  })

  const liquidation = async (
    liquidationAmount: BigNumber,
  ): Promise<ContractTransaction> => {
    return lending.connect(bob).liquidation(1, zat.address, liquidationAmount)
  }

  describe('Liquidation', () => {
    describe('Normal Case', () => {
      it('long position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await zatPriceAggregatorMock.changePrice(150e8)

        const liquidationAmount = parseEther('3')
        res = await liquidation(liquidationAmount)

        await expect(res)
          .to.emit(lending, 'Liquidation')
          .withArgs(1, liquidationAmount, parseEther('562.5'))

        // check liquidate amount
        const originalAmount = parseEther('10000')
        expect(await zat.balanceOf(bob.address)).to.equal(
          originalAmount.sub(liquidationAmount),
        )

        expect(await dai.balanceOf(collateralManager.address)).to.equal(
          parseEther('437.5'),
        )
        expect(await dai.balanceOf(bob.address)).to.equal(parseEther('555.75'))
        expect(await dai.balanceOf(treasuryAddress)).to.equal(
          parseEther('6.75'),
        )
        expect(await dai.balanceOf(alice.address)).to.equal(parseEther('9000')) // position is not closed

        // position is not closed
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.assetAmount).to.equal(parseEther('2'))
        expect(position.collateralAmount).to.equal(parseEther('437.5'))
        expect(position.isClosed).to.equal(false)
        expect(position.liquidatedAmount).to.equal(liquidationAmount)
      })
      it('short position', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, true)

        await zatPriceAggregatorMock.changePrice(150e8)
        const liquidationAmount = parseEther('3')

        res = await liquidation(liquidationAmount)

        // check decreased stake
        expect(
          (await staking.testGetReward(alice.address, zat.address)).bondAmount,
        ).to.equal(parseEther('2'))
      })
      it('liquidate all assets', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await zatPriceAggregatorMock.changePrice(150e8)

        const liquidationAmount = parseEther('5')
        res = await liquidation(liquidationAmount)

        await expect(res)
          .to.emit(lending, 'Liquidation')
          .withArgs(1, liquidationAmount, parseEther('937.5'))

        // check liquidate amount
        const originalAmount = parseEther('10000')
        expect(await zat.balanceOf(bob.address)).to.equal(
          originalAmount.sub(liquidationAmount),
        )

        // withdraw amount
        // CollateralManager => bob(liquidateFee)/treasury(protocolFee)/alice(leftCollateral)
        expect(await dai.balanceOf(collateralManager.address)).to.equal(0)
        expect(await dai.balanceOf(bob.address)).to.equal(parseEther('926.25'))
        expect(await dai.balanceOf(treasuryAddress)).to.equal(
          parseEther('11.25'),
        )
        expect(await dai.balanceOf(alice.address)).to.equal(
          parseEther('9000').add(parseEther('62.5')),
        )

        // position is not closed
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.assetAmount).to.equal(0)
        expect(position.collateralAmount).to.equal(0)
        expect(position.isClosed).to.equal(true)
        expect(position.liquidatedAmount).to.equal(liquidationAmount)
      })
      it('assets value over collateral value', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await zatPriceAggregatorMock.changePrice(200e8)

        const liquidationAmount = parseEther('5') // over value
        res = await liquidation(liquidationAmount)

        const actualAmount = parseEther('4')
        await expect(res)
          .to.emit(lending, 'Liquidation')
          .withArgs(1, actualAmount, amount)

        // check liquidate amount
        const originalAmount = parseEther('10000')
        expect(await zat.balanceOf(bob.address)).to.equal(
          originalAmount.sub(actualAmount), // nothing left
        )

        // withdraw amount
        expect(await dai.balanceOf(collateralManager.address)).to.equal(0)
        expect(await dai.balanceOf(bob.address)).to.equal(parseEther('988'))
        expect(await dai.balanceOf(treasuryAddress)).to.equal(parseEther('12'))
        expect(await dai.balanceOf(alice.address)).to.equal(parseEther('9000'))

        // position is closed
        const position = await lending.connect(alice).queryPosition(1)
        expect(position.index).to.equal(1)
        expect(position.assetAmount).to.equal(parseEther('1')) // outstanding
        expect(position.collateralAmount).to.equal(0)
        expect(position.isClosed).to.equal(true)
        expect(position.liquidatedAmount).to.equal(actualAmount)
      })
      it('Liquidate excced amount', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        const liquidationAmount = parseEther('5')
        await zatPriceAggregatorMock.changePrice(150e8)

        res = await liquidation(parseEther('6')) // exceed amount

        await expect(res)
          .to.emit(lending, 'Liquidation')
          .withArgs(1, liquidationAmount, parseEther('937.5'))

        // check liquidate amount
        const originalAmount = parseEther('10000')
        expect(await zat.balanceOf(bob.address)).to.equal(
          originalAmount.sub(liquidationAmount),
        )
      })
    })
    describe('Error Case', () => {
      it('PositionClosed', async () => {
        // OpenPosition
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // set postion closed
        await lending.testSetPositionClosed(1)

        // Liquidate for closed position
        await expect(
          lending.connect(alice).liquidation(1, zat.address, 1),
        ).to.be.revertedWithCustomError(positionLogic, 'PositionClosed')
      })
      it('WrongAsset', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await expect(
          lending.connect(alice).liquidation(1, dai.address, 1),
        ).to.be.revertedWithCustomError(positionLogic, 'WrongAsset')
      })
      it('AmountNotAllowZero', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await expect(
          lending.connect(alice).liquidation(1, zat.address, 0),
        ).to.be.revertedWithCustomError(positionLogic, 'AmountNotAllowZero')
      })
      it('AssetNotAvailable[endPrice > 0]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.testSetMigration(zat.address, 100e8)

        await expect(
          lending.connect(alice).liquidation(1, zat.address, parseEther('1')),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('AssetNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await lending.suspendAsset(zat.address)

        await expect(
          lending.connect(alice).liquidation(1, zat.address, parseEther('1')),
        ).to.be.revertedWithCustomError(positionLogic, 'AssetNotAvailable')
      })
      it('CollateralNotAvailable[isRevoked]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await collateralOracle.revokeCollateralAsset(dai.address)

        await expect(
          lending.connect(alice).liquidation(1, zat.address, parseEther('1')),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('CollateralNotAvailable[isSuspended]', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await collateralOracle.suspendCollateralAsset(dai.address)

        await expect(
          lending.connect(alice).liquidation(1, zat.address, parseEther('1')),
        ).to.be.revertedWithCustomError(positionLogic, 'CollateralNotAvailable')
      })
      it('LiquidateSafePosition', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        await zatPriceAggregatorMock.changePrice(133e8) // within minCollateralRation

        await expect(
          lending.connect(alice).liquidation(1, zat.address, parseEther('1')),
        ).to.be.revertedWithCustomError(positionLogic, 'LiquidateSafePosition')
      })
      it('Pausable: paused', async () => {
        const amount = parseEther('1000')
        const collateralRate = 2000
        await openPosition(amount, collateralRate, false)

        // pause
        await lending.pause()

        await expect(
          lending.connect(alice).liquidation(1, zat.address, parseEther('1')),
        ).to.be.revertedWith('Pausable: paused')
      })
    })
  })
})
