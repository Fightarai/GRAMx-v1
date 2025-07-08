# GRAMX Vault Conversion Ratio Fix

## Issue Identified
The GRAMX vault protocol was incorrectly using a 1:1 conversion ratio between PAXG and GRAMX tokens. However, since 1 PAXG = 31.0115 grams of gold, and GRAMX represents grams of gold, the correct conversion should be:

**1 PAXG = 31.0115 GRAMX**

## Changes Made

### 1. Smart Contract Updates (`contracts/GramxVault.sol`)

#### Added Conversion Constant
```solidity
// Conversion ratio: 1 PAXG = 31.0115 grams of gold = 31.0115 GRAMX
// Using 18 decimals: 31.0115 * 1e18 = 31011500000000000000
uint256 public constant PAXG_TO_GRAMX_RATIO = 31011500000000000000; // 31.0115 with 18 decimals
```

#### Updated Mint Function
**Before:**
```solidity
// Calculate GRAMX amount (1:1 ratio with PAXG)
uint256 gramxAmount = amountPAXG;
```

**After:**
```solidity
// Calculate GRAMX amount (1 PAXG = 31.0115 GRAMX)
uint256 gramxAmount = (amountPAXG * PAXG_TO_GRAMX_RATIO) / 1e18;
```

#### Updated Redeem Function
**Before:**
```solidity
// Calculate PAXG amount to return (1:1 ratio)
uint256 paxgAmount = amountGRAMX;
```

**After:**
```solidity
// Calculate PAXG amount to return (31.0115 GRAMX = 1 PAXG)
uint256 paxgAmount = (amountGRAMX * 1e18) / PAXG_TO_GRAMX_RATIO;
require(paxgAmount > 0, "GramxVault: PAXG amount too small");
```

#### Updated Reserve Ratio Calculations
Fixed both `getReserveRatio()` and `getVaultStats()` to properly convert GRAMX supply to PAXG equivalent before calculating ratios.

#### Added Helper Functions
```solidity
function convertPAXGToGRAMX(uint256 amountPAXG) external pure returns (uint256 amountGRAMX);
function convertGRAMXToPAXG(uint256 amountGRAMX) external pure returns (uint256 amountPAXG);
```

### 2. Frontend Updates

#### Updated VaultABI (`frontend/src/abi/VaultABI.js`)
Added the new conversion functions and constant to the ABI.

#### Fixed useVaultStats Hook (`frontend/src/hooks/useVaultStats.js`)
Removed incorrect `backingRatio` calculation that assumed 1:1 ratio. The hook now relies on the contract's corrected reserve ratio calculations.

#### Updated Mint Page (`frontend/src/pages/Mint.js`)
**Before:**
```javascript
const gramxToReceive = amount ? parseFloat(amount) : 0;
```

**After:**
```javascript
const PAXG_TO_GRAMX_RATIO = 31.0115;
const gramxToReceive = amount ? parseFloat(amount) * PAXG_TO_GRAMX_RATIO : 0;
```

Fixed display text from "Receive equal amount of GRAMX tokens" to "Receive GRAMX tokens (1 PAXG = 31.0115 GRAMX)".

#### Updated Redeem Page (`frontend/src/pages/Redeem.js`)
**Before:**
```javascript
const paxgToReceive = amount ? parseFloat(amount) * (1 - parseFloat(vaultStats.redemptionFee) / 100) : 0;
```

**After:**
```javascript
const PAXG_TO_GRAMX_RATIO = 31.0115;
const paxgEquivalent = amount ? parseFloat(amount) / PAXG_TO_GRAMX_RATIO : 0;
const paxgToReceive = paxgEquivalent * (1 - parseFloat(vaultStats.redemptionFee) / 100);
```

Fixed display text to show correct conversion rate with fees.

#### Updated Liquidity Page (`frontend/src/pages/Liquidity.js`)
Changed "Stable 1:1 PAXG backing maintained" to "Stable PAXG backing maintained (1 PAXG = 31.0115 GRAMX)".

### 3. Test Updates (`test/GramxVault.test.js`)

Updated all tests to use the correct conversion ratio:

- Mint tests now expect 310.115 GRAMX for 10 PAXG input
- Redeem tests properly calculate PAXG equivalent for GRAMX input
- Reserve ratio tests updated with correct comments
- Event emission tests use correct conversion amounts

## Conversion Examples

### Minting
- **Input:** 1 PAXG
- **Output:** 31.0115 GRAMX (to user) + 31.0115 GRAMX (for LP)
- **Total GRAMX minted:** 62.023 GRAMX

### Redemption
- **Input:** 31.0115 GRAMX
- **Output:** 1 PAXG (before fees)

### Reserve Ratio
The reserve ratio calculation now properly compares:
- PAXG reserves in vault
- GRAMX supply converted to PAXG equivalent (GRAMX supply ÷ 31.0115)

## Verification

1. **Smart Contract:** The conversion functions can be called directly to verify calculations
2. **Frontend:** All amount displays and calculations now show correct conversions
3. **Tests:** All tests pass with the new conversion logic

## Impact

This fix ensures that:
- GRAMX tokens truly represent grams of gold as intended
- The 1 PAXG = 1 troy ounce = 31.0115 grams relationship is maintained
- Reserve ratios are calculated correctly
- User interfaces display accurate conversion rates
- The protocol maintains its gold-backed value proposition

The protocol now correctly implements the intended tokenomics where each GRAMX token represents one gram of gold value.