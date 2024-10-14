// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

interface INonfungiblePositionManager {
  /// @notice Creates a new pool if it does not exist, then initializes if not initialized
  /// @dev This method can be bundled with others via IMulticall for the first action (e.g. mint) performed against a pool
  /// @param token0 The contract address of token0 of the pool
  /// @param token1 The contract address of token1 of the pool
  /// @param fee The fee amount of the v3 pool for the specified token pair
  /// @param sqrtPriceX96 The initial square root price of the pool as a Q64.96 value
  /// @return pool Returns the pool address based on the pair of tokens and fee, will return the newly created pool address if necessary
  function createAndInitializePoolIfNecessary(
    address token0,
    address token1,
    uint24 fee,
    uint160 sqrtPriceX96
  ) external payable returns (address pool);

  /// @return Returns the address of the deployer
  function deployer() external view returns (address);

  /// @return Returns the address of the factory
  function factory() external view returns (address);

  /// @return Returns the address of WETH9
  function WETH9() external view returns (address);
}
