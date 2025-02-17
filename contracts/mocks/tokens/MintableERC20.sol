// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.17;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title ERC20Mintable
 * @dev ERC20 minting logic
 */
contract MintableERC20 is ERC20 {
  uint8 private _decimals;

  constructor(string memory name, string memory symbol, uint8 decimal) ERC20(name, symbol) {
    _decimals = decimal;
  }

  /**
   * @dev Function to mint tokens
   * @param value The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(uint value) public returns (bool) {
    _mint(_msgSender(), value);
    return true;
  }

  function decimals() public view override returns (uint8) {
    return _decimals;
  }
}
