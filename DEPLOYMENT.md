# StackSUSU V7 Mainnet Deployment Guide

## 🆕 V7 Features

V7 is the current production version with all features:

| Feature | Description |
|---------|-------------|
| **Reputation System** | Track member trust scores, on-time payments, and defaults |
| **Governance** | Circle voting for proposals (pause, resume, change intervals) |
| **Referral Program** | Tiered rewards for member referrals |
| **Contribution Modes** | Upfront or round-by-round contribution options |
| **NFT Badges** | Participation badges for completed circles |

---

## 💰 Gas Fee Estimates

| Contract | Approximate Cost (STX) |
|----------|------------------------|
| stacksusu-traits-v5 | ~0.025 |
| stacksusu-admin-v7 | ~0.060 |
| stacksusu-reputation-v7 | ~0.055 |
| stacksusu-referral-v7 | ~0.065 |
| stacksusu-core-v7 | ~0.140 |
| stacksusu-escrow-v7 | ~0.085 |
| stacksusu-emergency-v7 | ~0.065 |
| stacksusu-governance-v7 | ~0.075 |
| stacksusu-nft-v7 | ~0.085 |
| **TOTAL** | **~0.66 STX** |

### Recommended Wallet Balance
- **Minimum:** 1.0 STX
- **Safe (2x buffer):** 1.5 STX  
- **Comfortable (3x buffer):** 2.0 STX

*Note: Actual costs vary based on network congestion.*

---

## 🔐 Deployment Steps

### Step 1: Set Up Your Wallet

1. Get a Stacks wallet (Leather or Xverse)
2. Fund it with at least **1.5 STX** for safe deployment
3. Configure your wallet in Clarinet settings

### Step 2: Configure Mainnet Settings

Edit `settings/Mainnet.toml` with your deployer account configuration.

⚠️ **SECURITY WARNING:** Never share credentials or commit them to git!

### Step 3: Generate Deployment Plan

```bash
clarinet deployments generate --mainnet
```

This creates `deployments/default.mainnet-plan.yaml`

### Step 4: Deploy to Mainnet

```bash
clarinet deployments apply --mainnet
```

### Step 5: Post-Deployment Setup

After deployment, run these contract calls to set up all authorizations:

```clarity
;; ============================================
;; ESCROW AUTHORIZATIONS
;; ============================================
(contract-call? .stacksusu-escrow-v7 authorize-caller .stacksusu-core-v7)
(contract-call? .stacksusu-escrow-v7 authorize-caller .stacksusu-emergency-v7)

;; ============================================
;; NFT AUTHORIZATIONS
;; ============================================
(contract-call? .stacksusu-nft-v7 authorize-minter .stacksusu-core-v7)
(contract-call? .stacksusu-core-v7 authorize-slot-updater .stacksusu-nft-v7)

;; ============================================
;; REPUTATION AUTHORIZATIONS
;; ============================================
(contract-call? .stacksusu-reputation-v7 authorize-updater .stacksusu-core-v7)
(contract-call? .stacksusu-reputation-v7 authorize-updater .stacksusu-escrow-v7)
(contract-call? .stacksusu-reputation-v7 authorize-updater .stacksusu-emergency-v7)

;; ============================================
;; REFERRAL AUTHORIZATIONS
;; ============================================
(contract-call? .stacksusu-referral-v7 authorize-caller .stacksusu-core-v7)
(contract-call? .stacksusu-referral-v7 authorize-caller .stacksusu-escrow-v7)

;; ============================================
;; GOVERNANCE AUTHORIZATIONS
;; ============================================
(contract-call? .stacksusu-governance-v7 authorize-executor .stacksusu-admin-v7)
```

---

## 📋 Deployed Contract Addresses

After deployment, your contracts will be at:

```
SP<YOUR_ADDRESS>.stacksusu-traits-v5
SP<YOUR_ADDRESS>.stacksusu-admin-v7
SP<YOUR_ADDRESS>.stacksusu-reputation-v7
SP<YOUR_ADDRESS>.stacksusu-referral-v7
SP<YOUR_ADDRESS>.stacksusu-core-v7
SP<YOUR_ADDRESS>.stacksusu-escrow-v7
SP<YOUR_ADDRESS>.stacksusu-emergency-v7
SP<YOUR_ADDRESS>.stacksusu-governance-v7
SP<YOUR_ADDRESS>.stacksusu-nft-v7
```

---

## 🧪 Testnet First (Recommended)

Before mainnet, test on testnet:

1. Get testnet STX from faucet: https://explorer.stacks.co/sandbox/faucet?chain=testnet
2. Configure `settings/Testnet.toml`
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
