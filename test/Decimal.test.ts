import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { DecimalTest } from '../typechain-types'
import { deployLibrary } from './shared/library'

describe('Decimal', function () {
  let decimalTest: DecimalTest
  const fixture = async () => {
    const { decimal } = await deployLibrary()
    const DecimalTest = await ethers.getContractFactory('DecimalTest', {
      libraries: {
        Decimal: decimal.address,
      },
    })
    const decimalTest = await DecimalTest.deploy()
    return { decimalTest }
  }

  beforeEach('Load fixture', async () => {
    ;({ decimalTest } = await loadFixture(fixture))
  })

  it('one', async () => {
    expect(await decimalTest.one()).to.equal(1000000000000000000n)
  })
  it('zero', async () => {
    expect(await decimalTest.zero()).to.equal(0)
  })
  it('isZero', async () => {
    expect(await decimalTest.isZero(0)).to.equal(true)
    expect(await decimalTest.isZero(1000000000000000000n)).to.equal(false)
  })
  it('permilleToDecimal', async () => {
    expect(await decimalTest.permilleToDecimal(0)).to.equal(0)
    expect(await decimalTest.permilleToDecimal(10)).to.equal(10000000000000000n)
    expect(await decimalTest.permilleToDecimal(100)).to.equal(
      100000000000000000n,
    )
    expect(await decimalTest.permilleToDecimal(1000)).to.equal(
      1000000000000000000n,
    )
  })
  it('add', async () => {
    expect(await decimalTest.add(1, 1)).to.equal(2000000000000000000n)
  })
  it('addUint', async () => {
    expect(await decimalTest.addUint(1, 1)).to.equal(2000000000000000000n)
  })
  it('sub', async () => {
    expect(await decimalTest.sub(3, 1)).to.equal(2000000000000000000n)
  })
  it('subUint', async () => {
    expect(await decimalTest.subUint(3, 1)).to.equal(2000000000000000000n)
  })
  it('mul', async () => {
    expect(await decimalTest.mul(2, 3)).to.equal(6000000000000000000n)
  })
  it('mulUint', async () => {
    expect(await decimalTest.mulUint(2, 3)).to.equal(6000000000000000000n)
  })
  it('div', async () => {
    expect(await decimalTest.div(5, 2)).to.equal(2500000000000000000n)
  })
  it('divUint', async () => {
    expect(await decimalTest.divUint(5, 2)).to.equal(2500000000000000000n)
  })
  it('gt', async () => {
    expect(await decimalTest.gt(10, 11)).to.equal(false)
    expect(await decimalTest.gt(11, 10)).to.equal(true)
  })
  it('min', async () => {
    expect(await decimalTest.min(1, 2)).to.equal(1000000000000000000n)
    expect(await decimalTest.min(2, 1)).to.equal(1000000000000000000n)
  })
  it('pow', async () => {
    expect(await decimalTest.pow(2, 3)).to.equal(8000000000000000000n)
  })
  it('reverseDecimal', async () => {
    expect(await decimalTest.reverseDecimal(100)).to.equal(10000000000000000n)
    expect(await decimalTest.reverseDecimal(3)).to.equal(333333333333333333n)
  })
  it('fromRatio', async () => {
    expect(await decimalTest.fromRatio(2, 100)).to.equal(20000000000000000n)
    expect(await decimalTest.fromRatio(2, 3)).to.equal(666666666666666666n)
  })
  it('toUint', async () => {
    expect(await decimalTest.toUint(2)).to.equal(2)
  })
  it('fromUint', async () => {
    expect(await decimalTest.fromUint(10)).to.equal(10000000000000000000n)
  })
  it('erfPlusOne', async () => {
    expect(
      await decimalTest.erfPlusOne(false, 21_213_203_435, 10_000_000_000),
    ).to.equal(0)
    expect(
      await decimalTest.erfPlusOne(false, 14_142_135_623, 10_000_000_000),
    ).to.equal(13_090_625_921_000_000n)
    expect(await decimalTest.erfPlusOne(true, 0, 10_000_000_000)).to.equal(
      1_000_000_000_000_000_000n,
    )
    expect(
      await decimalTest.erfPlusOne(true, 14_142_135_623, 10_000_000_000),
    ).to.equal(1_954_499_476_208_000_000n)
  })
  it('sumAndMultiplyX', async () => {
    const result1 = await decimalTest.sumAndMultiplyX(true, true, true, 2, 3, 4)
    expect(result1[0]).to.equal(true)
    expect(result1[1]).to.equal(20000000000000000000n)

    const result2 = await decimalTest.sumAndMultiplyX(
      true,
      true,
      false,
      2,
      3,
      4,
    )
    expect(result2[0]).to.equal(false)
    expect(result2[1]).to.equal(20000000000000000000n)

    const result3 = await decimalTest.sumAndMultiplyX(
      true,
      false,
      true,
      3,
      2,
      4,
    )
    expect(result3[0]).to.equal(true)
    expect(result3[1]).to.equal(4000000000000000000n)

    const result4 = await decimalTest.sumAndMultiplyX(
      true,
      false,
      false,
      3,
      2,
      4,
    )
    expect(result4[0]).to.equal(false)
    expect(result4[1]).to.equal(4000000000000000000n)

    const result5 = await decimalTest.sumAndMultiplyX(
      true,
      false,
      true,
      2,
      3,
      4,
    )
    expect(result5[0]).to.equal(false)
    expect(result5[1]).to.equal(4000000000000000000n)

    const result6 = await decimalTest.sumAndMultiplyX(
      true,
      false,
      false,
      2,
      3,
      4,
    )
    expect(result6[0]).to.equal(true)
    expect(result6[1]).to.equal(4000000000000000000n)
  })
})
