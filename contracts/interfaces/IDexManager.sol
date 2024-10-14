// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Decimal.sol";

interface IDexManager {
  function shortSwap(
    address tokenIn,
    address recipient,
    uint amountIn,
    ShortParams memory shortParams
  ) external returns (uint amount);

  function queryPool(address asset) external view returns (address pool);

  function queryPoolPrice(address asset) external view returns (decimal memory);

  event SetAllowanceForSwapRouter(address asset);
  event SetPool(address asset, address pool);
  event ShortSwap(address recipient, address tokenIn, uint amountIn, uint amountOut);
}
