// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

interface IAddressHandler {
  function lookup(uint32 id) external view returns (address contractAddress);
}
