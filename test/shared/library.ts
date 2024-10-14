import { ethers } from 'hardhat'

export const deployLibrary = async () => {
  const Decimal = await ethers.getContractFactory('Decimal')
  const decimal = await Decimal.deploy()
  const MathUtils = await ethers.getContractFactory('MathUtils')
  const mathUtils = await MathUtils.deploy()
  const PositionLogic = await ethers.getContractFactory('PositionLogic', {
    libraries: {
      Decimal: decimal.address,
      MathUtils: mathUtils.address,
    },
  })
  const positionLogic = await PositionLogic.deploy()
  return { decimal, mathUtils, positionLogic }
}
