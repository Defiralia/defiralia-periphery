// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../interfaces/IPriceAggregator.sol";

interface IPriceOracle {
  function setPriceAggregator(address token, IPriceAggregator aggregator) external;

  function queryAssetPrice(address asset) external view returns (uint, uint);

  function queryPriceAggregator(address asset) external view returns (address);
}
