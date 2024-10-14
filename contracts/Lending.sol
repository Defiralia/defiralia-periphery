// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./base/AddressHandler.sol";
import "./interfaces/IAddressHandler.sol";
import "./interfaces/IAddressMap.sol";
import "./interfaces/ILending.sol";
import "./interfaces/IFactory.sol";
import "./interfaces/IStaking.sol";
import "./interfaces/ICollateralManager.sol";
import "./interfaces/IPriceOracle.sol";
import "./interfaces/ICollateralOracle.sol";
import "./interfaces/IDexManager.sol";
import "./logics/PositionLogic.sol";
import "./libraries/Constant.sol";
import "./libraries/Error.sol";

/**
 * @title Lending
 * @author Defiralia
 * @notice Core Contract for CDP Operations
 * Users can create two kinds of position, long and short.
 * In Short position, minted assets are exchanged to base tokens at dex and return base tokens to user.
 */
contract Lending is ILending, AddressHandler, PausableUpgradeable, ReentrancyGuardUpgradeable {
  /// @notice unique id for each position
  /// @dev this keeps next position index
  uint public positionIndex;
  /// @notice fee rate collected by protocol according to burn value
  uint32 public protocolFeeRate;
  /// @dev ref to receiver in AddressMap
  uint32 public feeReciverRole;

  /// @dev assetConfigs[asset] => AssetConfig
  mapping(address => AssetConfig) public assetConfigs;
  /// @dev _positions[positionIndex] => Position
  mapping(uint => Position) internal _positions;
  /// @dev _userPositionList[user] => positionIndex[]
  mapping(address => uint[]) internal _userPositionList;
  /// @dev _isPositionExist[user][asset][collateral] => User has a given pair of long position or not
  mapping(address => mapping(address => mapping(address => bool))) internal _isPositionExist;
  /// @dev _isShortPositionExist[user][asset][collateral] => User has a given pair of short position or not
  mapping(address => mapping(address => mapping(address => bool))) internal _isShortPositionExist;

  /**
   * @dev Modifier to check for position owner
   */
  modifier onlyPositionOwner(uint index) {
    _checkPositionOwner(index);
    _;
  }

  function _checkPositionOwner(uint index) private view {
    if (_positions[index].owner != msg.sender) revert OnlyPositionOwner();
  }

  function initialize(IAddressMap addressMap) public initializer {
    positionIndex = 1;
    protocolFeeRate = 15;
    feeReciverRole = CONTRACT_TREASURY;
    __Pausable_init();
    __ReentrancyGuard_init();
    __AddressHandler_init(addressMap);

    _grantRole(ROLE_PAUSER, msg.sender);
  }

  /**
   * @notice register asset to Lending contract and set asset config
   * @param asset asset address
   * @param liquidationDiscount discount rate for liquidation
   * @param minCollateralRatio minimum collateral ratio for CDP
   */
  function registerAsset(
    address asset,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) external onlyContract(CONTRACT_FACTORY) {
    if (liquidationDiscount >= MAX_LIQUIDATION_DISCOUNT) revert ExceedLimitLiquidationDiscount();
    if (
      minCollateralRatio <= MINIMUM_MIN_COLLATERAL_RATIO ||
      MAX_MIN_COLLATERAL_RATIO <= minCollateralRatio
    ) revert InvalidMinCollateralRatio();
    if (assetConfigs[asset].asset != address(0)) revert ExistAssetConfig();

    assetConfigs[asset] = AssetConfig({
      asset: asset,
      liquidationDiscount: liquidationDiscount,
      minCollateralRatio: minCollateralRatio,
      endPrice: 0,
      isSuspended: false
    });
  }

  /**
   * @notice revoke asset and change asset config
   * @param asset asset address
   * @param endPrice fixed price after revoke
   */
  function registerRevoke(address asset, uint endPrice) external onlyContract(CONTRACT_FACTORY) {
    AssetConfig storage assetConfig = assetConfigs[asset];
    if (assetConfig.asset == address(0)) return;
    assetConfig.minCollateralRatio = PERMILLE;
    assetConfig.endPrice = endPrice;
  }

  /**
   * @dev pause CDP operations
   */
  function pause() public onlyRole(ROLE_PAUSER) nonReentrant {
    _pause();
  }

  /**
   * @dev unpause CDP operations
   */
  function unpause() public onlyRole(ROLE_PAUSER) nonReentrant {
    _unpause();
  }

  function setFeeReciverRole(uint32 id) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
    lookup(id);
    feeReciverRole = id;
    emit SetFeeReciverRole(id);
  }

  function updateProtocolFee(
    uint32 protocolFee
  ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
    if (protocolFee > MAX_PROTOCOL_FEE) revert ExceedMaxProtocolFee();
    protocolFeeRate = protocolFee;
    emit UpdateProtocolFee(protocolFee);
  }

  /**
   * @dev update asset config
   * @param asset asset address
   * @param liquidationDiscount discount rate for liquidation
   * @param minCollateralRatio minimum collateral ratio for CDP
   */
  function updateAsset(
    address asset,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
    if (liquidationDiscount >= MAX_LIQUIDATION_DISCOUNT) revert ExceedLimitLiquidationDiscount();
    if (
      minCollateralRatio <= MINIMUM_MIN_COLLATERAL_RATIO ||
      MAX_MIN_COLLATERAL_RATIO <= minCollateralRatio
    ) revert InvalidMinCollateralRatio();

    AssetConfig storage assetConfig = assetConfigs[asset];
    if (assetConfig.asset == address(0)) revert NoAssetRegistered();
    assetConfig.liquidationDiscount = liquidationDiscount;
    assetConfig.minCollateralRatio = minCollateralRatio;

    emit UpdateAsset(asset, liquidationDiscount, minCollateralRatio);
  }

  /**
   * @dev suspend asset
   * @param asset asset address
   */
  function suspendAsset(address asset) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
    AssetConfig memory assetConfig = assetConfigs[asset];
    if (assetConfig.asset == address(0) || assetConfig.isSuspended) return;
    assetConfig.isSuspended = true;
    assetConfigs[asset] = assetConfig;

    emit SuspendAsset(asset);
  }

  /**
   * @dev unsuspend asset
   * @param asset asset address
   */
  function unsuspendAsset(address asset) external onlyRole(DEFAULT_ADMIN_ROLE) nonReentrant {
    AssetConfig memory assetConfig = assetConfigs[asset];
    if (assetConfig.asset == address(0) || !assetConfig.isSuspended) return;
    assetConfig.isSuspended = false;
    assetConfigs[asset] = assetConfig;

    emit UnsuspendAsset(asset);
  }

  /**
   * @notice create new position
   * @notice user can create only one position for each pair and long/short
   * @param asset asset address
   * @param collateral collateral address
   * @param collateralAmount collateral amount
   * @param collateralRatio collateral ratio specified by user for new position
   * @param shortParams params for short swap
   */
  function openPosition(
    address asset,
    address collateral,
    uint collateralAmount,
    uint32 collateralRatio,
    ShortParams memory shortParams
  ) external whenNotPaused nonReentrant {
    // Only can create one same asset and same kind of position at the same time
    if (
      shortParams.isShort
        ? _isShortPositionExist[msg.sender][asset][collateral]
        : _isPositionExist[msg.sender][asset][collateral]
    ) revert ExistSameAssetPosition();

    AssetConfig memory assetConfig = assetConfigs[asset];

    uint mintAmount = PositionLogic.openPositionLogic(
      OpenPositionParams(
        asset,
        collateral,
        collateralAmount,
        collateralRatio,
        shortParams,
        assetConfig
      ),
      IAddressHandler(address(this))
    );

    _createPosition(
      Position({
        index: positionIndex,
        owner: msg.sender,
        asset: asset,
        assetAmount: mintAmount,
        collateral: collateral,
        collateralAmount: collateralAmount,
        isShort: shortParams.isShort,
        isClosed: false,
        liquidatedAmount: 0
      })
    );

    emit OpenPosition(
      positionIndex,
      msg.sender,
      asset,
      mintAmount,
      collateral,
      collateralAmount,
      collateralRatio,
      shortParams.isShort
    );

    unchecked {
      positionIndex += 1;
    }
  }

  /**
   * @notice deposit collateral to owned position
   * @param index position index
   * @param collateral collateral address
   * @param collateralAmount collateral amount to deposit
   */
  function deposit(
    uint index,
    address collateral,
    uint collateralAmount
  ) public onlyPositionOwner(index) whenNotPaused nonReentrant {
    Position storage position = _positions[index];
    AssetConfig memory assetConfig = assetConfigs[position.asset];

    PositionLogic.depositLogic(
      position,
      DepositParams(collateral, collateralAmount, assetConfig),
      IAddressHandler(address(this))
    );

    emit Deposit(index, collateral, collateralAmount);
  }

  /**
   * @notice withdraw collateral from owned position
   * @dev if user tries to withdraw over amount of collateral, all collaterals are withdrawn
   * @param index position index
   * @param collateral collateral address
   * @param collateralAmount collateral amount to withdraw
   */
  function withdraw(
    uint index,
    address collateral,
    uint collateralAmount
  ) public onlyPositionOwner(index) whenNotPaused nonReentrant {
    Position storage position = _positions[index];
    AssetConfig memory assetConfig = assetConfigs[position.asset];

    uint withdrawAmount = PositionLogic.withdrawLogic(
      position,
      WithdrawParams(collateral, collateralAmount, assetConfig),
      IAddressHandler(address(this))
    );

    if (position.collateralAmount == 0 && position.assetAmount == 0) _closePosition(index);

    emit Withdraw(index, collateral, withdrawAmount);
  }

  /**
   * @notice mint asset to owned position
   * @param index position index
   * @param asset asset address
   * @param assetAmount asset amount to mint
   * @param shortParams params for short swap
   */
  function mint(
    uint index,
    address asset,
    uint assetAmount,
    ShortParams memory shortParams
  ) public onlyPositionOwner(index) whenNotPaused nonReentrant {
    Position storage position = _positions[index];
    AssetConfig memory assetConfig = assetConfigs[position.asset];

    PositionLogic.mintLogic(
      position,
      MintParams(asset, assetAmount, shortParams, assetConfig),
      IAddressHandler(address(this))
    );

    emit Mint(index, asset, assetAmount);
  }

  /**
   * @notice burn asset to from position. protocol fee is collected according to burn value
   * @notice anyone can call this function for revoked position
   * @dev if user tries to burn over amount of asset, all assets are burned
   * @param asset asset address
   * @param assetAmount asset amount to burn
   */
  function burn(uint index, address asset, uint assetAmount) public whenNotPaused nonReentrant {
    Position storage position = _positions[index];
    AssetConfig memory assetConfig = assetConfigs[position.asset];

    uint burnAmount = PositionLogic.burnLogic(
      position,
      BurnParams(asset, assetAmount, assetConfig, protocolFeeRate, feeReciverRole),
      IAddressHandler(address(this))
    );

    if (position.collateralAmount == 0 && position.assetAmount == 0) _closePosition(index);

    emit Burn(index, asset, burnAmount);
  }

  /**
   * @notice call deposit and mint sequentially
   * @param index position index
   * @param asset asset address
   * @param assetAmount asset amount to mint
   * @param collateral collateral address
   * @param collateralAmount collateral amount to deposit
   */
  function depositAndMint(
    uint index,
    address asset,
    uint assetAmount,
    address collateral,
    uint collateralAmount,
    ShortParams memory shortParams
  ) external {
    deposit(index, collateral, collateralAmount);
    mint(index, asset, assetAmount, shortParams);
  }

  /**
   * @notice call burn and withdraw sequentially
   * @dev Since this is thought to be called by owner, it might be reverted
   *      if other users call this function for revoked asset position and close it
   * @param index position index
   * @param asset asset address
   * @param assetAmount asset amount to burn
   * @param collateral collateral address
   * @param collateralAmount collateral amount to withdraw
   */
  function burnAndWithdraw(
    uint index,
    address asset,
    uint assetAmount,
    address collateral,
    uint collateralAmount
  ) external {
    burn(index, asset, assetAmount);
    withdraw(index, collateral, collateralAmount);
  }

  /**
   * @notice anyone can liquidate positions below the required collateral rate
   * @dev if all assets are liquidated, the position is closed and left collaterals are refunded to owner
   * @param index position index
   * @param asset asset address
   * @param assetAmount asset amount prepared for liquidation
   */
  function liquidation(
    uint index,
    address asset,
    uint assetAmount
  ) external whenNotPaused nonReentrant {
    Position storage position = _positions[index];
    AssetConfig memory assetConfig = assetConfigs[asset];

    (uint liquidateAmount, uint withdrawAmount) = PositionLogic.liquidationLogic(
      position,
      LiquidateParams(asset, assetAmount, assetConfig, protocolFeeRate, feeReciverRole),
      IAddressHandler(address(this))
    );

    if (position.assetAmount == 0 || position.collateralAmount == 0) _closePosition(index);
    // position.collateralAmount == 0 & position.assetAmount > 0 will happen
    // when asset value become larger than discounted collateral value
    // In this case, position.assetAmount become outstanding

    emit Liquidation(index, liquidateAmount, withdrawAmount);
  }

  /**
   * @dev create new position
   */
  function _createPosition(Position memory position) internal {
    if (_positions[position.index].index != 0) revert ExistPosition();
    _positions[position.index] = position;
    _userPositionList[position.owner].push(position.index);
    if (position.isShort)
      _isShortPositionExist[position.owner][position.asset][position.collateral] = true;
    else _isPositionExist[position.owner][position.asset][position.collateral] = true;
  }

  /**
   * @dev close position
   */
  function _closePosition(uint index) private {
    Position storage position = _positions[index];

    if (position.isShort)
      delete _isShortPositionExist[position.owner][position.asset][position.collateral];
    else delete _isPositionExist[position.owner][position.asset][position.collateral];

    position.isClosed = true;
  }

  /**
   * @notice return only owened position. if not, return empty position
   */
  function queryPosition(uint index) external view returns (Position memory res) {
    if (_positions[index].owner == msg.sender) res = _positions[index];
  }

  /**
   * @notice return all positions
   */
  function queryPositions() external view returns (Position[] memory) {
    Position[] memory res = new Position[](positionIndex - 1);
    for (uint i = 0; i < positionIndex - 1; i++) {
      Position memory position = _positions[i + 1];
      res[i] = position;
    }
    return res;
  }

  /**
   * @notice return all positions owned by a owner
   */
  function queryUserPositions(address owner) external view returns (Position[] memory) {
    uint[] memory indexs = _userPositionList[owner];
    Position[] memory res = new Position[](indexs.length);
    for (uint i = 0; i < indexs.length; i++) {
      Position memory position = _positions[indexs[i]];
      if (position.owner != msg.sender) return new Position[](0);
      res[i] = position;
    }
    return res;
  }
}
