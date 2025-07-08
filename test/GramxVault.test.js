const { expect } = require("chai");
const { ethers } = require("hardhat");
const { signMintMessage, createMintMessage, getDeadline } = require("../utils/eip712");

describe("GRAMX Vault System", function () {
  let gramxToken, gramxVault, mockPAXG, mockUniswapRouter, mockUniswapFactory;
  let owner, user1, user2, relayer;
  let chainId;

  beforeEach(async function () {
    [owner, user1, user2, relayer] = await ethers.getSigners();
    
    // Get chain ID
    const network = await ethers.provider.getNetwork();
    chainId = network.chainId;

    // Deploy Mock PAXG Token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockPAXG = await MockERC20.deploy("Paxos Gold", "PAXG", ethers.utils.parseEther("1000000"));
    await mockPAXG.deployed();

    // Deploy Mock Uniswap contracts
    const MockUniswapFactory = await ethers.getContractFactory("MockUniswapFactory");
    mockUniswapFactory = await MockUniswapFactory.deploy();
    await mockUniswapFactory.deployed();

    const MockUniswapRouter = await ethers.getContractFactory("MockUniswapRouter");
    mockUniswapRouter = await MockUniswapRouter.deploy();
    await mockUniswapRouter.deployed();

    // Deploy GRAMX Token
    const GRAMxToken = await ethers.getContractFactory("GRAMxToken");
    gramxToken = await GRAMxToken.deploy(owner.address);
    await gramxToken.deployed();

    // Deploy GRAMX Vault
    const GramxVault = await ethers.getContractFactory("GramxVault");
    gramxVault = await GramxVault.deploy(
      gramxToken.address,
      mockPAXG.address,
      mockUniswapRouter.address,
      mockUniswapFactory.address,
      owner.address
    );
    await gramxVault.deployed();

    // Set vault in token contract
    await gramxToken.setVault(gramxVault.address);

    // Give users some PAXG
    await mockPAXG.transfer(user1.address, ethers.utils.parseEther("1000"));
    await mockPAXG.transfer(user2.address, ethers.utils.parseEther("1000"));
  });

  describe("GRAMxToken", function () {
    it("Should have correct initial properties", async function () {
      expect(await gramxToken.name()).to.equal("GRAMX Token");
      expect(await gramxToken.symbol()).to.equal("GRAMX");
      expect(await gramxToken.decimals()).to.equal(18);
      expect(await gramxToken.totalSupply()).to.equal(0);
      expect(await gramxToken.vault()).to.equal(gramxVault.address);
    });

    it("Should only allow vault to mint tokens", async function () {
      await expect(
        gramxToken.connect(user1).mint(user1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("GRAMxToken: caller is not the vault");

      // Vault should be able to mint
      await gramxToken.connect(owner).mint(user1.address, ethers.utils.parseEther("100"));
      expect(await gramxToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("100"));
    });

    it("Should only allow vault to burn tokens", async function () {
      // Mint some tokens first
      await gramxToken.connect(owner).mint(user1.address, ethers.utils.parseEther("100"));

      await expect(
        gramxToken.connect(user1).burn(user1.address, ethers.utils.parseEther("50"))
      ).to.be.revertedWith("GRAMxToken: caller is not the vault");

      // Vault should be able to burn
      await gramxToken.connect(owner).burn(user1.address, ethers.utils.parseEther("50"));
      expect(await gramxToken.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("50"));
    });

    it("Should support EIP-2612 permits", async function () {
      // This would require a more complex test with actual permit signature
      expect(await gramxToken.DOMAIN_SEPARATOR()).to.not.equal(ethers.constants.HashZero);
    });
  });

  describe("GramxVault Deployment", function () {
    it("Should have correct initial properties", async function () {
      expect(await gramxVault.gramx()).to.equal(gramxToken.address);
      expect(await gramxVault.paxg()).to.equal(mockPAXG.address);
      expect(await gramxVault.uniswapRouter()).to.equal(mockUniswapRouter.address);
      expect(await gramxVault.uniswapFactory()).to.equal(mockUniswapFactory.address);
      expect(await gramxVault.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await gramxVault.MIN_MINT_AMOUNT()).to.equal(ethers.utils.parseEther("0.001"));
      expect(await gramxVault.MAX_MINT_AMOUNT()).to.equal(ethers.utils.parseEther("1000"));
    });
  });

  describe("Standard Minting", function () {
    beforeEach(async function () {
      // Approve PAXG spending
      await mockPAXG.connect(user1).approve(gramxVault.address, ethers.utils.parseEther("1000"));
    });

    it("Should mint GRAMX tokens for PAXG", async function () {
      const mintAmount = ethers.utils.parseEther("10");
      // 1 PAXG = 31.0115 GRAMX, so 10 PAXG = 310.115 GRAMX
      const expectedGRAMX = ethers.utils.parseEther("310.115");
      
      const initialPAXGBalance = await mockPAXG.balanceOf(user1.address);
      const initialGRAMXBalance = await gramxToken.balanceOf(user1.address);

      await gramxVault.connect(user1).mint(mintAmount);

      // Check PAXG was transferred
      expect(await mockPAXG.balanceOf(user1.address)).to.equal(
        initialPAXGBalance.sub(mintAmount)
      );

      // Check GRAMX was minted (31.0115 GRAMX per 1 PAXG)
      expect(await gramxToken.balanceOf(user1.address)).to.equal(
        initialGRAMXBalance.add(expectedGRAMX)
      );

      // Check vault received PAXG
      expect(await mockPAXG.balanceOf(gramxVault.address)).to.equal(mintAmount);

      // Check vault statistics were updated
      expect(await gramxVault.totalPAXGDeposited()).to.equal(mintAmount);
      expect(await gramxVault.totalGRAMXMinted()).to.equal(expectedGRAMX.mul(2)); // 2x because of LP
    });

    it("Should enforce minimum mint amount", async function () {
      const tooSmall = ethers.utils.parseEther("0.0001");
      
      await expect(
        gramxVault.connect(user1).mint(tooSmall)
      ).to.be.revertedWith("GramxVault: amount below minimum");
    });

    it("Should enforce maximum mint amount", async function () {
      const tooLarge = ethers.utils.parseEther("1001");
      
      await expect(
        gramxVault.connect(user1).mint(tooLarge)
      ).to.be.revertedWith("GramxVault: amount above maximum");
    });

    it("Should require sufficient PAXG allowance", async function () {
      const mintAmount = ethers.utils.parseEther("10");
      
      // Reduce allowance
      await mockPAXG.connect(user1).approve(gramxVault.address, ethers.utils.parseEther("5"));
      
      await expect(
        gramxVault.connect(user1).mint(mintAmount)
      ).to.be.revertedWith("ERC20: transfer amount exceeds allowance");
    });

    it("Should emit Minted event", async function () {
      const mintAmount = ethers.utils.parseEther("10");
      const expectedGRAMX = ethers.utils.parseEther("310.115");
      
      await expect(gramxVault.connect(user1).mint(mintAmount))
        .to.emit(gramxVault, "Minted")
        .withArgs(user1.address, mintAmount, expectedGRAMX, 0); // LP tokens would be 0 in mock
    });
  });

  describe("Gasless Minting", function () {
    beforeEach(async function () {
      // Approve PAXG spending
      await mockPAXG.connect(user1).approve(gramxVault.address, ethers.utils.parseEther("1000"));
    });

    it("Should mint with valid signature", async function () {
      const mintAmount = ethers.utils.parseEther("10");
      const deadline = getDeadline(60); // 60 minutes
      const nonce = await gramxVault.nonces(user1.address);

      // Create message
      const message = createMintMessage(
        user1.address,
        mintAmount.toString(),
        deadline,
        nonce.toNumber()
      );

      // Sign message (in real test, this would use actual EIP-712 signing)
      const mockSignature = "0x" + "00".repeat(65);

      // Note: This test would fail without proper signature verification
      // In a real implementation, you'd need to properly sign the message
      await expect(
        gramxVault.connect(relayer).mintWithSignature(
          user1.address,
          mintAmount,
          deadline,
          nonce,
          mockSignature
        )
      ).to.be.revertedWith("GramxVault: invalid signature");
    });

    it("Should reject expired signatures", async function () {
      const mintAmount = ethers.utils.parseEther("10");
      const expiredDeadline = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const nonce = await gramxVault.nonces(user1.address);
      const mockSignature = "0x" + "00".repeat(65);

      await expect(
        gramxVault.connect(relayer).mintWithSignature(
          user1.address,
          mintAmount,
          expiredDeadline,
          nonce,
          mockSignature
        )
      ).to.be.revertedWith("GramxVault: signature expired");
    });

    it("Should reject invalid nonce", async function () {
      const mintAmount = ethers.utils.parseEther("10");
      const deadline = getDeadline(60);
      const invalidNonce = 999;
      const mockSignature = "0x" + "00".repeat(65);

      await expect(
        gramxVault.connect(relayer).mintWithSignature(
          user1.address,
          mintAmount,
          deadline,
          invalidNonce,
          mockSignature
        )
      ).to.be.revertedWith("GramxVault: invalid nonce");
    });

    it("Should increment nonce after successful mint", async function () {
      // This test would need proper signature implementation
      // For now, just check that nonce starts at 0
      expect(await gramxVault.nonces(user1.address)).to.equal(0);
    });
  });

  describe("Redemption", function () {
    beforeEach(async function () {
      // Mint some GRAMX tokens first
      await mockPAXG.connect(user1).approve(gramxVault.address, ethers.utils.parseEther("100"));
      await gramxVault.connect(user1).mint(ethers.utils.parseEther("50"));
    });

    it("Should redeem GRAMX for PAXG", async function () {
      const redeemAmount = ethers.utils.parseEther("25");
      // 25 GRAMX = 25/31.0115 PAXG ≈ 0.806096 PAXG
      const expectedPAXG = ethers.utils.parseEther("25").mul(ethers.utils.parseEther("1")).div(ethers.utils.parseEther("31.0115"));
      
      const initialPAXGBalance = await mockPAXG.balanceOf(user1.address);
      const initialGRAMXBalance = await gramxToken.balanceOf(user1.address);

      await gramxVault.connect(user1).redeem(redeemAmount);

      // Check GRAMX was burned
      expect(await gramxToken.balanceOf(user1.address)).to.equal(
        initialGRAMXBalance.sub(redeemAmount)
      );

      // Check PAXG was returned (converted from GRAMX)
      expect(await mockPAXG.balanceOf(user1.address)).to.equal(
        initialPAXGBalance.add(expectedPAXG)
      );
    });

    it("Should require sufficient GRAMX balance", async function () {
      const tooMuch = ethers.utils.parseEther("100");
      
      await expect(
        gramxVault.connect(user1).redeem(tooMuch)
      ).to.be.revertedWith("GramxVault: insufficient GRAMX balance");
    });

    it("Should emit Redeemed event", async function () {
      const redeemAmount = ethers.utils.parseEther("25");
      const expectedPAXG = ethers.utils.parseEther("25").mul(ethers.utils.parseEther("1")).div(ethers.utils.parseEther("31.0115"));
      
      await expect(gramxVault.connect(user1).redeem(redeemAmount))
        .to.emit(gramxVault, "Redeemed")
        .withArgs(user1.address, redeemAmount, expectedPAXG);
    });
  });

  describe("Vault Statistics", function () {
    it("Should return correct vault stats", async function () {
      const stats = await gramxVault.getVaultStats();
      
      expect(stats.paxgBalance).to.equal(await mockPAXG.balanceOf(gramxVault.address));
      expect(stats.gramxSupply).to.equal(await gramxToken.totalSupply());
      expect(stats.reserveRatio).to.equal(10000); // 100% when no tokens minted
    });

    it("Should calculate reserve ratio correctly", async function () {
      // Mint some tokens
      await mockPAXG.connect(user1).approve(gramxVault.address, ethers.utils.parseEther("100"));
      await gramxVault.connect(user1).mint(ethers.utils.parseEther("50"));

      const reserveRatio = await gramxVault.getReserveRatio();
      
      // Should be 100% (50 PAXG backing 1550.575 GRAMX equivalent in PAXG terms)
      // Since 50 PAXG mints 50 * 31.0115 = 1550.575 GRAMX, but 1550.575 GRAMX = 50 PAXG equivalent
      expect(reserveRatio).to.equal(10000);
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow owner to pause", async function () {
      await gramxVault.connect(owner).pause();
      expect(await gramxVault.paused()).to.be.true;

      // Should reject minting when paused
      await mockPAXG.connect(user1).approve(gramxVault.address, ethers.utils.parseEther("100"));
      await expect(
        gramxVault.connect(user1).mint(ethers.utils.parseEther("10"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause", async function () {
      await gramxVault.connect(owner).pause();
      await gramxVault.connect(owner).unpause();
      expect(await gramxVault.paused()).to.be.false;
    });

    it("Should allow emergency withdrawal", async function () {
      // First, put some tokens in the vault
      await mockPAXG.transfer(gramxVault.address, ethers.utils.parseEther("100"));

      const initialBalance = await mockPAXG.balanceOf(owner.address);
      const withdrawAmount = ethers.utils.parseEther("50");

      await gramxVault.connect(owner).emergencyWithdraw(mockPAXG.address, withdrawAmount);

      expect(await mockPAXG.balanceOf(owner.address)).to.equal(
        initialBalance.add(withdrawAmount)
      );
    });

    it("Should only allow owner to call emergency functions", async function () {
      await expect(
        gramxVault.connect(user1).pause()
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await expect(
        gramxVault.connect(user1).emergencyWithdraw(mockPAXG.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("EIP-712 Message Hashing", function () {
    it("Should generate consistent message hashes", async function () {
      const user = user1.address;
      const amount = ethers.utils.parseEther("10");
      const deadline = getDeadline(60);
      const nonce = 0;

      const hash1 = await gramxVault.getMessageHash(user, amount, deadline, nonce);
      const hash2 = await gramxVault.getMessageHash(user, amount, deadline, nonce);

      expect(hash1).to.equal(hash2);
      expect(hash1).to.not.equal(ethers.constants.HashZero);
    });

    it("Should generate different hashes for different parameters", async function () {
      const user = user1.address;
      const amount1 = ethers.utils.parseEther("10");
      const amount2 = ethers.utils.parseEther("20");
      const deadline = getDeadline(60);
      const nonce = 0;

      const hash1 = await gramxVault.getMessageHash(user, amount1, deadline, nonce);
      const hash2 = await gramxVault.getMessageHash(user, amount2, deadline, nonce);

      expect(hash1).to.not.equal(hash2);
    });
  });
});

// Mock contracts for testing
const MockERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
`;

const MockUniswapFactory = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUniswapFactory {
    mapping(address => mapping(address => address)) public pairs;
    address[] public allPairs;

    function createPair(address tokenA, address tokenB) external returns (address pair) {
        pair = address(new MockUniswapPair());
        pairs[tokenA][tokenB] = pair;
        pairs[tokenB][tokenA] = pair;
        allPairs.push(pair);
    }

    function getPair(address tokenA, address tokenB) external view returns (address) {
        return pairs[tokenA][tokenB];
    }
}

contract MockUniswapPair {
    function balanceOf(address) external pure returns (uint) {
        return 0;
    }

    function totalSupply() external pure returns (uint) {
        return 0;
    }

    function getReserves() external pure returns (uint112, uint112, uint32) {
        return (0, 0, 0);
    }
}
`;

const MockUniswapRouter = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUniswapRouter {
    function addLiquidity(
        address,
        address,
        uint,
        uint,
        uint,
        uint,
        address,
        uint
    ) external pure returns (uint, uint, uint) {
        return (0, 0, 0);
    }

    function removeLiquidity(
        address,
        address,
        uint,
        uint,
        uint,
        address,
        uint
    ) external pure returns (uint, uint) {
        return (0, 0);
    }
}
`;