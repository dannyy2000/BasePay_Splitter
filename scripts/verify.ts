// scripts/verify.js
const hre = require("hardhat"); // ✅ import Hardhat Runtime Environment

async function main() {
  const contractAddress = "0x451C6F28B49f83213E319CEfeE6E949aA8Ee9D20";

  const payees = [
    "0x02AF376f613938A58c9567128E82bf3536a76F27",
    "0x58A8D815eE6D1DDd027341650139B21c3258172b",
  ];

  const shares = [60, 40];

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [payees, shares],
      network: "base",
    });

    console.log("✅ Contract verified successfully!");
  } catch (error) {
    console.error("❌ Verification failed:");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
