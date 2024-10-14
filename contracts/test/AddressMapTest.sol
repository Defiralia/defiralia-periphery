// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../base/AddressMap.sol";

contract AddressMapTest is AddressMap {
  mapping(uint32 => address) private _addressList;

  function initializeTest(address defiraliat, address base) public initializer {
    _addressList[TOKEN_DefiraliaT] = defiraliat;
    _addressList[TOKEN_BASE] = base;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ROLE_UPGRADER, msg.sender);
  }
}
