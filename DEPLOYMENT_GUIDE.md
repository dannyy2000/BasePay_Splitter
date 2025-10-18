# 🚀 BasePay Splitter Deployment Guide

## Prerequisites

1. **Get Base Sepolia testnet ETH** from the Base Sepolia faucet:
   - Visit: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Or: https://faucet.quicknode.com/base/sepolia

2. **Export your wallet private key**:
   - MetaMask: Settings → Security & Privacy → Show Private Key
   - ⚠️ **NEVER share your private key or commit it to git!**

3. **(Optional) Get a Basescan API key** for contract verification:
   - Visit: https://basescan.org/myapikey
   - Sign up and create a new API key

---

## 📋 Step-by-Step Deployment

### Step 1: Set up your environment variables

Copy the example env file and fill in your details:

```bash
cp .env.example .env
```

Edit the `.env` file:

```bash
# Remove the 0x prefix from your private key
PRIVATE_KEY=abc123def456...

# Optional: Add your Basescan API key for verification
BASESCAN_API_KEY=YOUR_API_KEY_HERE
```

### Step 2: Prepare your deployment parameters

Create a JSON file with your team's wallet addresses and shares.

**Example**: Create a file called `deployment-params.json`:

```json
{
  "BasePaySplitterModule": {
    "payees": [
      "0x1111111111111111111111111111111111111111",
      "0x2222222222222222222222222222222222222222",
      "0x3333333333333333333333333333333333333333"
    ],
    "shares": [50, 30, 20]
  }
}
```

**Understanding the parameters**:
- `payees`: Array of Ethereum addresses (your team members' wallet addresses)
- `shares`: Array of numbers representing each person's share
  - These are proportional shares, not percentages
  - Example: `[50, 30, 20]` means total shares = 100
    - First payee gets 50/100 = 50%
    - Second payee gets 30/100 = 30%
    - Third payee gets 20/100 = 20%
  - You can use any numbers: `[1, 1, 1]` = equal split, `[100, 200, 300]` = 1:2:3 ratio

### Step 3: Deploy to Base Sepolia Testnet

```bash
npx hardhat ignition deploy ignition/modules/BasePaySplitter.ts \
  --network base-sepolia \
  --parameters deployment-params.json
```

Or deploy inline without a parameters file:

```bash
npx hardhat ignition deploy ignition/modules/BasePaySplitter.ts \
  --network base-sepolia \
  --parameters '{"BasePaySplitterModule":{"payees":["0xYourAddress1","0xYourAddress2"],"shares":[50,50]}}'
```

### Step 4: Verify your contract on Basescan

After deployment, verify your contract:

```bash
npx hardhat ignition verify <deployment-id> --network base-sepolia
```

The `<deployment-id>` will be shown after deployment completes.

---

## 🎯 After Deployment

### View your contract

1. Note the deployed contract address from the deployment output
2. View it on Base Sepolia Explorer: `https://sepolia.basescan.org/address/YOUR_CONTRACT_ADDRESS`

### Test your contract

Send some test ETH to the contract:

```bash
# From another wallet, send ETH to the contract address
# The contract will automatically receive and log the payment
```

### Withdraw funds

Each payee can withdraw their share by calling the `release()` function:

```bash
npx hardhat console --network base-sepolia
```

Then in the console:

```javascript
const contract = await ethers.getContractAt("BasePaySplitter", "YOUR_CONTRACT_ADDRESS");

// Check releasable amount for an address
await contract.releasable("0xYourAddress");

// Release funds to an address
await contract.release("0xYourAddress");
```

Or use a frontend interface like Etherscan:
1. Go to your contract on Basescan
2. Click "Contract" → "Write Contract"
3. Connect your wallet
4. Call the `release` function with your address

---

## 📊 Deployment to Base Mainnet

⚠️ **WARNING**: Only deploy to mainnet when you're ready to use real ETH!

1. Make sure you have real ETH on Base mainnet
2. Update your deployment parameters with real wallet addresses
3. Deploy:

```bash
npx hardhat ignition deploy ignition/modules/BasePaySplitter.ts \
  --network base-mainnet \
  --parameters deployment-params.json
```

---

## 🔍 Useful Commands

### Check contract info

```bash
# Get contract details
npx hardhat ignition status <deployment-id> --network base-sepolia

# Verify contract
npx hardhat ignition verify <deployment-id> --network base-sepolia
```

### Run local tests first

```bash
# Always test before deploying!
npx hardhat test

# Test with gas reporting
npx hardhat test --gas-report
```

---

## 🛡️ Security Checklist

Before deploying:

- [ ] ✅ Tested the contract locally with `npx hardhat test`
- [ ] ✅ Verified all payee addresses are correct (copy-paste carefully!)
- [ ] ✅ Confirmed share distribution is correct
- [ ] ✅ Private key is in `.env` file (not committed to git)
- [ ] ✅ `.env` is listed in `.gitignore`
- [ ] ✅ Have enough ETH for gas fees (~0.003 ETH on Base Sepolia)

---

## 📚 Network Information

### Base Sepolia Testnet
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### Base Mainnet
- **Chain ID**: 8453
- **RPC URL**: https://mainnet.base.org
- **Explorer**: https://basescan.org

---

## ❓ Troubleshooting

### Error: "insufficient funds for gas"
- Make sure you have enough ETH in your wallet
- Get testnet ETH from the Base Sepolia faucet

### Error: "invalid address"
- Check that all addresses start with `0x`
- Verify addresses are valid Ethereum addresses (42 characters)

### Error: "payees and shares length mismatch"
- Make sure you have the same number of addresses and shares
- Example: 3 addresses = 3 shares

### Need help?
- Base Documentation: https://docs.base.org
- Hardhat Ignition Docs: https://hardhat.org/ignition

---

## 🎉 Example Real-World Usage

**Hackathon Team (3 members)**:
```json
{
  "BasePaySplitterModule": {
    "payees": [
      "0xAlice...",
      "0xBob...",
      "0xCharlie..."
    ],
    "shares": [40, 40, 20]
  }
}
```
- Alice: 40%
- Bob: 40%
- Charlie: 20%

**Equal Split (5 members)**:
```json
{
  "BasePaySplitterModule": {
    "payees": ["0xAddr1", "0xAddr2", "0xAddr3", "0xAddr4", "0xAddr5"],
    "shares": [1, 1, 1, 1, 1]
  }
}
```
- Everyone gets 20% (1/5)
