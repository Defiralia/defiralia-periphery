// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "../PriceOracle.sol";

contract PriceOracleTest is PriceOracle {
  function initializeTest(IAddressMap addressMap) public initializer {
    __AddressHandler_init(addressMap);
  }
}
