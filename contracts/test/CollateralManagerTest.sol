// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../CollateralManager.sol";
import "../mocks/TokenMock.sol";

contract CollateralManagerTest is CollateralManager {
  function initializeTest(IAddressMap addressMap) public initializer {
    __AddressHandler_init(addressMap);
  }
}
