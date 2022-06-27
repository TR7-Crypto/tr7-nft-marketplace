require("dotenv").config({ path: __dirname + "/.env" });
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const {
  ALCHEMY_KEY,
  INFURA_API_KEY,
  ACCOUNT_PRIVATE_KEY,
  ACCOUNT_POLYGON_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
} = process.env;
// Go to https://www.alchemyapi.io, sign up, create
// a new App in its dashboard, and replace "KEY" with its key
// const ALCHEMY_API_KEY = "EqjnutIPBiDdPv8M4lasLyfubJ3LCrnu";

// Replace this private key with your Ropsten account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
// Be aware of NEVER putting real Ether into testing accounts
// const ROPSTEN_PRIVATE_KEY =
//   "55eea47157b6c757f0e6dc300eb4474ce2154a3849f5155e8ab2ca4e3f431007";

module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: "./src/backend/artifacts",
    sources: "./src/backend/contracts",
    cache: "./src/backend/cache",
    tests: "./src/backend/test",
  },
  networks: {
    ropsten: {
      // url: `https://eth-ropsten.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
      gasPrice: 30000000000, // default is 'auto' which breaks chains without the london hardfork
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    ethereum: {
      chainId: 1,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [`0x${ACCOUNT_PRIVATE_KEY}`],
    },
    polygon_mumbai: {
      chainId: 80001,
      url: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`,
      accounts: [`0x${ACCOUNT_POLYGON_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
