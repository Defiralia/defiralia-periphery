// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IPriceAggregator {
  function currentPrice() external view returns (uint, uint);
}
