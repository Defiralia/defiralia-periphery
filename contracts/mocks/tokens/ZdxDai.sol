// SPDX-License-Identifier: agpl-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DefiraliaDai
 * @dev this is for a Campaign
 */
contract DefiraliaDai is ERC20, Ownable {
  mapping(address => bool) public minted;

  event OwnerMint(uint amount);

  constructor() ERC20("Defiralia DAI", "DAI") {}

  function ownerMint(uint256 _amount) external onlyOwner returns (bool) {
    _mint(_msgSender(), _amount);
    emit OwnerMint(_amount);
    return true;
  }

  function mint() external returns (bool) {
    require(!minted[_msgSender()], "DefiraliaDai: already minted");
    minted[_msgSender()] = true;
    _mint(_msgSender(), 10 ** 18 * 10000); // 10000 DAI
    return true;
  }
}
