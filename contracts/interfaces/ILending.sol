// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Struct.sol";

interface ILending {
  function updateProtocolFee(uint32 protocolFee) external;

  function registerAsset(
    address asset,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) external;

  function updateAsset(
    address asset,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) external;

  function registerRevoke(address asset, uint endPrice) external;

  function openPosition(
    address asset,
    address collateral,
    uint collateralAmount,
    uint32 collateralRatio,
    ShortParams memory shortParams
  ) external;

  function deposit(uint index, address collateral, uint collateralAmount) external;

  function withdraw(uint index, address collateral, uint collateralAmount) external;

  function mint(
    uint index,
    address asset,
    uint assetAmount,
    ShortParams memory shortParams
  ) external;

  function burn(uint index, address asset, uint assetAmount) external;

  function liquidation(uint index, address asset, uint assetAmount) external;

  event UpdateProtocolFee(uint32 protocolFee);
  event SetFeeReciverRole(uint32 id);
  event UpdateAsset(address asset, uint liquidationDiscount, uint minCollateralRatio);
  event SuspendAsset(address asset);
  event UnsuspendAsset(address asset);
  event OpenPosition(
    uint indexed index,
    address owner,
    address asset,
    uint assetAmount,
    address collateral,
    uint collateralAmount,
    uint collateralRatio,
    bool isShort
  );
  event Deposit(uint indexed index, address collateral, uint amount);
  event Withdraw(uint indexed index, address collateral, uint amount);
  event Mint(uint indexed index, address asset, uint amount);
  event Burn(uint indexed index, address asset, uint amount);
  event Liquidation(uint indexed index, uint liquidatedAmount, uint withdrawAmount);
}
