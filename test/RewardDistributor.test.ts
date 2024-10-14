import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { TokenMock, ZAsset } from '../typechain-types'
import { rewardDistributorFixture } from './shared/fixtures'

describe('RewardDistributor', function () {
  let owner: SignerWithAddress
  let alice: SignerWithAddress
  let zat: ZAsset
  let defiraliat: TokenMock
  let factory: Contract
  let rewardDistributor: Contract

  beforeEach('Load fixture', async () => {
    ;({ zat, defiraliat, factory, rewardDistributor, alice, owner } =
      await loadFixture(rewardDistributorFixture))
  })

  describe('distribute', () => {
    describe('Normal Case', () => {
      it('distribute: Owner', async () => {
        await defiraliat.mint(rewardDistributor.address, 100000000000000n)
        await factory.setTotalWeight(10)
        await factory.enableAsset(zat.address, 10, 200, 1400)
        const timestamp = await time.latest()
        await factory.updateDistributionSchedule([
          {
            startTime: timestamp,
            endTime: timestamp + 1000,
            distributionAmount: 100000000000000n,
          },
        ])
        const nextTimestamp = timestamp + 1000
        await time.setNextBlockTimestamp(nextTimestamp)
        await expect(rewardDistributor.distribute())
          .to.emit(rewardDistributor, 'Distribute')
          .withArgs(owner.address)
      })
    })
    describe('Error Case', () => {
      it('NoBalance', async () => {
        await factory.setTotalWeight(10)
        await factory.enableAsset(zat.address, 10, 200, 1400)
        const timestamp = await time.latest()
        await factory.updateDistributionSchedule([
          {
            startTime: timestamp,
            endTime: timestamp + 1000,
            distributionAmount: 100000000000000n,
          },
        ])
        const nextTimestamp = timestamp + 1000
        await time.setNextBlockTimestamp(nextTimestamp)
        await expect(
          rewardDistributor.connect(alice).distribute(),
        ).to.be.revertedWithCustomError(rewardDistributor, 'NoBalance')
      })
      it('Pausable: paused', async () => {
        await defiraliat.mint(rewardDistributor.address, 100000000000000n)
        await factory.setTotalWeight(10)
        await factory.enableAsset(zat.address, 10, 200, 1400)
        const timestamp = await time.latest()
        await factory.updateDistributionSchedule([
          {
            startTime: timestamp,
            endTime: timestamp + 1000,
            distributionAmount: 100000000000000n,
          },
        ])
        const nextTimestamp = timestamp + 1000
        await time.setNextBlockTimestamp(nextTimestamp)
        await rewardDistributor.pause()
        await expect(rewardDistributor.distribute()).to.be.revertedWith(
          'Pausable: paused',
        )
      })
    })
  })
  describe('withdraw', () => {
    describe('Normal Case', () => {
      it('withdraw', async () => {
        await zat.mint(rewardDistributor.address, 100000000000000n)
        const res = await rewardDistributor.withdraw(zat.address)
        expect(await zat.balanceOf(owner.address)).to.be.eq(100000000000000n)
        await expect(res)
          .to.emit(rewardDistributor, 'Withdraw')
          .withArgs(zat.address, owner.address, 100000000000000n)
      })
      it('withdraw: nonexistent token', async () => {
        await zat.mint(rewardDistributor.address, 100000000000000n)
        const res = await rewardDistributor.withdraw(defiraliat.address)
        await expect(res)
          .to.emit(rewardDistributor, 'Withdraw')
          .withArgs(defiraliat.address, owner.address, 0n)
      })
      it('withdraw: even DefiraliaT', async () => {
        await defiraliat.mint(rewardDistributor.address, 100000000000000n)
        const res = await rewardDistributor.withdraw(defiraliat.address)
        expect(await defiraliat.balanceOf(owner.address)).to.be.eq(100000000000000n)
        await expect(res)
          .to.emit(rewardDistributor, 'Withdraw')
          .withArgs(defiraliat.address, owner.address, 100000000000000n)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await zat.mint(rewardDistributor.address, 100000000000000n)
        await expect(rewardDistributor.connect(alice).withdraw(zat.address)).to
          .be.reverted
      })
    })
  })
})
