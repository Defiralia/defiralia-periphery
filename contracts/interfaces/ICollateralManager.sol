// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Struct.sol";

interface ICollateralManager {
  function increaseCollateral(address collateral, uint amountIn, address owner) external;

  function decreaseCollateral(
    address collateral,
    uint amountOut,
    address owner,
    address to
  ) external;
}
