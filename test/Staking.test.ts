import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { ethers } from 'hardhat'
import { TokenMock, ZAsset } from '../typechain-types'
import { stakingFixture } from './shared/fixtures'

describe('Staking', function () {
  let alice: SignerWithAddress
  let defiraliat: TokenMock
  let zat: ZAsset
  let dai: TokenMock
  let dummyToken1: string
  let dummyToken2: string
  let staking: Contract
  let lending: SignerWithAddress
  let factory: SignerWithAddress

  beforeEach('Load fixture', async () => {
    ;({
      alice,
      zat,
      dai,
      defiraliat,
      dummyToken1,
      dummyToken2,
      factory,
      lending,
      staking,
    } = await loadFixture(stakingFixture))
  })

  describe('updateInterval', () => {
    describe('Normal Case', () => {
      it('updateInterval', async () => {
        const interval = 20
        await staking.updateInterval(interval)
        await expect(await staking.testGetInterval()).to.equal(interval)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await expect(staking.connect(alice).updateInterval(20)).to.be.reverted
      })
      it('InvalidPremiumMinUpdateInterval', async () => {
        await expect(staking.updateInterval(0)).to.be.revertedWithCustomError(
          staking,
          'InvalidPremiumMinUpdateInterval',
        )
      })
    })
  })

  describe('registerPoolInfo', () => {
    describe('Normal Case', () => {
      it('registerPoolInfo', async () => {
        const poolInfoBefore = await staking.queryPoolInfo(zat.address)
        expect(poolInfoBefore.asset).to.equal(ethers.constants.AddressZero)
        expect(poolInfoBefore.shortPendingReward).to.equal(0)
        expect(poolInfoBefore.totalShortAmount).to.equal(0)
        expect(poolInfoBefore.rewardUnit.value).to.equal(0)
        expect(poolInfoBefore.shortRewardWeight.value).to.equal(0)
        expect(poolInfoBefore.premiumUpdatedTime).to.equal(0)

        await staking.connect(factory).registerPoolInfo(zat.address)

        const poolInfoAfter = await staking.queryPoolInfo(zat.address)
        expect(poolInfoAfter.asset).to.equal(zat.address)
        expect(poolInfoAfter.shortPendingReward).to.equal(0)
        expect(poolInfoAfter.totalShortAmount).to.equal(0)
        expect(poolInfoAfter.rewardUnit.value).to.equal(0)
        expect(poolInfoAfter.shortRewardWeight.value).to.equal(0)
        expect(poolInfoAfter.premiumUpdatedTime).to.equal(0)
      })
    })
    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(
          staking.connect(alice).registerPoolInfo(zat.address),
        ).to.be.revertedWithCustomError(staking, 'OnlyRole')
      })
      it('ExistPoolInfo', async () => {
        await staking.connect(factory).registerPoolInfo(zat.address)
        await expect(
          staking.connect(factory).registerPoolInfo(zat.address),
        ).to.be.revertedWithCustomError(staking, 'ExistPoolInfo')
      })
    })
  })

  describe('increaseShortToken', () => {
    describe('Normal Case', () => {
      it('increaseShortToken', async () => {
        const amount = 1

        await staking
          .connect(lending)
          .increaseShortToken(alice.address, zat.address, amount)

        const reward = await staking.testGetReward(alice.address, zat.address)
        await expect(reward.rewardUnit.value).to.equal(0)
        await expect(reward.bondAmount).to.equal(amount)
        await expect(reward.pendingReward).to.equal(0)

        const poolInfo = await staking.queryPoolInfo(zat.address)
        await expect(poolInfo.shortPendingReward).to.equal(0)
        await expect(poolInfo.totalShortAmount).to.equal(amount)
        await expect(poolInfo.rewardUnit.value).to.equal(0)
        await expect(poolInfo.premiumRate.value).to.equal(0)
        await expect(poolInfo.shortRewardWeight.value).to.equal(0)
        await expect(poolInfo.premiumUpdatedTime).to.equal(0)
      })
    })

    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(
          staking
            .connect(alice)
            .increaseShortToken(alice.address, zat.address, 1),
        ).to.be.revertedWithCustomError(staking, 'OnlyRole')
      })
    })
  })

  describe('decreaseShortToken', () => {
    describe('Normal Case', () => {
      it('decreaseShortToken', async () => {
        const increaseAmount = 1000
        await staking
          .connect(lending)
          .increaseShortToken(alice.address, zat.address, increaseAmount)

        const rewardBefore = await staking.testGetReward(
          alice.address,
          zat.address,
        )
        const poolInfoBefore = await staking.queryPoolInfo(zat.address)
        await expect(rewardBefore.bondAmount).to.equal(increaseAmount)
        await expect(poolInfoBefore.totalShortAmount).to.equal(increaseAmount)

        const decreaseAmount = 500
        await staking
          .connect(lending)
          .decreaseShortToken(alice.address, zat.address, decreaseAmount)

        const reward = await staking.testGetReward(alice.address, zat.address)
        await expect(reward.rewardUnit.value).to.equal(0)
        await expect(reward.bondAmount).to.equal(
          increaseAmount - decreaseAmount,
        )
        await expect(reward.pendingReward).to.equal(0)

        const poolInfo = await staking.queryPoolInfo(zat.address)
        await expect(poolInfo.shortPendingReward).to.equal(0)
        await expect(poolInfo.totalShortAmount).to.equal(
          increaseAmount - decreaseAmount,
        )
        await expect(poolInfo.rewardUnit.value).to.equal(0)
        await expect(poolInfo.premiumRate.value).to.equal(0)
        await expect(poolInfo.shortRewardWeight.value).to.equal(0)
        await expect(poolInfo.premiumUpdatedTime).to.equal(0)
      })
      it('unbond over bond amount', async () => {
        const amount = 1000

        await staking
          .connect(lending)
          .increaseShortToken(alice.address, zat.address, amount)

        const decreaseAmount = 1001 // over bond amount
        await staking
          .connect(lending)
          .decreaseShortToken(alice.address, zat.address, decreaseAmount)

        const reward = await staking.testGetReward(alice.address, zat.address)
        await expect(reward.bondAmount).to.equal(0)
      })
    })
    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(
          staking
            .connect(alice)
            .increaseShortToken(alice.address, zat.address, 1),
        ).to.be.revertedWithCustomError(staking, 'OnlyRole')
      })
    })
  })

  describe('_computeShortRewardWeight', () => {
    it('premiumRate is 0%', async () => {
      const res = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('0'), // 0%
      })
      expect(res.value).to.equal(BigNumber.from('6545312953500000')) // 0.654..%
    })
    it('premiumRate is under 2%', async () => {
      const res = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('10000000000000000'), // 1%
      })
      expect(res.value).to.equal(BigNumber.from('158542324668500000')) // 15.85..%
      const res1 = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('15000000000000000'), // 1.5%
      })
      expect(res1.value).to.equal(BigNumber.from('308553888618000000')) // 30.85..%
    })
    it('premiumRate is 2%', async () => {
      const res = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('20000000000000000'), // 2%
      })
      expect(res.value).to.equal(BigNumber.from('500000000000000000')) // 50%
    })
    it('premiumRate is over 2%', async () => {
      const res = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('30000000000000000'), // 3%
      })
      expect(res.value).to.equal(BigNumber.from('841344680836500000')) // 84.13..%
      const res1 = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('60000000000000000'), // 6%
      })
      expect(res1.value).to.equal(BigNumber.from('999968210954500000')) // 99.99..%
      const res2 = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('70000000000000000'), // 7%
      })
      expect(res2.value).to.equal(BigNumber.from('999999699812500000')) // 99.99..%
    })
    it('premiumRate is larger than 7%', async () => {
      const res = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('70000000000000001'), // 7.0...01%
      })
      expect(res.value).to.equal(BigNumber.from('1000000000000000000')) // 100%
      const res1 = await staking.testGetComputeShortRewardWeight({
        value: BigNumber.from('100000000000000000'), // 10%
      })
      expect(res1.value).to.equal(BigNumber.from('1000000000000000000')) // 100%
    })
  })

  describe('adjustPremium', () => {
    describe('Normal Case', () => {
      it('adjustPremium[asset < base]', async () => {
        await staking.testSetPoolInfo({
          asset: dummyToken1,
          shortPendingReward: 0,
          totalShortAmount: 0,
          rewardUnit: { value: BigNumber.from('0') },
          premiumRate: { value: BigNumber.from('0') },
          shortRewardWeight: { value: BigNumber.from('0') },
          premiumUpdatedTime: 0,
        })
        await staking.adjustPremium([dummyToken1])

        // check poolInfo
        const poolInfo = await staking.queryPoolInfo(dummyToken1)

        expect(poolInfo.premiumRate.value).to.equal(
          BigNumber.from('60000000000000000'),
        )
        expect(poolInfo.shortRewardWeight.value).to.equal(
          BigNumber.from('999968210954500000'),
        )
        expect(poolInfo.premiumUpdatedTime).to.equal(await time.latest())
      })

      it('adjustPremium[base < asset]', async () => {
        await staking.testSetPoolInfo({
          asset: dummyToken2,
          shortPendingReward: 0,
          totalShortAmount: 0,
          rewardUnit: { value: BigNumber.from('0') },
          premiumRate: { value: BigNumber.from('0') },
          shortRewardWeight: { value: BigNumber.from('0') },
          premiumUpdatedTime: 0,
        })
        await staking.adjustPremium([dummyToken2])

        // check poolInfo
        const poolInfo = await staking.queryPoolInfo(dummyToken2)

        expect(poolInfo.premiumRate.value).to.equal(
          BigNumber.from('60000000000000044'),
        )
        expect(poolInfo.shortRewardWeight.value).to.equal(
          BigNumber.from('999968210954500000'),
        )
        expect(poolInfo.premiumUpdatedTime).to.equal(await time.latest())
      })
      it('ajust premium before interval', async () => {
        await staking.testSetPoolInfo({
          asset: zat.address,
          shortPendingReward: 0,
          totalShortAmount: 0,
          rewardUnit: { value: BigNumber.from('0') },
          premiumRate: { value: BigNumber.from('0') },
          shortRewardWeight: { value: BigNumber.from('0') },
          premiumUpdatedTime: 0,
        })
        await staking.adjustPremium([zat.address])
        const res = await staking.adjustPremium([zat.address])
        await expect(res).not.to.emit(staking, 'AdjustPremium')
      })
    })
  })

  describe('depositReward', () => {
    describe('Normal Case', () => {
      it('sLP is not staked at all (totalShortAmount = 0)', async () => {
        await staking
          .connect(factory)
          .depositReward([{ asset: zat.address, amount: 1000 }])

        // check poolInfo
        const poolInfo = await staking.queryPoolInfo(zat.address)
        await expect(poolInfo.shortPendingReward).to.equal(1000)
        await expect(poolInfo.totalShortAmount).to.equal(0)
        await expect(poolInfo.rewardUnit.value).to.equal(0)
        await expect(poolInfo.premiumRate.value).to.equal(0)
        await expect(poolInfo.shortRewardWeight.value).to.equal(0)
        await expect(poolInfo.premiumUpdatedTime).to.equal(0)
      })
      it('sLP is staked (totalShortAmount > 0)', async () => {
        await staking.testSetPoolInfo({
          asset: zat.address,
          shortPendingReward: 2000,
          totalShortAmount: 0,
          rewardUnit: { value: BigNumber.from('50000000000000000000') },
          premiumRate: { value: BigNumber.from('0') },
          shortRewardWeight: { value: BigNumber.from('500000000000000000') },
          premiumUpdatedTime: 0,
        })
        await staking
          .connect(lending)
          .increaseShortToken(alice.address, zat.address, 1000)

        // deposit rewards
        await staking
          .connect(factory)
          .depositReward([{ asset: zat.address, amount: 1000 }])

        // check poolInfo
        const poolInfo = await staking.queryPoolInfo(zat.address)
        await expect(poolInfo.shortPendingReward).to.equal(0)
        await expect(poolInfo.totalShortAmount).to.equal(1000)
        await expect(poolInfo.rewardUnit.value).to.equal(
          BigNumber.from('53000000000000000000'),
        )
        await expect(poolInfo.premiumRate.value).to.equal(0)
        await expect(poolInfo.shortRewardWeight.value).to.equal(
          BigNumber.from('500000000000000000'),
        )
        await expect(poolInfo.premiumUpdatedTime).to.equal(0)
      })
    })
    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(
          staking.depositReward([{ asset: zat.address, amount: 1000 }]),
        ).to.be.revertedWithCustomError(staking, 'OnlyRole')
      })
    })
  })

  describe('withdrawReward', () => {
    describe('Normal Case', () => {
      it('updated', async () => {
        await staking.testSetPoolInfo({
          asset: zat.address,
          shortPendingReward: 0,
          totalShortAmount: 0,
          rewardUnit: { value: BigNumber.from('50000000000000000000') },
          premiumRate: { value: BigNumber.from('0') },
          shortRewardWeight: { value: BigNumber.from('500000000000000000') },
          premiumUpdatedTime: 0,
        })
        await staking
          .connect(lending)
          .increaseShortToken(alice.address, zat.address, 2000)

        await staking
          .connect(factory)
          .depositReward([{ asset: zat.address, amount: 500 }])

        expect(await defiraliat.balanceOf(alice.address)).to.equal(0)
        await defiraliat.mint(staking.address, 10000)
        await staking.connect(alice).withdrawReward(zat.address)

        const shortReward = await staking.testGetReward(
          alice.address,
          zat.address,
        )
        expect(shortReward.rewardUnit.value).to.equal(
          BigNumber.from('50250000000000000000'),
        )
        expect(shortReward.pendingReward).to.equal(0)
        expect(shortReward.bondAmount).to.equal(2000)
        expect(await defiraliat.balanceOf(alice.address)).to.equal(500)
      })
    })
  })

  describe('updateRewardInfo', () => {
    describe('Normal Case', () => {
      it('empty', async () => {
        const res = await staking.callStatic.updateRewardInfo(
          alice.address,
          zat.address,
        )
        await expect(res.asset).to.equal(ethers.constants.AddressZero)
        await expect(res.bondAmount).to.equal(0)
        await expect(res.pendingReward).to.equal(0)
      })
      it('updateRewardInfo', async () => {
        await staking
          .connect(lending)
          .increaseShortToken(alice.address, zat.address, 1000)

        await staking.testSetPoolInfo({
          asset: zat.address,
          shortPendingReward: 0,
          totalShortAmount: 0,
          rewardUnit: { value: BigNumber.from('5000000000000000000') },
          premiumRate: { value: BigNumber.from('0') },
          shortRewardWeight: { value: BigNumber.from('0') },
          premiumUpdatedTime: 0,
        })

        const res = await staking.callStatic.updateRewardInfo(
          alice.address,
          zat.address,
        )
        await expect(res.asset).to.equal(zat.address)
        await expect(res.bondAmount).to.equal(1000)
        await expect(res.pendingReward).to.equal(5000)
      })
    })
  })
})
