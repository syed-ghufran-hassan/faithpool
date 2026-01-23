# StackSUSU V5 Mainnet Deployment Guide

## 🆕 V5 New Features

V5 introduces several new contracts and features:

| Feature | Description |
|---------|-------------|
| **Reputation System** | Track member trust scores, on-time payments, and defaults |
| **Governance** | Circle voting for proposals (pause, resume, change intervals) |
| **Referral Program** | Tiered rewards for member referrals |
| **Contribution Modes** | Upfront or round-by-round contribution options |
| **Higher Limits** | Up to 100 STX per contribution (vs 10 STX in v4) |

---

## 💰 Gas Fee Estimates (V5)

| Contract | Cost (microSTX) | Cost (STX) |
|----------|-----------------|------------|
| stacksusu-traits-v3 | ~25,000 | 0.025 |
| stacksusu-admin-v5 | ~60,000 | 0.060 |
| stacksusu-reputation-v5 | ~55,000 | 0.055 |
| stacksusu-referral-v5 | ~65,000 | 0.065 |
| stacksusu-core-v5 | ~140,000 | 0.140 |
| stacksusu-escrow-v5 | ~85,000 | 0.085 |
| stacksusu-emergency-v5 | ~65,000 | 0.065 |
| stacksusu-governance-v5 | ~75,000 | 0.075 |
| stacksusu-nft-v5 | ~85,000 | 0.085 |
| **TOTAL** | **~655,000** | **~0.66 STX** |

### Recommended Wallet Balance
- **Minimum:** 1.0 STX
- **Safe (2x buffer):** 1.5 STX  
- **Comfortable (3x buffer):** 2.0 STX

*Note: Actual costs vary based on network congestion. During high congestion, fees can be 2-5x higher.*

---

## 🔐 Deployment Steps

### Step 1: Set Up Your Wallet

1. Get a Stacks wallet (Leather, Xverse, or use existing)
2. Fund it with at least **1.5 STX** for safe deployment
3. Get your 24-word seed phrase (mnemonic)

### Step 2: Configure Mainnet Settings

Edit `settings/Mainnet.toml`:

```toml
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "your 24 word seed phrase here"
```

⚠️ **SECURITY WARNING:** Never share your mnemonic or commit it to git!

### Step 3: Generate Deployment Plan

```bash
clarinet deployments generate --mainnet
```

This creates `deployments/default.mainnet-plan.yaml`

### Step 4: Deploy to Mainnet

```bash
clarinet deployments apply --mainnet
```

### Step 5: Post-Deployment Setup (V5)

After deployment, run these contract calls to set up all authorizations:

```clarity
;; ============================================
;; ESCROW AUTHORIZATIONS
;; ============================================
;; Authorize core and emergency to use escrow
(contract-call? .stacksusu-escrow-v5 authorize-caller .stacksusu-core-v5)
(contract-call? .stacksusu-escrow-v5 authorize-caller .stacksusu-emergency-v5)

;; ============================================
;; NFT AUTHORIZATIONS
;; ============================================
;; Authorize core to mint NFTs
(contract-call? .stacksusu-nft-v5 authorize-minter .stacksusu-core-v5)

;; Authorize NFT contract to update slots
(contract-call? .stacksusu-core-v5 authorize-slot-updater .stacksusu-nft-v5)

;; ============================================
;; REPUTATION AUTHORIZATIONS (NEW IN V5)
;; ============================================
;; Authorize core to update reputation
(contract-call? .stacksusu-reputation-v5 authorize-updater .stacksusu-core-v5)
(contract-call? .stacksusu-reputation-v5 authorize-updater .stacksusu-escrow-v5)
(contract-call? .stacksusu-reputation-v5 authorize-updater .stacksusu-emergency-v5)

;; ============================================
;; REFERRAL AUTHORIZATIONS (NEW IN V5)
;; ============================================
;; Authorize core to record referral activity
(contract-call? .stacksusu-referral-v5 authorize-caller .stacksusu-core-v5)
(contract-call? .stacksusu-referral-v5 authorize-caller .stacksusu-escrow-v5)

;; ============================================
;; GOVERNANCE AUTHORIZATIONS (NEW IN V5)
;; ============================================
;; Authorize governance executor
(contract-call? .stacksusu-governance-v5 authorize-executor .stacksusu-admin-v5)
```

---

## 📋 Deployed Contract Addresses (V5)

After deployment, your contracts will be at:

```
SP<YOUR_ADDRESS>.stacksusu-traits-v3
SP<YOUR_ADDRESS>.stacksusu-admin-v5
SP<YOUR_ADDRESS>.stacksusu-reputation-v5
SP<YOUR_ADDRESS>.stacksusu-referral-v5
SP<YOUR_ADDRESS>.stacksusu-core-v5
SP<YOUR_ADDRESS>.stacksusu-escrow-v5
SP<YOUR_ADDRESS>.stacksusu-emergency-v5
SP<YOUR_ADDRESS>.stacksusu-governance-v5
SP<YOUR_ADDRESS>.stacksusu-nft-v5
```

---

## 🔄 Migration from V3/V4

If you have existing circles on V3 or V4:

1. **Data is NOT automatically migrated** - each version is independent
2. Complete any active circles on the old version before migrating
3. Users need to rejoin circles on V5 contracts
4. Reputation starts fresh for all users on V5

### Recommended Migration Path:
1. Announce migration date to users
2. Wait for all active circles to complete
3. Deploy V5 contracts
4. Update frontend to point to V5 contracts
5. Disable new circle creation on V3/V4 (via pause-protocol)

---

## 🧪 Testnet First (Recommended)

Before mainnet, test on testnet:

1. Get testnet STX from faucet: https://explorer.stacks.co/sandbox/faucet?chain=testnet
2. Edit `settings/Testnet.toml` with your mnemonic
3. Run:
   ```bash
   clarinet deployments generate --testnet
   clarinet deployments apply --testnet
   ```

---

## 🧪 Running Tests

```bash
# Run all tests
npm test

# Check contracts compile
clarinet check
```

---

## 🔧 Troubleshooting

### "Insufficient funds"
- Ensure wallet has enough STX (check balance on explorer)
- Try increasing `deployment_fee_rate` in settings

### "Transaction stuck"
- Network may be congested
- Check tx status on explorer.stacks.co

### "Contract already exists"
- Contract names are unique per address
- Use a fresh wallet or change contract names

### "ERR-NOT-AUTHORIZED" when using contracts
- Ensure all authorizations from Step 5 were executed
- Check that the correct contract principal is authorized
