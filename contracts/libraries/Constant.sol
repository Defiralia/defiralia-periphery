// SPDX-License-Identifier: AGPL-3.0
pragma solidity ^0.8.17;

// ========== SYSTEM ==========

uint32 constant PERMILLE = 1_000;
uint32 constant PER_MILLION = 1_000_000;

uint32 constant DEFAULT_TIME_WEIGHT = 600;
uint constant DEFAULT_DEADLINE = 300;
uint constant DISTRIBUTION_INTERVAL = 60;
uint32 constant MAX_PROTOCOL_FEE = 100;

uint32 constant MINIMUM_MIN_COLLATERAL_RATIO = 1100;
uint32 constant MINIMUM_MULTIPLIER = 1000;

uint32 constant MAX_MIN_COLLATERAL_RATIO = 2000;
uint32 constant MAX_LIQUIDATION_DISCOUNT = 1000;

uint constant MAX_INT = (2 ** 255 - 1) + 2 ** 255;

// ========== CONTRACT ==========

uint32 constant TOKEN_DefiraliaT = 1;
uint32 constant TOKEN_BASE = 2;
uint32 constant CONTRACT_FACTORY = 3;
uint32 constant CONTRACT_LENDING = 4;
uint32 constant CONTRACT_COLLATERAL_MANAGER = 5;
uint32 constant CONTRACT_STAKING = 6;
uint32 constant CONTRACT_PRICE_ORACLE = 7;
uint32 constant CONTRACT_COLLATERAL_ORACLE = 8;
uint32 constant CONTRACT_DEX_MANAGER = 9;
uint32 constant CONTRACT_TREASURY = 10;
uint32 constant CONTRACT_REWARD_DISTRIBUTOR = 11;

// ========== ROLE ==========

bytes32 constant ROLE_UPGRADER = keccak256("ROLE_UPGRADER");
bytes32 constant ROLE_PAUSER = keccak256("ROLE_PAUSER");
