require('dotenv').config()

const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PlayerCardNFT ERC721 contract", function () {
  async function deployTokenAndNftFixture() {
    const [admin, bob, jane] = await ethers.getSigners();

    const FanToken = await ethers.getContractFactory("FanToken");
    const PlayerCard = await ethers.getContractFactory("PlayerCardNFT");

    const fanToken = await FanToken.deploy("Leeds United Fan Token", "LUFT");
    await fanToken.deployed();

    const playerCard = await PlayerCard.deploy("LUFC PlayerCard", "LUPC", process.env.NFT_METADATA_BASE_URL, fanToken.address);
    await playerCard.deployed();

    return { FanToken, fanToken, PlayerCard, playerCard, admin, bob, jane };
  }

  describe("Deployment", function () {
    it("Should set the right admin", async function () {
      const { playerCard, admin } = await loadFixture(deployTokenAndNftFixture);

      expect(await playerCard.admin()).to.equal(admin.address);
    });

    it("Should assign the total supply of tokens to the admin", async function () {
      const { fanToken, admin } = await loadFixture(deployTokenAndNftFixture);
      const adminBalance = await fanToken.balanceOf(admin.address);

      expect(await fanToken.totalSupply()).to.equal(adminBalance);
    });
  });

  describe("Minting", function () {
    describe("With a non-zero FanToken balance", function() {
      it("Should allow a user to mint", async function () {
        const { fanToken, playerCard, bob } = await loadFixture(deployTokenAndNftFixture);

        await fanToken.transfer(bob.address, 1);

        await expect(playerCard.connect(bob).mint())
          .to.changeTokenBalances(playerCard, [bob], [1]);
      });
    });

    describe("With a zero FanToken balance", function() {
      it("Should not allow a user to mint", async function () {
        const { playerCard, bob } = await loadFixture(deployTokenAndNftFixture);

        await expect(playerCard.connect(bob).mint())
          .to.be.revertedWith("You need at least one fan token to mint a Player Card");
      });
    });

    describe("When all NFTs have been minted (and we're at max supply)", function() {
      it("Should not allow a user to mint", async function () {
        const { fanToken, playerCard, bob } = await loadFixture(deployTokenAndNftFixture);

        for(var i = 0; i < 5; i++){
          await playerCard.mint();
        }

        await fanToken.transfer(bob.address, 1);

        await expect(playerCard.connect(bob).mint())
          .to.be.revertedWith("All PlayerCards have been minted");
      });
    });


    describe("Events", function() {
      it("should emit Minting Transfer events", async function () {
        const { playerCard, admin } = await loadFixture(deployTokenAndNftFixture);

        await expect(playerCard.mint())
          .to.emit(playerCard, "Transfer").withArgs("0x0000000000000000000000000000000000000000", admin.address, 0);
      });
    });
  });
});
