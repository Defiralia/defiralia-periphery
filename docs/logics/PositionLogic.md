# Solidity API

## PositionLogic

Library to execute CDP related logics

### openPositionLogic

```solidity
function openPositionLogic(struct OpenPositionParams params, contract IAddressHandler addressHandler) public returns (uint256 mintAmount)
```

logic for openPosition

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| params | struct OpenPositionParams | paramerters needed to execute openPosition |
| addressHandler | contract IAddressHandler | AddressHandler address |

### depositLogic

```solidity
function depositLogic(struct Position position, struct DepositParams params, contract IAddressHandler addressHandler) public
```

logic for deposit

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| position | struct Position | position to deposit |
| params | struct DepositParams | paramerters needed to execute deposit |
| addressHandler | contract IAddressHandler | AddressHandler address |

### withdrawLogic

```solidity
function withdrawLogic(struct Position position, struct WithdrawParams params, contract IAddressHandler addressHandler) public returns (uint256 withdrawAmount)
```

logic for withdraw

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| position | struct Position | position to withdraw |
| params | struct WithdrawParams | paramerters needed to execute withdraw |
| addressHandler | contract IAddressHandler | AddressHandler address |

### mintLogic

```solidity
function mintLogic(struct Position position, struct MintParams params, contract IAddressHandler addressHandler) public
```

logic for mint

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| position | struct Position | position to mint |
| params | struct MintParams | paramerters needed to execute mint |
| addressHandler | contract IAddressHandler | AddressHandler address |

### burnLogic

```solidity
function burnLogic(struct Position position, struct BurnParams params, contract IAddressHandler addressHandler) public returns (uint256 burnAmount)
```

logic for burn

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| position | struct Position | position to burn |
| params | struct BurnParams | paramerters needed to execute burn |
| addressHandler | contract IAddressHandler | AddressHandler address |

### liquidationLogic

```solidity
function liquidationLogic(struct Position position, struct LiquidateParams params, contract IAddressHandler addressHandler) public returns (uint256 liquidateAmount, uint256 withdrawCollateralAmount)
```

logic for close

#### Parameters

| Name | Type | Description |
| ---- | ---- | ----------- |
| position | struct Position | position to close |
| params | struct LiquidateParams | paramerters needed to execute close |
| addressHandler | contract IAddressHandler | AddressHandler address |

#### Return Values

| Name | Type | Description |
| ---- | ---- | ----------- |
| liquidateAmount | uint256 | asset amount to liquidate |
| withdrawCollateralAmount | uint256 | collateral amount to withdraw |

