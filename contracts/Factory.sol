// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "./ZAsset.sol";
import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/ILending.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/ICollateralOracle.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/IDexManager.sol";
import "./interfaces/IZAsset.sol";
import "./libraries/Decimal.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title Factory
 * @author Defiralia
 * @notice Contract to manage assets and distribute sLP rewards.
 * @dev Only asset deployed by Factory can be listed for Lending Contract.
 */
contract Factory is IFactory, AddressHandler {
  using SafeERC20 for IERC20;

  /// @dev last timestamp of distributing sLP rewards
  uint public lastDistributed;
  /// @dev sum of sLP rewards weight for each asset
  uint public totalWeight;

  /// @dev distribution schedule for sLP rewards
  DistributionSchedule[] public distributionSchedule;
  /// @dev enabled asset list
  address[] internal _assetList;

  /// @dev assetInfos[asset] => AssetInfo
  mapping(address => AssetInfo) public assetInfos;
  /// @dev _deployedByFactory[asset] => is asset deployed by Factory or not
  mapping(address => bool) internal _deployedByFactory;

  function initialize(IAddressMap addressMap) public initializer {
    totalWeight = 0;
    lastDistributed = block.timestamp;
    __AddressHandler_init(addressMap);
  }

  /**
   * @notice update distributionSchedule
   */
  function updateDistributionSchedule(
    DistributionSchedule[] memory newDistributionSchedule
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    // delete all
    while (distributionSchedule.length > 0) {
      distributionSchedule.pop();
    }
    // push new schedules
    for (uint i = 0; i < newDistributionSchedule.length; i++) {
      if (newDistributionSchedule[i].distributionAmount == 0) revert AmountNotAllowZero();
      if (
        newDistributionSchedule[i].endTime <= block.timestamp ||
        newDistributionSchedule[i].startTime >= newDistributionSchedule[i].endTime
      ) revert InvalidSchedule();
      distributionSchedule.push(newDistributionSchedule[i]);
    }
  }

  /**
   * @notice depoly asset
   * @param name name of asset
   * @param symbol symbol of asset
   * @return asset newly deployed address address
   */
  function createAsset(
    string memory name,
    string memory symbol
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address asset) {
    asset = address(new ZAsset(name, symbol));
    if (asset == address(0)) revert FailAssetDeploy();

    _deployedByFactory[asset] = true;

    emit CreateAsset(asset, name, symbol);
  }

  /**
   * @notice enable asset for lending
   * @param asset asset address
   * @param weight weight for sLP staking reward
   * @param liquidationDiscount discount rate for liquidation
   * @param minCollateralRatio minimum collateral ratio for CDP
   */
  function enableAsset(
    address asset,
    uint8 weight,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (
      weight == 0 ||
      liquidationDiscount >= MAX_LIQUIDATION_DISCOUNT ||
      minCollateralRatio <= MINIMUM_MIN_COLLATERAL_RATIO
    ) revert InvalidEnableAssetParameters();
    if (!_deployedByFactory[asset]) revert AssetNotDeployedByFactory();
    if (assetInfos[asset].asset != address(0)) revert ExistAsset();
    if (IPriceOracle(lookup(CONTRACT_PRICE_ORACLE)).queryPriceAggregator(asset) == address(0))
      revert NotExistPriceAggregator();
    if (IDexManager(lookup(CONTRACT_DEX_MANAGER)).queryPool(asset) == address(0))
      revert NotExistPool();

    assetInfos[asset] = AssetInfo({ asset: asset, weight: weight, isRevoked: false });
    _assetList.push(asset);
    totalWeight += weight;

    // Lending registerAsset
    ILending(lookup(CONTRACT_LENDING)).registerAsset(
      asset,
      liquidationDiscount,
      minCollateralRatio
    );

    // Staking registerPoolInfo
    IStaking(lookup(CONTRACT_STAKING)).registerPoolInfo(asset);

    emit EnableAsset(asset, weight, liquidationDiscount, minCollateralRatio);
  }

  function updateWeight(address asset, uint8 weight) external onlyRole(DEFAULT_ADMIN_ROLE) {
    AssetInfo storage assetInfo = assetInfos[asset];
    if (assetInfo.asset == address(0) || assetInfo.isRevoked) revert AssetNotAvaliable();

    totalWeight = totalWeight + weight - assetInfo.weight;
    assetInfo.weight = weight;
  }

  /**
   * @notice revoke asset
   * @param asset asset address
   */
  function revokeAsset(address asset) external onlyRole(DEFAULT_ADMIN_ROLE) {
    AssetInfo storage assetInfo = assetInfos[asset];
    if (assetInfo.asset == address(0) || assetInfo.isRevoked) revert AssetNotAvaliable();

    totalWeight = totalWeight - assetInfo.weight;
    assetInfo.weight = 0;
    assetInfo.isRevoked = true;

    (uint endPrice, ) = IPriceOracle(lookup(CONTRACT_PRICE_ORACLE)).queryAssetPrice(asset);
    ILending(lookup(CONTRACT_LENDING)).registerRevoke(asset, endPrice);
  }

  /**
   * @notice mint asset for lending
   * @param asset asset address
   * @param recipient recipient address
   * @param amount amount to mint
   */
  function mintAsset(
    address asset,
    address recipient,
    uint amount
  ) external onlyContract(CONTRACT_LENDING) {
    if (assetInfos[asset].asset == address(0) || assetInfos[asset].isRevoked)
      revert AssetNotAvaliable();
    IZAsset(asset).mint(recipient, amount);
  }

  /**
   * @notice burn asset for lending
   * @param asset asset address
   * @param from from address
   * @param amount amount to burn
   */
  function burnAsset(
    address asset,
    address from,
    uint amount
  ) external onlyContract(CONTRACT_LENDING) {
    if (assetInfos[asset].asset == address(0)) revert NotExistAsset(); // not check isRevoked here
    IZAsset(asset).burn(from, amount);
  }

  /**
   * @notice distribute sLP rewards to Staking according to the percentage allocated
   * by shortRewardWeight and the left to Treasury
   */
  function distribute() external onlyContract(CONTRACT_REWARD_DISTRIBUTOR) {
    if (lastDistributed + DISTRIBUTION_INTERVAL > block.timestamp) {
      emit Distribute(0, 0);
      return;
    }

    if (totalWeight == 0) revert NotAllowZero();

    uint currentTimestamp = block.timestamp;
    uint targetDistributionAmount;

    for (uint i = 0; i < distributionSchedule.length; i++) {
      DistributionSchedule memory s = distributionSchedule[i];
      if (s.startTime > currentTimestamp || s.endTime <= lastDistributed) continue;
      uint timeDuration = Math.min(s.endTime, currentTimestamp) -
        Math.max(s.startTime, lastDistributed);
      uint timeSlot = s.endTime - s.startTime;
      targetDistributionAmount += (s.distributionAmount * timeDuration) / timeSlot;
    }

    uint shortDistributionAmount;
    uint treasuryAmount;

    IStaking staking = IStaking(lookup(CONTRACT_STAKING));

    AssetInfo[] memory infos = _readAssetInfos();

    // adjust premium before calculating reward
    staking.adjustPremium(_assetList);

    Reward[] memory rewards = new Reward[](infos.length);
    for (uint i = 0; i < infos.length; i++) {
      uint amount = (targetDistributionAmount * infos[i].weight) / totalWeight;
      PoolInfo memory poolInfo = staking.queryPoolInfo(infos[i].asset);
      uint shortAmount = Decimal.toUint(Decimal.mulUint(poolInfo.shortRewardWeight, amount));
      shortDistributionAmount += shortAmount;
      treasuryAmount += amount - shortAmount;
      rewards[i] = Reward({ asset: infos[i].asset, amount: shortAmount });
    }

    lastDistributed = block.timestamp;

    address rewardDistributor = lookup(CONTRACT_REWARD_DISTRIBUTOR);
    address defiraliat = lookup(TOKEN_DefiraliaT);

    IERC20(defiraliat).safeTransferFrom(rewardDistributor, lookup(CONTRACT_TREASURY), treasuryAmount);
    IERC20(defiraliat).safeTransferFrom(
      rewardDistributor,
      lookup(CONTRACT_STAKING),
      shortDistributionAmount
    );
    staking.depositReward(rewards);

    emit Distribute(shortDistributionAmount, treasuryAmount);
  }

  function _readAssetInfos() internal view returns (AssetInfo[] memory infos) {
    infos = new AssetInfo[](_assetList.length);
    for (uint i = 0; i < _assetList.length; i++) infos[i] = assetInfos[_assetList[i]];
  }

  /**
   * @notice return all asset infos and last distribute timestamp
   */
  function queryDistributionInfo() external view returns (DistributionInfoResponse memory) {
    return
      DistributionInfoResponse({ assetInfos: _readAssetInfos(), lastDistributed: lastDistributed });
  }

  /**
   * @notice return all asset infos
   */
  function queryAssetInfos() external view returns (AssetInfo[] memory infos) {
    return _readAssetInfos();
  }
}
