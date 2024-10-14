import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers } from 'hardhat'
import { TokenMock, ZAssetMock } from '../typechain-types'
import { factoryFixture } from './shared/fixtures'

describe('Factory', function () {
  let alice: SignerWithAddress
  let defiraliat: TokenMock
  let dai: TokenMock
  let zat: ZAssetMock
  let spy: ZAssetMock
  let tsla: ZAssetMock
  let dummyToken: string
  let factory: Contract
  let lending: Contract
  let staking: Contract
  let collateralOracle: Contract
  let treasury: string
  let rewardDistributor: Contract

  beforeEach('Load fixture', async () => {
    ;({
      alice,
      zat,
      spy,
      tsla,
      dai,
      defiraliat,
      dummyToken,
      factory,
      lending,
      staking,
      collateralOracle,
      treasury,
      rewardDistributor,
    } = await loadFixture(factoryFixture))
  })

  describe('Initialize', () => {
    describe('Normal Case', () => {
      it('constractor', async () => {
        const distributionInfo = await factory.queryDistributionInfo()
        expect(distributionInfo.lastDistributed).to.equal(
          await factory.lastDistributed(),
        )
        expect(await factory.totalWeight()).to.equal(0)
      })
    })
  })

  describe('updateDistributionSchedule', () => {
    describe('Normal Case', () => {
      it('updateDistributionSchedule', async () => {
        const currentTimestamp = await time.latest()
        await factory.updateDistributionSchedule([
          {
            startTime: currentTimestamp,
            endTime: currentTimestamp + 2000,
            distributionAmount: ethers.utils.parseEther('1000'),
          },
        ])
        const schedule = await factory.distributionSchedule(0)
        expect(schedule.startTime).to.equal(currentTimestamp)
        expect(schedule.endTime).to.equal(currentTimestamp + 2000)
        expect(schedule.distributionAmount).to.equal(
          ethers.utils.parseEther('1000'),
        )
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        const currentTimestamp = await time.latest()
        await expect(
          factory.connect(alice).updateDistributionSchedule([
            {
              startTime: currentTimestamp,
              endTime: currentTimestamp + 2000,
              distributionAmount: ethers.utils.parseEther('1000'),
            },
          ]),
        ).to.be.reverted
      })
      it('AmountNotAllowZero', async () => {
        const currentTimestamp = await time.latest()
        await expect(
          factory.updateDistributionSchedule([
            {
              startTime: currentTimestamp,
              endTime: currentTimestamp + 2000,
              distributionAmount: 0,
            },
          ]),
        ).to.be.revertedWithCustomError(factory, 'AmountNotAllowZero')
      })
      it('InvalidSchedule', async () => {
        const currentTimestamp = await time.latest()
        await expect(
          factory.updateDistributionSchedule([
            {
              startTime: currentTimestamp - 5000,
              endTime: currentTimestamp - 1000,
              distributionAmount: ethers.utils.parseEther('1000'),
            },
          ]),
        ).to.be.revertedWithCustomError(factory, 'InvalidSchedule')
        await expect(
          factory.updateDistributionSchedule([
            {
              startTime: currentTimestamp + 10000,
              endTime: currentTimestamp + 1000,
              distributionAmount: ethers.utils.parseEther('1000'),
            },
          ]),
        ).to.be.revertedWithCustomError(factory, 'InvalidSchedule')
      })
    })
  })

  describe('enableAsset', () => {
    describe('Normal Case', () => {
      it('enableAsset', async () => {
        await factory.enableAsset(zat.address, 10, 200, 1400)

        // Lending
        const assetConfig = await lending.assetConfigs(zat.address)
        expect(assetConfig.liquidationDiscount).to.equal(200)
        expect(assetConfig.minCollateralRatio).to.equal(1400)

        // AssetInfo
        const assetInfo = await factory.getAssetInfo(zat.address)
        expect(assetInfo.asset).to.equal(zat.address)
        expect(assetInfo.weight).to.equal(10)
        expect(assetInfo.isRevoked).to.equal(false)

        expect(await factory.totalWeight()).to.be.equal(10)
        expect(await factory.getAssetList()).to.be.deep.equal([zat.address])

        // Staking
        const poolInfo = await staking.queryPoolInfo(zat.address)
        expect(poolInfo.asset).to.equal(zat.address)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await expect(
          factory.connect(alice).enableAsset(zat.address, 10, 200, 1400),
        ).to.be.reverted
      })
      it('InvalidEnableAssetParameters', async () => {
        await expect(
          factory.enableAsset(zat.address, 0, 1000, 1100),
        ).to.be.revertedWithCustomError(factory, 'InvalidEnableAssetParameters')
      })
      it('AssetNotDeployedByFactory', async () => {
        await expect(
          factory.enableAsset(
            '0x0000000000000000000000000000000000000001',
            10,
            200,
            1400,
          ),
        ).to.be.revertedWithCustomError(factory, 'AssetNotDeployedByFactory')
      })
      it('ExistAsset', async () => {
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await expect(
          factory.enableAsset(zat.address, 10, 200, 1400),
        ).to.be.revertedWithCustomError(factory, 'ExistAsset')
      })
      it('NotExistPriceAggregator', async () => {
        await expect(
          factory.enableAsset(tsla.address, 10, 200, 1400),
        ).to.be.revertedWithCustomError(factory, 'NotExistPriceAggregator')
      })
      it('NotExistPool', async () => {
        await expect(
          factory.enableAsset(spy.address, 10, 200, 1400),
        ).to.be.revertedWithCustomError(factory, 'NotExistPool')
      })
    })
  })

  describe('updateWeight', () => {
    describe('Normal Case', () => {
      it('updateWeight', async () => {
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await factory.updateWeight(zat.address, 20)

        expect((await factory.getAssetInfo(zat.address)).weight).to.equal(20)
        expect(await factory.totalWeight()).to.equal(20)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await expect(factory.connect(alice).updateWeight(zat.address, 20)).to.be
          .reverted
      })
      it('AssetNotAvaliable', async () => {
        // not enebled
        await expect(
          factory.updateWeight(zat.address, 20),
        ).to.be.revertedWithCustomError(factory, 'AssetNotAvaliable')

        // revoked
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await factory.revokeAsset(zat.address)
        await expect(
          factory.updateWeight(zat.address, 20),
        ).to.be.revertedWithCustomError(factory, 'AssetNotAvaliable')
      })
    })
  })

  describe('revokeAsset', () => {
    describe('Normal Case', () => {
      it('revokeAsset', async () => {
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await factory.revokeAsset(zat.address)

        // AssetInfo
        const assetInfo = await factory.getAssetInfo(zat.address)
        expect(assetInfo.asset).to.equal(zat.address)
        expect(assetInfo.weight).to.equal(0)
        expect(assetInfo.isRevoked).to.equal(true)

        // Lending
        const res = await lending.assetConfigs(zat.address)
        expect(res.liquidationDiscount).to.equal(200)
        expect(res.minCollateralRatio).to.equal(1000)
        expect(res.endPrice).to.equal(10000000000)

        // Weight
        expect((await factory.getAssetInfo(zat.address)).weight).to.be.equal(0)
        expect(await factory.totalWeight()).to.be.equal(0)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await expect(factory.connect(alice).revokeAsset(zat.address)).to.be
          .reverted
      })
      it('AssetNotAvaliable', async () => {
        // not enebled
        await expect(
          factory.revokeAsset(zat.address),
        ).to.be.revertedWithCustomError(factory, 'AssetNotAvaliable')

        // revoked
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await factory.revokeAsset(zat.address)
        await expect(
          factory.revokeAsset(zat.address),
        ).to.be.revertedWithCustomError(factory, 'AssetNotAvaliable')
      })
    })
  })

  describe('mintAsset', () => {
    describe('Normal Case', () => {
      it('mintAsset', async () => {
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await lending.mintAssetTest(
          zat.address,
          alice.address,
          1000000000000000000n, // 1
        )
        expect(await zat.balanceOf(alice.address)).to.be.equal(
          1000000000000000000n,
        )
      })
    })
    describe('Error Case', () => {
      it('AssetNotAvaliable', async () => {
        // not enebled
        await expect(
          lending.mintAssetTest(
            dai.address,
            alice.address,
            1000000000000000000n,
          ),
        ).to.be.revertedWithCustomError(factory, 'AssetNotAvaliable')

        // revoked
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await factory.revokeAsset(zat.address)
        await expect(
          lending.mintAssetTest(
            dai.address,
            alice.address,
            1000000000000000000n,
          ),
        ).to.be.revertedWithCustomError(factory, 'AssetNotAvaliable')
      })
    })
  })

  describe('burnAsset', () => {
    describe('Normal Case', () => {
      it('burnAsset', async () => {
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await lending.mintAssetTest(
          zat.address,
          alice.address,
          1000000000000000000n, // 1
        )
        await lending.burnAssetTest(
          zat.address,
          alice.address,
          1000000000000000000n, // 1
        )
        expect(await zat.balanceOf(alice.address)).to.be.equal(0)
      })
    })
    describe('Error Case', () => {
      it('NotExistAsset', async () => {
        await expect(
          lending.burnAssetTest(
            dai.address,
            alice.address,
            1000000000000000000n,
          ),
        ).to.be.revertedWithCustomError(factory, 'NotExistAsset')
      })
    })
  })

  describe('distribute', () => {
    describe('Normal Case', () => {
      it('distribute after endTime', async () => {
        await defiraliat.mint(rewardDistributor.address, 1000000000000000000000n)

        await factory.setTotalWeight(10)
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await staking.adjustPremium([zat.address])

        const currentTimestamp = await time.latest()

        await factory.updateDistributionSchedule([
          {
            startTime: currentTimestamp,
            endTime: currentTimestamp + 1000,
            distributionAmount: 1000000000000000000000n,
          },
        ])

        const nextTimestamp = currentTimestamp + 1000
        await time.setNextBlockTimestamp(nextTimestamp)

        const res = await rewardDistributor.distribute()

        // lastDistributed
        expect(await factory.lastDistributed()).to.be.greaterThanOrEqual(
          nextTimestamp,
        )

        // balance
        expect(await defiraliat.balanceOf(rewardDistributor.address)).to.be.equal(
          500000000000000000000n,
        )
        expect(await defiraliat.balanceOf(staking.address)).to.be.equal(
          499984105477250000000n,
        )
        expect(await defiraliat.balanceOf(treasury)).to.be.equal(15894522750000000n)

        await expect(res)
          .to.emit(staking, 'DepositReward')
          .withArgs(499984105477250000000n)
          .to.emit(factory, 'Distribute')
          .withArgs(499984105477250000000n, 15894522750000000n)
      })
      it('distribute within the schedule period', async () => {
        await defiraliat.mint(rewardDistributor.address, 1000000000000000000000n)

        await factory.setTotalWeight(10)
        await factory.enableAsset(zat.address, 10, 200, 1400)
        await staking.adjustPremium([zat.address])

        const currentTimestamp = await time.latest()

        await factory.updateDistributionSchedule([
          {
            startTime: currentTimestamp,
            endTime: currentTimestamp + 1000,
            distributionAmount: 1000000000000000000000n,
          },
        ])

        const nextTimestamp = currentTimestamp + 500
        await time.setNextBlockTimestamp(nextTimestamp)

        const res = await rewardDistributor.distribute()

        // lastDistributed
        expect(await factory.lastDistributed()).to.be.greaterThanOrEqual(
          nextTimestamp,
        )

        // balance
        expect(await defiraliat.balanceOf(rewardDistributor.address)).to.be.equal(
          750000000000000000000n,
        )
        expect(await defiraliat.balanceOf(staking.address)).to.be.equal(
          249992052738625000000n,
        )
        expect(await defiraliat.balanceOf(treasury)).to.be.equal(7947261375000000n)

        await expect(res)
          .to.emit(staking, 'DepositReward')
          .withArgs(249992052738625000000n)
          .to.emit(factory, 'Distribute')
          .withArgs(249992052738625000000n, 7947261375000000n)
      })
      it('distribute before interval', async () => {
        await defiraliat.mint(rewardDistributor.address, 1000000000000000000000n)

        await staking.adjustPremium([zat.address])
        await factory.setTotalWeight(10)
        await factory.enableAsset(zat.address, 10, 200, 1400)

        const currentTimestamp = await time.latest()
        await factory.updateDistributionSchedule([
          {
            startTime: currentTimestamp,
            endTime: currentTimestamp + 1000,
            distributionAmount: 1000000000000000000000n,
          },
        ])

        const nextTimestamp = currentTimestamp + 500
        await time.setNextBlockTimestamp(nextTimestamp)

        await rewardDistributor.distribute()
        const res = await rewardDistributor.distribute()
        await expect(res).to.emit(factory, 'Distribute').withArgs(0, 0)
      })
    })
    describe('Error Case', () => {
      it('OnlyRole', async () => {
        await expect(factory.distribute()).to.be.revertedWithCustomError(
          factory,
          'OnlyRole',
        )
      })
      it('NotAllowZero', async () => {
        await defiraliat.mint(rewardDistributor.address, 1000000000000000000000n)
        await time.setNextBlockTimestamp((await time.latest()) + 60)
        await expect(
          rewardDistributor.distribute(),
        ).to.be.revertedWithCustomError(factory, 'NotAllowZero')
      })
    })
  })
})
