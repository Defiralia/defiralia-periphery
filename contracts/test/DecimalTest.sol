// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Decimal.sol";

contract DecimalTest {
  function one() public pure returns (uint) {
    return Decimal.one().value;
  }

  function zero() public pure returns (uint) {
    return Decimal.zero().value;
  }

  function isZero(uint x) public pure returns (bool) {
    return Decimal.isZero(decimal(x));
  }

  function permilleToDecimal(uint num) public pure returns (uint) {
    return Decimal.permilleToDecimal(num).value;
  }

  function add(uint x1, uint x2) public pure returns (uint) {
    return Decimal.add(Decimal.fromUint(x1), Decimal.fromUint(x2)).value;
  }

  function addUint(uint x1, uint x2) public pure returns (uint) {
    return Decimal.addUint(Decimal.fromUint(x1), x2).value;
  }

  function sub(uint x1, uint x2) public pure returns (uint) {
    return Decimal.sub(Decimal.fromUint(x1), Decimal.fromUint(x2)).value;
  }

  function subUint(uint x1, uint x2) public pure returns (uint) {
    return Decimal.subUint(Decimal.fromUint(x1), x2).value;
  }

  function mul(uint x1, uint x2) public pure returns (uint) {
    return Decimal.mul(Decimal.fromUint(x1), Decimal.fromUint(x2)).value;
  }

  function mulUint(uint x1, uint x2) public pure returns (uint) {
    return Decimal.mulUint(Decimal.fromUint(x1), x2).value;
  }

  function div(uint x1, uint x2) public pure returns (uint) {
    return Decimal.div(Decimal.fromUint(x1), Decimal.fromUint(x2)).value;
  }

  function divUint(uint x1, uint x2) public pure returns (uint) {
    return Decimal.divUint(Decimal.fromUint(x1), x2).value;
  }

  function gt(uint x1, uint x2) public pure returns (bool) {
    return Decimal.gt(Decimal.fromUint(x1), Decimal.fromUint(x2));
  }

  function min(uint x1, uint x2) public pure returns (uint) {
    return Decimal.min(Decimal.fromUint(x1), Decimal.fromUint(x2)).value;
  }

  function pow(uint x, uint n) public pure returns (uint) {
    return Decimal.pow(Decimal.fromUint(x), n).value;
  }

  function reverseDecimal(uint x) public pure returns (uint) {
    return Decimal.reverseDecimal(Decimal.fromUint(x)).value;
  }

  function fromRatio(uint x, uint y) public pure returns (uint) {
    return Decimal.fromRatio(x, y).value;
  }

  function toUint(uint x) public pure returns (uint) {
    return Decimal.toUint(Decimal.fromUint(x));
  }

  function fromUint(uint x) public pure returns (uint) {
    return Decimal.fromUint(x).value;
  }

  function erfPlusOne(bool isPlus, uint numerator, uint denominator) public pure returns (uint) {
    decimal memory x = Decimal.fromRatio(numerator, denominator);
    return Decimal.erfPlusOne(isPlus, x).value;
  }

  function sumAndMultiplyX(
    bool isPlus1,
    bool isPlus2,
    bool isPlusX,
    uint x1,
    uint x2,
    uint x3
  ) public pure returns (bool, uint) {
    (bool isPlus, decimal memory x) = Decimal.sumAndMultiplyX(
      isPlus1,
      isPlus2,
      isPlusX,
      Decimal.fromUint(x1),
      Decimal.fromUint(x2),
      Decimal.fromUint(x3)
    );
    return (isPlus, x.value);
  }
}
