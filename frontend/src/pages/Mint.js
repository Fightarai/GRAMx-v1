import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Divider,
  Alert,
  AlertTitle,
  Chip,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  AccountBalance as VaultIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Mock contract addresses - these would come from config
const CONTRACTS = {
  GRAMX_VAULT: '0x1234567890123456789012345678901234567890',
  PAXG: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
};

const Mint = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [isGasless, setIsGasless] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [signature, setSignature] = useState('');
  const [nonce, setNonce] = useState(0);
  const [allowance, setAllowance] = useState('0');

  // Mock data - in real app, these would be from contract reads
  const [vaultStats, setVaultStats] = useState({
    minMintAmount: '0.001',
    maxMintAmount: '1000',
    reserveRatio: '200.15',
    currentTVL: '2,456,789.50',
  });

  // Get PAXG balance
  const { data: paxgBalance } = useBalance({
    address: address,
    token: CONTRACTS.PAXG,
    enabled: !!address,
  });

  // Calculate expected outputs - 1 PAXG = 31.0115 GRAMX
  const PAXG_TO_GRAMX_RATIO = 31.0115;
  const gramxToReceive = amount ? parseFloat(amount) * PAXG_TO_GRAMX_RATIO : 0;
  const lpTokensToCreate = amount ? parseFloat(amount) * 0.5 : 0; // Approximate LP tokens from PAXG contribution
  const totalPAXGNeeded = amount ? parseFloat(amount) : 0;

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxClick = () => {
    if (paxgBalance) {
      const maxAmount = Math.min(
        parseFloat(ethers.utils.formatEther(paxgBalance.value)),
        parseFloat(vaultStats.maxMintAmount)
      );
      setAmount(maxAmount.toString());
    }
  };

  const validateAmount = () => {
    if (!amount) return { valid: false, message: 'Please enter an amount' };
    
    const amountNum = parseFloat(amount);
    const minAmount = parseFloat(vaultStats.minMintAmount);
    const maxAmount = parseFloat(vaultStats.maxMintAmount);
    
    if (amountNum < minAmount) {
      return { valid: false, message: `Minimum amount is ${vaultStats.minMintAmount} PAXG` };
    }
    
    if (amountNum > maxAmount) {
      return { valid: false, message: `Maximum amount is ${vaultStats.maxMintAmount} PAXG` };
    }
    
    if (paxgBalance && amountNum > parseFloat(ethers.utils.formatEther(paxgBalance.value))) {
      return { valid: false, message: 'Insufficient PAXG balance' };
    }
    
    return { valid: true, message: '' };
  };

  const approveStep = async () => {
    setIsLoading(true);
    try {
      // Mock approval - in real app, this would call the PAXG approve function
      await new Promise(resolve => setTimeout(resolve, 2000));
      setAllowance(ethers.utils.parseEther(amount).toString());
      setActiveStep(1);
      toast.success('PAXG approval successful!');
    } catch (error) {
      toast.error('Approval failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const signTransaction = async () => {
    setIsLoading(true);
    try {
      // Mock signing - in real app, this would use EIP-712 signing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSignature = '0x' + '0'.repeat(130);
      setSignature(mockSignature);
      setNonce(nonce + 1);
      setActiveStep(2);
      toast.success('Transaction signed successfully!');
    } catch (error) {
      toast.error('Signing failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const submitMint = async () => {
    setIsLoading(true);
    try {
      // Mock mint execution - in real app, this would call the vault contract
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setActiveStep(3);
      toast.success(`Successfully minted ${gramxToReceive} GRAMX tokens!`);
      
      // Reset form
      setTimeout(() => {
        setAmount('');
        setActiveStep(0);
        setSignature('');
      }, 2000);
    } catch (error) {
      toast.error('Mint failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      label: 'Approve PAXG',
      description: 'Allow the vault to spend your PAXG tokens',
      action: approveStep,
      completed: parseFloat(allowance) >= parseFloat(ethers.utils.parseEther(amount || '0')),
    },
    {
      label: isGasless ? 'Sign Transaction' : 'Execute Mint',
      description: isGasless 
        ? 'Sign the mint transaction (gasless)' 
        : 'Execute the mint transaction',
      action: isGasless ? signTransaction : submitMint,
      completed: isGasless ? !!signature : false,
    },
    ...(isGasless ? [{
      label: 'Submit to Relayer',
      description: 'Submit signed transaction to gasless relayer',
      action: submitMint,
      completed: false,
    }] : []),
  ];

  const validation = validateAmount();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Mint GRAMX Tokens
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Deposit PAXG to mint GRAMX tokens backed by gold reserves
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Main Mint Form */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Gasless Toggle */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight="600">
                    Mint Configuration
                  </Typography>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={isGasless}
                        onChange={(e) => setIsGasless(e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SpeedIcon fontSize="small" />
                        Gasless Mint
                        <Tooltip title="Use EIP-712 signatures for gasless transactions">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </Box>
                    }
                  />
                </Box>

                {/* Amount Input */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Amount to Mint
                  </Typography>
                  <TextField
                    fullWidth
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.0"
                    variant="outlined"
                    error={!validation.valid && !!amount}
                    helperText={!validation.valid && amount ? validation.message : ''}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Button
                              size="small"
                              onClick={handleMaxClick}
                              disabled={!paxgBalance}
                            >
                              MAX
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                              PAXG
                            </Typography>
                          </Box>
                        </InputAdornment>
                      ),
                      sx: {
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }
                    }}
                  />
                  
                  {paxgBalance && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Balance: {parseFloat(ethers.utils.formatEther(paxgBalance.value)).toFixed(4)} PAXG
                    </Typography>
                  )}
                </Box>

                {/* Expected Output */}
                <AnimatePresence>
                  {amount && validation.valid && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card variant="outlined" sx={{ mb: 4, bgcolor: 'rgba(0, 210, 255, 0.05)' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Expected Output
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  GRAMX to Receive
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                  {gramxToReceive.toFixed(4)} GRAMX
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  LP Tokens Created
                                </Typography>
                                <Typography variant="h6" color="secondary.main" fontWeight="bold">
                                  ~{lpTokensToCreate.toFixed(4)} LP
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transaction Steps */}
                {isConnected && amount && validation.valid && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Transaction Steps
                    </Typography>
                    <Stepper activeStep={activeStep} orientation="vertical">
                      {steps.map((step, index) => (
                        <Step key={step.label}>
                          <StepLabel
                            optional={
                              step.completed ? (
                                <Chip
                                  label="Completed"
                                  size="small"
                                  color="success"
                                  icon={<CheckIcon />}
                                />
                              ) : null
                            }
                          >
                            {step.label}
                          </StepLabel>
                          <StepContent>
                            <Typography sx={{ mb: 2 }}>
                              {step.description}
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Button
                                variant="contained"
                                onClick={step.action}
                                disabled={isLoading || step.completed}
                                startIcon={isLoading && activeStep === index ? <CircularProgress size={16} /> : null}
                                sx={{ mr: 1 }}
                              >
                                {isLoading && activeStep === index ? 'Processing...' : step.label}
                              </Button>
                            </Box>
                          </StepContent>
                        </Step>
                      ))}
                    </Stepper>

                    {activeStep === steps.length && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Alert severity="success" sx={{ mt: 2 }}>
                          <AlertTitle>Mint Successful!</AlertTitle>
                          Your GRAMX tokens have been minted and LP tokens have been created.
                        </Alert>
                      </motion.div>
                    )}
                  </Box>
                )}

                {/* Connect Wallet Prompt */}
                {!isConnected && (
                  <Alert severity="info">
                    <AlertTitle>Connect Wallet</AlertTitle>
                    Please connect your wallet to start minting GRAMX tokens.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sidebar Information */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Vault Stats */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vault Statistics
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Current TVL</Typography>
                    <Typography fontWeight="600">${vaultStats.currentTVL}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Reserve Ratio</Typography>
                    <Typography fontWeight="600" color="success.main">
                      {vaultStats.reserveRatio}%
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Min Amount</Typography>
                    <Typography fontWeight="600">{vaultStats.minMintAmount} PAXG</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Max Amount</Typography>
                    <Typography fontWeight="600">{vaultStats.maxMintAmount} PAXG</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  How Minting Works
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      1
                    </Box>
                    <Typography variant="body2">
                      Deposit PAXG tokens as collateral
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      2
                    </Box>
                    <Typography variant="body2">
                      Receive GRAMX tokens (1 PAXG = 31.0115 GRAMX)
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      3
                    </Box>
                    <Typography variant="body2">
                      LP tokens are automatically created
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Gasless Benefits */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SpeedIcon color="primary" />
                  <Typography variant="h6">
                    Gasless Benefits
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      No ETH required for gas fees
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      Instant transaction signing
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      Secure EIP-712 signatures
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      Better user experience
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Mint;