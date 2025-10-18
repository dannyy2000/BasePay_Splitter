import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying from:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "ETH");

  const payees = [
    "0x02AF376f613938A58c9567128E82bf3536a76F27",
    "0x58A8D815eE6D1DDd027341650139B21c3258172b"
  ];
  const shares = [60, 40];

  const Splitter = await ethers.getContractFactory("BasePaySplitter");
  const splitter = await Splitter.deploy(payees, shares);

  await splitter.waitForDeployment();

  console.log("✅ Deployed BasePaySplitter at:", await splitter.getAddress());
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
