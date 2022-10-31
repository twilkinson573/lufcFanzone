// This is a script for deploying your contracts. You can adapt it to deploy
// yours, or create new ones.

require('dotenv').config()

const path = require("path");

async function main() {
  // This is just a convenience check
  if (network.name === "hardhat") {
    console.warn(
      "You are trying to deploy a contract to the Hardhat Network, which " +
        "gets automatically created and destroyed every time. Use the Hardhat" +
        " option '--network localhost'"
    );
  }


  // ethers is available in the global scope
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );

  console.log("Account balance:", (await deployer.getBalance()).toString());

  console.log("Deploying ERC20 FanToken...");
  const Token = await ethers.getContractFactory("FanToken");
  const token = await Token.deploy("Leeds United Fan Token", "LUFT");
  await token.deployed();

  console.log("FanToken address:", token.address);


  console.log("Deploying PlayerCard NFT with base URI:", process.env.NFT_METADATA_BASE_URL);
  const NFT = await ethers.getContractFactory("PlayerCardNFT");
  const nft = await NFT.deploy("LUFC PlayerCard", "LUPC", process.env.NFT_METADATA_BASE_URL, token.address);
  await nft.deployed();

  console.log("NFT address:", nft.address);

  // We also save the contract's artifacts and address in the frontend directory
  // saveFrontendFiles(token);
}

function saveFrontendFiles(token) {
  const fs = require("fs");
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "contracts");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-address.json"),
    JSON.stringify({ Token: token.address }, undefined, 2)
  );

  const TokenArtifact = artifacts.readArtifactSync("Token");

  fs.writeFileSync(
    path.join(contractsDir, "Token.json"),
    JSON.stringify(TokenArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
