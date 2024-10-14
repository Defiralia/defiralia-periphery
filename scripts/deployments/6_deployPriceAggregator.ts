import { Contract } from 'ethers'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployPriceAggregator } from '../../helpers/deploy-helpers'
import { PriceOracle__factory } from '../../typechain-types'
import { PARAMETERS } from '../constants'

export const executeDeployPriceAggregator = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]
  const { daiUsdPriceFeed, spyUsdPriceFeed } = PARAMETERS[network.name]
  if (!daiUsdPriceFeed || !spyUsdPriceFeed) {
    throw new Error('Missing parameters')
  }

  const {
    tokens: { zSPY },
    campaign: { DefiraliaDai },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!zSPY || !DefiraliaDai) {
    throw new Error('Missing parameters')
  }

  const daiPriceAggregator = await deployPriceAggregator({
    deployer,
    params: [daiUsdPriceFeed],
  })
  console.log('deployPriceAggregator dai: done')
  const spyPriceAggregator = await deployPriceAggregator({
    deployer,
    params: [spyUsdPriceFeed],
  })
  console.log('deployPriceAggregator spy: done')

  const aggregators: { [c: string]: Contract } = {
    SpyPriceAggregator: spyPriceAggregator,
    DaiPriceAggregator: daiPriceAggregator,
  }

  for (const c of Object.entries(aggregators)) {
    ContractsJsonHelper.writeAddress({
      group: 'contracts',
      name: c[0],
      value: c[1].address,
      network: network.name,
    })
  }

  const { contracts } = ContractsJsonHelper.load({
    network: network.name,
  })
  const { PriceOracle } = contracts

  const priceOracle = PriceOracle__factory.connect(PriceOracle, deployer)

  await (
    await priceOracle.setPriceAggregator(zSPY, spyPriceAggregator.address)
  ).wait()
  console.log('setPriceAggregator zspy: done')
  await (
    await priceOracle.setPriceAggregator(DefiraliaDai, daiPriceAggregator.address)
  ).wait()
  console.log('setPriceAggregator dai: done')

  const priceSPY = await priceOracle.queryAssetPrice(zSPY)
  const priceDAI = await priceOracle.queryAssetPrice(DefiraliaDai)
  console.log('spy price:', priceSPY.price)
  console.log('dai price:', priceDAI.price)

  ContractsJsonHelper.writeAddress({
    group: 'oraclePrice',
    name: 'SPY',
    value: priceSPY.price.toString(),
    network: network.name,
  })

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
}
