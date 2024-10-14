# Solidity API

## AddressMap

Core Contract to store contract addresses.

### initialize

```solidity
function initialize(address defiraliat, address base) public
```

### _authorizeUpgrade

```solidity
function _authorizeUpgrade(address newImplementation) internal
```

_Function that should revert when `msg.sender` is not authorized to upgrade the contract. Called by
{upgradeTo} and {upgradeToAndCall}.

Normally, this function will use an xref:access.adoc[access control] modifier such as {Ownable-onlyOwner}.

```solidity
function _authorizeUpgrade(address) internal override onlyOwner {}
```_

### setAddressToList

```solidity
function setAddressToList(uint32 id, address newAddress) external
```

set id to contract address

### readAddressList

```solidity
function readAddressList(uint32 id) external view returns (address)
```

