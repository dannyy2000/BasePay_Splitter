import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Base Sepolia Testnet
    "baseSepolia": {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 84532,
    },
    // Base Mainnet
    "base": {
    url: process.env.BASE_MAINNET_RPC_URL || "https://mainnet.base.org",
    accounts: process.env.PRIVATE_KEY
    ? [process.env.PRIVATE_KEY.trim()]
    : [],
    chainId: 8453,
},

  },
  etherscan: {
  apiKey: process.env.BASESCAN_API_KEY || "", // single key for all
  customChains: [
    {
      network: "base",
      chainId: 8453,
      urls: {
        apiURL: "https://api.basescan.org/api",
        browserURL: "https://basescan.org",
      },
    },
    {
      network: "base-sepolia",
      chainId: 84532,
      urls: {
        apiURL: "https://api-sepolia.basescan.org/api",
        browserURL: "https://sepolia.basescan.org",
      },
    },
  ],
},
sourcify: { enabled: false },
  gasReporter: {
    enabled: true,
    currency: "USD",
  },
};

export default config;
