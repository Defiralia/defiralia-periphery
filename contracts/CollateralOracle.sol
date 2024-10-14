// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/ICollateralOracle.sol";
import "./interfaces/IPriceOracle.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title CollateralOracle
 * @author Defiralia
 * @notice Contract to provide collateral infos
 */
contract CollateralOracle is ICollateralOracle, AddressHandler {
  /// @dev index of registered collateral
  uint public collateralIndex;

  /// @dev _collateralByIndex[collateralIndex] => collateral
  mapping(uint => address) internal _collateralByIndex;
  /// @dev _collateralInfos[collateral] => CollateralConfig
  mapping(address => CollateralConfig) internal _collateralInfos;

  function initialize(IAddressMap addressMap) public initializer {
    __AddressHandler_init(addressMap);
  }

  /**
   * @notice register collateral
   * @param collateral collateral address
   * @param multiplier the multiplier to be applied to the minimum collateral ratio
   * to calculate the required collateral ratio
   */
  function registerCollateral(
    address collateral,
    uint32 multiplier
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (_collateralInfos[collateral].collateral != address(0)) revert ExistCollateral();
    if (multiplier < MINIMUM_MULTIPLIER) revert InvalidMultiplier();
    if (IPriceOracle(lookup(CONTRACT_PRICE_ORACLE)).queryPriceAggregator(collateral) == address(0))
      revert NotExistPriceAggregator();

    _collateralByIndex[collateralIndex++] = collateral;
    _collateralInfos[collateral] = CollateralConfig(collateral, multiplier, 0, false, false);

    emit RegisterCollateral(collateral, multiplier, collateralIndex);
  }

  /**
   * @notice revoke collateral
   * @param collateral collateral address
   */
  function revokeCollateralAsset(address collateral) external onlyRole(DEFAULT_ADMIN_ROLE) {
    CollateralConfig storage collateralConfig = _collateralInfos[collateral];
    if (collateralConfig.collateral != address(0) && !collateralConfig.isRevoked) {
      collateralConfig.isRevoked = true;
      emit RevokeCollateralAsset(collateral);
    }
  }

  /**
   * @notice suspend collateral
   * @param collateral collateral address
   */
  function suspendCollateralAsset(address collateral) external onlyRole(DEFAULT_ADMIN_ROLE) {
    CollateralConfig storage collateralConfig = _collateralInfos[collateral];
    if (collateralConfig.collateral != address(0) && !collateralConfig.isSuspended) {
      collateralConfig.isSuspended = true;
      emit SuspendCollateralAsset(collateral);
    }
  }

  /**
   * @notice unsuspend collateral
   * @param collateral collateral address
   */
  function unsuspendCollateralAsset(address collateral) external onlyRole(DEFAULT_ADMIN_ROLE) {
    CollateralConfig storage collateralConfig = _collateralInfos[collateral];
    if (collateralConfig.collateral != address(0) && collateralConfig.isSuspended) {
      collateralConfig.isSuspended = false;
      emit UnsuspendCollateralAsset(collateral);
    }
  }

  function updateCollateralEndPrice(
    address collateral,
    uint fixedPrice
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    CollateralConfig storage collateralConfig = _collateralInfos[collateral];
    if (collateralConfig.collateral == address(0)) revert NotExistCollateral();
    collateralConfig.fixedPrice = fixedPrice;
    emit UpdateCollateralEndPrice(collateral, fixedPrice);
  }

  function updateCollateralMultiplier(
    address collateral,
    uint32 multiplier
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    CollateralConfig storage collateralConfig = _collateralInfos[collateral];
    if (collateralConfig.collateral == address(0)) revert NotExistCollateral();
    if (multiplier < MINIMUM_MULTIPLIER) revert InvalidMultiplier();
    collateralConfig.multiplier = multiplier;
    emit UpdateCollateralMultiplier(collateral, multiplier);
  }

  /**
   * @dev return collateral price info
   * if collateral is available, return oracle price
   * if collateral is revoked, return end price
   */
  function queryCollateralPrice(
    address collateral
  ) external view returns (CollateralPriceInfo memory) {
    CollateralConfig memory collateralConfig = _collateralInfos[collateral];
    if (collateralConfig.collateral == address(0)) revert NotExistCollateral();

    (uint price, uint lastUpdate) = collateralConfig.fixedPrice == 0
      ? IPriceOracle(lookup(CONTRACT_PRICE_ORACLE)).queryAssetPrice(collateral)
      : (collateralConfig.fixedPrice, MAX_INT);

    return
      CollateralPriceInfo({
        collateral: collateralConfig.collateral,
        price: price,
        lastUpdate: lastUpdate,
        multiplier: collateralConfig.multiplier,
        isRevoked: collateralConfig.isRevoked,
        isSuspended: collateralConfig.isSuspended
      });
  }

  function queryCollateralInfo(address collateral) external view returns (CollateralConfig memory) {
    return _collateralInfos[collateral];
  }

  /**
   * @dev return all collateral infos
   */
  function queryCollateralInfos() external view returns (CollateralConfig[] memory) {
    CollateralConfig[] memory infos = new CollateralConfig[](collateralIndex);
    for (uint i = 0; i < collateralIndex; i++) {
      infos[i] = _collateralInfos[_collateralByIndex[i]];
    }
    return infos;
  }
}
