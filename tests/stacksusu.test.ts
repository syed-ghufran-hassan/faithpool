import { describe, it, expect, beforeAll } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
import { initSimnet, Simnet } from "@hirosystems/clarinet-sdk";

let simnet: Simnet;

// V5 Contract names
const ADMIN_CONTRACT = "stacksusu-admin-v5";
const CORE_CONTRACT = "stacksusu-core-v5";
const ESCROW_CONTRACT = "stacksusu-escrow-v5";
const NFT_CONTRACT = "stacksusu-nft-v5";
const EMERGENCY_CONTRACT = "stacksusu-emergency-v5";
const REPUTATION_CONTRACT = "stacksusu-reputation-v5";
const GOVERNANCE_CONTRACT = "stacksusu-governance-v5";
const REFERRAL_CONTRACT = "stacksusu-referral-v5";

// Contribution mode constants
const MODE_UPFRONT = 0;
const MODE_ROUND_BY_ROUND = 1;

beforeAll(async () => {
  simnet = await initSimnet();
}, 60000); // 60 second timeout for initialization

// =============================================================================
// ADMIN TESTS (V5)
// =============================================================================

describe("StackSUSU Admin Contract V5", () => {
  it("deployer is contract owner and can pause protocol", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      ADMIN_CONTRACT,
      "pause-protocol",
      [],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Check protocol is paused
    const isPaused = simnet.callReadOnlyFn(
      ADMIN_CONTRACT,
      "is-paused",
      [],
      deployer
    );
    expect(isPaused.result).toStrictEqual(Cl.bool(true));
  });

  it("non-owner cannot pause protocol", async () => {
    const accounts = simnet.getAccounts();
    const wallet1 = accounts.get("wallet_1")!;
    
    const result = simnet.callPublicFn(
      ADMIN_CONTRACT,
      "pause-protocol",
      [],
      wallet1
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1000))); // ERR-NOT-AUTHORIZED
  });

  it("can set and get fee configurations", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Get default admin fee
    let adminFee = simnet.callReadOnlyFn(
      ADMIN_CONTRACT,
      "get-admin-fee-bps",
      [],
      deployer
    );
    expect(adminFee.result).toStrictEqual(Cl.uint(50)); // 0.5%
    
    // Get default emergency fee
    let emergencyFee = simnet.callReadOnlyFn(
      ADMIN_CONTRACT,
      "get-emergency-fee-bps",
      [],
      deployer
    );
    expect(emergencyFee.result).toStrictEqual(Cl.uint(200)); // 2%
    
    // Update admin fee
    const result = simnet.callPublicFn(
      ADMIN_CONTRACT,
      "set-admin-fee",
      [Cl.uint(100)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Verify update
    adminFee = simnet.callReadOnlyFn(
      ADMIN_CONTRACT,
      "get-admin-fee-bps",
      [],
      deployer
    );
    expect(adminFee.result).toStrictEqual(Cl.uint(100));
  });

  it("can set referral and late fee configurations", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Get default referral fee
    let referralFee = simnet.callReadOnlyFn(
      ADMIN_CONTRACT,
      "get-referral-fee-bps",
      [],
      deployer
    );
    expect(referralFee.result).toStrictEqual(Cl.uint(25)); // 0.25%
    
    // Update referral fee
    const result = simnet.callPublicFn(
      ADMIN_CONTRACT,
      "set-referral-fee",
      [Cl.uint(50)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("rejects fees above maximum limits", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Try to set admin fee above 5% max (500 bps)
    const result = simnet.callPublicFn(
      ADMIN_CONTRACT,
      "set-admin-fee",
      [Cl.uint(600)], // 6% - above max
      deployer
    );
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1025))); // ERR-INVALID-FEE
  });
});

// =============================================================================
// CIRCLE CREATION TESTS (V5)
// =============================================================================

describe("StackSUSU Circle Creation V5", () => {
  // Setup authorization before all circle tests
  beforeAll(async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    // Authorize core contract to use reputation (required for create-circle)
    simnet.callPublicFn(REPUTATION_CONTRACT, "authorize-updater", [Cl.principal(coreContract)], deployer);
    
    // Unpause protocol
    simnet.callPublicFn(ADMIN_CONTRACT, "unpause-protocol", [], deployer);
  });

  it("can create a new circle with valid parameters (upfront mode)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Test Susu Circle V5"),
        Cl.uint(1000000),  // 1 STX contribution
        Cl.uint(10),       // 10 members
        Cl.uint(3),        // 3-day payout interval
        Cl.uint(MODE_UPFRONT),  // Upfront contribution mode
        Cl.uint(0),        // No minimum reputation required
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Verify circle was created
    const circleInfo = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-info",
      [Cl.uint(1)],
      deployer
    );
    expect(circleInfo.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("can create circle with round-by-round contribution mode", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Round-by-Round Circle"),
        Cl.uint(500000),   // 0.5 STX per round
        Cl.uint(5),        // 5 members
        Cl.uint(7),        // 7-day payout interval
        Cl.uint(MODE_ROUND_BY_ROUND),  // Round-by-round mode
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("can use legacy create-circle-simple for backwards compatibility", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle-simple",
      [
        Cl.stringAscii("Simple Circle"),
        Cl.uint(1000000),
        Cl.uint(10),
        Cl.uint(3),
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("creator automatically becomes first member", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle
    simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Auto Join Circle"),
        Cl.uint(1000000),
        Cl.uint(10),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-count",
      [],
      deployer
    );
    
    const isMember = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "is-member",
      [circleCount.result, Cl.principal(deployer)],
      deployer
    );
    expect(isMember.result).toStrictEqual(Cl.bool(true));
  });

  it("rejects invalid contribution amounts (too low)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Too low (below 0.01 STX = 10000 microSTX)
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Low Contribution"),
        Cl.uint(1000),  // Too low
        Cl.uint(10),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1006))); // ERR-INVALID-AMOUNT
  });

  it("accepts higher contribution amounts (up to 100 STX in v5)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // 50 STX = 50,000,000 microSTX (valid in v5, was rejected in v4)
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("High Value Circle"),
        Cl.uint(50000000),  // 50 STX - valid in v5
        Cl.uint(5),
        Cl.uint(7),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("rejects invalid member counts (too few)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Small Circle"),
        Cl.uint(1000000),
        Cl.uint(2),  // Too few (min is 3)
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1007))); // ERR-INVALID-MEMBERS
  });

  it("rejects invalid member counts (too many)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Large Circle"),
        Cl.uint(1000000),
        Cl.uint(100),  // Too many (max is 50)
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1007))); // ERR-INVALID-MEMBERS
  });

  it("rejects invalid contribution mode", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Invalid Mode Circle"),
        Cl.uint(1000000),
        Cl.uint(10),
        Cl.uint(3),
        Cl.uint(5),  // Invalid mode
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1029))); // ERR-INVALID-MODE
  });
});

// =============================================================================
// MEMBERSHIP TESTS (V5)
// =============================================================================

describe("StackSUSU Membership V5", () => {
  // Ensure authorization is set up for membership tests
  beforeAll(async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    // Authorize core contract to use reputation
    simnet.callPublicFn(REPUTATION_CONTRACT, "authorize-updater", [Cl.principal(coreContract)], deployer);
    simnet.callPublicFn(ADMIN_CONTRACT, "unpause-protocol", [], deployer);
  });

  it("multiple users can join a circle", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;
    
    // Create circle
    const createResult = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Community Circle"),
        Cl.uint(1000000),
        Cl.uint(10),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(createResult.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const circleCount = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Others join
    const join1 = simnet.callPublicFn(
      CORE_CONTRACT,
      "join-circle",
      [circleId],
      wallet1
    );
    expect(join1.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const join2 = simnet.callPublicFn(
      CORE_CONTRACT,
      "join-circle",
      [circleId],
      wallet2
    );
    expect(join2.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Verify membership
    const isMember = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "is-member",
      [circleId, Cl.principal(wallet1)],
      deployer
    );
    expect(isMember.result).toStrictEqual(Cl.bool(true));
  });

  it("can join circle with referral", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet3 = accounts.get("wallet_3")!;
    
    // Create circle
    simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Referral Circle"),
        Cl.uint(1000000),
        Cl.uint(10),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Wallet3 joins with wallet1 as referrer
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "join-circle-with-referral",
      [circleId, Cl.principal(wallet1)],
      wallet3
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("cannot join same circle twice", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    
    // Create circle
    simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("No Dupes Circle"),
        Cl.uint(1000000),
        Cl.uint(10),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Join once
    simnet.callPublicFn(CORE_CONTRACT, "join-circle", [circleId], wallet1);
    
    // Try to join again
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "join-circle",
      [circleId],
      wallet1
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1004))); // ERR-ALREADY-MEMBER
  });
});

// =============================================================================
// REPUTATION TESTS (V5 - NEW)
// =============================================================================

describe("StackSUSU Reputation System V5", () => {
  it("deployer can authorize reputation updaters", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    const result = simnet.callPublicFn(
      REPUTATION_CONTRACT,
      "authorize-updater",
      [Cl.principal(coreContract)],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("new members start with base reputation score", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet4 = accounts.get("wallet_4")!;
    
    // Initialize member reputation
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    simnet.callPublicFn(REPUTATION_CONTRACT, "authorize-updater", [Cl.principal(coreContract)], deployer);
    
    // Create a circle (which initializes reputation for creator)
    simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Rep Test Circle"),
        Cl.uint(1000000),
        Cl.uint(5),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    // Check deployer's reputation
    const score = simnet.callReadOnlyFn(
      REPUTATION_CONTRACT,
      "get-member-score",
      [Cl.principal(deployer)],
      deployer
    );
    
    // Base score is 500
    expect(score.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("can check if member meets reputation requirement", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Check if deployer meets requirement of 100 (base score is 500)
    const meetsReq = simnet.callReadOnlyFn(
      REPUTATION_CONTRACT,
      "meets-requirement",
      [Cl.principal(deployer), Cl.uint(100)],
      deployer
    );
    
    // meets-requirement returns bool directly, not a response
    expect(meetsReq.result).toStrictEqual(Cl.bool(true));
  });

  it("can create circle with minimum reputation requirement", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle requiring 200 reputation
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Elite Circle"),
        Cl.uint(5000000),  // 5 STX
        Cl.uint(5),
        Cl.uint(7),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(200),  // Require 200 reputation
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

// =============================================================================
// REFERRAL TESTS (V5 - NEW)
// =============================================================================

describe("StackSUSU Referral System V5", () => {
  it("deployer can authorize referral callers", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    const result = simnet.callPublicFn(
      REFERRAL_CONTRACT,
      "authorize-caller",
      [Cl.principal(coreContract)],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("users can register referral relationships", async () => {
    const accounts = simnet.getAccounts();
    const wallet5 = accounts.get("wallet_5")!;
    const wallet6 = accounts.get("wallet_6")!;
    
    // Wallet6 registers wallet5 as their referrer
    const result = simnet.callPublicFn(
      REFERRAL_CONTRACT,
      "register-referral",
      [Cl.principal(wallet5)],
      wallet6
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("cannot self-refer", async () => {
    const accounts = simnet.getAccounts();
    const wallet7 = accounts.get("wallet_7")!;
    
    const result = simnet.callPublicFn(
      REFERRAL_CONTRACT,
      "register-referral",
      [Cl.principal(wallet7)],
      wallet7
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(3002))); // ERR-SELF-REFERRAL
  });

  it("cannot register referral twice", async () => {
    const accounts = simnet.getAccounts();
    const wallet8 = accounts.get("wallet_8")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;
    
    // First referral
    simnet.callPublicFn(
      REFERRAL_CONTRACT,
      "register-referral",
      [Cl.principal(wallet1)],
      wallet8
    );
    
    // Try to register different referrer
    const result = simnet.callPublicFn(
      REFERRAL_CONTRACT,
      "register-referral",
      [Cl.principal(wallet2)],
      wallet8
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(3001))); // ERR-ALREADY-REFERRED
  });
});

// =============================================================================
// GOVERNANCE TESTS (V5 - NEW)
// =============================================================================

describe("StackSUSU Governance V5", () => {
  it("deployer can authorize governance executors", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      GOVERNANCE_CONTRACT,
      "authorize-executor",
      [Cl.principal(deployer)],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

// =============================================================================
// NFT TESTS (V5)
// =============================================================================

describe("StackSUSU NFT Contract V5", () => {
  it("deployer can authorize minters", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    const result = simnet.callPublicFn(
      NFT_CONTRACT,
      "authorize-minter",
      [Cl.principal(coreContract)],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Check authorization
    const isAuth = simnet.callReadOnlyFn(
      NFT_CONTRACT,
      "is-authorized-minter",
      [Cl.principal(coreContract)],
      deployer
    );
    expect(isAuth.result).toStrictEqual(Cl.bool(true));
  });

  it("SIP-009 get-last-token-id works correctly", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const lastId = simnet.callReadOnlyFn(
      NFT_CONTRACT,
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastId.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

// =============================================================================
// ESCROW TESTS (V5)
// =============================================================================

describe("StackSUSU Escrow Contract V5", () => {
  it("deployer can authorize callers", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    const result = simnet.callPublicFn(
      ESCROW_CONTRACT,
      "authorize-caller",
      [Cl.principal(coreContract)],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("non-owner cannot authorize callers", async () => {
    const accounts = simnet.getAccounts();
    const wallet1 = accounts.get("wallet_1")!;
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    
    const result = simnet.callPublicFn(
      ESCROW_CONTRACT,
      "authorize-caller",
      [Cl.principal(coreContract)],
      wallet1
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1000))); // ERR-NOT-AUTHORIZED
  });
});

// =============================================================================
// EMERGENCY TESTS (V5)
// =============================================================================

describe("StackSUSU Emergency Contract V5", () => {
  it("can calculate emergency fee amount", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle first
    simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Emergency Test"),
        Cl.uint(1000000),  // 1 STX each
        Cl.uint(10),       // 10 members = 10 STX pot
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Check emergency fee calculation
    const feeAmount = simnet.callReadOnlyFn(
      EMERGENCY_CONTRACT,
      "get-emergency-fee-amount",
      [circleId],
      deployer
    );
    expect(feeAmount.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

// =============================================================================
// INTEGRATION TESTS (V5)
// =============================================================================

describe("StackSUSU Integration V5", () => {
  it("read functions return correct data", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle
    simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Query Test"),
        Cl.uint(2000000),  // 2 STX
        Cl.uint(15),       // 15 members
        Cl.uint(5),        // 5 day interval
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-count",
      [],
      deployer
    );
    expect(circleCount.result).toHaveClarityType(ClarityType.UInt);
    
    const circleId = circleCount.result;
    
    const memberAtSlot = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-member-at-slot",
      [circleId, Cl.uint(0)],
      deployer
    );
    expect(memberAtSlot.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("full circle setup with all authorizations", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.${CORE_CONTRACT}`;
    const emergencyContract = `${deployer}.${EMERGENCY_CONTRACT}`;
    
    // Setup all authorizations
    simnet.callPublicFn(ESCROW_CONTRACT, "authorize-caller", [Cl.principal(coreContract)], deployer);
    simnet.callPublicFn(ESCROW_CONTRACT, "authorize-caller", [Cl.principal(emergencyContract)], deployer);
    simnet.callPublicFn(NFT_CONTRACT, "authorize-minter", [Cl.principal(coreContract)], deployer);
    simnet.callPublicFn(REPUTATION_CONTRACT, "authorize-updater", [Cl.principal(coreContract)], deployer);
    simnet.callPublicFn(REFERRAL_CONTRACT, "authorize-caller", [Cl.principal(coreContract)], deployer);
    
    // Create circle and have multiple members join
    const result = simnet.callPublicFn(
      CORE_CONTRACT,
      "create-circle",
      [
        Cl.stringAscii("Full Integration"),
        Cl.uint(1000000),
        Cl.uint(5),
        Cl.uint(3),
        Cl.uint(MODE_UPFRONT),
        Cl.uint(0),
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const circleCount = simnet.callReadOnlyFn(CORE_CONTRACT, "get-circle-count", [], deployer);
    const circleId = circleCount.result;
    
    // Have more members join
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;
    const wallet3 = accounts.get("wallet_3")!;
    const wallet4 = accounts.get("wallet_4")!;
    
    simnet.callPublicFn(CORE_CONTRACT, "join-circle", [circleId], wallet1);
    simnet.callPublicFn(CORE_CONTRACT, "join-circle", [circleId], wallet2);
    simnet.callPublicFn(CORE_CONTRACT, "join-circle", [circleId], wallet3);
    simnet.callPublicFn(CORE_CONTRACT, "join-circle", [circleId], wallet4);
    
    // Circle should now be active (5 members = full)
    const circleInfo = simnet.callReadOnlyFn(
      CORE_CONTRACT,
      "get-circle-info",
      [circleId],
      deployer
    );
    expect(circleInfo.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
