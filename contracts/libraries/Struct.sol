// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

// ========== Common ==========

struct decimal {
  uint value;
}

struct Reward {
  address asset;
  uint amount;
}

// ========== Lending ==========

struct AssetConfig {
  address asset;
  uint32 liquidationDiscount;
  uint32 minCollateralRatio;
  uint endPrice;
  bool isSuspended;
}

struct Position {
  uint index;
  address owner;
  address asset;
  uint assetAmount;
  address collateral;
  uint collateralAmount;
  bool isShort;
  bool isClosed;
  uint liquidatedAmount;
}

struct ShortParams {
  bool isShort;
  uint amountOutMinimum;
  uint160 sqrtPriceLimitX96;
}
struct OpenPositionParams {
  address asset;
  address collateral;
  uint collateralAmount;
  uint32 collateralRatio;
  ShortParams shortParams;
  AssetConfig assetConfig;
}
struct DepositParams {
  address collateral;
  uint collateralAmount;
  AssetConfig assetConfig;
}
struct WithdrawParams {
  address collateral;
  uint collateralAmount;
  AssetConfig assetConfig;
}

struct MintParams {
  address asset;
  uint assetAmount;
  ShortParams shortParams;
  AssetConfig assetConfig;
}

struct BurnParams {
  address asset;
  uint assetAmount;
  AssetConfig assetConfig;
  uint32 protocolFeeRate;
  uint32 feeReciverRole;
}

struct LiquidateParams {
  address asset;
  uint assetAmount;
  AssetConfig assetConfig;
  uint32 protocolFeeRate;
  uint32 feeReciverRole;
}

// ========== Staking ==========

struct PoolInfo {
  address asset;
  uint shortPendingReward;
  uint totalShortAmount;
  decimal rewardUnit;
  decimal premiumRate;
  decimal shortRewardWeight;
  uint premiumUpdatedTime;
}

struct RewardInfo {
  decimal rewardUnit;
  uint bondAmount;
  uint pendingReward;
}

struct RewardInfoResponseItem {
  address asset;
  uint bondAmount;
  uint pendingReward;
}

// ========== Factory ==========

struct AssetInfo {
  address asset;
  uint8 weight;
  bool isRevoked;
}

struct DistributionSchedule {
  uint startTime;
  uint endTime;
  uint distributionAmount;
}

struct DistributionInfoResponse {
  AssetInfo[] assetInfos;
  uint lastDistributed;
}

// ========== CollateralOracle ==========

struct CollateralPriceInfo {
  address collateral;
  uint price;
  uint lastUpdate;
  uint32 multiplier;
  bool isRevoked;
  bool isSuspended;
}

struct CollateralConfig {
  address collateral;
  uint32 multiplier;
  uint fixedPrice;
  bool isRevoked;
  bool isSuspended;
}
