# Solidity API

## Staking

Contract for Short LP (sLP) Token Staking.
sLP Staking Rewards are determined by the premium which
is downward deviation of the pool price from the oracle price.

### _premiumMinUpdateInterval

```solidity
uint256 _premiumMinUpdateInterval
```

_Interval at which premium can be updated_

### _poolInfos

```solidity
mapping(address => struct PoolInfo) _poolInfos
```

__poolInfos[asset] => PoolInfo_

### _shortRewardInfos

```solidity
mapping(address => mapping(address => struct RewardInfo)) _shortRewardInfos
```

__shortRewardInfos[staker][asset] => RewardInfo_

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### updateInterval

```solidity
function updateInterval(uint256 premiumMinUpdateInterval) external
```

### increaseShortToken

```solidity
function increaseShortToken(address staker, address asset, uint256 amount) external
```

increase staking sLP token according to the amount of asset in short position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| staker | address | staker address |
| asset | address | asset address |
| amount | uint256 | the increase amount of sLP staking |

### decreaseShortToken

```solidity
function decreaseShortToken(address staker, address asset, uint256 amount) external
```

decrease staking sLP token according to the amount of asset in short position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| staker | address | staker address |
| asset | address | asset address |
| amount | uint256 | the decrease amount of sLP staking |

### registerPoolInfo

```solidity
function registerPoolInfo(address asset) external
```

register sLP rewards pool of newly listed asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |

### depositReward

```solidity
function depositReward(struct Reward[] rewards) external
```

deposit rewards to each sLP rewards pools

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| rewards | struct Reward[] | the infos of deposited amount for each pools |

### withdrawReward

```solidity
function withdrawReward(address asset) external
```

withdraw sLP staking rewards

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |

### adjustPremium

```solidity
function adjustPremium(address[] assetList) external
```

ajust premium by current pool price and oracle price. anyone can call this function

_if this is called within the interval, it will be just skipped_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| assetList | address[] | target list of asset address to ajust premium |

### _beforeShareChange

```solidity
function _beforeShareChange(struct decimal poolRewardUnit, struct RewardInfo rewardInfo) internal
```

update reward info

_this should be called before the staking amount is changed_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| poolRewardUnit | struct decimal | current pool reward per 1 sLP |
| rewardInfo | struct RewardInfo | the reward info to be updated |

### _computeShortRewardWeight

```solidity
function _computeShortRewardWeight(struct decimal premiumRate) internal pure returns (struct decimal)
```

_compute short reward weight by premium rate_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| premiumRate | struct decimal | premium rate (e.g. 5% => 50 * 10**18) |

### queryPoolInfo

```solidity
function queryPoolInfo(address asset) external view returns (struct PoolInfo)
```

### updateRewardInfo

```solidity
function updateRewardInfo(address staker, address asset) public returns (struct RewardInfoResponseItem)
```

return reward info

_this is usually called with staticcall_

### updateUserRewardInfos

```solidity
function updateUserRewardInfos(address staker) external returns (struct RewardInfoResponseItem[] rewardInfos)
```

return all reward infos by a staker

_this is usually called with staticcall_

