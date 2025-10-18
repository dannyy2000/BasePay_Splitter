import { expect } from "chai";
import { ethers } from "hardhat";
import { BasePaySplitter } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("BasePaySplitter", function () {
  let basePaySplitter: BasePaySplitter;
  let owner: HardhatEthersSigner;
  let payee1: HardhatEthersSigner;
  let payee2: HardhatEthersSigner;
  let payee3: HardhatEthersSigner;
  let nonPayee: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, payee1, payee2, payee3, nonPayee] = await ethers.getSigners();
  });

  describe("Deployment", function () {
    it("Should deploy with valid payees and shares", async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const shares = [50, 30, 20];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares);

      expect(await basePaySplitter.totalShares()).to.equal(100);
      expect(await basePaySplitter.shares(payee1.address)).to.equal(50);
      expect(await basePaySplitter.shares(payee2.address)).to.equal(30);
      expect(await basePaySplitter.shares(payee3.address)).to.equal(20);
    });

    it("Should revert if payees and shares length mismatch", async function () {
      const payees = [payee1.address, payee2.address];
      const shares = [50, 30, 20];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      await expect(
        BasePaySplitter.deploy(payees, shares)
      ).to.be.revertedWith("BasePaySplitter: payees and shares length mismatch");
    });

    it("Should revert if no payees provided", async function () {
      const payees: string[] = [];
      const shares: number[] = [];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      await expect(
        BasePaySplitter.deploy(payees, shares)
      ).to.be.revertedWith("BasePaySplitter: no payees");
    });

    it("Should revert if payee is zero address", async function () {
      const payees = [ethers.ZeroAddress, payee2.address];
      const shares = [50, 50];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      await expect(
        BasePaySplitter.deploy(payees, shares)
      ).to.be.revertedWith("BasePaySplitter: account is the zero address");
    });

    it("Should revert if shares are 0", async function () {
      const payees = [payee1.address, payee2.address];
      const shares = [50, 0];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      await expect(
        BasePaySplitter.deploy(payees, shares)
      ).to.be.revertedWith("BasePaySplitter: shares are 0");
    });

    it("Should revert if duplicate payees", async function () {
      const payees = [payee1.address, payee1.address];
      const shares = [50, 50];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      await expect(
        BasePaySplitter.deploy(payees, shares)
      ).to.be.revertedWith("BasePaySplitter: account already has shares");
    });

    it("Should emit PayeeAdded events", async function () {
      const payees = [payee1.address, payee2.address];
      const shares = [60, 40];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      const splitter = await BasePaySplitter.deploy(payees, shares);
      const receipt = await splitter.deploymentTransaction()?.wait();

      // Check that PayeeAdded events were emitted
      const payeeAddedEvents = receipt?.logs.filter(
        (log: any) => log.fragment && log.fragment.name === "PayeeAdded"
      );

      expect(payeeAddedEvents).to.have.length(2);
    });

    it("Should accept initial ETH payment on deployment", async function () {
      const payees = [payee1.address, payee2.address];
      const shares = [50, 50];
      const initialPayment = ethers.parseEther("1.0");

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares, {
        value: initialPayment,
      });

      expect(await ethers.provider.getBalance(basePaySplitter.target)).to.equal(
        initialPayment
      );
    });
  });

  describe("Receiving Payments", function () {
    beforeEach(async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const shares = [50, 30, 20];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares);
    });

    it("Should receive ETH and emit PaymentReceived event", async function () {
      const paymentAmount = ethers.parseEther("1.0");

      await expect(
        owner.sendTransaction({
          to: basePaySplitter.target,
          value: paymentAmount,
        })
      )
        .to.emit(basePaySplitter, "PaymentReceived")
        .withArgs(owner.address, paymentAmount);

      expect(await ethers.provider.getBalance(basePaySplitter.target)).to.equal(
        paymentAmount
      );
    });

    it("Should accept multiple payments", async function () {
      const payment1 = ethers.parseEther("1.0");
      const payment2 = ethers.parseEther("0.5");

      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: payment1,
      });

      await payee1.sendTransaction({
        to: basePaySplitter.target,
        value: payment2,
      });

      expect(await ethers.provider.getBalance(basePaySplitter.target)).to.equal(
        payment1 + payment2
      );
    });
  });

  describe("Getters", function () {
    beforeEach(async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const shares = [50, 30, 20];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares);
    });

    it("Should return correct total shares", async function () {
      expect(await basePaySplitter.totalShares()).to.equal(100);
    });

    it("Should return correct shares for each payee", async function () {
      expect(await basePaySplitter.shares(payee1.address)).to.equal(50);
      expect(await basePaySplitter.shares(payee2.address)).to.equal(30);
      expect(await basePaySplitter.shares(payee3.address)).to.equal(20);
    });

    it("Should return 0 shares for non-payee", async function () {
      expect(await basePaySplitter.shares(nonPayee.address)).to.equal(0);
    });

    it("Should return correct payee count", async function () {
      expect(await basePaySplitter.payeesCount()).to.equal(3);
    });

    it("Should return correct payee by index", async function () {
      expect(await basePaySplitter.payee(0)).to.equal(payee1.address);
      expect(await basePaySplitter.payee(1)).to.equal(payee2.address);
      expect(await basePaySplitter.payee(2)).to.equal(payee3.address);
    });

    it("Should return 0 for initial released amounts", async function () {
      expect(await basePaySplitter.released(payee1.address)).to.equal(0);
      expect(await basePaySplitter.totalReleased()).to.equal(0);
    });
  });

  describe("Release", function () {
    beforeEach(async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const shares = [50, 30, 20];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares);
    });

    it("Should calculate correct releasable amount", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      expect(await basePaySplitter.releasable(payee1.address)).to.equal(
        ethers.parseEther("5.0")
      );
      expect(await basePaySplitter.releasable(payee2.address)).to.equal(
        ethers.parseEther("3.0")
      );
      expect(await basePaySplitter.releasable(payee3.address)).to.equal(
        ethers.parseEther("2.0")
      );
    });

    it("Should release correct amount to payee", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      const initialBalance = await ethers.provider.getBalance(payee1.address);
      const tx = await basePaySplitter.release(payee1.address);
      const receipt = await tx.wait();
      const finalBalance = await ethers.provider.getBalance(payee1.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("5.0"));
    });

    it("Should emit PaymentReleased event", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      await expect(basePaySplitter.release(payee1.address))
        .to.emit(basePaySplitter, "PaymentReleased")
        .withArgs(payee1.address, ethers.parseEther("5.0"));
    });

    it("Should update released amounts after release", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      await basePaySplitter.release(payee1.address);

      expect(await basePaySplitter.released(payee1.address)).to.equal(
        ethers.parseEther("5.0")
      );
      expect(await basePaySplitter.totalReleased()).to.equal(
        ethers.parseEther("5.0")
      );
    });

    it("Should revert if account has no shares", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      await expect(
        basePaySplitter.release(nonPayee.address)
      ).to.be.revertedWith("BasePaySplitter: account has no shares");
    });

    it("Should revert if account is not due payment", async function () {
      await expect(
        basePaySplitter.release(payee1.address)
      ).to.be.revertedWith("BasePaySplitter: account is not due payment");
    });

    it("Should handle multiple releases correctly", async function () {
      // First payment
      const payment1 = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: payment1,
      });

      await basePaySplitter.release(payee1.address);
      expect(await basePaySplitter.released(payee1.address)).to.equal(
        ethers.parseEther("5.0")
      );

      // Second payment
      const payment2 = ethers.parseEther("5.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: payment2,
      });

      // Payee1 should now be able to release additional 2.5 ETH (50% of 5 ETH)
      expect(await basePaySplitter.releasable(payee1.address)).to.equal(
        ethers.parseEther("2.5")
      );

      await basePaySplitter.release(payee1.address);
      expect(await basePaySplitter.released(payee1.address)).to.equal(
        ethers.parseEther("7.5")
      );
    });

    it("Should allow any address to trigger release for a payee", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      // Non-payee triggers release for payee1
      const initialBalance = await ethers.provider.getBalance(payee1.address);
      await basePaySplitter.connect(nonPayee).release(payee1.address);
      const finalBalance = await ethers.provider.getBalance(payee1.address);

      expect(finalBalance - initialBalance).to.equal(ethers.parseEther("5.0"));
    });

    it("Should handle complex share distributions", async function () {
      // Deploy with complex shares
      const payees = [payee1.address, payee2.address, payee3.address];
      const shares = [100, 200, 300]; // Total: 600

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      const complexSplitter = await BasePaySplitter.deploy(payees, shares);

      const paymentAmount = ethers.parseEther("6.0");
      await owner.sendTransaction({
        to: complexSplitter.target,
        value: paymentAmount,
      });

      // payee1: 100/600 * 6 = 1 ETH
      // payee2: 200/600 * 6 = 2 ETH
      // payee3: 300/600 * 6 = 3 ETH
      expect(await complexSplitter.releasable(payee1.address)).to.equal(
        ethers.parseEther("1.0")
      );
      expect(await complexSplitter.releasable(payee2.address)).to.equal(
        ethers.parseEther("2.0")
      );
      expect(await complexSplitter.releasable(payee3.address)).to.equal(
        ethers.parseEther("3.0")
      );
    });

    it("Should revert if trying to release twice without new payment", async function () {
      const paymentAmount = ethers.parseEther("10.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: paymentAmount,
      });

      await basePaySplitter.release(payee1.address);

      await expect(
        basePaySplitter.release(payee1.address)
      ).to.be.revertedWith("BasePaySplitter: account is not due payment");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle very small payments correctly", async function () {
      const payees = [payee1.address, payee2.address];
      const shares = [1, 1];

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares);

      const tinyPayment = 100n; // 100 wei
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: tinyPayment,
      });

      expect(await basePaySplitter.releasable(payee1.address)).to.equal(50n);
      expect(await basePaySplitter.releasable(payee2.address)).to.equal(50n);
    });

    it("Should handle rounding in integer division", async function () {
      const payees = [payee1.address, payee2.address, payee3.address];
      const shares = [33, 33, 34]; // Total: 100

      const BasePaySplitter = await ethers.getContractFactory("BasePaySplitter");
      basePaySplitter = await BasePaySplitter.deploy(payees, shares);

      const payment = ethers.parseEther("1.0");
      await owner.sendTransaction({
        to: basePaySplitter.target,
        value: payment,
      });

      const releasable1 = await basePaySplitter.releasable(payee1.address);
      const releasable2 = await basePaySplitter.releasable(payee2.address);
      const releasable3 = await basePaySplitter.releasable(payee3.address);

      // Due to integer division, some wei may remain in contract
      expect(releasable1 + releasable2 + releasable3).to.be.lessThanOrEqual(payment);
    });
  });
});
