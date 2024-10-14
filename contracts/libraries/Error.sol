// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

error OnlyRole();
error NotFound();

error AmountNotAllowZero();
error NotExistPriceAggregator();

error ExceedCollateralAmount();
error ExistCollateral();
error NotExistCollateral();
error InvalidMultiplier();

error InvalidSwapAmount();

error FailAssetDeploy();
error AssetNotDeployedByFactory();
error ExistAsset();
error NotExistAsset();
error InvalidEnableAssetParameters();
error NotExistPool();
error AssetNotAvaliable();
error NotAllowZero();
error InvalidSchedule();

error OnlyPositionOwner();
error ExceedMaxProtocolFee();
error ExceedLimitLiquidationDiscount();
error InvalidMinCollateralRatio();
error ExistAssetConfig();
error NoAssetRegistered();
error ExistSameAssetPosition();
error CollateralNotAvailable();
error InvalidCollateralRatio();
error AssetNotAvailable();
error ExistPosition();
error PositionClosed();
error WrongCollateral();
error WrongAsset();
error InvalidShortParams();
error LiquidateSafePosition();

error PriceNotAllowZero();
error NotUpdatedPriceFeed();

error InvalidPremiumMinUpdateInterval();
error ExistPoolInfo();
