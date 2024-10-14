// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "./interfaces/IZAsset.sol";

/**
 * @title ZAsset
 * @author Defiralia
 * @notice Contract of debt token for lending
 * @dev This is deployed by Factory
 */
contract ZAsset is IZAsset, ERC20, Ownable {
  using SafeERC20 for IERC20;

  constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

  function mint(address to, uint amount) external onlyOwner returns (bool) {
    _mint(to, amount);
    return true;
  }

  function burn(address from, uint amount) external onlyOwner returns (bool) {
    _burn(from, amount);
    return true;
  }
}
