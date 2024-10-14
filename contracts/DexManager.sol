// SPDX-License-Identifier: MIT
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/IDexManager.sol";
import "./interfaces/ISwapRouter.sol";
import "./interfaces/IDefiraliaFactory.sol";
import "./interfaces/IDefiraliaPool.sol";
import "./interfaces/INonfungiblePositionManager.sol";
import "./libraries/OracleLibrary.sol";
import "./libraries/Decimal.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title DexManager
 * @author Defiralia
 * @notice Contract to mediate to dex
 */
contract DexManager is IDexManager, AddressHandler {
  using SafeERC20 for IERC20;

  ISwapRouter public swapRouter;
  INonfungiblePositionManager public nonfungiblePositionManager;

  /// @dev _pools[asset] => pool
  /// @dev one of the pairs is omitted as DAI
  mapping(address => address) internal _pools;

  function initialize(
    IAddressMap addressMap,
    INonfungiblePositionManager _nonfungiblePositionManager,
    ISwapRouter _swapRouter
  ) public initializer {
    nonfungiblePositionManager = _nonfungiblePositionManager;
    swapRouter = _swapRouter;
    __AddressHandler_init(addressMap);
  }

  /**
   * @notice set allowance for swapRouter
   * @dev short positions cannot be created unless this function is executed once
   * @param asset asset address
   */
  function setAllowanceForSwapRouter(IERC20 asset) external onlyRole(DEFAULT_ADMIN_ROLE) {
    asset.safeApprove(address(swapRouter), type(uint256).max);

    emit SetAllowanceForSwapRouter(address(asset));
  }

  /**
   * @notice set pool for asset
   * @param asset asset address
   * @param pool pool address
   */
  function setPool(address asset, address pool) external onlyRole(DEFAULT_ADMIN_ROLE) {
    address poolFactory = nonfungiblePositionManager.factory();
    (address token0, address token1) = _sortPair(asset, lookup(TOKEN_BASE));
    uint24 fee = IDefiraliaPool(pool).fee();
    require(pool == IDefiraliaFactory(poolFactory).getPool(token0, token1, fee), "Invalid address");
    _pools[asset] = pool;

    emit SetPool(asset, pool);
  }

  /**
   * @notice execute swap for short position
   * @param tokenIn token address to be swapped from
   * @param recipient recipient address of swap
   * @param amountIn token amount to be swapped from
   * @param shortParams params for short swap
   * @return amountOut token amount to be swapped to
   */
  function shortSwap(
    address tokenIn,
    address recipient,
    uint amountIn,
    ShortParams memory shortParams
  ) external onlyContract(CONTRACT_LENDING) returns (uint amountOut) {
    if (amountIn > 0) {
      address dai = lookup(TOKEN_BASE);
      uint24 fee = IDefiraliaPool(_pools[tokenIn]).fee();

      uint beforeBalanceIn = IERC20(tokenIn).balanceOf(address(this));

      amountOut = _callSingleHop(
        tokenIn,
        dai,
        fee,
        recipient,
        amountIn,
        shortParams.amountOutMinimum,
        shortParams.sqrtPriceLimitX96
      );

      uint afterBalanceIn = IERC20(tokenIn).balanceOf(address(this));

      if (afterBalanceIn != beforeBalanceIn - amountIn) revert InvalidSwapAmount();
      emit ShortSwap(recipient, tokenIn, amountIn, amountOut);
    }
  }

  /**
   * @dev execute single hop swap using default params
   */
  function _callSingleHop(
    address tokenIn,
    address tokenOut,
    uint24 fee,
    address recipient,
    uint amountIn,
    uint amountOutMinimum,
    uint160 sqrtPriceLimitX96
  ) internal returns (uint amount) {
    ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      fee: fee,
      recipient: recipient,
      amountIn: amountIn,
      deadline: block.timestamp + DEFAULT_DEADLINE,
      amountOutMinimum: amountOutMinimum,
      sqrtPriceLimitX96: sqrtPriceLimitX96
    });
    amount = swapRouter.exactInputSingle(params);
  }

  /**
   * @dev execute multi hop swap using default params
   */
  function _callMultiHop(
    address tokenIn,
    uint24 feeIn,
    address tokenVia,
    uint24 feeOut,
    address tokenOut,
    address recipient,
    uint amountIn,
    uint amountOutMinimum
  ) internal returns (uint amount) {
    ISwapRouter.ExactInputParams memory params = ISwapRouter.ExactInputParams({
      path: abi.encodePacked(tokenIn, feeIn, tokenVia, feeOut, tokenOut),
      recipient: recipient,
      deadline: block.timestamp + DEFAULT_DEADLINE,
      amountIn: amountIn,
      amountOutMinimum: amountOutMinimum
    });
    amount = swapRouter.exactInput(params);
  }

  function queryPool(address asset) public view returns (address) {
    return _pools[asset];
  }

  /**
   * @notice return pool price of asset
   * @dev price is calculated by twap
   * @param asset asset address
   * @return price asset amount per unit of base token
   */
  function queryPoolPrice(address asset) public view returns (decimal memory price) {
    address pool = _pools[asset];
    address token0 = IDefiraliaPool(pool).token0();
    address token1 = IDefiraliaPool(pool).token1();

    uint8 decimalToken0 = IERC20Metadata(token0).decimals();
    uint8 decimalToken1 = IERC20Metadata(token1).decimals();

    int24 twaTick = OracleLibrary.consult(pool, DEFAULT_TIME_WEIGHT);
    uint128 token0UnitAmount = uint128(10 ** decimalToken0);
    uint quoteAmount = OracleLibrary.getQuoteAtTick(twaTick, token0UnitAmount, token0, token1);

    price = Decimal.fromRatio(quoteAmount, 10 ** decimalToken1);
  }
}
