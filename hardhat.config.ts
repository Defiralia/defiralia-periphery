import '@nomicfoundation/hardhat-toolbox'
import '@nomiclabs/hardhat-solhint'
import '@openzeppelin/hardhat-upgrades'
import 'dotenv/config'
import fs from 'fs'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import { HardhatUserConfig } from 'hardhat/config'
import path from 'path'
import 'solidity-docgen'

// Prevent to load scripts before compilation and typechain
const SKIP_LOAD = process.env.SKIP_LOAD === 'true'
if (!SKIP_LOAD) {
  const scriptsFolders = ['task']
  scriptsFolders.forEach((folder) => {
    const scriptsPath = path.join(__dirname, 'scripts', folder)
    fs.readdirSync(scriptsPath)
      .filter((_path) => _path.includes('.ts'))
      .forEach((script) => {
        require(`${scriptsPath}/${script}`)
      })
  })
}

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.7.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: false,
    },
    arbitrum: {
      chainId: 42161,
      url: process.env.ARBITRUM_ALCHEMY_API_KEY
        ? `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARBITRUM_ALCHEMY_API_KEY}`
        : process.env.INFURA_API_KEY
        ? `https://arbitrum-mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`
        : `https://endpoints.omniatech.io/v1/arbitrum/one/public`,
      // accounts: [process.env.PRIVATE_KEY], TODO: add account
    },
    arbitrumGoerli: {
      chainId: 421613,
      url: process.env.ARBITRUM_GOERLI_ALCHEMY_API_KEY
        ? `https://arb-goerli.g.alchemy.com/v2/${process.env.ARBITRUM_GOERLI_ALCHEMY_API_KEY}`
        : process.env.INFURA_API_KEY
        ? `https://arbitrum-goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
        : `https://arbitrum-goerli.publicnode.com`,
      accounts: [
        process.env.DEV_ACCOUNT_PRIVATE_KEY ||
          '0000000000000000000000000000000000000000000000000000000000000000',
      ],
    },
    goerli: {
      chainId: 5,
      url: process.env.GOERLI_ALCHEMY_API_KEY
        ? `https://eth-goerli.g.alchemy.com/v2/${process.env.GOERLI_ALCHEMY_API_KEY}`
        : process.env.INFURA_API_KEY
        ? `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`
        : `https://goerli.blockpi.network/v1/rpc/public`,
      accounts: [
        process.env.DEV_ACCOUNT_PRIVATE_KEY ||
          '0000000000000000000000000000000000000000000000000000000000000000',
      ],
    },
    sepolia: {
      chainId: 11155111,
      url: process.env.SEPOLIA_ALCHEMY_API_KEY
        ? `https://eth-sepolia.g.alchemy.com/v2/${process.env.SEPOLIA_ALCHEMY_API_KEY}`
        : process.env.INFURA_API_KEY
        ? `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`
        : `https://rpc.sepolia.org`,
      accounts: [
        process.env.DEV_ACCOUNT_PRIVATE_KEY ||
          '0000000000000000000000000000000000000000000000000000000000000000',
      ],
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || '',
      goerli: process.env.ETHERSCAN_API_KEY || '',
      arbitrum: process.env.ARBISCAN_API_KEY || '',
    },
  },
  abiExporter: {
    path: './abi/',
    clear: true,
    runOnCompile: true,
  },
  docgen: {
    pages: 'files',
    exclude: ['test', 'mocks', 'interfaces', 'libraries'],
  },
}

export default config
