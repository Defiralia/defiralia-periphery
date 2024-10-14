// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/**
 * @title DefiraliaToken
 * @author Defiralia
 * @notice Contract of Defiralia Governance Token
 */
contract DefiraliaToken is ERC20Burnable, ERC20Permit {
  constructor() ERC20("Defiralia Token", "DefiraliaT") ERC20Permit("Defiralia Token") {
    _mint(msg.sender, 1000000 * 10 ** decimals());
  }
}
