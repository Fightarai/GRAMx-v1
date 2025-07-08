# GRAMX Vault - Gold-Backed DeFi Protocol

🏆 **A production-ready DeFi vault protocol for minting GRAMX tokens backed by PAXG gold with gasless transactions and automatic liquidity provision.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue.svg)](https://solidity.readthedocs.io/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-yellow.svg)](https://hardhat.org/)
[![React](https://img.shields.io/badge/Frontend-React-blue.svg)](https://reactjs.org/)

## 🌟 Features

### Core Protocol Features
- 🥇 **1:1 PAXG Backing**: Every GRAMX token is backed by PAXG gold tokens
- ⚡ **Gasless Transactions**: EIP-712 meta-transactions for free minting
- 🔄 **Automatic LP Provision**: Instant liquidity creation on Uniswap V2
- 🛡️ **Security First**: Comprehensive security measures and access controls
- 📊 **Proof of Reserves**: Real-time verification of backing assets
- 🎯 **Efficient Redemption**: Burn GRAMX to get PAXG back

### Frontend Features
- 🌙 **Modern Dark UI**: Beautiful glass morphism design
- 📱 **Responsive Design**: Works perfectly on desktop and mobile
- 🔗 **Web3 Integration**: RainbowKit wallet connection
- 📈 **Real-time Analytics**: Comprehensive dashboard with charts
- 🎨 **Smooth Animations**: Framer Motion powered interactions
- 🔔 **Smart Notifications**: Toast notifications for all actions

## 🏗️ Architecture

### Smart Contracts

```
├── GRAMxToken.sol          # ERC-20 token with vault-controlled minting
├── GramxVault.sol          # Main vault contract with gasless minting
└── utils/eip712.js         # EIP-712 signature utilities
```

### Frontend

```
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Main application pages
│   ├── config/            # Configuration files
│   ├── hooks/             # Custom React hooks
│   └── utils/             # Utility functions
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- MetaMask or compatible wallet
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-org/gramx-vault.git
cd gramx-vault
```

2. **Install dependencies**
```bash
npm install
cd frontend && npm install && cd ..
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Compile contracts**
```bash
npm run compile
```

5. **Run tests**
```bash
npm test
```

6. **Deploy contracts (local)**
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

7. **Start frontend**
```bash
npm run dev
```

## 📋 Environment Configuration

Create a `.env` file with the following variables:

```env
# Network Configuration
MAINNET_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
SEPOLIA_RPC_URL=https://eth-sepolia.alchemyapi.io/v2/your-api-key

# Deployment
PRIVATE_KEY=your-private-key-here

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key
COINMARKETCAP_API_KEY=your-coinmarketcap-api-key

# Contract Addresses (Mainnet)
PAXG_ADDRESS=0x45804880De22913dAFE09f4980848ECE6EcbAf78
UNISWAP_V2_ROUTER=0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
UNISWAP_V2_FACTORY=0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f
```

## 🔧 Smart Contract Details

### GRAMxToken
- **Standard**: ERC-20 with EIP-2612 permits
- **Minting**: Only the vault contract can mint tokens
- **Burning**: Only the vault contract can burn tokens
- **Features**: Pausable, Ownable, SafeTransfer

### GramxVault
- **Core Function**: Manages PAXG collateral and GRAMX minting
- **Gasless Minting**: EIP-712 signatures for meta-transactions
- **LP Management**: Automatic Uniswap V2 liquidity provision
- **Reserve Tracking**: Real-time reserve ratio calculations
- **Security**: Reentrancy protection, access controls, emergency functions

## 🎯 Usage Guide

### Standard Minting

1. **Connect Wallet**: Use RainbowKit to connect your wallet
2. **Approve PAXG**: Allow the vault to spend your PAXG tokens
3. **Enter Amount**: Specify how much PAXG to deposit
4. **Mint GRAMX**: Execute the transaction and receive GRAMX tokens

### Gasless Minting

1. **Enable Gasless Mode**: Toggle the gasless option
2. **Sign Message**: Sign the EIP-712 message (no gas required)
3. **Submit to Relayer**: Transaction is submitted by a relayer
4. **Receive Tokens**: Get your GRAMX tokens without paying gas

### Redemption

1. **Enter GRAMX Amount**: Specify how many GRAMX tokens to redeem
2. **Approve Burning**: Allow the vault to burn your GRAMX tokens
3. **Execute Redemption**: Burn GRAMX and receive PAXG back

## 📊 Key Metrics

- **Reserve Ratio**: PAXG reserves / Total GRAMX supply
- **TVL**: Total value locked in the protocol
- **LP Tokens**: Liquidity tokens created automatically
- **Transaction Volume**: Daily/monthly transaction volume

## 🔐 Security Features

### Smart Contract Security
- **Reentrancy Protection**: ReentrancyGuard on all external functions
- **Access Control**: Ownable pattern with role-based permissions
- **Pausable**: Emergency pause functionality
- **Input Validation**: Comprehensive parameter validation
- **Overflow Protection**: Built-in SafeMath via Solidity 0.8+

### Frontend Security
- **Secure Storage**: No private keys stored locally
- **Input Sanitization**: All user inputs are validated
- **HTTPS Only**: Secure communication channels
- **CSP Headers**: Content Security Policy implementation

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/GramxVault.test.js

# Run tests with coverage
npx hardhat coverage
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Local Development
```bash
# Start local Hardhat network
npx hardhat node

# Deploy contracts
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
npm run dev
```

### Testnet Deployment
```bash
# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contracts
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Mainnet Deployment
```bash
# Deploy to mainnet (use with caution)
npx hardhat run scripts/deploy.js --network mainnet
```

## 📈 Gas Optimization

The protocol is optimized for gas efficiency:

- **Batch Operations**: Multiple actions in single transaction
- **Storage Optimization**: Minimal storage reads/writes
- **EIP-712 Signatures**: Gasless transactions for users
- **Efficient LP**: Automated liquidity provision

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Write comprehensive tests for all new features
- Follow Solidity style guide for smart contracts
- Use ESLint and Prettier for JavaScript/React code
- Add documentation for new functions and components

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [https://gramxvault.finance](https://gramxvault.finance)
- **Documentation**: [https://docs.gramxvault.finance](https://docs.gramxvault.finance)
- **Twitter**: [@GRAMXVault](https://twitter.com/gramxvault)
- **Discord**: [GRAMX Community](https://discord.gg/gramxvault)
- **Telegram**: [GRAMX Vault](https://t.me/gramxvault)

## ⚠️ Disclaimer

This software is provided "as is", without warranty of any kind. The protocol is experimental and may contain bugs. Users should conduct their own research and use at their own risk. Never invest more than you can afford to lose.

## 📞 Support

For support and questions:

- Open an issue on GitHub
- Join our Discord community
- Contact us on Telegram
- Email: support@gramxvault.finance

---

**Built with ❤️ for the DeFi community**