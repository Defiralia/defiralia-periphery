// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title DefiraliaVestingWallet
 * @author Defiralia
 * @notice Contract for release Defiralia Governance Token as rewards gradually
 */
contract DefiraliaVestingWallet is Context {
  event DefiraliatReleased(uint256 amount);

  /// @dev defiralia governance token address
  address private immutable _defiraliat;
  /// @dev beneficiary address
  address private immutable _beneficiary;
  /// @dev total released amount
  uint256 private _released;
  /// @dev schedule of emission times of governance token
  uint256[] private _emissionTimes;

  constructor(address defiraliat, address beneficiaryAddress, uint256[] memory emissionTimeList) payable {
    require(defiraliat != address(0), "DefiraliaT is zero address");
    require(beneficiaryAddress != address(0), "beneficiary is zero address");
    _defiraliat = defiraliat;
    _beneficiary = beneficiaryAddress;
    for (uint i = 0; i < emissionTimeList.length; i++) {
      require(emissionTimeList[i] > block.timestamp, "Invaild timestamp");
      _emissionTimes.push(emissionTimeList[i]);
    }
  }

  /**
   * @dev Getter for the beneficiary address.
   */
  function beneficiary() public view virtual returns (address) {
    return _beneficiary;
  }

  /**
   * @dev Getter for the start timestamp.
   */
  function start() public view virtual returns (uint256) {
    return _emissionTimes[0];
  }

  /**
   * @dev Getter for the end timestamp.
   */
  function end() public view virtual returns (uint256) {
    return _emissionTimes[_emissionTimes.length - 1];
  }

  /**
   * @dev Getter for DefiraliaT.
   */
  function defiraliatAddress() public view virtual returns (address) {
    return _defiraliat;
  }

  /**
   * @dev Getter for the emissionTimes.
   */
  function emissionTimes() public view virtual returns (uint256[] memory) {
    return _emissionTimes;
  }

  /**
   * @dev Amount of defiraliat already released
   */
  function released() public view virtual returns (uint256) {
    return _released;
  }

  /**
   * @dev Getter for the amount of releasable defiraliat.
   */
  function releasable() public view virtual returns (uint256) {
    return vestedAmount(uint64(block.timestamp)) - released();
  }

  /**
   * @dev Release DefiraliaT that have already vested.
   *
   * Emits a {DefiraliatReleased} event.
   */
  function release() public virtual {
    uint256 amount = releasable();
    _released += amount;
    emit DefiraliatReleased(amount);
    SafeERC20.safeTransfer(IERC20(defiraliatAddress()), beneficiary(), amount);
  }

  /**
   * @dev Calculates the amount of defiraliat that has already vested. Default implementation is a linear vesting curve.
   */
  function vestedAmount(uint64 timestamp) public view virtual returns (uint256) {
    return _vestingSchedule(IERC20(defiraliatAddress()).balanceOf(address(this)) + released(), timestamp);
  }

  function _vestingSchedule(
    uint256 totalAllocation,
    uint64 timestamp
  ) internal view virtual returns (uint256) {
    if (timestamp < start()) {
      return 0;
    }

    if (timestamp >= end()) {
      return totalAllocation;
    }

    uint256 totalVested = 0;
    uint256 emissionPerTerm = totalAllocation / _emissionTimes.length;
    for (uint256 i = 0; i < _emissionTimes.length; i++) {
      if (timestamp >= _emissionTimes[i]) {
        totalVested += emissionPerTerm;
      }
    }
    return totalVested;
  }
}
