// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IZAsset is IERC20 {
  function mint(address to, uint amount) external returns (bool);

  function burn(address from, uint amount) external returns (bool);
}
