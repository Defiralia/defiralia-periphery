// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "../interfaces/IPriceOracle.sol";
import "../libraries/MathUtils.sol";
import "../libraries/Decimal.sol";
import "../mocks/TokenMock.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

contract DexManagerMock {
  using MathUtils for uint;

  mapping(address => uint) _mockPrices;
  address _defiraliat;
  address _base;

  mapping(address => address) _pools;

  constructor() {}

  function setMockPrice(address token, uint price) external {
    _mockPrices[token] = price;
  }

  function setMockAddresses(address defiraliat, address base) public {
    _defiraliat = defiraliat;
    _base = base;
  }

  function queryPoolPrice(address asset) public view returns (decimal memory) {
    (address token0, address token1) = _base < asset ? (_base, asset) : (asset, _base);
    return Decimal.fromRatio(_mockPrices[token0], _mockPrices[token1]);
  }

  function shortSwap(
    address tokenIn,
    address recipient,
    uint amountIn,
    ShortParams memory shortParams
  ) external returns (uint256 amountOut) {
    // tokenIn: asset
    // tokenOut: base

    // DexManager -> Pool (burn insted)
    TokenMock(tokenIn).burn(address(this), amountIn);
    // calc swap mock amount
    amountOut = (amountIn * _mockPrices[tokenIn]) / _mockPrices[_base];
    // Pool -> sender (mint insted)
    TokenMock(_base).mint(recipient, amountOut);
  }

  function setPool(address asset, address pool) external {
    _pools[asset] = pool;
  }

  function queryPool(address asset) public view returns (address pool) {
    pool = _pools[asset];
  }
}
