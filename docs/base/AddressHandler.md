# Solidity API

## AddressHandler

Base Contract to serve contract addresses from AddressMap.

_This contract has the role of making the inherited contract upgradeable and implements access control._

### __AddressHandler_init

```solidity
function __AddressHandler_init(contract IAddressMap addressMap) public
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

### onlyContract

```solidity
modifier onlyContract(uint32 id)
```

_Modifier to check for specific contract_

### setAddressMap

```solidity
function setAddressMap(contract IAddressMap newAddressMap) external
```

### lookup

```solidity
function lookup(uint32 id) public view returns (address contractAddress)
```

look up contract address by id

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| id | uint32 | contract id registered in AddressMap |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| contractAddress | address | contract address |

### _sortPair

```solidity
function _sortPair(address token0, address token1) internal pure returns (address, address)
```

_sort token pair addresses by asc_

