const { ethers } = require("ethers");

/**
 * EIP-712 Domain and Types for GRAMX Vault
 */
const EIP712_DOMAIN = {
  name: "GramxVault",
  version: "1",
  chainId: 1, // Will be set dynamically
  verifyingContract: "", // Will be set when contract is deployed
};

const MINT_TYPES = {
  Mint: [
    { name: "user", type: "address" },
    { name: "amountPAXG", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

/**
 * Generate EIP-712 signature for mint function
 * @param {object} signer - Ethers signer object
 * @param {string} contractAddress - Vault contract address
 * @param {number} chainId - Chain ID
 * @param {object} message - Message object with user, amountPAXG, deadline, nonce
 * @returns {string} Signature
 */
async function signMintMessage(signer, contractAddress, chainId, message) {
  const domain = {
    ...EIP712_DOMAIN,
    chainId,
    verifyingContract: contractAddress,
  };

  const signature = await signer._signTypedData(domain, MINT_TYPES, message);
  return signature;
}

/**
 * Generate message hash for verification
 * @param {string} contractAddress - Vault contract address
 * @param {number} chainId - Chain ID
 * @param {object} message - Message object with user, amountPAXG, deadline, nonce
 * @returns {string} Message hash
 */
function getMintMessageHash(contractAddress, chainId, message) {
  const domain = {
    ...EIP712_DOMAIN,
    chainId,
    verifyingContract: contractAddress,
  };

  const hash = ethers.utils._TypedDataEncoder.hash(domain, MINT_TYPES, message);
  return hash;
}

/**
 * Recover signer address from signature
 * @param {string} contractAddress - Vault contract address
 * @param {number} chainId - Chain ID
 * @param {object} message - Message object
 * @param {string} signature - Signature to verify
 * @returns {string} Recovered address
 */
function recoverMintSigner(contractAddress, chainId, message, signature) {
  const domain = {
    ...EIP712_DOMAIN,
    chainId,
    verifyingContract: contractAddress,
  };

  const recoveredAddress = ethers.utils.verifyTypedData(
    domain,
    MINT_TYPES,
    message,
    signature
  );

  return recoveredAddress;
}

/**
 * Create mint message object
 * @param {string} user - User address
 * @param {string} amountPAXG - Amount of PAXG (as string)
 * @param {number} deadline - Unix timestamp deadline
 * @param {number} nonce - User nonce
 * @returns {object} Message object
 */
function createMintMessage(user, amountPAXG, deadline, nonce) {
  return {
    user,
    amountPAXG,
    deadline,
    nonce,
  };
}

/**
 * Get current timestamp plus minutes
 * @param {number} minutes - Minutes to add to current time
 * @returns {number} Unix timestamp
 */
function getDeadline(minutes = 30) {
  return Math.floor(Date.now() / 1000) + minutes * 60;
}

/**
 * Validate mint message parameters
 * @param {object} message - Message object to validate
 * @returns {boolean} Whether message is valid
 */
function validateMintMessage(message) {
  const { user, amountPAXG, deadline, nonce } = message;

  // Check all required fields are present
  if (!user || !amountPAXG || !deadline || nonce === undefined) {
    return false;
  }

  // Check user is valid address
  if (!ethers.utils.isAddress(user)) {
    return false;
  }

  // Check amountPAXG is positive
  const amount = ethers.BigNumber.from(amountPAXG);
  if (amount.lte(0)) {
    return false;
  }

  // Check deadline is in the future
  const currentTime = Math.floor(Date.now() / 1000);
  if (deadline <= currentTime) {
    return false;
  }

  // Check nonce is non-negative
  if (nonce < 0) {
    return false;
  }

  return true;
}

/**
 * Format PAXG amount from user input
 * @param {string|number} amount - Amount in PAXG
 * @returns {string} Formatted amount as string
 */
function formatPAXGAmount(amount) {
  return ethers.utils.parseEther(amount.toString()).toString();
}

/**
 * Parse PAXG amount for display
 * @param {string} amount - Amount as string
 * @returns {string} Formatted amount for display
 */
function parsePAXGAmount(amount) {
  return ethers.utils.formatEther(amount);
}

module.exports = {
  EIP712_DOMAIN,
  MINT_TYPES,
  signMintMessage,
  getMintMessageHash,
  recoverMintSigner,
  createMintMessage,
  getDeadline,
  validateMintMessage,
  formatPAXGAmount,
  parsePAXGAmount,
};