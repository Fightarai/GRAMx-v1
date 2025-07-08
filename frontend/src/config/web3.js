import { configureChains, createConfig } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';

// Configure chains and providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    ...(process.env.NODE_ENV === 'development' ? [sepolia, hardhat] : []),
  ],
  [
    alchemyProvider({ 
      apiKey: process.env.REACT_APP_ALCHEMY_API_KEY || 'demo' 
    }),
    publicProvider(),
  ]
);

// Configure RainbowKit
const { connectors } = getDefaultWallets({
  appName: 'GRAMX Vault',
  projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'default',
  chains,
});

// Create wagmi config
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export { wagmiConfig, chains };