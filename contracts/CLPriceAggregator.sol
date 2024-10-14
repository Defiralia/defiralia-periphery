// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./interfaces/IPriceAggregator.sol";

/**
 * @title CLPriceAggregator
 * @author Defiralia
 * @notice Contract to wrap Chainlink price aggregator
 */
contract CLPriceAggregator is IPriceAggregator {
  AggregatorV3Interface private _aggregator;

  constructor(AggregatorV3Interface aggregator) {
    _aggregator = aggregator;
  }

  /**
   * @dev this function is to get the price as a common interface from any oracle provider
   */
  function currentPrice() external view virtual returns (uint, uint) {
    (, int256 answer, , uint updatedAt, ) = _aggregator.latestRoundData();
    return (uint(answer), updatedAt);
  }
}
