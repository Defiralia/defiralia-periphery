# Solidity API

## PriceOracle

Contract to provide oracle price

### assetTimeFrames

```solidity
mapping(address => uint256) assetTimeFrames
```

_assetTimeFrames[asset] => timeFrame_

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### setPriceAggregator

```solidity
function setPriceAggregator(address asset, contract IPriceAggregator aggregator) external
```

set price aggregator for asset

_set timeFrame as 0. it means that the oracle price update time is not checked as default_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| aggregator | contract IPriceAggregator | price aggregator address |

### setAssetTimeFrame

```solidity
function setAssetTimeFrame(address asset, uint256 timeFrame) external
```

set time frame for asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| timeFrame | uint256 | expiration time for oracle price timestamp |

### queryAssetPrice

```solidity
function queryAssetPrice(address asset) external view returns (uint256 price, uint256 lastUpdate)
```

return oracle price and timestamp

### queryPriceAggregator

```solidity
function queryPriceAggregator(address asset) external view returns (address)
```

