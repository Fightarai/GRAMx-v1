const { ethers } = require("hardhat");
require("dotenv").config();

// Contract addresses (mainnet)
const PAXG_ADDRESS = process.env.PAXG_ADDRESS || "0x45804880De22913dAFE09f4980848ECE6EcbAf78";
const UNISWAP_V2_ROUTER = process.env.UNISWAP_V2_ROUTER || "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const UNISWAP_V2_FACTORY = process.env.UNISWAP_V2_FACTORY || "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f";

async function main() {
  console.log("🚀 Starting GRAMX Vault deployment...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📦 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "| Chain ID:", network.chainId);

  // Deploy GRAMxToken first
  console.log("🪙 Deploying GRAMxToken...");
  const GRAMxToken = await ethers.getContractFactory("GRAMxToken");
  const gramxToken = await GRAMxToken.deploy(deployer.address);
  await gramxToken.deployed();
  console.log("✅ GRAMxToken deployed to:", gramxToken.address);

  // Deploy GramxVault
  console.log("\n🏦 Deploying GramxVault...");
  const GramxVault = await ethers.getContractFactory("GramxVault");
  const gramxVault = await GramxVault.deploy(
    gramxToken.address,
    PAXG_ADDRESS,
    UNISWAP_V2_ROUTER,
    UNISWAP_V2_FACTORY,
    deployer.address
  );
  await gramxVault.deployed();
  console.log("✅ GramxVault deployed to:", gramxVault.address);

  // Set vault address in token contract
  console.log("\n🔗 Configuring contracts...");
  const setVaultTx = await gramxToken.setVault(gramxVault.address);
  await setVaultTx.wait();
  console.log("✅ Vault address set in GRAMxToken");

  // Get LP pair address
  const lpPair = await gramxVault.lpPair();
  console.log("🔄 LP Pair address:", lpPair);

  // Get vault statistics
  const stats = await gramxVault.getVaultStats();
  console.log("\n📊 Initial Vault Statistics:");
  console.log("- PAXG Balance:", ethers.utils.formatEther(stats.paxgBalance), "PAXG");
  console.log("- GRAMX Supply:", ethers.utils.formatEther(stats.gramxSupply), "GRAMX");
  console.log("- LP Balance:", ethers.utils.formatEther(stats.lpBalance), "LP tokens");
  console.log("- Reserve Ratio:", stats.reserveRatio.toString(), "bps (", stats.reserveRatio.div(100).toString(), "%)");

  // Test EIP-712 message hash generation
  console.log("\n🔏 Testing EIP-712 functionality...");
  const testUser = deployer.address;
  const testAmount = ethers.utils.parseEther("1.0");
  const testDeadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  const testNonce = 0;

  const messageHash = await gramxVault.getMessageHash(testUser, testAmount, testDeadline, testNonce);
  console.log("✅ EIP-712 message hash generated:", messageHash);

  console.log("\n🎯 Deployment Summary:");
  console.log("==========================================");
  console.log("📋 Contract Addresses:");
  console.log("  🪙 GRAMxToken:   ", gramxToken.address);
  console.log("  🏦 GramxVault:   ", gramxVault.address);
  console.log("  🔄 LP Pair:      ", lpPair);
  console.log("\n📋 External Addresses:");
  console.log("  💰 PAXG:         ", PAXG_ADDRESS);
  console.log("  🦄 Uniswap V2 Router:", UNISWAP_V2_ROUTER);
  console.log("  🏭 Uniswap V2 Factory:", UNISWAP_V2_FACTORY);
  console.log("==========================================");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      gramxToken: gramxToken.address,
      gramxVault: gramxVault.address,
      lpPair: lpPair,
    },
    external: {
      paxg: PAXG_ADDRESS,
      uniswapRouter: UNISWAP_V2_ROUTER,
      uniswapFactory: UNISWAP_V2_FACTORY,
    },
    gasUsed: {
      gramxToken: (await gramxToken.deployTransaction.wait()).gasUsed.toString(),
      gramxVault: (await gramxVault.deployTransaction.wait()).gasUsed.toString(),
    },
  };

  // Write deployment info to file
  const fs = require("fs");
  const deploymentPath = `./deployments/${network.name}-deployment.json`;
  
  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: ${deploymentPath}`);

  // Create frontend config
  const frontendConfig = {
    CHAIN_ID: network.chainId,
    CONTRACTS: {
      GRAMX_TOKEN: gramxToken.address,
      GRAMX_VAULT: gramxVault.address,
      LP_PAIR: lpPair,
    },
    EXTERNAL: {
      PAXG: PAXG_ADDRESS,
      UNISWAP_ROUTER: UNISWAP_V2_ROUTER,
      UNISWAP_FACTORY: UNISWAP_V2_FACTORY,
    },
  };

  const frontendConfigPath = "./frontend/src/config/contracts.json";
  
  // Create config directory if it doesn't exist
  if (!fs.existsSync("./frontend/src/config")) {
    fs.mkdirSync("./frontend/src/config", { recursive: true });
  }

  fs.writeFileSync(frontendConfigPath, JSON.stringify(frontendConfig, null, 2));
  console.log(`📱 Frontend config saved to: ${frontendConfigPath}`);

  console.log("\n🎉 Deployment completed successfully!");
  
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Verify contracts on Etherscan:");
    console.log(`npx hardhat verify --network ${network.name} ${gramxToken.address} "${deployer.address}"`);
    console.log(`npx hardhat verify --network ${network.name} ${gramxVault.address} "${gramxToken.address}" "${PAXG_ADDRESS}" "${UNISWAP_V2_ROUTER}" "${UNISWAP_V2_FACTORY}" "${deployer.address}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });