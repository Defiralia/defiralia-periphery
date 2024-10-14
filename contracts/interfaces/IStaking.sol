// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Struct.sol";

interface IStaking {
  function updateInterval(uint premiumMinUpdateInterval) external;

  function registerPoolInfo(address asset) external;

  function increaseShortToken(address staker, address asset, uint amount) external;

  function decreaseShortToken(address staker, address asset, uint amount) external;

  function depositReward(Reward[] memory rewards) external;

  function withdrawReward(address asset) external;

  function adjustPremium(address[] memory assetList) external;

  function queryPoolInfo(address asset) external view returns (PoolInfo memory);

  event UpdateInterval(uint premiumMinUpdateInterval);
  event RegisterPoolInfo(address asset);
  event IncreaseShortToken(address staker, address asset, uint amount);
  event DecreaseShortToken(address staker, address asset, uint amount);
  event DepositReward(uint amount);
  event WithdrawReward(address asset, address staker, uint amount);
  event AdjustPremium(address asset, uint timestamp);
}
