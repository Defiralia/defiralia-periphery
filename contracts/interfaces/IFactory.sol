// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Struct.sol";

interface IFactory {
  function updateDistributionSchedule(DistributionSchedule[] memory distributionSchedule) external;

  function enableAsset(
    address asset,
    uint8 weight,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) external;

  function mintAsset(address asset, address recipient, uint amount) external;

  function burnAsset(address asset, address from, uint amount) external;

  function distribute() external;

  function queryAssetInfos() external view returns (AssetInfo[] memory infos);

  event CreateAsset(address asset, string name, string symbol);
  event EnableAsset(
    address asset,
    uint8 weight,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  );
  event Distribute(uint shortDistributionAmount, uint treasuryAmount);
}
