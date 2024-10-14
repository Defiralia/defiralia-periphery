// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

interface IAddressMap {
  function setAddressToList(uint32 id, address account) external;

  function readAddressList(uint32 id) external view returns (address);
}
