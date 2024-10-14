// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../libraries/Struct.sol";

interface ICollateralOracle {
  function registerCollateral(address collateral, uint32 multiplier) external;

  function revokeCollateralAsset(address collateral) external;

  function updateCollateralEndPrice(address collateral, uint fixedPrice) external;

  function updateCollateralMultiplier(address collateral, uint32 multiplier) external;

  function queryCollateralPrice(
    address collateral
  ) external view returns (CollateralPriceInfo memory);

  function queryCollateralInfo(address collateral) external view returns (CollateralConfig memory);

  function queryCollateralInfos() external view returns (CollateralConfig[] memory);

  event RegisterCollateral(address collateral, uint32 multiplier, uint collateralIndex);
  event RevokeCollateralAsset(address collateral);
  event SuspendCollateralAsset(address collateral);
  event UnsuspendCollateralAsset(address collateral);
  event UpdateCollateralEndPrice(address collateral, uint fixedPrice);
  event UpdateCollateralMultiplier(address collateral, uint32 multiplier);
}
