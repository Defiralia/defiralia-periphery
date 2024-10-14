# Solidity API

## Lending

Core Contract for CDP Operations
Users can create two kinds of position, long and short.
In Short position, minted assets are exchanged to base tokens at dex and return base tokens to user.

### positionIndex

```solidity
uint256 positionIndex
```

unique id for each position

_this keeps next position index_

### protocolFeeRate

```solidity
uint32 protocolFeeRate
```

fee rate collected by protocol acording to burn value

### feeReciverRole

```solidity
uint32 feeReciverRole
```

_ref to receiver in AddressMap_

### assetConfigs

```solidity
mapping(address => struct AssetConfig) assetConfigs
```

_assetConfigs[asset] => AssetConfig_

### _positions

```solidity
mapping(uint256 => struct Position) _positions
```

__positions[positionIndex] => Position_

### _userPositionList

```solidity
mapping(address => uint256[]) _userPositionList
```

__userPositionList[user] => positionIndex[]_

### _isPositionExist

```solidity
mapping(address => mapping(address => mapping(address => bool))) _isPositionExist
```

__isPositionExist[user][asset][collateral] => User has a given pair of long position or not_

### _isShortPositionExist

```solidity
mapping(address => mapping(address => mapping(address => bool))) _isShortPositionExist
```

__isShortPositionExist[user][asset][collateral] => User has a given pair of short position or not_

### onlyPositionOwner

```solidity
modifier onlyPositionOwner(uint256 index)
```

_Modifier to check for position owner_

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### registerAsset

```solidity
function registerAsset(address asset, uint32 liquidationDiscount, uint32 minCollateralRatio) external
```

register asset to Lending contract and set asset config

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| liquidationDiscount | uint32 | discount rate for liquidation |
| minCollateralRatio | uint32 | minimum collateral ratio for CDP |

### registerRevoke

```solidity
function registerRevoke(address asset, uint256 endPrice) external
```

revoke asset and change asset config

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| endPrice | uint256 | fixed price after revoke |

### pause

```solidity
function pause() public
```

_pause CDP operations_

### unpause

```solidity
function unpause() public
```

_unpause CDP operations_

### setFeeReciverRole

```solidity
function setFeeReciverRole(uint32 id) external
```

### updateProtocolFee

```solidity
function updateProtocolFee(uint32 protocolFee) external
```

### updateAsset

```solidity
function updateAsset(address asset, uint32 liquidationDiscount, uint32 minCollateralRatio) external
```

_update asset config_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| liquidationDiscount | uint32 | discount rate for liquidation |
| minCollateralRatio | uint32 | minimum collateral ratio for CDP |

### suspendAsset

```solidity
function suspendAsset(address asset) external
```

_suspend asset_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |

### unsuspendAsset

```solidity
function unsuspendAsset(address asset) external
```

_unsuspend asset_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |

### openPosition

```solidity
function openPosition(address asset, address collateral, uint256 collateralAmount, uint32 collateralRatio, struct ShortParams shortParams) external
```

create new position
user can create only one position for each pair and long/short

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| collateral | address | collateral address |
| collateralAmount | uint256 | collateral amount |
| collateralRatio | uint32 | collateral ratio specified by user for new position |
| shortParams | struct ShortParams | params for short swap |

### deposit

```solidity
function deposit(uint256 index, address collateral, uint256 collateralAmount) public
```

deposit collateral to owned position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | position index |
| collateral | address | collateral address |
| collateralAmount | uint256 | collateral amount to deposit |

### withdraw

```solidity
function withdraw(uint256 index, address collateral, uint256 collateralAmount) public
```

withdraw collateral from owned position

_if user tries to withdraw over amount of collateral, all collaterals are withdrawn_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | position index |
| collateral | address | collateral address |
| collateralAmount | uint256 | collateral amount to withdraw |

### mint

```solidity
function mint(uint256 index, address asset, uint256 assetAmount, struct ShortParams shortParams) public
```

mint asset to owned position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | position index |
| asset | address | asset address |
| assetAmount | uint256 | asset amount to mint |
| shortParams | struct ShortParams | params for short swap |

### burn

```solidity
function burn(uint256 index, address asset, uint256 assetAmount) public
```

burn asset to from position. protocol fee is collected according to burn value
anyone can call this function for revoked position

_if user tries to burn over amount of asset, all assets are burned_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 |  |
| asset | address | asset address |
| assetAmount | uint256 | asset amount to burn |

### depositAndMint

```solidity
function depositAndMint(uint256 index, address asset, uint256 assetAmount, address collateral, uint256 collateralAmount, struct ShortParams shortParams) external
```

call deposit and mint sequentially

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | position index |
| asset | address | asset address |
| assetAmount | uint256 | asset amount to mint |
| collateral | address | collateral address |
| collateralAmount | uint256 | collateral amount to deposit |
| shortParams | struct ShortParams |  |

### burnAndWithdraw

```solidity
function burnAndWithdraw(uint256 index, address asset, uint256 assetAmount, address collateral, uint256 collateralAmount) external
```

call burn and withdraw sequentially

_Since this is thought to be called by owner, it might be reverted
     if other users call this function for revoked asset position and close it_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | position index |
| asset | address | asset address |
| assetAmount | uint256 | asset amount to burn |
| collateral | address | collateral address |
| collateralAmount | uint256 | collateral amount to withdraw |

### liquidation

```solidity
function liquidation(uint256 index, address asset, uint256 assetAmount) external
```

anyone can liquidate positions below the required collateral rate

_if all assets are liquidated, the position is closed and left collaterals are refunded to owner_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| index | uint256 | position index |
| asset | address | asset address |
| assetAmount | uint256 | asset amount prepared for liquidation |

### _createPosition

```solidity
function _createPosition(struct Position position) internal
```

_create new position_

### queryPosition

```solidity
function queryPosition(uint256 index) external view returns (struct Position res)
```

return only owened position. if not, return empty position

### queryPositions

```solidity
function queryPositions() external view returns (struct Position[])
```

return all positions

### queryUserPositions

```solidity
function queryUserPositions(address owner) external view returns (struct Position[])
```

return all positions owned by a owner

