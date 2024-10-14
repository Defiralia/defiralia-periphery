export const PROTOCOL_FEE = 15

export const TOKEN_DefiraliaT = 1
export const TOKEN_BASE = 2
export const CONTRACT_FACTORY = 3
export const CONTRACT_LENDING = 4
export const CONTRACT_COLLATERAL_MANAGER = 5
export const CONTRACT_STAKING = 6
export const CONTRACT_PRICE_ORACLE = 7
export const CONTRACT_COLLATERAL_ORACLE = 8
export const CONTRACT_DEX_MANAGER = 9
export const CONTRACT_TREASURY = 10
export const CONTRACT_REWARD_DISTRIBUTOR = 11

// For Vesting Wallet
export const ONE_MONTH = 60 * 60 * 24 * 30
export const SIX_MONTHS = ONE_MONTH * 6
export const ONE_YEAR = 60 * 60 * 24 * 365
export const shortEmissionTimes = [
  Date.now() + SIX_MONTHS,
  Date.now() + SIX_MONTHS + ONE_MONTH * 2,
  Date.now() + SIX_MONTHS + ONE_MONTH * 4,
  Date.now() + SIX_MONTHS + ONE_MONTH * 6,
]
export const longEmissionTimes = [
  Date.now() + ONE_YEAR,
  Date.now() + ONE_YEAR + ONE_MONTH * 3,
  Date.now() + ONE_YEAR + ONE_MONTH * 6,
  Date.now() + ONE_YEAR + ONE_MONTH * 9,
  Date.now() + ONE_YEAR + ONE_MONTH * 12,
  Date.now() + ONE_YEAR + ONE_MONTH * 15,
  Date.now() + ONE_YEAR + ONE_MONTH * 18,
  Date.now() + ONE_YEAR + ONE_MONTH * 21,
]
