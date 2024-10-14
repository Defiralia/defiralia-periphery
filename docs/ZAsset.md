# Solidity API

## ZAsset

Contract of debt token for lending

_This is deployed by Factory_

### constructor

```solidity
constructor(string name, string symbol) public
```

### mint

```solidity
function mint(address to, uint256 amount) external returns (bool)
```

### burn

```solidity
function burn(address from, uint256 amount) external returns (bool)
```

