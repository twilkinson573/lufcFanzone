require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
      {
        version: "0.8.9",
      },
    ],
  }, 
  networks: {
    hardhat: {},
    // goerli: {
    //   url: process.env.ALCHEMY_API_URL,
    //   accounts: [
    //     process.env.PRIVATE_KEY
    //   ]
    // },
    mumbai: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [
        process.env.PRIVATE_KEY
      ]
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.ETHERSCAN_API_KEY
    }
  }
};
