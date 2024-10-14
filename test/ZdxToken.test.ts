import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { expect } from 'chai'
import { parseEther } from 'ethers/lib/utils'
import { DefiraliaToken } from '../typechain-types'
import { defiraliaTokenFixture } from './shared/fixtures'

describe('Defiralia Token', function () {
  let owner: SignerWithAddress
  let defiraliat: DefiraliaToken

  beforeEach('Load fixture', async () => {
    ;({ owner, defiraliat } = await loadFixture(defiraliaTokenFixture))
  })

  describe('Check Token Holder', () => {
    describe('Normal Case', () => {
      it('deployer balance', async () => {
        expect(await defiraliat.balanceOf(owner.address)).to.equal(
          parseEther('1000000'),
        )
        expect(await defiraliat.totalSupply()).to.equal(parseEther('1000000'))
      })
    })
  })
})
