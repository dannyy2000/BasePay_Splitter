# 💸 BasePay Splitter

A minimal onchain payment splitter built on **Base**, designed for hackathon teams and collaborators to receive ETH payments transparently — no backend, no tokens, just trustless payout automation.

---

## 🚀 Overview

BasePay Splitter allows you to define a set of recipients and their payout shares at deployment.  
Any ETH sent to the contract is automatically allocated according to these predefined shares.  
Each member can withdraw their portion anytime, directly onchain.

This project demonstrates how Base’s low fees and fast finality make micro-payments and team revenue sharing simple and efficient.

---

## ✨ Key Features

- 🪙 **ETH-based** — uses Base’s native ETH (no custom token).  
- ⚖️ **Automatic split logic** — fair, transparent, immutable payouts.  
- 🔒 **Non-custodial** — funds are held by the smart contract until claimed.  
- 🧮 **Onchain accounting** — shares and balances are public.  
- 🌐 **No backend** — only Base network required.

---

## 🧱 Tech Stack

- **Solidity** — core payout logic  
- **Hardhat** — compile, test, deploy  
- **Base Network** — mainnet or Base Sepolia testnet  
- *(Optional)* React + wagmi — wallet connect & UI demo

---

## 🪙 How It Works

1. Deploy the contract with:
   - A list of team addresses  
   - Their respective share percentages  

2. Anyone can send ETH to the contract.  

3. The ETH is allocated proportionally to each member’s share.  

4. Members can call `release()` (or a frontend button) to withdraw their share anytime.

---

## 🧩 Use Cases

- Hackathon team revenue sharing  
- DAO or collective project payouts  
- Artist collaborations  
- Freelance split payments  
- Transparent fund distribution on Base

---

## 🧠 Why on Base?

- 🌀 Built on Ethereum’s security  
- ⚡ Extremely low gas fees  
- 🔁 Seamless developer tooling  
- 🌍 Growing ecosystem  

Base makes it practical to automate micropayments onchain — what’s expensive on mainnet becomes affordable here.

---

## 🔗 Resources

- [Base Docs](https://docs.base.org)  
- [Base Sepolia Explorer](https://sepolia.basescan.org)  
- [Hardhat Documentation](https://hardhat.org/docs)  
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

## 🧑‍💻 Example Flow

1. Deploy `BasePaySplitter` to **Base Sepolia** with your team’s wallet addresses and shares.  
2. Share your contract address publicly.  
3. Receive ETH contributions directly to the contract.  
4. Each member can withdraw their allocated share on demand.  

No backend, no database — all transparent onchain.

---

## ⚙️ Network Info

- **Network:** Base  
- **Chain ID:** `8453` (Mainnet) / `84531` (Sepolia Testnet)  
- **RPC:** `https://sepolia.base.org`  
- **Explorer:** [https://sepolia.basescan.org](https://sepolia.basescan.org)

---

## 📜 License

MIT © 2025 BasePay Splitter Team

