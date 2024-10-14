# Solidity API

## CLPriceAggregator

Contract to wrap Chainlink price aggregator

### constructor

```solidity
constructor(contract AggregatorV3Interface aggregator) public
```

### currentPrice

```solidity
function currentPrice() external view virtual returns (uint256, uint256)
```

_this function is to get the price as a common interface from any oracle provider_

