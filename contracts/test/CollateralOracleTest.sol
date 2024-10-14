// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../CollateralOracle.sol";

contract CollateralOracleTest is CollateralOracle {
  function initializeTest(IAddressMap addressMap) public initializer {
    __AddressHandler_init(addressMap);
  }
}
