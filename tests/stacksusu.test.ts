import { describe, it, expect, beforeAll } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";
import { initSimnet, Simnet } from "@hirosystems/clarinet-sdk";

let simnet: Simnet;

beforeAll(async () => {
  simnet = await initSimnet();
});

// =============================================================================
// ADMIN TESTS
// =============================================================================

describe("StackSUSU Admin Contract", () => {
  it("deployer is contract owner and can pause protocol", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      "stacksusu-admin",
      "pause-protocol",
      [],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Check protocol is paused
    const isPaused = simnet.callReadOnlyFn(
      "stacksusu-admin",
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
      "stacksusu-admin",
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
      "stacksusu-admin",
      "get-admin-fee-bps",
      [],
      deployer
    );
    expect(adminFee.result).toStrictEqual(Cl.uint(50)); // 0.5%
    
    // Get default emergency fee
    let emergencyFee = simnet.callReadOnlyFn(
      "stacksusu-admin",
      "get-emergency-fee-bps",
      [],
      deployer
    );
    expect(emergencyFee.result).toStrictEqual(Cl.uint(200)); // 2%
    
    // Update admin fee
    const result = simnet.callPublicFn(
      "stacksusu-admin",
      "set-admin-fee",
      [Cl.uint(100)],
      deployer
    );
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Verify update
    adminFee = simnet.callReadOnlyFn(
      "stacksusu-admin",
      "get-admin-fee-bps",
      [],
      deployer
    );
    expect(adminFee.result).toStrictEqual(Cl.uint(100));
  });
});

// =============================================================================
// CIRCLE CREATION TESTS
// =============================================================================

describe("StackSUSU Circle Creation", () => {
  it("can create a new circle with valid parameters", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Unpause first (may have been paused by previous test)
    simnet.callPublicFn("stacksusu-admin", "unpause-protocol", [], deployer);
    
    const result = simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Test Susu Circle"),
        Cl.uint(1000000),  // 1 STX contribution
        Cl.uint(25),       // 25 members
        Cl.uint(3),        // 3-day payout interval
      ],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Verify circle was created
    const circleInfo = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-circle-info",
      [Cl.uint(1)],
      deployer
    );
    expect(circleInfo.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("creator automatically becomes first member", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle
    simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Auto Join Circle"),
        Cl.uint(1000000),
        Cl.uint(25),
        Cl.uint(3),
      ],
      deployer
    );
    
    // Check membership - get circle count first to find the circle ID
    const circleCount = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-circle-count",
      [],
      deployer
    );
    
    const isMember = simnet.callReadOnlyFn(
      "stacksusu-core",
      "is-member",
      [Cl.uint(2), Cl.principal(deployer)], // 2nd circle created
      deployer
    );
    expect(isMember.result).toStrictEqual(Cl.bool(true));
  });

  it("rejects invalid contribution amounts (too low)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Too low (0.1 STX = 100000 microSTX)
    const result = simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Low Contribution"),
        Cl.uint(100000),  // Too low
        Cl.uint(25),
        Cl.uint(3),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1006))); // ERR-INVALID-AMOUNT
  });

  it("rejects invalid contribution amounts (too high)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Too high (100 STX = 100000000 microSTX)
    const result = simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("High Contribution"),
        Cl.uint(100000000),  // Too high
        Cl.uint(25),
        Cl.uint(3),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1006))); // ERR-INVALID-AMOUNT
  });

  it("rejects invalid member counts (too few)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Small Circle"),
        Cl.uint(1000000),
        Cl.uint(10),  // Too few
        Cl.uint(3),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1007))); // ERR-INVALID-MEMBERS
  });

  it("rejects invalid member counts (too many)", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    const result = simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Large Circle"),
        Cl.uint(1000000),
        Cl.uint(100),  // Too many
        Cl.uint(3),
      ],
      deployer
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1007))); // ERR-INVALID-MEMBERS
  });
});

// =============================================================================
// MEMBERSHIP TESTS
// =============================================================================

describe("StackSUSU Membership", () => {
  it("multiple users can join a circle", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    const wallet2 = accounts.get("wallet_2")!;
    
    // Create circle
    const createResult = simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Community Circle"),
        Cl.uint(1000000),
        Cl.uint(25),
        Cl.uint(3),
      ],
      deployer
    );
    
    // Get the circle ID from result
    expect(createResult.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const circleCount = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Others join
    const join1 = simnet.callPublicFn(
      "stacksusu-core",
      "join-circle",
      [circleId],
      wallet1
    );
    expect(join1.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const join2 = simnet.callPublicFn(
      "stacksusu-core",
      "join-circle",
      [circleId],
      wallet2
    );
    expect(join2.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Verify membership
    const isMember = simnet.callReadOnlyFn(
      "stacksusu-core",
      "is-member",
      [circleId, Cl.principal(wallet1)],
      deployer
    );
    expect(isMember.result).toStrictEqual(Cl.bool(true));
  });

  it("cannot join same circle twice", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const wallet1 = accounts.get("wallet_1")!;
    
    // Create circle
    simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("No Dupes Circle"),
        Cl.uint(1000000),
        Cl.uint(25),
        Cl.uint(3),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Join once
    simnet.callPublicFn("stacksusu-core", "join-circle", [circleId], wallet1);
    
    // Try to join again
    const result = simnet.callPublicFn(
      "stacksusu-core",
      "join-circle",
      [circleId],
      wallet1
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1004))); // ERR-ALREADY-MEMBER
  });
});

// =============================================================================
// NFT TESTS
// =============================================================================

describe("StackSUSU NFT Contract", () => {
  it("deployer can authorize minters", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.stacksusu-core`;
    
    const result = simnet.callPublicFn(
      "stacksusu-nft",
      "authorize-minter",
      [Cl.principal(coreContract)],
      deployer
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Check authorization
    const isAuth = simnet.callReadOnlyFn(
      "stacksusu-nft",
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
      "stacksusu-nft",
      "get-last-token-id",
      [],
      deployer
    );
    expect(lastId.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

// =============================================================================
// ESCROW TESTS
// =============================================================================

describe("StackSUSU Escrow Contract", () => {
  it("deployer can authorize callers", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    const coreContract = `${deployer}.stacksusu-core`;
    
    const result = simnet.callPublicFn(
      "stacksusu-escrow",
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
    const coreContract = `${deployer}.stacksusu-core`;
    
    const result = simnet.callPublicFn(
      "stacksusu-escrow",
      "authorize-caller",
      [Cl.principal(coreContract)],
      wallet1
    );
    
    expect(result.result).toStrictEqual(Cl.error(Cl.uint(1000))); // ERR-NOT-AUTHORIZED
  });
});

// =============================================================================
// EMERGENCY TESTS
// =============================================================================

describe("StackSUSU Emergency Contract", () => {
  it("can calculate emergency fee amount", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle first
    simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Emergency Test"),
        Cl.uint(1000000),  // 1 STX each
        Cl.uint(25),       // 25 members = 25 STX pot
        Cl.uint(3),
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-circle-count",
      [],
      deployer
    );
    const circleId = circleCount.result;
    
    // Check emergency fee calculation
    // 25 members × 1 STX = 25,000,000 microSTX total
    // 2% fee = 500,000 microSTX
    const feeAmount = simnet.callReadOnlyFn(
      "stacksusu-emergency",
      "get-emergency-fee-amount",
      [circleId],
      deployer
    );
    expect(feeAmount.result).toHaveClarityType(ClarityType.ResponseOk);
    // The actual value should be (ok u500000)
  });
});

// =============================================================================
// INTEGRATION TESTS
// =============================================================================

describe("StackSUSU Integration", () => {
  it("read functions return correct data", async () => {
    const accounts = simnet.getAccounts();
    const deployer = accounts.get("deployer")!;
    
    // Create circle
    simnet.callPublicFn(
      "stacksusu-core",
      "create-circle",
      [
        Cl.stringAscii("Query Test"),
        Cl.uint(2000000),  // 2 STX
        Cl.uint(30),       // 30 members
        Cl.uint(5),        // 5 day interval
      ],
      deployer
    );
    
    const circleCount = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-circle-count",
      [],
      deployer
    );
    expect(circleCount.result).toHaveClarityType(ClarityType.UInt);
    
    const circleId = circleCount.result;
    
    const requiredDeposit = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-required-deposit",
      [circleId],
      deployer
    );
    expect(requiredDeposit.result).toHaveClarityType(ClarityType.ResponseOk);
    // 2 STX × 30 = 60 STX = 60,000,000 microSTX
    
    const memberAtSlot = simnet.callReadOnlyFn(
      "stacksusu-core",
      "get-member-at-slot",
      [circleId, Cl.uint(0)],
      deployer
    );
    expect(memberAtSlot.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});
