// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../Staking.sol";

contract StakingTest is Staking {
  function initializeTest(IAddressMap addressMap) public initializer {
    _premiumMinUpdateInterval = 60;
    __AddressHandler_init(addressMap);
  }

  function testGetInterval() external view returns (uint) {
    return _premiumMinUpdateInterval;
  }

  function testGetReward(address owner, address asset) external view returns (RewardInfo memory) {
    return _shortRewardInfos[owner][asset];
  }

  function testGetUserStaking(address user, address asset) external view returns (uint) {
    return _shortRewardInfos[user][asset].bondAmount;
  }

  function testSetShortRewardWeight(address asset, decimal memory shortRewardWeight) external {
    PoolInfo memory poolInfo = _poolInfos[asset];
    poolInfo.shortRewardWeight = shortRewardWeight;
    _poolInfos[asset] = poolInfo;
  }

  function testSetPoolInfo(PoolInfo memory poolInfo) external {
    _poolInfos[poolInfo.asset] = poolInfo;
  }

  function testGetComputeShortRewardWeight(
    decimal memory premiumRate
  ) external pure returns (decimal memory) {
    return _computeShortRewardWeight(premiumRate);
  }
}
