// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

contract PriceAggregatorMock {
  uint _price;

  constructor(uint price) {
    _price = price;
  }

  function currentPrice() public view returns (uint price, uint lastUpdate) {
    return (_price, block.timestamp - 60);
  }

  function changePrice(uint price) public {
    _price = price;
  }
}
