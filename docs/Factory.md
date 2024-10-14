# Solidity API

## Factory

Contract to manage assets and distribute sLP rewards.

_Only asset deployed by Factory can be listed for Lending Contract._

### lastDistributed

```solidity
uint256 lastDistributed
```

_last timestamp of distributing sLP rewards_

### totalWeight

```solidity
uint256 totalWeight
```

_sum of sLP rewards weight for each asset_

### distributionSchedule

```solidity
struct DistributionSchedule[] distributionSchedule
```

_distribution schedule for sLP rewards_

### _assetList

```solidity
address[] _assetList
```

_enabled asset list_

### assetInfos

```solidity
mapping(address => struct AssetInfo) assetInfos
```

_assetInfos[asset] => AssetInfo_

### _deployedByFactory

```solidity
mapping(address => bool) _deployedByFactory
```

__deployedByFactory[asset] => is asset deployed by Factory or not_

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### updateDistributionSchedule

```solidity
function updateDistributionSchedule(struct DistributionSchedule[] newDistributionSchedule) external
```

update distributionSchedule

### createAsset

```solidity
function createAsset(string name, string symbol) external returns (address asset)
```

depoly asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| name | string | name of asset |
| symbol | string | symbol of asset |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | newly deployed address address |

### enableAsset

```solidity
function enableAsset(address asset, uint8 weight, uint32 liquidationDiscount, uint32 minCollateralRatio) external
```

enable asset for lending

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| weight | uint8 | weight for sLP staking reward |
| liquidationDiscount | uint32 | discount rate for liquidation |
| minCollateralRatio | uint32 | minimum collateral ratio for CDP |

### updateWeight

```solidity
function updateWeight(address asset, uint8 weight) external
```

### revokeAsset

```solidity
function revokeAsset(address asset) external
```

revoke asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |

### mintAsset

```solidity
function mintAsset(address asset, address recipient, uint256 amount) external
```

mint asset for lending

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| recipient | address | recipient address |
| amount | uint256 | amount to mint |

### burnAsset

```solidity
function burnAsset(address asset, address from, uint256 amount) external
```

burn asset for lending

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| from | address | from address |
| amount | uint256 | amount to burn |

### distribute

```solidity
function distribute() external
```

distribute sLP rewards to Staking according to the percentage allocated
by shortRewardWeight and the left to Treasury

### _readAssetInfos

```solidity
function _readAssetInfos() internal view returns (struct AssetInfo[] infos)
```

### queryDistributionInfo

```solidity
function queryDistributionInfo() external view returns (struct DistributionInfoResponse)
```

return all asset infos and last distribute timestamp

### queryAssetInfos

```solidity
function queryAssetInfos() external view returns (struct AssetInfo[] infos)
```

return all asset infos

