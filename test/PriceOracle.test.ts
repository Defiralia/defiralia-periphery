import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { PriceAggregatorMock, ZAsset } from '../typechain-types'
import { priceOracleFixture } from './shared/fixtures'

describe('PriceOracle', function () {
  let zat: ZAsset
  let spy: ZAsset
  let priceOracle: Contract
  let zatPriceAggregatorMock: PriceAggregatorMock

  beforeEach('Load fixture', async () => {
    ;({ zat, spy, priceOracle, zatPriceAggregatorMock } = await loadFixture(
      priceOracleFixture,
    ))
  })

  describe('setPriceAggregator', () => {
    describe('Error Case', () => {
      it('PriceNotAllowZero', async () => {
        await zatPriceAggregatorMock.changePrice(0)
        await expect(
          priceOracle.setPriceAggregator(
            zat.address,
            zatPriceAggregatorMock.address,
          ),
        ).to.be.revertedWithCustomError(priceOracle, 'PriceNotAllowZero')
      })
    })
  })

  describe('setAssetTimeFrame', () => {
    describe('Normal Case', () => {
      it('setAssetTimeFrame', async () => {
        const res0 = await priceOracle.assetTimeFrames(zat.address)
        expect(res0).to.equal(0)
        await priceOracle.setAssetTimeFrame(zat.address, 60)
        const res1 = await priceOracle.assetTimeFrames(zat.address)
        expect(res1).to.equal(60)
      })
    })
  })

  describe('queryAssetPrice', () => {
    describe('Normal Case', () => {
      it('no timeFrame', async () => {
        const timestamp = await time.latest()
        const res = await priceOracle.queryAssetPrice(zat.address)
        expect(res[0]).to.equal(10000000000)
        expect(res[1]).to.equal(timestamp - 60)
      })
      it('with timeFrame', async () => {
        await priceOracle.setAssetTimeFrame(zat.address, 60)
        const timestamp = await time.latest()
        const res = await priceOracle.queryAssetPrice(zat.address)
        expect(res[0]).to.equal(10000000000)
        expect(res[1]).to.equal(timestamp - 60)
      })
    })
    describe('Error Case', () => {
      it('NotExistPriceAggregator', async () => {
        await expect(
          priceOracle.queryAssetPrice(spy.address),
        ).to.be.revertedWithCustomError(priceOracle, 'NotExistPriceAggregator')
      })
      it('PriceNotAllowZero', async () => {
        await zatPriceAggregatorMock.changePrice(0)
        await expect(
          priceOracle.queryAssetPrice(zat.address),
        ).to.be.revertedWithCustomError(priceOracle, 'PriceNotAllowZero')
      })
      it('NotUpdatedPriceFeed', async () => {
        await priceOracle.setAssetTimeFrame(zat.address, 59)
        await expect(
          priceOracle.queryAssetPrice(zat.address),
        ).to.be.revertedWithCustomError(priceOracle, 'NotUpdatedPriceFeed')
      })
    })
  })
  describe('queryPriceAggregator', () => {
    describe('Normal Case', () => {
      it('queryPriceAggregator', async () => {
        const res0 = await priceOracle.queryPriceAggregator(zat.address)
        expect(res0).to.equal(zatPriceAggregatorMock.address)
        const res1 = await priceOracle.queryPriceAggregator(spy.address)
        expect(res1).to.equal('0x0000000000000000000000000000000000000000')
      })
    })
  })
})
