// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./base/AddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IDexManager.sol";
import "./interfaces/IPriceOracle.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title Staking
 * @author Defiralia
 * @notice Contract for Short LP (sLP) Token Staking.
 * sLP Staking Rewards are determined by the premium which
 * is downward deviation of the pool price from the oracle price.
 */
contract Staking is IStaking, AddressHandler {
  using SafeERC20 for IERC20;

  /// @dev Interval at which premium can be updated
  uint internal _premiumMinUpdateInterval;

  /// @dev _poolInfos[asset] => PoolInfo
  mapping(address => PoolInfo) internal _poolInfos;
  /// @dev _shortRewardInfos[staker][asset] => RewardInfo
  mapping(address => mapping(address => RewardInfo)) internal _shortRewardInfos;

  function initialize(IAddressMap addressMap) public initializer {
    _premiumMinUpdateInterval = 60;
    __AddressHandler_init(addressMap);
  }

  function updateInterval(uint premiumMinUpdateInterval) external onlyRole(DEFAULT_ADMIN_ROLE) {
    if (premiumMinUpdateInterval == 0) revert InvalidPremiumMinUpdateInterval();
    _premiumMinUpdateInterval = premiumMinUpdateInterval;
    emit UpdateInterval(premiumMinUpdateInterval);
  }

  /**
   * @notice increase staking sLP token according to the amount of asset in short position
   * @param staker staker address
   * @param asset asset address
   * @param amount the increase amount of sLP staking
   */
  function increaseShortToken(
    address staker,
    address asset,
    uint amount
  ) external onlyContract(CONTRACT_LENDING) {
    PoolInfo storage poolInfo = _poolInfos[asset];
    RewardInfo storage rewardInfo = _shortRewardInfos[staker][asset];

    _beforeShareChange(poolInfo.rewardUnit, rewardInfo);

    poolInfo.totalShortAmount += amount;
    rewardInfo.bondAmount += amount;

    emit IncreaseShortToken(staker, asset, amount);
  }

  /**
   * @notice decrease staking sLP token according to the amount of asset in short position
   * @param staker staker address
   * @param asset asset address
   * @param amount the decrease amount of sLP staking
   */
  function decreaseShortToken(
    address staker,
    address asset,
    uint amount
  ) external onlyContract(CONTRACT_LENDING) {
    PoolInfo storage poolInfo = _poolInfos[asset];
    RewardInfo storage rewardInfo = _shortRewardInfos[staker][asset];
    // NOTE: This should not occur, but just in case
    if (rewardInfo.bondAmount < amount) amount = rewardInfo.bondAmount;

    _beforeShareChange(poolInfo.rewardUnit, rewardInfo);

    poolInfo.totalShortAmount -= amount;
    rewardInfo.bondAmount -= amount;

    emit DecreaseShortToken(staker, asset, amount);
  }

  /**
   * @notice register sLP rewards pool of newly listed asset
   * @param asset asset address
   */
  function registerPoolInfo(address asset) external onlyContract(CONTRACT_FACTORY) {
    PoolInfo storage poolInfo = _poolInfos[asset];
    if (poolInfo.asset != address(0)) revert ExistPoolInfo();

    poolInfo.asset = asset;

    emit RegisterPoolInfo(asset);
  }

  /**
   * @notice deposit rewards to each sLP rewards pools
   * @param rewards the infos of deposited amount for each pools
   */
  function depositReward(Reward[] memory rewards) external onlyContract(CONTRACT_FACTORY) {
    uint amount;
    for (uint i = 0; i < rewards.length; i++) {
      Reward memory reward = rewards[i];
      PoolInfo storage poolInfo = _poolInfos[reward.asset];

      uint shortReward = reward.amount;

      if (poolInfo.totalShortAmount == 0) {
        poolInfo.shortPendingReward += shortReward;
      } else {
        shortReward += poolInfo.shortPendingReward;
        decimal memory shortRewardPerBond = Decimal.fromRatio(
          shortReward,
          poolInfo.totalShortAmount
        );
        poolInfo.rewardUnit = Decimal.add(poolInfo.rewardUnit, shortRewardPerBond);
        poolInfo.shortPendingReward = 0;
      }

      amount += reward.amount;
    }

    emit DepositReward(amount);
  }

  /**
   * @notice withdraw sLP staking rewards
   * @param asset asset address
   */
  function withdrawReward(address asset) external {
    RewardInfo storage rewardInfo = _shortRewardInfos[msg.sender][asset];
    _beforeShareChange(_poolInfos[asset].rewardUnit, rewardInfo);

    uint amount = rewardInfo.pendingReward;
    rewardInfo.pendingReward = 0;

    IERC20(lookup(TOKEN_DefiraliaT)).safeTransfer(msg.sender, amount);

    emit WithdrawReward(asset, msg.sender, amount);
  }

  /**
   * @notice ajust premium by current pool price and oracle price. anyone can call this function
   * @dev if this is called within the interval, it will be just skipped
   * @param assetList target list of asset address to ajust premium
   */
  function adjustPremium(address[] memory assetList) external {
    for (uint i = 0; i < assetList.length; i++) {
      PoolInfo storage poolInfo = _poolInfos[assetList[i]];
      if (poolInfo.asset != address(0)) {
        if (block.timestamp < poolInfo.premiumUpdatedTime + _premiumMinUpdateInterval) continue;

        (decimal memory premiumRate, bool noPriceFeed) = _computePremiumRate(assetList[i]);
        decimal memory shortRewardWeight;
        {
          if (noPriceFeed) {
            shortRewardWeight = Decimal.zero();
          } else {
            shortRewardWeight = _computeShortRewardWeight(premiumRate);
          }
        }

        poolInfo.premiumRate = premiumRate;
        poolInfo.shortRewardWeight = shortRewardWeight;
        poolInfo.premiumUpdatedTime = block.timestamp;

        emit AdjustPremium(assetList[i], block.timestamp);
      }
    }
  }

  /**
   * @notice update reward info
   * @dev this should be called before the staking amount is changed
   * @param poolRewardUnit current pool reward per 1 sLP
   * @param rewardInfo the reward info to be updated
   */
  function _beforeShareChange(
    decimal memory poolRewardUnit,
    RewardInfo storage rewardInfo
  ) internal {
    uint pendingReward = Decimal.toUint(
      Decimal.mulUint(Decimal.sub(poolRewardUnit, rewardInfo.rewardUnit), rewardInfo.bondAmount)
    );
    rewardInfo.rewardUnit = poolRewardUnit;
    rewardInfo.pendingReward += pendingReward;
  }

  /**
   * @dev compute premium rate by current pool price and oracle price
   */
  function _computePremiumRate(address asset) private view returns (decimal memory, bool) {
    address base = lookup(TOKEN_BASE);
    bool isFlipped = base < asset;
    (address token0, address token1) = isFlipped ? (base, asset) : (asset, base);

    (uint price0, ) = IPriceOracle(lookup(CONTRACT_PRICE_ORACLE)).queryAssetPrice(token0);
    (uint price1, ) = IPriceOracle(lookup(CONTRACT_PRICE_ORACLE)).queryAssetPrice(token1);

    decimal memory oraclePrice = Decimal.fromRatio(price0, price1);
    decimal memory poolPrice = IDexManager(lookup(CONTRACT_DEX_MANAGER)).queryPoolPrice(asset);

    if (Decimal.isZero(oraclePrice)) {
      return (Decimal.zero(), true);
    } else if (isFlipped && Decimal.gt(oraclePrice, poolPrice)) {
      return (Decimal.div(Decimal.sub(oraclePrice, poolPrice), poolPrice), false);
    } else if (!isFlipped && Decimal.gt(poolPrice, oraclePrice)) {
      return (Decimal.div(Decimal.sub(poolPrice, oraclePrice), oraclePrice), false);
    } else {
      return (Decimal.zero(), false);
    }
  }

  /**
   * @dev compute short reward weight by premium rate
   * @param premiumRate premium rate (e.g. 5% => 50 * 10**18)
   */
  function _computeShortRewardWeight(
    decimal memory premiumRate
  ) internal pure returns (decimal memory) {
    if (Decimal.gt(premiumRate, Decimal.permilleToDecimal(70))) {
      return Decimal.permilleToDecimal(1000);
    }

    decimal memory two = Decimal.mulUint(Decimal.one(), 2);
    decimal memory sqrtTwo = Decimal.fromRatio(14_142_135_624, 10_000_000_000);

    bool isPlus;
    decimal memory x;
    decimal memory p = Decimal.mulUint(premiumRate, 100);
    if (Decimal.gt(p, two)) {
      isPlus = true;
      x = Decimal.div(Decimal.sub(p, two), sqrtTwo);
    } else {
      isPlus = false;
      x = Decimal.div(Decimal.sub(two, p), sqrtTwo);
    }

    decimal memory shortRewardWeight = Decimal.div(
      Decimal.erfPlusOne(isPlus, x),
      Decimal.fromRatio(2, 1)
    );

    return shortRewardWeight;
  }

  function queryPoolInfo(address asset) external view returns (PoolInfo memory) {
    return _poolInfos[asset];
  }

  /**
   * @notice return reward info
   * @dev this is usually called with staticcall
   */
  function updateRewardInfo(
    address staker,
    address asset
  ) public returns (RewardInfoResponseItem memory) {
    PoolInfo memory poolInfo = _poolInfos[asset];
    RewardInfo storage rewardInfo = _shortRewardInfos[staker][asset];
    if (rewardInfo.bondAmount == 0 && rewardInfo.pendingReward == 0)
      return RewardInfoResponseItem(address(0), 0, 0);

    _beforeShareChange(poolInfo.rewardUnit, rewardInfo);

    return RewardInfoResponseItem(asset, rewardInfo.bondAmount, rewardInfo.pendingReward);
  }

  /**
   * @notice return all reward infos by a staker
   * @dev this is usually called with staticcall
   */
  function updateUserRewardInfos(
    address staker
  ) external returns (RewardInfoResponseItem[] memory rewardInfos) {
    address factory = lookup(CONTRACT_FACTORY);
    AssetInfo[] memory assetInfos = IFactory(factory).queryAssetInfos();

    rewardInfos = new RewardInfoResponseItem[](assetInfos.length);
    for (uint i = 0; i < assetInfos.length; i++) {
      rewardInfos[i] = updateRewardInfo(staker, assetInfos[i].asset);
    }
  }
}
