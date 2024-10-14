# Solidity API

## RewardDistributor

Contract to distribute sLP rewards

### Distribute

```solidity
event Distribute(address operator)
```

### Withdraw

```solidity
event Withdraw(address token, address to, uint256 amount)
```

### NoBalance

```solidity
error NoBalance()
```

### initialize

```solidity
function initialize(contract IAddressMap addressMap) public
```

### pause

```solidity
function pause() public
```

### unpause

```solidity
function unpause() public
```

### withdraw

```solidity
function withdraw(contract IERC20 _token) external
```

Withdraw unexpected tokens sent to the receiver, can also withdraw defiraliat.

_Callable by owner._

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| _token | contract IERC20 | Token address. |

### distribute

```solidity
function distribute() external
```

anyone can call this function to distribute sLP rewards

