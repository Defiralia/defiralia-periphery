# Solidity API

## CollateralOracle

Contract to provide collateral infos

### collateralIndex

```solidity
uint256 collateralIndex
```

_index of registered collateral_

### _collateralByIndex

```solidity
mapping(uint256 => address) _collateralByIndex
```

__collateralByIndex[collateralIndex] => collateral_

### _collateralInfos

```solidity
mapping(address => struct CollateralConfig) _collateralInfos
```

__collateralInfos[collateral] => CollateralConfig_

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### registerCollateral

```solidity
function registerCollateral(address collateral, uint32 multiplier) external
```

register collateral

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | address | collateral address |
| multiplier | uint32 | the multiplier to be applied to the minimum collateral ratio to calculate the required collateral ratio |

### revokeCollateralAsset

```solidity
function revokeCollateralAsset(address collateral) external
```

revoke collateral

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | address | collateral address |

### suspendCollateralAsset

```solidity
function suspendCollateralAsset(address collateral) external
```

suspend collateral

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | address | collateral address |

### unsuspendCollateralAsset

```solidity
function unsuspendCollateralAsset(address collateral) external
```

unsuspend collateral

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | address | collateral address |

### updateCollateralEndPrice

```solidity
function updateCollateralEndPrice(address collateral, uint256 fixedPrice) external
```

### updateCollateralMultiplier

```solidity
function updateCollateralMultiplier(address collateral, uint32 multiplier) external
```

### queryCollateralPrice

```solidity
function queryCollateralPrice(address collateral) external view returns (struct CollateralPriceInfo)
```

_return collateral price info
if collateral is available, return oracle price
if collateral is revoked, return end price_

### queryCollateralInfo

```solidity
function queryCollateralInfo(address collateral) external view returns (struct CollateralConfig)
```

### queryCollateralInfos

```solidity
function queryCollateralInfos() external view returns (struct CollateralConfig[])
```

_return all collateral infos_

