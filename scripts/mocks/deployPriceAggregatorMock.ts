import { Contract } from 'ethers'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployPriceAggregatorMock } from '../../helpers/deploy-helpers'
import { PriceOracle__factory } from '../../typechain-types'
;(async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const spyPriceAggregator = await deployPriceAggregatorMock({
    deployer,
    params: [10000000000],
  })
  console.log('deployPriceAggregator spy: done')
  const daiPriceAggregator = await deployPriceAggregatorMock({
    deployer,
    params: [100000000],
  })
  console.log('deployPriceAggregator dai: done')

  const tokens: { [c: string]: Contract } = {
    SpyPriceAggregator: spyPriceAggregator,
    DaiPriceAggregator: daiPriceAggregator,
  }

  for (const c of Object.entries(tokens)) {
    ContractsJsonHelper.writeAddress({
      group: 'contracts',
      name: c[0],
      value: c[1].address,
      network: network.name,
    })
  }

  const { contracts, mockTokens } = ContractsJsonHelper.load({
    network: network.name,
  })

  const { PriceOracle } = contracts
  const { mockzSPY, mockDAI } = mockTokens

  const priceOracle = PriceOracle__factory.connect(PriceOracle, deployer)

  await (
    await priceOracle.setPriceAggregator(mockzSPY, spyPriceAggregator.address)
  ).wait()
  console.log('setPriceAggregator zspy: done')
  await (
    await priceOracle.setPriceAggregator(mockDAI, daiPriceAggregator.address)
  ).wait()
  console.log('setPriceAggregator dai: done')

  const priceSPY = await priceOracle.queryAssetPrice(mockzSPY)
  const priceDAI = await priceOracle.queryAssetPrice(mockDAI)
  console.log('spy price:', priceSPY.price)
  console.log('dai price:', priceDAI.price)

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
})()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
