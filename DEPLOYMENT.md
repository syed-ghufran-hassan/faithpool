# StackSUSU Mainnet Deployment Guide

## 💰 Gas Fee Estimates

| Contract | Cost (microSTX) | Cost (STX) |
|----------|-----------------|------------|
| stacksusu-traits | 20,970 | 0.02097 |
| stacksusu-admin | 47,480 | 0.04748 |
| stacksusu-escrow | 73,170 | 0.07317 |
| stacksusu-core | 121,940 | 0.12194 |
| stacksusu-emergency | 58,170 | 0.05817 |
| stacksusu-nft | 76,910 | 0.07691 |
| **TOTAL** | **398,640** | **~0.4 STX** |

### Recommended Wallet Balance
- **Minimum:** 0.5 STX
- **Safe (2x buffer):** 1.0 STX  
- **Comfortable (3x buffer):** 1.5 STX

*Note: Actual costs vary based on network congestion. During high congestion, fees can be 2-5x higher.*

---

## 🔐 Deployment Steps

### Step 1: Set Up Your Wallet

1. Get a Stacks wallet (Leather, Xverse, or use existing)
2. Fund it with at least **1.0 STX** for safe deployment
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

### Step 5: Post-Deployment Setup

After deployment, run these contract calls to set up authorizations:

```clarity
;; Authorize escrow to be called by core
(contract-call? .stacksusu-escrow authorize-caller .stacksusu-core)
(contract-call? .stacksusu-escrow authorize-caller .stacksusu-emergency)

;; Authorize NFT contract to update slots
(contract-call? .stacksusu-core authorize-slot-updater .stacksusu-nft)

;; Authorize NFT to be minted by core (optional - for auto-mint on join)
(contract-call? .stacksusu-nft authorize-minter .stacksusu-core)
```

---

## 📋 Deployed Contract Addresses

After deployment, your contracts will be at:

```
SP<YOUR_ADDRESS>.stacksusu-traits
SP<YOUR_ADDRESS>.stacksusu-admin
SP<YOUR_ADDRESS>.stacksusu-escrow
SP<YOUR_ADDRESS>.stacksusu-core
SP<YOUR_ADDRESS>.stacksusu-nft
SP<YOUR_ADDRESS>.stacksusu-emergency
```

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
