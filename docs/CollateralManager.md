# Solidity API

## CollateralManager

Contract to store and deposit/withdraw collaterals

### totalUserCollaterals

```solidity
mapping(address => mapping(address => uint256)) totalUserCollaterals
```

_totalUserCollaterals[user][collateral] => user collateral amount by token_

### totalCollaterals

```solidity
mapping(address => uint256) totalCollaterals
```

_totalCollaterals[collateral] => total collateral amount by token_

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### increaseCollateral

```solidity
function increaseCollateral(address collateral, uint256 amountIn, address user) external
```

increase collateral amount by deposit

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | address | collateral address |
| amountIn | uint256 | increase collateral amount |
| user | address | user address |

### decreaseCollateral

```solidity
function decreaseCollateral(address collateral, uint256 amountOut, address user, address to) external
```

decrease collateral amount by withdraw

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| collateral | address | collateral address |
| amountOut | uint256 | decrease collateral amount |
| user | address | user address |
| to | address | receipient address |

