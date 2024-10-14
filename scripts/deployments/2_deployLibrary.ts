import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import {
  deployDecimal,
  deployMathUtils,
  depolyPositionLogic,
} from '../../helpers/deploy-helpers'

export const executeDeployLibrary = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const decimal = await deployDecimal({
    deployer,
    params: [],
  })
  ContractsJsonHelper.writeAddress({
    group: 'library',
    name: 'Decimal',
    value: decimal.address,
    network: network.name,
  })

  const mathUtils = await deployMathUtils({
    deployer,
    params: [],
  })
  ContractsJsonHelper.writeAddress({
    group: 'library',
    name: 'MathUtils',
    value: mathUtils.address,
    network: network.name,
  })

  const positionLogic = await depolyPositionLogic({
    deployer,
    linkLibraryAddresses: {
      'contracts/libraries/Decimal.sol:Decimal': decimal.address,
      'contracts/libraries/MathUtils.sol:MathUtils': mathUtils.address,
    },
    params: [],
  })
  ContractsJsonHelper.writeAddress({
    group: 'library',
    name: 'PositionLogic',
    value: positionLogic.address,
    network: network.name,
  })

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
}
