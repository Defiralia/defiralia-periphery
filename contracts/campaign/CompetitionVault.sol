// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CompetitionVault
 * @author Defiralia
 * @notice Contract to deposit DAI for competition
 */
contract CompetitionVault is Ownable {
  using SafeERC20 for IERC20;

  bool public canWithdraw;
  uint public endTimestamp;
  uint public totalDeposits;
  IERC20 public immutable dai;

  address[] private _users;
  mapping(address => uint) private _balance;

  event UpdateWithdrawFlag(bool canWithdraw);
  event UpdateEndtimestamp(uint endTimestamp);
  event Deposit(address indexed user, uint amount);
  event Withdraw(address indexed user, uint amount);

  constructor(IERC20 _dai) {
    dai = _dai;
  }

  function updateWithdrawFlag(bool _canWithdraw) external onlyOwner {
    canWithdraw = _canWithdraw;
    emit UpdateWithdrawFlag(_canWithdraw);
  }

  function setEndtimestamp(uint _endTimestamp) external onlyOwner {
    require(_endTimestamp > block.timestamp, "invalid timestamp");
    endTimestamp = _endTimestamp;
    emit UpdateEndtimestamp(_endTimestamp);
  }

  function deposit(uint amount) public {
    require(block.timestamp < endTimestamp, "competition is over");
    _balance[msg.sender] += amount;
    totalDeposits += amount;
    if (_balance[msg.sender] == amount) {
      _users.push(msg.sender);
    }
    dai.safeTransferFrom(msg.sender, address(this), amount);
    emit Deposit(msg.sender, amount);
  }

  function depositAll() external {
    uint amount = dai.balanceOf(msg.sender);
    require(amount > 0, "no balance");
    deposit(amount);
  }

  function withdraw() external {
    require(canWithdraw, "cannot withdraw");
    uint amount = _balance[msg.sender];
    require(amount > 0, "no balance");
    _balance[msg.sender] = 0;
    totalDeposits -= amount;
    dai.safeTransfer(msg.sender, amount);
    emit Withdraw(msg.sender, amount);
  }

  function balanceOf(address user) external view returns (uint) {
    return _balance[user];
  }

  function usersLength() external view returns (uint) {
    return _users.length;
  }

  function usersAt(uint index) external view returns (address) {
    return _users[index];
  }

  function getStats() external view returns (address[] memory, uint[] memory) {
    uint length = _users.length;
    address[] memory users = new address[](length);
    uint[] memory balances = new uint[](length);
    for (uint i = 0; i < length; i++) {
      users[i] = _users[i];
      balances[i] = _balance[_users[i]];
    }
    return (users, balances);
  }
}
