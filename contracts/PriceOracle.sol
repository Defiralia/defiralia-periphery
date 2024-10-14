// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IPriceAggregator.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title PriceOracle
 * @author Defiralia
 * @notice Contract to provide oracle price
 */
contract PriceOracle is IPriceOracle, AddressHandler {
  /// @dev _priceAggregators[asset] => IPriceAggregator
  mapping(address => IPriceAggregator) private _priceAggregators;
  /// @dev assetTimeFrames[asset] => timeFrame
  mapping(address => uint) public assetTimeFrames;

  function initialize(IAddressMap addressMap) public initializer {
    __AddressHandler_init(addressMap);
  }

  /**
   * @notice set price aggregator for asset
   * @dev set timeFrame as 0. it means that the oracle price update time is not checked as default
   * @param asset asset address
   * @param aggregator price aggregator address
   */
  function setPriceAggregator(
    address asset,
    IPriceAggregator aggregator
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    (uint price, ) = aggregator.currentPrice();
    if (price == 0) revert PriceNotAllowZero();
    _priceAggregators[asset] = aggregator;
    assetTimeFrames[asset] = 0; // 0: uncheck
  }

  /**
   * @notice set time frame for asset
   * @param asset asset address
   * @param timeFrame expiration time for oracle price timestamp
   */
  function setAssetTimeFrame(address asset, uint timeFrame) external onlyRole(DEFAULT_ADMIN_ROLE) {
    assetTimeFrames[asset] = timeFrame;
  }

  /**
   * @notice return oracle price and timestamp
   */
  function queryAssetPrice(address asset) external view returns (uint price, uint lastUpdate) {
    IPriceAggregator aggregator = _priceAggregators[asset];
    if (address(aggregator) == address(0)) revert NotExistPriceAggregator();
    (price, lastUpdate) = _priceAggregators[asset].currentPrice();
    if (price == 0) revert PriceNotAllowZero();
    if (assetTimeFrames[asset] > 0 && lastUpdate < block.timestamp - assetTimeFrames[asset])
      revert NotUpdatedPriceFeed();
  }

  function queryPriceAggregator(address asset) external view returns (address) {
    return address(_priceAggregators[asset]);
  }
}
