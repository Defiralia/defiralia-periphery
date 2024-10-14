// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../Lending.sol";
import "../interfaces/IFactory.sol";

contract LendingTest is Lending {
  function initializeTest(IAddressMap addressMap) public initializer {
    positionIndex = 1;
    protocolFeeRate = 15;
    feeReciverRole = CONTRACT_TREASURY;
    __Pausable_init();
    __AddressHandler_init(addressMap);

    _grantRole(ROLE_PAUSER, msg.sender);
  }

  function getProtocolFeeRate() external view returns (uint) {
    return protocolFeeRate;
  }

  function testHasPosition(
    address owner,
    address asset,
    address collateral,
    bool isShort
  ) external view returns (bool) {
    return
      isShort
        ? _isShortPositionExist[owner][asset][collateral]
        : _isPositionExist[owner][asset][collateral];
  }

  function testSetMigration(address asset, uint endPrice) external {
    AssetConfig storage assetConfig = assetConfigs[asset];
    assetConfig.minCollateralRatio = PERMILLE;
    assetConfig.endPrice = endPrice;
  }

  function testSetPositionClosed(uint index) external {
    _positions[index].isClosed = true;
  }

  // ----- For onlyContract(CONTRACT_LENDING) Test -----
  function mintAssetTest(address asset, address recipient, uint amount) external {
    IFactory(lookup(CONTRACT_FACTORY)).mintAsset(asset, recipient, amount);
  }

  function burnAssetTest(address asset, address from, uint amount) external {
    IFactory(lookup(CONTRACT_FACTORY)).burnAsset(asset, from, amount);
  }

  function increaseCollateralTest(address collateral, uint amountIn, address owner) external {
    ICollateralManager(lookup(CONTRACT_COLLATERAL_MANAGER)).increaseCollateral(
      collateral,
      amountIn,
      owner
    );
  }

  function decreaseCollateralTest(
    address collateral,
    uint amountOut,
    address owner,
    address to
  ) external {
    ICollateralManager(lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
      collateral,
      amountOut,
      owner,
      to
    );
  }
}
