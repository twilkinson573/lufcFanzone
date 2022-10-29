const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("FanToken ERC20 contract", function () {
  async function deployTokenFixture() {
    const FanToken = await ethers.getContractFactory("FanToken");
    const [admin, bob, jane] = await ethers.getSigners();

    const fanToken = await FanToken.deploy("Leeds United Fan Token", "LUFT");

    await fanToken.deployed();

    return { FanToken, fanToken, admin, bob, jane };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { fanToken, admin } = await loadFixture(deployTokenFixture);

      expect(await fanToken.admin()).to.equal(admin.address);
    });

    it("Should assign the total supply of tokens to the admin", async function () {
      const { fanToken, admin } = await loadFixture(deployTokenFixture);
      const adminBalance = await fanToken.balanceOf(admin.address);

      expect(await fanToken.totalSupply()).to.equal(adminBalance);
    });
  });

  describe("Minting", function () {
    it("Should grant a zero balance account 1 token", async function () {
      const { fanToken, bob } = await loadFixture(deployTokenFixture);

      await expect(fanToken.connect(bob).mint())
        .to.changeTokenBalances(fanToken, [bob], [1]);
    });

    it("Should fail if the balance of an account is non-zero", async function () {
      const { fanToken, admin, bob, jane } = await loadFixture(deployTokenFixture);

      await fanToken.transfer(bob.address, 1);

      await expect(fanToken.connect(bob).mint())
        .to.be.revertedWith("Only accounts with a zero balance can mint");

      expect(await fanToken.balanceOf(bob.address)).to.equal(1);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { fanToken, admin, bob, jane } = await loadFixture(deployTokenFixture);

      await expect(fanToken.transfer(bob.address, 50))
        .to.changeTokenBalances(fanToken, [admin, bob], [-50, 50]);

      await expect(fanToken.connect(bob).transfer(jane.address, 50))
        .to.changeTokenBalances(fanToken, [bob, jane], [-50, 50]);
    });

    it("should emit Transfer events", async function () {
      const { fanToken, admin, bob, jane } = await loadFixture(deployTokenFixture);

      await expect(fanToken.transfer(bob.address, 50))
        .to.emit(fanToken, "Transfer").withArgs(admin.address, bob.address, 50)

      await expect(fanToken.connect(bob).transfer(jane.address, 50))
        .to.emit(fanToken, "Transfer").withArgs(bob.address, jane.address, 50)
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { fanToken, admin, bob } = await loadFixture(deployTokenFixture);
      const initialadminBalance = await fanToken.balanceOf(
        admin.address
      );

      await expect(
        fanToken.connect(bob).transfer(admin.address, 1)
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await fanToken.balanceOf(admin.address)).to.equal(
        initialadminBalance
      );
    });
  });
});
