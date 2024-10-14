import { ethers, upgrades } from 'hardhat'

// import * as LendingArtifact from '../../artifacts/contracts/Lending.sol/Lending.json'

const main = async () => {
  console.log(`------- Start -------`)

  const Lending = await ethers.getContractFactory('Lending', {
    signer: (await ethers.getSigners())[0],
    libraries: {
      PositionLogic: '0x38a5EB72244Af11Be87FE6cf9630b4F3A00E3ee9',
    },
  })

  const instance = await upgrades.upgradeProxy(
    '0xA2c302FeCc250CA538D16d19cbFee51254c4b6a3',
    Lending,
    {
      kind: 'uups',
      unsafeAllow: ['external-library-linking'],
    },
  )

  await instance.deployTransaction.wait()

  console.log(`------- Finished -------`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
