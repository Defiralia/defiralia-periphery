import { Contract } from 'ethers'
import { ethers, network } from 'hardhat'
import { ContractsJsonHelper } from '../../helpers/contracts-json-helper'
import { deployDefiraliaVestingWallet } from '../../helpers/deploy-helpers'

type Beneficiary = 'PRE_SEED' | 'SEED' | 'TEAM'
const ONE_MONTH = 60 * 60 * 24 * 30
const SIX_MONTHS = ONE_MONTH * 6
const ONE_YEAR = 60 * 60 * 24 * 365

// TODO: set exact timestamp
const shortEmissionTimes = [
  Date.now() + SIX_MONTHS,
  Date.now() + SIX_MONTHS + ONE_MONTH * 2,
  Date.now() + SIX_MONTHS + ONE_MONTH * 4,
  Date.now() + SIX_MONTHS + ONE_MONTH * 6,
]

// TODO: set exact timestamp
const longEmissionTimes = [
  Date.now() + ONE_YEAR,
  Date.now() + ONE_YEAR + ONE_MONTH * 3,
  Date.now() + ONE_YEAR + ONE_MONTH * 6,
  Date.now() + ONE_YEAR + ONE_MONTH * 9,
  Date.now() + ONE_YEAR + ONE_MONTH * 12,
  Date.now() + ONE_YEAR + ONE_MONTH * 15,
  Date.now() + ONE_YEAR + ONE_MONTH * 18,
  Date.now() + ONE_YEAR + ONE_MONTH * 21,
]

const PARAMS: {
  [key in Beneficiary]: {
    beneficiaryAddress: string
    emissionTimes: number[]
  }[]
} = {
  PRE_SEED: [
    {
      // TODO:
      beneficiaryAddress: `0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097`,
      emissionTimes: shortEmissionTimes,
    },
  ],
  // Note: SEED is supposed to be multiple.
  SEED: [
    {
      // TODO:
      beneficiaryAddress: `0xcd3B766CCDd6AE721141F452C550Ca635964ce71`,
      emissionTimes: longEmissionTimes,
    },
    {
      // TODO:
      beneficiaryAddress: `0x2546BcD3c84621e976D8185a91A922aE77ECEc30`,
      emissionTimes: longEmissionTimes,
    },
  ],
  TEAM: [
    {
      // TODO:
      beneficiaryAddress: `0xbDA5747bFD65F08deb54cb465eB87D40e51B197E`,
      emissionTimes: longEmissionTimes,
    },
  ],
}

export const executeDeployDefiraliaVestingWallet = async () => {
  console.log(`------- Start -------`)

  const deployer = (await ethers.getSigners())[0]

  const {
    tokens: { DefiraliaT },
  } = ContractsJsonHelper.load({ network: network.name })
  if (!DefiraliaT) {
    throw new Error('DefiraliaT address is not found')
  }

  const vestingForPreSeed = await deployDefiraliaVestingWallet({
    deployer,
    params: [
      DefiraliaT,
      PARAMS.PRE_SEED[0].beneficiaryAddress,
      PARAMS.PRE_SEED[0].emissionTimes,
    ],
  })
  console.log('deployed VestingWalletForPreSeed.')

  const vestingForSeed1 = await deployDefiraliaVestingWallet({
    deployer,
    params: [
      DefiraliaT,
      PARAMS.SEED[0].beneficiaryAddress,
      PARAMS.SEED[0].emissionTimes,
    ],
  })
  console.log('deployed VestingWalletForSeed1.')

  const vestingForSeed2 = await deployDefiraliaVestingWallet({
    deployer,
    params: [
      DefiraliaT,
      PARAMS.SEED[1].beneficiaryAddress,
      PARAMS.SEED[1].emissionTimes,
    ],
  })
  console.log('deployed VestingWalletForSeed2.')

  const vestingForTeam = await deployDefiraliaVestingWallet({
    deployer,
    params: [
      DefiraliaT,
      PARAMS.TEAM[0].beneficiaryAddress,
      PARAMS.TEAM[0].emissionTimes,
    ],
  })
  console.log('deployed VestingWalletForTeam.')

  const contracs: { [c: string]: Contract } = {
    VestingForPreSeed: vestingForPreSeed,
    VestingForSeed1: vestingForSeed1,
    VestingForSeed2: vestingForSeed2,
    VestingWalletForTeam: vestingForTeam,
  }

  for (const c of Object.entries(contracs)) {
    ContractsJsonHelper.writeAddress({
      group: 'vesting',
      name: c[0],
      value: c[1].address,
      network: network.name,
    })
  }

  console.log(`------- Finished -------`)
  console.log(ContractsJsonHelper.load({ network: network.name }))
}
