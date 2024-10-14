import { loadFixture, time } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { parseEther } from 'ethers/lib/utils'
import { DefiraliaToken, DefiraliaVestingWallet } from '../typechain-types'
import { longEmissionTimes, shortEmissionTimes } from './shared/constant'
import { defiraliatVestingWalletFixture } from './shared/fixtures'

describe('DefiraliaT Vesting Wallet', function () {
  let defiraliat: DefiraliaToken
  let preSeed: SignerWithAddress
  let seed1: SignerWithAddress
  let vestingWalletForPreseed: DefiraliaVestingWallet
  let vestingWalletForSeed1: DefiraliaVestingWallet
  let vestingWalletForSeed2: DefiraliaVestingWallet
  let vestingWalletForTeam: DefiraliaVestingWallet

  const preSeedAmount = parseEther('50000')
  const seed1Amount = parseEther('100000')

  beforeEach('Load fixture and distribute DefiraliaT', async () => {
    ;({
      defiraliat,
      preSeed,
      seed1,
      vestingWalletForPreseed,
      vestingWalletForSeed1,
      vestingWalletForSeed2,
      vestingWalletForTeam,
    } = await loadFixture(defiraliatVestingWalletFixture))
    await defiraliat.transfer(vestingWalletForPreseed.address, preSeedAmount)
    await defiraliat.transfer(vestingWalletForSeed1.address, seed1Amount)
  })

  describe('Check Six Months Wallet(vestingWalletForPreseed)', () => {
    describe('Normal Case', () => {
      it('Check Parameters', async () => {
        const [
          balance,
          beneficiary,
          start,
          end,
          defiraliatAddress,
          emissionTimes,
          released,
          releasable,
        ] = await Promise.all([
          await defiraliat.balanceOf(vestingWalletForPreseed.address),
          await vestingWalletForPreseed.beneficiary(),
          await vestingWalletForPreseed.start(),
          await vestingWalletForPreseed.end(),
          await vestingWalletForPreseed.defiraliatAddress(),
          await vestingWalletForPreseed.emissionTimes(),
          await vestingWalletForPreseed.released(),
          await vestingWalletForPreseed.releasable(),
        ])
        expect(balance).to.equal(preSeedAmount)
        expect(beneficiary).to.equal(preSeed.address)
        expect(start.toNumber()).to.equal(shortEmissionTimes[0])
        expect(end.toNumber()).to.equal(
          shortEmissionTimes[shortEmissionTimes.length - 1],
        )
        expect(defiraliatAddress).to.equal(defiraliat.address)
        for (let i = 0; i < emissionTimes.length; i++) {
          expect(emissionTimes[i].toNumber()).to.equal(shortEmissionTimes[i])
        }
        expect(released).to.equal(0)
        expect(releasable).to.equal(0)
      })
      it('Increase Time for term 1', async () => {
        await time.increaseTo(shortEmissionTimes[0])
        expect(await vestingWalletForPreseed.releasable()).to.equal(
          preSeedAmount.div(shortEmissionTimes.length),
        )
        await vestingWalletForPreseed.release()
        expect(await defiraliat.balanceOf(preSeed.address)).to.equal(
          preSeedAmount.div(shortEmissionTimes.length),
        )
      })
      it('Increase Time for term 2', async () => {
        await time.increaseTo(shortEmissionTimes[1])
        expect(await vestingWalletForPreseed.releasable()).to.equal(
          preSeedAmount.div(shortEmissionTimes.length).mul(2),
        )
        await vestingWalletForPreseed.release()
        expect(await defiraliat.balanceOf(preSeed.address)).to.equal(
          preSeedAmount.div(shortEmissionTimes.length).mul(2),
        )
      })
      it('Increase Time for term 3', async () => {
        await time.increaseTo(shortEmissionTimes[2])
        expect(await vestingWalletForPreseed.releasable()).to.equal(
          preSeedAmount.div(shortEmissionTimes.length).mul(3),
        )
        await vestingWalletForPreseed.release()
        expect(await defiraliat.balanceOf(preSeed.address)).to.equal(
          preSeedAmount.div(shortEmissionTimes.length).mul(3),
        )
      })
      it('Increase Time for term 4', async () => {
        await time.increaseTo(shortEmissionTimes[3])
        expect(await vestingWalletForPreseed.releasable()).to.equal(
          preSeedAmount,
        )
        await vestingWalletForPreseed.release()
        expect(await defiraliat.balanceOf(preSeed.address)).to.equal(preSeedAmount)
      })
    })
  })
  describe('Check One Year Wallet(except vestingWalletForPreseed)', () => {
    it('Check Parameters', async () => {
      const [
        balance,
        beneficiary,
        start,
        end,
        defiraliatAddress,
        emissionTimes,
        released,
        releasable,
      ] = await Promise.all([
        await defiraliat.balanceOf(vestingWalletForSeed1.address),
        await vestingWalletForSeed1.beneficiary(),
        await vestingWalletForSeed1.start(),
        await vestingWalletForSeed1.end(),
        await vestingWalletForSeed1.defiraliatAddress(),
        await vestingWalletForSeed1.emissionTimes(),
        await vestingWalletForSeed1.released(),
        await vestingWalletForSeed1.releasable(),
      ])
      expect(balance).to.equal(seed1Amount)
      expect(beneficiary).to.equal(seed1.address)
      expect(start.toNumber()).to.equal(longEmissionTimes[0])
      expect(end.toNumber()).to.equal(
        longEmissionTimes[longEmissionTimes.length - 1],
      )
      expect(defiraliatAddress).to.equal(defiraliat.address)
      for (let i = 0; i < emissionTimes.length; i++) {
        expect(emissionTimes[i].toNumber()).to.equal(longEmissionTimes[i])
      }
      expect(released).to.equal(0)
      expect(releasable).to.equal(0)
    })
    it('Increase Time for term 1', async () => {
      await time.increaseTo(longEmissionTimes[0])
      expect(await vestingWalletForSeed1.releasable()).to.equal(
        seed1Amount.div(longEmissionTimes.length),
      )
      await vestingWalletForSeed1.release()
      expect(await defiraliat.balanceOf(seed1.address)).to.equal(
        seed1Amount.div(longEmissionTimes.length),
      )
    })
    it('Increase Time for term 2', async () => {
      await time.increaseTo(longEmissionTimes[1])
      expect(await vestingWalletForSeed1.releasable()).to.equal(
        seed1Amount.div(longEmissionTimes.length).mul(2),
      )
      await vestingWalletForSeed1.release()
      expect(await defiraliat.balanceOf(seed1.address)).to.equal(
        seed1Amount.div(longEmissionTimes.length).mul(2),
      )
    })
    it('Increase Time for term 3', async () => {
      await time.increaseTo(longEmissionTimes[2])
      expect(await vestingWalletForSeed1.releasable()).to.equal(
        seed1Amount.div(longEmissionTimes.length).mul(3),
      )
      await vestingWalletForSeed1.release()
      expect(await defiraliat.balanceOf(seed1.address)).to.equal(
        seed1Amount.div(longEmissionTimes.length).mul(3),
      )
    })
    it('Increase Time for term 8', async () => {
      await time.increaseTo(longEmissionTimes[7])
      expect(await vestingWalletForSeed1.releasable()).to.equal(seed1Amount)
      await vestingWalletForSeed1.release()
      expect(await defiraliat.balanceOf(seed1.address)).to.equal(seed1Amount)
    })
  })
})
