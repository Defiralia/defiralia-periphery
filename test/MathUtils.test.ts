import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { BigNumber } from 'ethers'
import { ethers } from 'hardhat'
import { MathUtils } from '../typechain-types'

const unitMax = BigNumber.from(2)
  .pow(255)
  .sub(1)
  .add(BigNumber.from(2).pow(255))

describe('MathUtils', function () {
  let mathUtils: MathUtils
  const fixture = async () => {
    const MathUtils = await ethers.getContractFactory('MathUtils')
    const mathUtils = await MathUtils.deploy()
    return { mathUtils }
  }

  beforeEach('Load fixture', async () => {
    ;({ mathUtils } = await loadFixture(fixture))
  })

  it('mulPermille', async () => {
    expect(
      await mathUtils.mulPermille(BigNumber.from(`${1e18}`), 2000),
    ).to.equal(BigNumber.from(`${2e18}`))
    expect(
      mathUtils.mulPermille(unitMax.div(2000).add(1), 2000),
    ).to.be.revertedWith('Math multiplication is overflow')
  })

  it('divPermille', async () => {
    expect(
      await mathUtils.divPermille(BigNumber.from(`${1e18}`), 2000),
    ).to.equal(BigNumber.from(`${5e17}`))
    expect(
      mathUtils.divPermille(unitMax.div(1000).add(1), 2000),
    ).to.be.revertedWith('Math multiplication is overflow')
  })

  it('mulPerMillion', async () => {
    expect(
      await mathUtils.mulPerMillion(BigNumber.from(`${1e18}`), 2000, 1500),
    ).to.equal(BigNumber.from(`${3e18}`))
    expect(
      mathUtils.mulPerMillion(unitMax.div(3000000).add(1), 2000, 1500),
    ).to.be.revertedWith('Math multiplication is overflow')
  })

  it('divPermille', async () => {
    expect(
      await mathUtils.divPermille(BigNumber.from(`${1e18}`), 2000),
    ).to.equal(BigNumber.from(`${5e17}`))
    expect(
      mathUtils.divPermille(unitMax.div(1000000).add(1), 2000),
    ).to.be.revertedWith('Math multiplication is overflow')
  })

  it('calcAmount', async () => {
    expect(
      await mathUtils.calcAmount(
        BigNumber.from(`${1e18}`),
        BigNumber.from(`${100e8}`),
        18,
        BigNumber.from(`${1e8}`),
        18,
      ),
    ).to.equal(BigNumber.from(`${100e18}`))
    expect(
      await mathUtils.calcAmount(
        BigNumber.from(`${1e18}`),
        BigNumber.from(`${1e8}`),
        6,
        BigNumber.from(`${1e8}`),
        18,
      ),
    ).to.equal(BigNumber.from(`${1e6}`))
    expect(
      await mathUtils.calcAmount(
        BigNumber.from(`${1e6}`),
        BigNumber.from(`${100e8}`),
        18,
        BigNumber.from(`${1e8}`),
        6,
      ),
    ).to.equal(BigNumber.from(`${100e18}`))
  })

  it('max', async () => {
    expect(await mathUtils.max(1000, 2000)).to.equal(2000)
    expect(await mathUtils.max(1000, 500)).to.equal(1000)
  })

  it('min', async () => {
    expect(await mathUtils.min(1000, 2000)).to.equal(1000)
    expect(await mathUtils.min(1000, 500)).to.equal(500)
  })
})
