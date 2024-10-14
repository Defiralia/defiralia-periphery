// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract TokenMock is ERC20 {
  using SafeERC20 for IERC20;

  uint8 private decimal;

  constructor(string memory _name, string memory _symbol, uint8 _decimal) ERC20(_name, _symbol) {
    decimal = _decimal;
  }

  function decimals() public view virtual override returns (uint8) {
    return decimal;
  }

  function mint(address to, uint amount) external returns (bool) {
    _mint(to, amount);
    return true;
  }

  function burn(address from, uint amount) external returns (bool) {
    _burn(from, amount);
    return true;
  }
}
