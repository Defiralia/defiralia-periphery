// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/ICollateralManager.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title CollateralManager
 * @author Defiralia
 * @notice Contract to store and deposit/withdraw collaterals
 */
contract CollateralManager is ICollateralManager, AddressHandler {
  using SafeERC20 for IERC20;

  /// @dev totalUserCollaterals[user][collateral] => user collateral amount by token
  mapping(address => mapping(address => uint)) public totalUserCollaterals;
  /// @dev totalCollaterals[collateral] => total collateral amount by token
  mapping(address => uint) public totalCollaterals; // asset => amount

  function initialize(IAddressMap addressMap) public initializer {
    __AddressHandler_init(addressMap);
  }

  /**
   * @notice increase collateral amount by deposit
   * @param collateral collateral address
   * @param amountIn increase collateral amount
   * @param user user address
   */
  function increaseCollateral(
    address collateral,
    uint amountIn,
    address user
  ) external onlyContract(CONTRACT_LENDING) {
    unchecked {
      totalUserCollaterals[user][collateral] += amountIn;
      totalCollaterals[collateral] += amountIn;
    }

    IERC20(collateral).safeTransferFrom(user, address(this), amountIn);
  }

  /**
   * @notice decrease collateral amount by withdraw
   * @param collateral collateral address
   * @param amountOut decrease collateral amount
   * @param user user address
   * @param to receipient address
   */
  function decreaseCollateral(
    address collateral,
    uint amountOut,
    address user,
    address to
  ) external onlyContract(CONTRACT_LENDING) {
    if (
      totalUserCollaterals[user][collateral] < amountOut || totalCollaterals[collateral] < amountOut
    ) revert ExceedCollateralAmount();

    unchecked {
      totalUserCollaterals[user][collateral] -= amountOut;
      totalCollaterals[collateral] -= amountOut;
    }
    IERC20(collateral).safeTransfer(to, amountOut);
  }
}
