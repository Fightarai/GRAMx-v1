// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

/**
 * @title GRAMxToken
 * @dev ERC-20 token backed by PAXG through the GRAMX Vault
 * Only the designated vault contract can mint and burn tokens
 */
contract GRAMxToken is ERC20, Ownable, Pausable, ERC20Permit {
    address public vault;
    
    // Events
    event VaultSet(address indexed oldVault, address indexed newVault);
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    // Modifiers
    modifier onlyVault() {
        require(msg.sender == vault, "GRAMxToken: caller is not the vault");
        _;
    }
    
    /**
     * @dev Constructor sets initial owner and token details
     * @param _initialOwner Address of the initial owner
     */
    constructor(address _initialOwner) 
        ERC20("GRAMX Token", "GRAMX") 
        Ownable(_initialOwner)
        ERC20Permit("GRAMX Token")
    {
        // Initial supply is 0 - tokens are only minted through the vault
    }
    
    /**
     * @dev Sets the vault address that can mint and burn tokens
     * @param _vault Address of the vault contract
     */
    function setVault(address _vault) external onlyOwner {
        require(_vault != address(0), "GRAMxToken: vault cannot be zero address");
        address oldVault = vault;
        vault = _vault;
        emit VaultSet(oldVault, _vault);
    }
    
    /**
     * @dev Mints tokens to specified address (only callable by vault)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyVault whenNotPaused {
        require(to != address(0), "GRAMxToken: mint to zero address");
        require(amount > 0, "GRAMxToken: mint amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burns tokens from specified address (only callable by vault)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burn(address from, uint256 amount) external onlyVault whenNotPaused {
        require(from != address(0), "GRAMxToken: burn from zero address");
        require(amount > 0, "GRAMxToken: burn amount must be greater than 0");
        require(balanceOf(from) >= amount, "GRAMxToken: burn amount exceeds balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount);
    }
    
    /**
     * @dev Pauses all token transfers (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override transfer function to include pause functionality
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    /**
     * @dev Returns the number of decimals (18 - same as PAXG for easy conversion)
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}