import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { BigNumber, Contract } from 'ethers'
import { ethers } from 'hardhat'
import { TokenMock, ZAsset } from '../typechain-types'
import { collateralOracleFixture } from './shared/fixtures'

const unitMax = BigNumber.from(2)
  .pow(255)
  .sub(1)
  .add(BigNumber.from(2).pow(255))

describe('collateralOracle', function () {
  let alice: SignerWithAddress
  let dai: TokenMock
  let zat: ZAsset
  let tsla: ZAsset
  let collateralOracle: Contract

  beforeEach('Load fixture', async () => {
    ;({ alice, zat, tsla, dai, collateralOracle } = await loadFixture(
      collateralOracleFixture,
    ))
  })

  describe('registerCollateral', () => {
    describe('Normal Case', () => {
      it('registerCollateral', async () => {
        const res = await collateralOracle.registerCollateral(zat.address, 1000)

        await expect(res)
          .to.emit(collateralOracle, 'RegisterCollateral')
          .withArgs(zat.address, 1000, 1)

        const info = await collateralOracle.queryCollateralInfo(zat.address)
        expect(info.collateral).to.equal(zat.address)
        expect(info.fixedPrice).to.equal(0)
        expect(info.multiplier).to.equal(1000)
        expect(info.isRevoked).to.equal(false)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await expect(
          collateralOracle.connect(alice).registerCollateral(zat.address, 1000),
        ).to.be.reverted
      })
      it('ExistCollateral', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        await expect(
          collateralOracle.registerCollateral(zat.address, 1000),
        ).to.be.revertedWithCustomError(collateralOracle, 'ExistCollateral')
      })
      it('InvalidMultiplier', async () => {
        await expect(
          collateralOracle.registerCollateral(zat.address, 999),
        ).to.be.revertedWithCustomError(collateralOracle, 'InvalidMultiplier')
      })
      it('NotExistPriceAggregator', async () => {
        await expect(
          collateralOracle.registerCollateral(tsla.address, 1000),
        ).to.be.revertedWithCustomError(
          collateralOracle,
          'NotExistPriceAggregator',
        )
      })
    })
  })

  describe('revokeCollateralAsset', () => {
    describe('Normal Case', () => {
      it('revokeCollateralAsset', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        const res = await collateralOracle.revokeCollateralAsset(zat.address)

        await expect(res)
          .to.emit(collateralOracle, 'RevokeCollateralAsset')
          .withArgs(zat.address)

        const info = await collateralOracle.queryCollateralInfo(zat.address)
        expect(info.collateral).to.equal(zat.address)
        expect(info.fixedPrice).to.equal(0)
        expect(info.multiplier).to.equal(1000)
        expect(info.isRevoked).to.equal(true)
      })
      it('asset is not registered', async () => {
        await collateralOracle.revokeCollateralAsset(zat.address)
        const info = await collateralOracle.queryCollateralInfo(zat.address)
        expect(info.collateral).to.equal(ethers.constants.AddressZero)
        expect(info.fixedPrice).to.equal(0)
        expect(info.multiplier).to.equal(0)
        expect(info.isRevoked).to.equal(false)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        await expect(
          collateralOracle.connect(alice).revokeCollateralAsset(zat.address),
        ).to.be.reverted
      })
    })
  })

  describe('suspendCollateralAsset', () => {
    describe('Normal Case', () => {
      it('suspendCollateralAsset', async () => {
        await collateralOracle.registerCollateral(dai.address, 1000)
        await collateralOracle.suspendCollateralAsset(dai.address)

        const info = await collateralOracle.queryCollateralInfo(dai.address)
        expect(info.collateral).to.equal(dai.address)
        expect(info.multiplier).to.equal(1000)
        expect(info.fixedPrice).to.equal(0)
        expect(info.isRevoked).to.equal(false)
        expect(info.isSuspended).to.equal(true)
      })
    })
  })

  describe('unsuspendCollateralAsset', () => {
    describe('Normal Case', () => {
      it('unsuspendCollateralAsset', async () => {
        await collateralOracle.registerCollateral(dai.address, 1000)
        await collateralOracle.suspendCollateralAsset(dai.address)
        await collateralOracle.unsuspendCollateralAsset(dai.address)

        const info = await collateralOracle.queryCollateralInfo(dai.address)
        expect(info.collateral).to.equal(dai.address)
        expect(info.multiplier).to.equal(1000)
        expect(info.fixedPrice).to.equal(0)
        expect(info.isRevoked).to.equal(false)
        expect(info.isSuspended).to.equal(false)
      })
    })
  })

  describe('updateCollateralEndPrice', () => {
    describe('Normal Case', () => {
      it('updateCollateralEndPrice', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        const res = await collateralOracle.updateCollateralEndPrice(
          zat.address,
          100,
        )

        await expect(res)
          .to.emit(collateralOracle, 'UpdateCollateralEndPrice')
          .withArgs(zat.address, 100)

        const info = await collateralOracle.queryCollateralInfo(zat.address)
        expect(info.collateral).to.equal(zat.address)
        expect(info.multiplier).to.equal(1000)
        expect(info.fixedPrice).to.equal(100)
        expect(info.isRevoked).to.equal(false)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        await expect(
          collateralOracle
            .connect(alice)
            .updateCollateralEndPrice(zat.address, 100),
        ).to.be.reverted
      })
      it('NotExistCollateral', async () => {
        await expect(
          collateralOracle.updateCollateralEndPrice(zat.address, 100),
        ).to.be.revertedWithCustomError(collateralOracle, 'NotExistCollateral')
      })
    })
  })
  describe('updateCollateralMultiplier', () => {
    describe('Normal Case', () => {
      it('updateCollateralMultiplier', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        const res = await collateralOracle.updateCollateralMultiplier(
          zat.address,
          1500,
        )

        await expect(res)
          .to.emit(collateralOracle, 'UpdateCollateralMultiplier')
          .withArgs(zat.address, 1500)

        const info = await collateralOracle.queryCollateralInfo(zat.address)
        expect(info.collateral).to.equal(zat.address)
        expect(info.fixedPrice).to.equal(0)
        expect(info.multiplier).to.equal(1500)
        expect(info.isRevoked).to.equal(false)
      })
    })
    describe('Error Case', () => {
      it('AssertionError', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        await expect(
          collateralOracle
            .connect(alice)
            .updateCollateralMultiplier(zat.address, 1500),
        ).to.be.reverted
      })
      it('NotExistCollateral', async () => {
        await expect(
          collateralOracle.updateCollateralMultiplier(zat.address, 1000),
        ).to.be.revertedWithCustomError(collateralOracle, 'NotExistCollateral')
      })
      it('InvalidMultiplier', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        await expect(
          collateralOracle.updateCollateralMultiplier(zat.address, 999),
        ).to.be.revertedWithCustomError(collateralOracle, 'InvalidMultiplier')
      })
    })
  })
  describe('queryCollateralPrice', () => {
    describe('Normal Case', () => {
      it('Fixed', async () => {
        await collateralOracle.registerCollateral(zat.address, 1000)
        await collateralOracle.updateCollateralEndPrice(zat.address, 100)
        const res = await collateralOracle.queryCollateralPrice(zat.address)

        await expect(res.collateral).to.equal(zat.address)
        await expect(res.price).to.equal(100)
        await expect(res.lastUpdate).to.equal(unitMax)
        await expect(res.multiplier).to.equal(1000)
        await expect(res.isRevoked).to.equal(false)
      })
      it('Oracle', async () => {
        const timestamp = await time.latest()
        await collateralOracle.registerCollateral(zat.address, 1000)
        const res = await collateralOracle.queryCollateralPrice(zat.address)
        await expect(res.collateral).to.equal(zat.address)
        await expect(res.price).to.equal(10000000000)
        await expect(res.lastUpdate).to.greaterThanOrEqual(timestamp - 60)
        await expect(res.multiplier).to.equal(1000)
        await expect(res.isRevoked).to.equal(false)
      })
    })
    describe('Error Case', () => {
      it('NotExistCollateral', async () => {
        await expect(
          collateralOracle.queryCollateralPrice(
            '0x0000000000000000000000000000000000000001',
          ),
        ).to.be.revertedWithCustomError(collateralOracle, 'NotExistCollateral')
      })
    })
  })

  describe('queryCollateralInfos', () => {
    describe('Normal Case', () => {
      it('queryCollateralInfos', async () => {
        await collateralOracle.registerCollateral(dai.address, 1000)
        await collateralOracle.updateCollateralEndPrice(dai.address, 100)
        await collateralOracle.registerCollateral(zat.address, 1000)
        const info = await collateralOracle.queryCollateralInfos()

        expect(info[0].collateral).to.equal(dai.address)
        expect(info[0].fixedPrice).to.equal(100)
        expect(info[0].multiplier).to.equal(1000)
        expect(info[0].isRevoked).to.equal(false)
        expect(info[1].collateral).to.equal(zat.address)
        expect(info[1].fixedPrice).to.equal(0)
        expect(info[1].multiplier).to.equal(1000)
        expect(info[1].isRevoked).to.equal(false)
      })
    })
  })
})
