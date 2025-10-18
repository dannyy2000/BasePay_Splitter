// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const BasePaySplitterModule = buildModule("BasePaySplitterModule", (m) => {
  // Example deployment parameters - can be overridden when deploying
  // These are sample addresses for demonstration
  const defaultPayees = m.getParameter("payees", [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Example address 1
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Example address 2
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Example address 3
  ]);

  // Example shares: 50%, 30%, 20%
  const defaultShares = m.getParameter("shares", [50, 30, 20]);

  // Optional initial payment to the splitter on deployment
  const initialPayment = m.getParameter("initialPayment", 0n);

  const basePaySplitter = m.contract("BasePaySplitter", [defaultPayees, defaultShares], {
    value: initialPayment,
  });

  return { basePaySplitter };
});

export default BasePaySplitterModule;
