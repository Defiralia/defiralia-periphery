// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "../DexManager.sol";

contract DexManagerTest is DexManager {
  function initializeTest(
    IAddressMap addressMap,
    INonfungiblePositionManager _nonfungiblePositionManager,
    ISwapRouter _swapRouter
  ) public initializer {
    nonfungiblePositionManager = _nonfungiblePositionManager;
    swapRouter = _swapRouter;
    __AddressHandler_init(addressMap);
  }

  function shortSwapTest(
    address tokenIn,
    address recipient,
    uint amountIn,
    ShortParams memory shortParams
  ) external {
    if (amountIn > 0) {
      uint24 fee = IDefiraliaPool(_pools[tokenIn]).fee();

      _callSingleHop(
        tokenIn,
        lookup(TOKEN_BASE),
        fee,
        recipient,
        amountIn,
        shortParams.amountOutMinimum,
        shortParams.sqrtPriceLimitX96
      );
    }
  }
}
