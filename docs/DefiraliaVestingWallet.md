# Solidity API

## DefiraliaVestingWallet

Contract for release Defiralia Governance Token as rewards gradually

### DefiraliatReleased

```solidity
event DefiraliatReleased(uint256 amount)
```

### constructor

```solidity
constructor(address defiraliat, address beneficiaryAddress, uint256[] emissionTimeList) public payable
```

### beneficiary

```solidity
function beneficiary() public view virtual returns (address)
```

_Getter for the beneficiary address._

### start

```solidity
function start() public view virtual returns (uint256)
```

_Getter for the start timestamp._

### end

```solidity
function end() public view virtual returns (uint256)
```

_Getter for the end timestamp._

### defiraliatAddress

```solidity
function defiraliatAddress() public view virtual returns (address)
```

_Getter for DefiraliaT._

### emissionTimes

```solidity
function emissionTimes() public view virtual returns (uint256[])
```

_Getter for the emissionTimes._

### released

```solidity
function released() public view virtual returns (uint256)
```

_Amount of defiraliat already released_

### releasable

```solidity
function releasable() public view virtual returns (uint256)
```

_Getter for the amount of releasable defiraliat._

### release

```solidity
function release() public virtual
```

_Release DefiraliaT that have already vested.

Emits a {DefiraliatReleased} event._

### vestedAmount

```solidity
function vestedAmount(uint64 timestamp) public view virtual returns (uint256)
```

_Calculates the amount of defiraliat that has already vested. Default implementation is a linear vesting curve._

### _vestingSchedule

```solidity
function _vestingSchedule(uint256 totalAllocation, uint64 timestamp) internal view virtual returns (uint256)
```

