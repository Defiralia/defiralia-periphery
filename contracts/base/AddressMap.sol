// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../interfaces/IAddressMap.sol";
import "../libraries/Constant.sol";

/**
 * @title AddressMap
 * @author Defiralia
 * @notice Core Contract to store contract addresses.
 */
contract AddressMap is IAddressMap, AccessControlUpgradeable, UUPSUpgradeable {
  /// @dev _addressList[id] => contract address
  mapping(uint32 => address) private _addressList;

  function initialize(address defiraliat, address base) public initializer {
    _addressList[TOKEN_DefiraliaT] = defiraliat;
    _addressList[TOKEN_BASE] = base;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ROLE_UPGRADER, msg.sender);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyRole(ROLE_UPGRADER) {}

  /**
   * @notice set id to contract address
   */
  function setAddressToList(uint32 id, address newAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _addressList[id] = newAddress;
  }

  function readAddressList(uint32 id) external view returns (address) {
    return _addressList[id];
  }
}
