// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../libraries/Struct.sol";
import "../libraries/Constant.sol";
import "../libraries/Error.sol";
import "../libraries/MathUtils.sol";
import "../libraries/Decimal.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";

import "../interfaces/IFactory.sol";
import "../interfaces/ILending.sol";
import "../interfaces/IStaking.sol";
import "../interfaces/ICollateralManager.sol";
import "../interfaces/IPriceOracle.sol";
import "../interfaces/ICollateralOracle.sol";
import "../interfaces/IDexManager.sol";
import "../interfaces/IAddressHandler.sol";

/**
 * @title PositionLogic
 * @author Defiralia
 * @notice Library to execute CDP related logics
 */
library PositionLogic {
  using SafeERC20 for IERC20;
  using MathUtils for uint;
  using Decimal for decimal;

  /**
   * @notice logic for openPosition
   * @param params paramerters needed to execute openPosition
   * @param addressHandler AddressHandler address
   */
  function openPositionLogic(
    OpenPositionParams memory params,
    IAddressHandler addressHandler
  ) public returns (uint mintAmount) {
    if (params.collateralAmount == 0) revert AmountNotAllowZero();
    if (params.assetConfig.asset == address(0)) revert NoAssetRegistered();
    if (params.assetConfig.endPrice > 0 || params.assetConfig.isSuspended)
      revert AssetNotAvailable();
    uint collateralPrice;
    uint32 multiplier;
    {
      CollateralPriceInfo memory info = ICollateralOracle(
        addressHandler.lookup(CONTRACT_COLLATERAL_ORACLE)
      ).queryCollateralPrice(params.collateral);
      if (info.isRevoked || info.isSuspended) revert CollateralNotAvailable();
      collateralPrice = info.price;
      multiplier = info.multiplier;
    }
    // check collateral ratio
    if (params.collateralRatio * PERMILLE < params.assetConfig.minCollateralRatio * multiplier)
      revert InvalidCollateralRatio();
    (uint assetPrice, ) = IPriceOracle(addressHandler.lookup(CONTRACT_PRICE_ORACLE))
      .queryAssetPrice(params.asset);
    {
      uint8 assetDecimals = IERC20Metadata(params.asset).decimals();
      uint8 collateralDecimals = IERC20Metadata(params.collateral).decimals();
      mintAmount = uint(params.collateralAmount)
        .calcAmount(collateralPrice, assetDecimals, assetPrice, collateralDecimals)
        .divPermille(params.collateralRatio);
    }
    ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).increaseCollateral(
      params.collateral,
      params.collateralAmount,
      msg.sender
    );
    if (params.shortParams.isShort) {
      address dexManager = addressHandler.lookup(CONTRACT_DEX_MANAGER);
      IFactory(addressHandler.lookup(CONTRACT_FACTORY)).mintAsset(
        params.asset,
        dexManager,
        mintAmount
      );
      IDexManager(dexManager).shortSwap(params.asset, msg.sender, mintAmount, params.shortParams);
      IStaking(addressHandler.lookup(CONTRACT_STAKING)).increaseShortToken(
        msg.sender,
        params.asset,
        mintAmount
      );
    } else {
      IFactory(addressHandler.lookup(CONTRACT_FACTORY)).mintAsset(
        params.asset,
        msg.sender,
        mintAmount
      );
    }
  }

  /**
   * @notice logic for deposit
   * @param position position to deposit
   * @param params paramerters needed to execute deposit
   * @param addressHandler AddressHandler address
   */
  function depositLogic(
    Position storage position,
    DepositParams memory params,
    IAddressHandler addressHandler
  ) public {
    if (position.isClosed) revert PositionClosed();
    if (position.collateral != params.collateral) revert WrongCollateral();
    if (params.collateralAmount == 0) revert AmountNotAllowZero();
    if (params.assetConfig.endPrice > 0 || params.assetConfig.isSuspended)
      revert AssetNotAvailable();

    CollateralConfig memory info = ICollateralOracle(
      addressHandler.lookup(CONTRACT_COLLATERAL_ORACLE)
    ).queryCollateralInfo(params.collateral);
    if (info.isRevoked || info.isSuspended) revert CollateralNotAvailable();

    position.collateralAmount += params.collateralAmount;

    ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).increaseCollateral(
      params.collateral,
      params.collateralAmount,
      msg.sender
    );
  }

  /**
   * @notice logic for withdraw
   * @param position position to withdraw
   * @param params paramerters needed to execute withdraw
   * @param addressHandler AddressHandler address
   */
  function withdrawLogic(
    Position storage position,
    WithdrawParams memory params,
    IAddressHandler addressHandler
  ) public returns (uint withdrawAmount) {
    if (position.isClosed) revert PositionClosed();
    if (position.collateral != params.collateral) revert WrongCollateral();
    if (params.collateralAmount == 0) revert AmountNotAllowZero();

    (uint assetPrice, ) = IPriceOracle(addressHandler.lookup(CONTRACT_PRICE_ORACLE))
      .queryAssetPrice(position.asset);

    uint collateralPrice;
    uint32 multiplier;
    {
      CollateralPriceInfo memory info = ICollateralOracle(
        addressHandler.lookup(CONTRACT_COLLATERAL_ORACLE)
      ).queryCollateralPrice(params.collateral);
      collateralPrice = info.price;
      multiplier = info.multiplier;
    }

    // If asset is revoked, no need to care about volatility
    if (params.assetConfig.endPrice > 0) multiplier = PERMILLE;

    // If exceeds position amount, wihtdraw max amount
    withdrawAmount = params.collateralAmount > position.collateralAmount
      ? position.collateralAmount
      : params.collateralAmount;

    uint leftCollateralAmount = position.collateralAmount - withdrawAmount;

    // check collateral ratio
    {
      uint8 assetDecimals = IERC20Metadata(position.asset).decimals();
      uint8 collateralDecimals = IERC20Metadata(params.collateral).decimals();
      uint minCollateralAmount = uint(position.assetAmount)
        .calcAmount(assetPrice, collateralDecimals, collateralPrice, assetDecimals)
        .mulPerMillion(multiplier, params.assetConfig.minCollateralRatio);

      if (minCollateralAmount > leftCollateralAmount) revert InvalidCollateralRatio();
    }

    position.collateralAmount = leftCollateralAmount;

    ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
      params.collateral,
      withdrawAmount,
      position.owner,
      msg.sender
    );
  }

  /**
   * @notice logic for mint
   * @param position position to mint
   * @param params paramerters needed to execute mint
   * @param addressHandler AddressHandler address
   */
  function mintLogic(
    Position storage position,
    MintParams memory params,
    IAddressHandler addressHandler
  ) public {
    if (position.isClosed) revert PositionClosed();
    if (position.asset != params.asset) revert WrongAsset();
    if (params.assetAmount == 0) revert AmountNotAllowZero();
    if (position.isShort != params.shortParams.isShort) revert InvalidShortParams();
    if (params.assetConfig.endPrice > 0 || params.assetConfig.isSuspended)
      revert AssetNotAvailable();

    uint collateralPrice;
    uint32 multiplier;
    {
      CollateralPriceInfo memory info = ICollateralOracle(
        addressHandler.lookup(CONTRACT_COLLATERAL_ORACLE)
      ).queryCollateralPrice(position.collateral);
      if (info.isRevoked || info.isSuspended) revert CollateralNotAvailable();
      collateralPrice = info.price;
      multiplier = info.multiplier;
    }

    // check collateral ratio
    {
      (uint assetPrice, ) = IPriceOracle(addressHandler.lookup(CONTRACT_PRICE_ORACLE))
        .queryAssetPrice(params.asset);
      uint8 assetDecimals = IERC20Metadata(params.asset).decimals();
      uint8 collateralDecimals = IERC20Metadata(position.collateral).decimals();
      if (
        assetPrice *
          (params.assetAmount + position.assetAmount) *
          10 ** collateralDecimals *
          multiplier *
          params.assetConfig.minCollateralRatio >
        collateralPrice * position.collateralAmount * 10 ** assetDecimals * PER_MILLION
      ) revert InvalidCollateralRatio();
    }

    position.assetAmount += params.assetAmount;

    if (params.shortParams.isShort) {
      address dexManager = addressHandler.lookup(CONTRACT_DEX_MANAGER);
      IFactory(addressHandler.lookup(CONTRACT_FACTORY)).mintAsset(
        position.asset,
        dexManager,
        params.assetAmount
      );
      IDexManager(dexManager).shortSwap(
        params.asset,
        msg.sender,
        params.assetAmount,
        params.shortParams
      );
      IStaking(addressHandler.lookup(CONTRACT_STAKING)).increaseShortToken(
        msg.sender,
        params.asset,
        params.assetAmount
      );
    } else {
      IFactory(addressHandler.lookup(CONTRACT_FACTORY)).mintAsset(
        position.asset,
        msg.sender,
        params.assetAmount
      );
    }
  }

  /**
   * @notice logic for burn
   * @param position position to burn
   * @param params paramerters needed to execute burn
   * @param addressHandler AddressHandler address
   */
  function burnLogic(
    Position storage position,
    BurnParams memory params,
    IAddressHandler addressHandler
  ) public returns (uint burnAmount) {
    if (params.assetAmount == 0) revert AmountNotAllowZero();
    if (position.isClosed) revert PositionClosed();
    if (position.asset != params.asset) revert WrongAsset();

    // If exceeds position amount, burn max amount
    burnAmount = params.assetAmount > position.assetAmount
      ? position.assetAmount
      : params.assetAmount;

    uint collateralPrice;
    {
      CollateralPriceInfo memory info = ICollateralOracle(
        addressHandler.lookup(CONTRACT_COLLATERAL_ORACLE)
      ).queryCollateralPrice(position.collateral);
      collateralPrice = info.price;
    }

    uint8 assetDecimals = IERC20Metadata(params.asset).decimals();
    uint8 collateralDecimals = IERC20Metadata(position.collateral).decimals();

    uint protocolFee;
    if (params.assetConfig.endPrice > 0) {
      // If asset is revoked, anyone can redeem whosever positions
      // Executers receive collateral deducting protocol fees corresponding to burn amount

      // Calcurate conversionRate within amount ratio to prevent convert over collateral value
      decimal memory conversionRate = Decimal.min(
        Decimal.fromRatio(
          position.collateralAmount * 10 ** assetDecimals,
          position.assetAmount * 10 ** collateralDecimals
        ),
        Decimal.fromRatio(params.assetConfig.endPrice, collateralPrice)
      );
      uint withdrawAmount = Decimal.toUint(
        conversionRate.mulDivUint(burnAmount * 10 ** collateralDecimals, 10 ** assetDecimals)
      );

      unchecked {
        position.assetAmount -= burnAmount;
        position.collateralAmount -= withdrawAmount;
      }

      protocolFee = burnAmount
        .calcAmount(params.assetConfig.endPrice, collateralDecimals, collateralPrice, assetDecimals)
        .mulPermille(params.protocolFeeRate);

      uint userRefund = withdrawAmount - protocolFee;
      ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
        position.collateral,
        userRefund,
        position.owner,
        msg.sender // To executer, not to owner
      );
    } else {
      // If asset is not revoked, olny owner can burn
      // To receive collateral, need to separately execute withdraw function

      if (position.owner != msg.sender) revert OnlyPositionOwner();

      unchecked {
        position.assetAmount -= burnAmount;
      }

      (uint assetPrice, ) = IPriceOracle(addressHandler.lookup(CONTRACT_PRICE_ORACLE))
        .queryAssetPrice(params.asset);

      protocolFee = burnAmount
        .calcAmount(assetPrice, collateralDecimals, collateralPrice, assetDecimals)
        .mulPermille(params.protocolFeeRate);

      position.collateralAmount -= protocolFee;
    }

    if (protocolFee > 0) {
      ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
        position.collateral,
        protocolFee,
        position.owner,
        addressHandler.lookup(params.feeReciverRole)
      );
    }

    if (position.isShort)
      IStaking(addressHandler.lookup(CONTRACT_STAKING)).decreaseShortToken(
        msg.sender,
        position.asset,
        burnAmount
      );

    IFactory(addressHandler.lookup(CONTRACT_FACTORY)).burnAsset(
      position.asset,
      msg.sender,
      burnAmount
    );
  }

  /**
   * @notice logic for close
   * @param position position to close
   * @param params paramerters needed to execute close
   * @param addressHandler AddressHandler address
   * @return liquidateAmount asset amount to liquidate
   * @return withdrawCollateralAmount collateral amount to withdraw
   */
  function liquidationLogic(
    Position storage position,
    LiquidateParams memory params,
    IAddressHandler addressHandler
  )
    public
    returns (
      uint liquidateAmount, // asset amount to liquidate from position
      uint withdrawCollateralAmount // collateral amount to withdraw from position
    )
  {
    if (position.isClosed) revert PositionClosed();
    if (position.asset != params.asset) revert WrongAsset();
    if (params.assetAmount == 0) revert AmountNotAllowZero();
    if (params.assetConfig.endPrice > 0 || params.assetConfig.isSuspended)
      revert AssetNotAvailable();

    uint8 assetDecimals = IERC20Metadata(params.asset).decimals();
    uint8 collateralDecimals = IERC20Metadata(position.collateral).decimals();
    (uint assetPrice, ) = IPriceOracle(addressHandler.lookup(CONTRACT_PRICE_ORACLE))
      .queryAssetPrice(params.asset);
    uint collateralPrice;
    {
      CollateralPriceInfo memory info = ICollateralOracle(
        addressHandler.lookup(CONTRACT_COLLATERAL_ORACLE)
      ).queryCollateralPrice(position.collateral);
      collateralPrice = info.price;

      if (info.isRevoked || info.isSuspended) revert CollateralNotAvailable();
      if (
        assetPrice *
          position.assetAmount *
          10 ** collateralDecimals *
          params.assetConfig.minCollateralRatio *
          info.multiplier <
        collateralPrice * position.collateralAmount * 10 ** assetDecimals * PER_MILLION
      ) revert LiquidateSafePosition();
    }

    {
      // Liquidate amount is up to position amount
      uint tempLiquidateAmount = params.assetAmount > position.assetAmount
        ? position.assetAmount
        : params.assetAmount;

      // Calculate discounted price by below formula
      uint32 discount = uint32(
        MathUtils.min(
          params.assetConfig.liquidationDiscount,
          params.assetConfig.minCollateralRatio - PERMILLE
        )
      );

      // Calcurate max withdraw amount
      uint tempWithdrawAmonut = uint(tempLiquidateAmount)
        .calcAmount(assetPrice, collateralDecimals, collateralPrice, assetDecimals)
        .divPermille(PERMILLE - discount);

      (liquidateAmount, withdrawCollateralAmount) = tempWithdrawAmonut <= position.collateralAmount
        ? (tempLiquidateAmount, tempWithdrawAmonut)
        : (
          MathUtils.min(
            uint(position.collateralAmount)
              .calcAmount(collateralPrice, assetDecimals, assetPrice, collateralDecimals)
              .mulPermille(PERMILLE - discount),
            tempLiquidateAmount // Guarantee not to exceed maximum
          ),
          position.collateralAmount
        );
    }

    // scope to avoid stack too deep error
    {
      // Update position
      uint leftAssetAmount = position.assetAmount - liquidateAmount;
      uint leftCollateralAmount = position.collateralAmount - withdrawCollateralAmount;
      position.liquidatedAmount += liquidateAmount;
      position.assetAmount = leftAssetAmount;
      position.collateralAmount = leftCollateralAmount;

      // Burn asset (& sLP if short)
      IFactory(addressHandler.lookup(CONTRACT_FACTORY)).burnAsset(
        params.asset,
        msg.sender,
        liquidateAmount
      );
      if (position.isShort) {
        IStaking(addressHandler.lookup(CONTRACT_STAKING)).decreaseShortToken(
          position.owner,
          params.asset,
          liquidateAmount
        );
      }

      // If left collateral, refund to owner
      if (leftCollateralAmount > 0 && leftAssetAmount == 0) {
        position.collateralAmount = 0;
        ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
          position.collateral,
          leftCollateralAmount,
          position.owner,
          position.owner
        );
      }
    }

    // Calcurate protocolFee based on liquidated(burned) aseet value, not withdrawn collateral value
    uint protocolFee = liquidateAmount
      .calcAmount(assetPrice, collateralDecimals, collateralPrice, assetDecimals)
      .mulPermille(params.protocolFeeRate);

    if (protocolFee > 0) {
      ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
        position.collateral,
        protocolFee,
        position.owner,
        addressHandler.lookup(params.feeReciverRole)
      );
    }

    uint returnCollateralAmount = withdrawCollateralAmount - protocolFee;

    // return collateral to liquidator
    ICollateralManager(addressHandler.lookup(CONTRACT_COLLATERAL_MANAGER)).decreaseCollateral(
      position.collateral,
      returnCollateralAmount,
      position.owner,
      msg.sender
    );
  }
}
