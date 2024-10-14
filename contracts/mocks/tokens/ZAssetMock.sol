// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../../interfaces/IZAsset.sol";

contract ZAssetMock is ERC20, IZAsset, Ownable {
  using SafeERC20 for IERC20;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  function selfMint(uint amount) public returns (bool) {
    _mint(_msgSender(), amount);
    return true;
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
