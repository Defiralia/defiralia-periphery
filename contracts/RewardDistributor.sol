// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/IFactory.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title RewardDistributor
 * @author Defiralia
 * @notice Contract to distribute sLP rewards
 */
contract RewardDistributor is AddressHandler, PausableUpgradeable {
  using SafeERC20 for IERC20;

  event Distribute(address operator);
  event Withdraw(address indexed token, address indexed to, uint256 amount);

  error NoBalance();

  function initialize(IAddressMap addressMap) public initializer {
    __Pausable_init();
    __AddressHandler_init(addressMap);

    _grantRole(ROLE_PAUSER, msg.sender);

    // NOTE: Must set addressMap before calling this function
    IERC20(lookup(TOKEN_DefiraliaT)).safeApprove(lookup(CONTRACT_FACTORY), type(uint256).max);
  }

  function pause() public onlyRole(ROLE_PAUSER) {
    _pause();
  }

  function unpause() public onlyRole(ROLE_PAUSER) {
    _unpause();
  }

  /// @notice Withdraw unexpected tokens sent to the receiver, can also withdraw defiraliat.
  /// @dev Callable by owner.
  /// @param _token Token address.
  function withdraw(IERC20 _token) external onlyRole(DEFAULT_ADMIN_ROLE) {
    uint256 amount = _token.balanceOf(address(this));
    _token.safeTransfer(msg.sender, amount);
    emit Withdraw(address(_token), msg.sender, amount);
  }

  /// @notice anyone can call this function to distribute sLP rewards
  function distribute() external whenNotPaused {
    uint balance = IERC20(lookup(TOKEN_DefiraliaT)).balanceOf(address(this));
    if (balance == 0) revert NoBalance();
    IFactory(lookup(CONTRACT_FACTORY)).distribute();
    emit Distribute(msg.sender);
  }
}
