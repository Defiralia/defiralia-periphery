// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../RewardDistributor.sol";

contract RewardDistributorTest is RewardDistributor {
  using SafeERC20 for IERC20;

  function initializeTest(IAddressMap addressMap) public initializer {
    __Pausable_init();
    __AddressHandler_init(addressMap);

    _grantRole(ROLE_PAUSER, msg.sender);

    IERC20(lookup(TOKEN_DefiraliaT)).safeApprove(lookup(CONTRACT_FACTORY), type(uint256).max);
  }
}
