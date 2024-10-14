// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

import "../Factory.sol";
import "../mocks/tokens/ZAssetMock.sol";

contract FactoryTest is Factory {
  function initializeTest(IAddressMap addressMap) public initializer {
    totalWeight = 0;
    lastDistributed = block.timestamp;

    __AddressHandler_init(addressMap);
  }

  function createAssetTest(
    string memory name,
    string memory symbol
  ) external onlyRole(DEFAULT_ADMIN_ROLE) returns (address asset) {
    asset = address(new ZAssetMock(name, symbol));
    require(asset != address(0), "Asset is not deployed");
    _deployedByFactory[asset] = true;
    emit CreateAsset(asset, name, symbol);

    return address(asset);
  }

  function setTotalWeight(uint weight) external {
    totalWeight = weight;
  }

  function getAssetInfo(address asset) external view returns (AssetInfo memory) {
    return assetInfos[asset];
  }

  function getAssetList() external view returns (address[] memory asset) {
    return _assetList;
  }

  // ----- For onlyContract(CONTRACT_FACTORY) Test -----
  function mintAssetTest(address asset, address recipient, uint amount) public {
    IZAsset(asset).mint(recipient, amount);
  }

  function burnAssetTest(address asset, address from, uint amount) public {
    IZAsset(asset).burn(from, amount);
  }

  function registerAssetTest(
    address asset,
    uint32 liquidationDiscount,
    uint32 minCollateralRatio
  ) public {
    ILending(lookup(CONTRACT_LENDING)).registerAsset(
      asset,
      liquidationDiscount,
      minCollateralRatio
    );
  }

  function registerRevokeTest(address asset, uint endPrice) public {
    ILending(lookup(CONTRACT_LENDING)).registerRevoke(asset, endPrice);
  }
  // ----------------------------
}
