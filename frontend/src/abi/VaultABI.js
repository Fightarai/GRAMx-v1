export const VaultABI = [
  // View functions
  {
    "inputs": [],
    "name": "getVaultStats",
    "outputs": [
      { "internalType": "uint256", "name": "paxgBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "gramxSupply", "type": "uint256" },
      { "internalType": "uint256", "name": "lpBalance", "type": "uint256" },
      { "internalType": "uint256", "name": "reserveRatio", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getReserveRatio",
    "outputs": [
      { "internalType": "uint256", "name": "ratio", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getLPReserves",
    "outputs": [
      { "internalType": "uint256", "name": "reservePAXG", "type": "uint256" },
      { "internalType": "uint256", "name": "reserveGRAMX", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amountPAXG", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" }
    ],
    "name": "getMessageHash",
    "outputs": [
      { "internalType": "bytes32", "name": "hash", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "name": "nonces",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PAXG_TO_GRAMX_RATIO",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountPAXG", "type": "uint256" }
    ],
    "name": "convertPAXGToGRAMX",
    "outputs": [
      { "internalType": "uint256", "name": "amountGRAMX", "type": "uint256" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountGRAMX", "type": "uint256" }
    ],
    "name": "convertGRAMXToPAXG",
    "outputs": [
      { "internalType": "uint256", "name": "amountPAXG", "type": "uint256" }
    ],
    "stateMutability": "pure",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountPAXG", "type": "uint256" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "user", "type": "address" },
      { "internalType": "uint256", "name": "amountPAXG", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint256", "name": "nonce", "type": "uint256" },
      { "internalType": "bytes", "name": "signature", "type": "bytes" }
    ],
    "name": "mintWithSignature",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "amountGRAMX", "type": "uint256" }
    ],
    "name": "redeem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amountPAXG", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amountGRAMX", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "lpTokens", "type": "uint256" }
    ],
    "name": "Minted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amountGRAMX", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amountPAXG", "type": "uint256" }
    ],
    "name": "Redeemed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "amountPAXG", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "amountGRAMX", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "lpTokens", "type": "uint256" }
    ],
    "name": "LiquidityAdded",
    "type": "event"
  }
];