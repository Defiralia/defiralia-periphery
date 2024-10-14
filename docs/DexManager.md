# Solidity API

## DexManager

Contract to mediate to dex

### swapRouter

```solidity
contract ISwapRouter swapRouter
```

### nonfungiblePositionManager

```solidity
contract INonfungiblePositionManager nonfungiblePositionManager
```

### _pools

```solidity
mapping(address => address) _pools
```

__pools[asset] => pool
one of the pairs is omitted as DAI_

### initialize

```solidity
function initialize(contract IAddressMap addressMap, contract INonfungiblePositionManager _nonfungiblePositionManager, contract ISwapRouter _swapRouter) public
```

### setAllowanceForSwapRouter

```solidity
function setAllowanceForSwapRouter(contract IERC20 asset) external
```

set allowance for swapRouter

_short positions cannot be created unless this function is executed once_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | contract IERC20 | asset address |

### setPool

```solidity
function setPool(address asset, address pool) external
```

set pool for asset

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |
| pool | address | pool address |

### shortSwap

```solidity
function shortSwap(address tokenIn, address recipient, uint256 amountIn, struct ShortParams shortParams) external returns (uint256 amountOut)
```

execute swap for short position

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| tokenIn | address | token address to be swapped from |
| recipient | address | recipient address of swap |
| amountIn | uint256 | token amount to be swapped from |
| shortParams | struct ShortParams | params for short swap |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| amountOut | uint256 | token amount to be swapped to |

### _callSingleHop

```solidity
function _callSingleHop(address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96) internal returns (uint256 amount)
```

_execute single hop swap using default params_

### _callMultiHop

```solidity
function _callMultiHop(address tokenIn, uint24 feeIn, address tokenVia, uint24 feeOut, address tokenOut, address recipient, uint256 amountIn, uint256 amountOutMinimum) internal returns (uint256 amount)
```

_execute multi hop swap using default params_

### queryPool

```solidity
function queryPool(address asset) public view returns (address)
```

### queryPoolPrice

```solidity
function queryPoolPrice(address asset) public view returns (struct decimal price)
```

return pool price of asset

_price is calculated by twap_

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| asset | address | asset address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| price | struct decimal | asset amount per unit of base token |

