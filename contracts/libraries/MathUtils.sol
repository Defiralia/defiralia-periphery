// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "./Constant.sol";

/**
 * @title MathUtils
 * @author Defiralia
 * @notice Library for calculations
 */
library MathUtils {
  function mulPermille(uint numerator, uint32 permille) public pure returns (uint) {
    if (numerator == 0 || permille == 0) return 0;
    require(numerator <= (type(uint).max) / permille, "Math multiplication is overflow");
    return (numerator * permille) / PERMILLE;
  }

  function divPermille(uint numerator, uint32 permille) public pure returns (uint) {
    if (numerator == 0) return 0;
    require(permille > 0, "Can not devide by 0");
    require(numerator <= (type(uint).max) / PERMILLE, "Math multiplication is overflow");
    return (numerator * PERMILLE) / permille;
  }

  function mulPerMillion(
    uint numerator,
    uint32 permille1,
    uint32 permille2
  ) public pure returns (uint) {
    if (numerator == 0 || permille1 == 0 || permille2 == 0) return 0;
    require(
      numerator <= (type(uint).max) / (permille1 * permille2),
      "Math multiplication is overflow"
    );
    return (numerator * permille1 * permille2) / PER_MILLION;
  }

  function divPerMillion(
    uint numerator,
    uint32 permille1,
    uint32 permille2
  ) public pure returns (uint) {
    if (numerator == 0) return 0;
    require(permille1 > 0 && permille2 > 0, "Can not devide by 0");
    require(numerator <= (type(uint).max) / PER_MILLION, "Math multiplication is overflow");
    return (numerator * PER_MILLION) / (permille1 * permille2);
  }

  function calcAmount(
    uint token1Amount,
    uint token1Price,
    uint8 token2Decimals,
    uint token2Price,
    uint8 token1Decimals
  ) public pure returns (uint) {
    uint numerator = token1Amount * token1Price * 10 ** token2Decimals;
    uint denominator = token2Price * 10 ** token1Decimals;
    return numerator / denominator;
  }

  function max(uint a, uint b) public pure returns (uint) {
    return a > b ? a : b;
  }

  function min(uint a, uint b) public pure returns (uint) {
    return a < b ? a : b;
  }
}
