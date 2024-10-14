// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "./Struct.sol";

uint constant DECIMALS = 10 ** 18;

/**
 * @title Decimal
 * @author Defiralia
 * @notice Library to handle numbers as 18 degits.
 */
library Decimal {
  function one() public pure returns (decimal memory) {
    return decimal(DECIMALS);
  }

  function zero() public pure returns (decimal memory) {
    return decimal(0);
  }

  function isZero(decimal memory d1) public pure returns (bool) {
    return d1.value == zero().value;
  }

  function add(decimal memory d1, decimal memory d2) public pure returns (decimal memory) {
    return decimal(d1.value + d2.value);
  }

  function addUint(decimal memory d1, uint x) public pure returns (decimal memory) {
    return add(d1, fromUint(x));
  }

  function sub(decimal memory d1, decimal memory d2) public pure returns (decimal memory) {
    return decimal(d1.value - d2.value);
  }

  function subUint(decimal memory d1, uint x) public pure returns (decimal memory) {
    return sub(d1, fromUint(x));
  }

  function mul(decimal memory d1, decimal memory d2) public pure returns (decimal memory) {
    return decimal((d1.value * d2.value) / DECIMALS);
  }

  function mulUint(decimal memory d1, uint x) public pure returns (decimal memory) {
    return mul(d1, fromUint(x));
  }

  function div(decimal memory d1, decimal memory d2) public pure returns (decimal memory) {
    return decimal((d1.value * DECIMALS) / d2.value);
  }

  function divUint(decimal memory d1, uint x) internal pure returns (decimal memory) {
    require(x > 0, "Can not allow to be devide by 0");
    return div(d1, fromUint(x));
  }

  function mulDivUint(decimal memory d1, uint x, uint y) public pure returns (decimal memory) {
    return divUint(mulUint(d1, x), y);
  }

  function permilleToDecimal(uint x) public pure returns (decimal memory) {
    return divUint(fromUint(x), 1_000);
  }

  function gt(decimal memory d1, decimal memory d2) public pure returns (bool) {
    return d1.value > d2.value;
  }

  function min(decimal memory d1, decimal memory d2) public pure returns (decimal memory) {
    return gt(d1, d2) ? d2 : d1;
  }

  function pow(decimal memory d1, uint n) public pure returns (decimal memory) {
    decimal memory result = one();
    for (uint i = 0; i < n; i++) {
      result = mul(result, d1);
    }
    return result;
  }

  function reverseDecimal(decimal memory d1) public pure returns (decimal memory) {
    return div(one(), d1);
  }

  function toUint(decimal memory d) public pure returns (uint) {
    return d.value / DECIMALS;
  }

  function fromUint(uint x) public pure returns (decimal memory) {
    return decimal(x * DECIMALS);
  }

  function fromRatio(uint numerator, uint denominator) public pure returns (decimal memory) {
    return divUint(fromUint(numerator), denominator);
  }

  function erfPlusOne(bool isPlus, decimal memory x) public pure returns (decimal memory) {
    uint e6 = 1_000_000;
    uint e10 = 10_000_000_000;

    decimal memory decimalOne = one();
    decimal memory two = mulUint(decimalOne, 2);

    // ((((((a6 * x) + a5) * x + a4 ) * x + a3) * x + a2) * x + a1) * x + 1
    bool _isPlus = isPlus;
    decimal memory num;
    {
      num = mul(fromRatio(430_638, e10), x);
      (_isPlus, num) = sumAndMultiplyX(_isPlus, true, isPlus, num, fromRatio(2_765_672, e10), x);
      (_isPlus, num) = sumAndMultiplyX(_isPlus, true, isPlus, num, fromRatio(1_520_143, e10), x);
      (_isPlus, num) = sumAndMultiplyX(_isPlus, true, isPlus, num, fromRatio(92_705_272, e10), x);
      (_isPlus, num) = sumAndMultiplyX(_isPlus, true, isPlus, num, fromRatio(422_820_123, e10), x);
      (_isPlus, num) = sumAndMultiplyX(_isPlus, true, isPlus, num, fromRatio(705_230_784, e10), x);
    }

    {
      if (_isPlus) {
        num = add(num, decimalOne);
      } else if (gt(num, decimalOne)) {
        num = sub(num, decimalOne);
      } else {
        num = sub(decimalOne, num);
      }
    }

    // ignore sign
    decimal memory reverseNum = reverseDecimal(pow(num, 16));
    if (reverseNum.value > two.value) {
      return decimal(0);
    }

    // maximum error: 3 * 10^-7
    // so only use 6 decimal digits
    return mulUint(divUint(sub(two, reverseNum), e6), e6);
  }

  function sumAndMultiplyX(
    bool isPlus1,
    bool isPlus2,
    bool isPlusX,
    decimal memory num1,
    decimal memory num2,
    decimal memory x
  ) public pure returns (bool, decimal memory) {
    if (isPlus1 == isPlus2) {
      decimal memory val = mul(add(num1, num2), x);
      if (isPlus1 == isPlusX) {
        return (true, val);
      } else {
        return (false, val);
      }
    } else if (num1.value > num2.value) {
      decimal memory val = mul(sub(num1, num2), x);
      if (isPlus1 == isPlusX) {
        return (true, val);
      } else {
        return (false, val);
      }
    } else {
      decimal memory val = mul(sub(num2, num1), x);
      if (isPlus2 == isPlusX) {
        return (true, val);
      } else {
        return (false, val);
      }
    }
  }
}
