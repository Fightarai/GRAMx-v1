// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./GRAMxToken.sol";

interface IUniswapV2Router02 {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
    function createPair(address tokenA, address tokenB) external returns (address pair);
}

interface IUniswapV2Pair {
    function balanceOf(address owner) external view returns (uint);
    function totalSupply() external view returns (uint);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
}

/**
 * @title GramxVault
 * @dev Main vault contract for GRAMX token minting, burning, and LP management
 * Features gasless minting via EIP-712 signatures and automatic LP provision
 */
contract GramxVault is ReentrancyGuard, Ownable, Pausable, EIP712 {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // State variables
    GRAMxToken public immutable gramx;
    IERC20 public immutable paxg;
    IUniswapV2Router02 public immutable uniswapRouter;
    IUniswapV2Factory public immutable uniswapFactory;
    address public lpPair;
    
    // EIP-712 signature tracking
    mapping(address => uint256) public nonces;
    
    // Vault statistics
    uint256 public totalPAXGDeposited;
    uint256 public totalGRAMXMinted;
    uint256 public totalLPTokens;
    
    // Constants
    bytes32 private constant MINT_TYPEHASH = keccak256("Mint(address user,uint256 amountPAXG,uint256 deadline,uint256 nonce)");
    uint256 public constant MIN_MINT_AMOUNT = 1e15; // 0.001 PAXG minimum
    uint256 public constant MAX_MINT_AMOUNT = 1000e18; // 1000 PAXG maximum
    
    // Events
    event Minted(address indexed user, uint256 amountPAXG, uint256 amountGRAMX, uint256 lpTokens);
    event Redeemed(address indexed user, uint256 amountGRAMX, uint256 amountPAXG);
    event LiquidityAdded(uint256 amountPAXG, uint256 amountGRAMX, uint256 lpTokens);
    event LiquidityRemoved(uint256 amountPAXG, uint256 amountGRAMX, uint256 lpTokens);
    event EmergencyWithdrawal(address indexed token, uint256 amount);
    event MetaTransactionExecuted(address indexed user, bytes32 indexed functionSelector);
    
    /**
     * @dev Constructor initializes the vault with token addresses and Uniswap integration
     */
    constructor(
        address _gramx,
        address _paxg,
        address _uniswapRouter,
        address _uniswapFactory,
        address _initialOwner
    ) EIP712("GramxVault", "1") Ownable(_initialOwner) {
        require(_gramx != address(0), "GramxVault: GRAMX address cannot be zero");
        require(_paxg != address(0), "GramxVault: PAXG address cannot be zero");
        require(_uniswapRouter != address(0), "GramxVault: Router address cannot be zero");
        require(_uniswapFactory != address(0), "GramxVault: Factory address cannot be zero");
        
        gramx = GRAMxToken(_gramx);
        paxg = IERC20(_paxg);
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        uniswapFactory = IUniswapV2Factory(_uniswapFactory);
        
        // Create or get the LP pair
        lpPair = uniswapFactory.getPair(_paxg, _gramx);
        if (lpPair == address(0)) {
            lpPair = uniswapFactory.createPair(_paxg, _gramx);
        }
    }
    
    /**
     * @dev Standard mint function (requires gas)
     * @param amountPAXG Amount of PAXG to deposit
     */
    function mint(uint256 amountPAXG) external nonReentrant whenNotPaused {
        _executeMint(msg.sender, amountPAXG);
    }
    
    /**
     * @dev Gasless mint function using EIP-712 signatures
     * @param user Address of the user minting tokens
     * @param amountPAXG Amount of PAXG to deposit
     * @param deadline Transaction deadline
     * @param nonce User's current nonce
     * @param signature EIP-712 signature
     */
    function mintWithSignature(
        address user,
        uint256 amountPAXG,
        uint256 deadline,
        uint256 nonce,
        bytes calldata signature
    ) external nonReentrant whenNotPaused {
        require(block.timestamp <= deadline, "GramxVault: signature expired");
        require(nonce == nonces[user], "GramxVault: invalid nonce");
        
        // Verify EIP-712 signature
        bytes32 structHash = keccak256(abi.encode(MINT_TYPEHASH, user, amountPAXG, deadline, nonce));
        bytes32 hash = _hashTypedDataV4(structHash);
        address signer = hash.recover(signature);
        require(signer == user, "GramxVault: invalid signature");
        
        // Increment nonce to prevent replay attacks
        nonces[user]++;
        
        // Execute mint
        _executeMint(user, amountPAXG);
        
        emit MetaTransactionExecuted(user, bytes32("mint"));
    }
    
    /**
     * @dev Internal function to execute minting logic
     * @param user Address of the user
     * @param amountPAXG Amount of PAXG to deposit
     */
    function _executeMint(address user, uint256 amountPAXG) internal {
        require(amountPAXG >= MIN_MINT_AMOUNT, "GramxVault: amount below minimum");
        require(amountPAXG <= MAX_MINT_AMOUNT, "GramxVault: amount above maximum");
        
        // Transfer PAXG from user to vault
        paxg.safeTransferFrom(user, address(this), amountPAXG);
        
        // Calculate GRAMX amount (1:1 ratio with PAXG)
        uint256 gramxAmount = amountPAXG;
        uint256 totalMint = gramxAmount * 2; // Mint 2x: 1x to user, 1x for LP
        
        // Mint GRAMX tokens
        gramx.mint(user, gramxAmount);         // To user
        gramx.mint(address(this), gramxAmount); // To vault for LP
        
        // Add liquidity to Uniswap
        uint256 lpTokens = _addLiquidity(amountPAXG, gramxAmount);
        
        // Update vault statistics
        totalPAXGDeposited += amountPAXG;
        totalGRAMXMinted += totalMint;
        totalLPTokens += lpTokens;
        
        emit Minted(user, amountPAXG, gramxAmount, lpTokens);
    }
    
    /**
     * @dev Redeem GRAMX tokens for PAXG
     * @param amountGRAMX Amount of GRAMX to redeem
     */
    function redeem(uint256 amountGRAMX) external nonReentrant whenNotPaused {
        require(amountGRAMX > 0, "GramxVault: amount must be greater than 0");
        require(gramx.balanceOf(msg.sender) >= amountGRAMX, "GramxVault: insufficient GRAMX balance");
        
        // Calculate PAXG amount to return (1:1 ratio)
        uint256 paxgAmount = amountGRAMX;
        require(paxg.balanceOf(address(this)) >= paxgAmount, "GramxVault: insufficient PAXG reserves");
        
        // Burn GRAMX tokens
        gramx.burn(msg.sender, amountGRAMX);
        
        // Transfer PAXG to user
        paxg.safeTransfer(msg.sender, paxgAmount);
        
        // Update statistics
        totalGRAMXMinted -= amountGRAMX;
        totalPAXGDeposited -= paxgAmount;
        
        emit Redeemed(msg.sender, amountGRAMX, paxgAmount);
    }
    
    /**
     * @dev Internal function to add liquidity to Uniswap
     * @param amountPAXG Amount of PAXG to add
     * @param amountGRAMX Amount of GRAMX to add
     * @return lpTokens Amount of LP tokens received
     */
    function _addLiquidity(uint256 amountPAXG, uint256 amountGRAMX) internal returns (uint256 lpTokens) {
        // Approve tokens for Uniswap router
        paxg.safeApprove(address(uniswapRouter), amountPAXG);
        gramx.approve(address(uniswapRouter), amountGRAMX);
        
        // Add liquidity
        (, , lpTokens) = uniswapRouter.addLiquidity(
            address(paxg),
            address(gramx),
            amountPAXG,
            amountGRAMX,
            0, // Accept any amount of tokens
            0, // Accept any amount of tokens
            address(this), // LP tokens go to vault
            block.timestamp + 600 // 10 minute deadline
        );
        
        emit LiquidityAdded(amountPAXG, amountGRAMX, lpTokens);
    }
    
    /**
     * @dev Get the current reserve ratio (PAXG reserves / Total GRAMX supply)
     * @return ratio Reserve ratio in basis points (10000 = 100%)
     */
    function getReserveRatio() external view returns (uint256 ratio) {
        uint256 totalSupply = gramx.totalSupply();
        if (totalSupply == 0) return 10000; // 100% if no tokens minted
        
        uint256 paxgReserves = paxg.balanceOf(address(this));
        ratio = (paxgReserves * 10000) / totalSupply;
    }
    
    /**
     * @dev Get LP pair reserves
     * @return reservePAXG PAXG reserve in LP
     * @return reserveGRAMX GRAMX reserve in LP
     */
    function getLPReserves() external view returns (uint256 reservePAXG, uint256 reserveGRAMX) {
        if (lpPair == address(0)) return (0, 0);
        
        IUniswapV2Pair pair = IUniswapV2Pair(lpPair);
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        
        // Determine which token is token0
        if (address(paxg) < address(gramx)) {
            reservePAXG = uint256(reserve0);
            reserveGRAMX = uint256(reserve1);
        } else {
            reservePAXG = uint256(reserve1);
            reserveGRAMX = uint256(reserve0);
        }
    }
    
    /**
     * @dev Get vault statistics
     * @return paxgBalance Total PAXG in vault
     * @return gramxSupply Total GRAMX supply
     * @return lpBalance Total LP tokens held by vault
     * @return reserveRatio Current reserve ratio
     */
    function getVaultStats() external view returns (
        uint256 paxgBalance,
        uint256 gramxSupply,
        uint256 lpBalance,
        uint256 reserveRatio
    ) {
        paxgBalance = paxg.balanceOf(address(this));
        gramxSupply = gramx.totalSupply();
        lpBalance = lpPair != address(0) ? IUniswapV2Pair(lpPair).balanceOf(address(this)) : 0;
        
        if (gramxSupply == 0) {
            reserveRatio = 10000; // 100%
        } else {
            reserveRatio = (paxgBalance * 10000) / gramxSupply;
        }
    }
    
    /**
     * @dev Generate EIP-712 message hash for signature verification
     * @param user User address
     * @param amountPAXG Amount of PAXG
     * @param deadline Transaction deadline
     * @param nonce User nonce
     * @return hash Message hash
     */
    function getMessageHash(
        address user,
        uint256 amountPAXG,
        uint256 deadline,
        uint256 nonce
    ) external view returns (bytes32 hash) {
        bytes32 structHash = keccak256(abi.encode(MINT_TYPEHASH, user, amountPAXG, deadline, nonce));
        hash = _hashTypedDataV4(structHash);
    }
    
    /**
     * @dev Emergency withdrawal function (only owner)
     * @param token Token to withdraw
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "GramxVault: invalid token address");
        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdrawal(token, amount);
    }
    
    /**
     * @dev Pause contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}