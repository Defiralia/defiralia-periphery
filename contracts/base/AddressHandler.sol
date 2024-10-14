// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../interfaces/IAddressHandler.sol";
import "../interfaces/IAddressMap.sol";
import "../libraries/Constant.sol";
import "../libraries/Error.sol";

/**
 * @title AddressHandler
 * @author Defiralia
 * @notice Base Contract to serve contract addresses from AddressMap.
 * @dev This contract has the role of making the inherited contract upgradeable and implements access control.
 */
contract AddressHandler is IAddressHandler, AccessControlUpgradeable, UUPSUpgradeable {
  /// @dev AddressMap address
  IAddressMap private _addressMap;

  function __AddressHandler_init(IAddressMap addressMap) public onlyInitializing {
    _addressMap = addressMap;

    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _grantRole(ROLE_UPGRADER, msg.sender);
  }

  function _authorizeUpgrade(address newImplementation) internal override onlyRole(ROLE_UPGRADER) {}

  /**
   * @dev Modifier to check for specific contract
   */
  modifier onlyContract(uint32 id) {
    if (msg.sender != lookup(id)) revert OnlyRole();
    _;
  }

  function setAddressMap(IAddressMap newAddressMap) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (address(newAddressMap) == address(0)) revert NotFound();
    _addressMap = newAddressMap;
  }

  /**
   * @notice look up contract address by id
   * @param id contract id registered in AddressMap
   * @return contractAddress contract address
   */
  function lookup(uint32 id) public view returns (address contractAddress) {
    contractAddress = _addressMap.readAddressList(id);
    if (contractAddress == address(0)) revert NotFound();
  }

  /**
   * @dev sort token pair addresses by asc
   */
  function _sortPair(address token0, address token1) internal pure returns (address, address) {
    if (token1 < token0) (token0, token1) = (token1, token0);
    return (token0, token1);
  }
}
