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
  Alert,
  AlertTitle,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  SwapHoriz as SwapIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  AccountBalance as VaultIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount, useBalance } from 'wagmi';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';

// Mock contract addresses
const CONTRACTS = {
  GRAMX_TOKEN: '0x1234567890123456789012345678901234567890',
  GRAMX_VAULT: '0x2345678901234567890123456789012345678901',
  PAXG: '0x45804880De22913dAFE09f4980848ECE6EcbAf78',
};

const Redeem = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mock vault stats
  const [vaultStats, setVaultStats] = useState({
    reserveRatio: '200.15',
    totalPAXGReserves: '2,456,789.50',
    redemptionFee: '0.1',
    minRedeemAmount: '0.001',
  });

  // Get GRAMX balance
  const { data: gramxBalance } = useBalance({
    address: address,
    token: CONTRACTS.GRAMX_TOKEN,
    enabled: !!address,
  });

  // Calculate expected outputs
  const paxgToReceive = amount ? parseFloat(amount) * (1 - parseFloat(vaultStats.redemptionFee) / 100) : 0;
  const redemptionFeeAmount = amount ? parseFloat(amount) * parseFloat(vaultStats.redemptionFee) / 100 : 0;

  const handleAmountChange = (event) => {
    const value = event.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxClick = () => {
    if (gramxBalance) {
      const maxAmount = parseFloat(ethers.utils.formatEther(gramxBalance.value));
      setAmount(maxAmount.toString());
    }
  };

  const validateAmount = () => {
    if (!amount) return { valid: false, message: 'Please enter an amount' };
    
    const amountNum = parseFloat(amount);
    const minAmount = parseFloat(vaultStats.minRedeemAmount);
    
    if (amountNum < minAmount) {
      return { valid: false, message: `Minimum redemption amount is ${vaultStats.minRedeemAmount} GRAMX` };
    }
    
    if (gramxBalance && amountNum > parseFloat(ethers.utils.formatEther(gramxBalance.value))) {
      return { valid: false, message: 'Insufficient GRAMX balance' };
    }

    // Check if vault has enough PAXG reserves
    const requiredPAXG = paxgToReceive;
    const availablePAXG = parseFloat(vaultStats.totalPAXGReserves.replace(/,/g, ''));
    
    if (requiredPAXG > availablePAXG) {
      return { valid: false, message: 'Insufficient PAXG reserves in vault' };
    }
    
    return { valid: true, message: '' };
  };

  const approveGRAMX = async () => {
    setIsLoading(true);
    try {
      // Mock approval - in real app, this would call GRAMX approve function
      await new Promise(resolve => setTimeout(resolve, 2000));
      setActiveStep(1);
      toast.success('GRAMX approval successful!');
    } catch (error) {
      toast.error('Approval failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const executeRedeem = async () => {
    setIsLoading(true);
    try {
      // Mock redemption - in real app, this would call vault redeem function
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setActiveStep(2);
      toast.success(`Successfully redeemed ${paxgToReceive.toFixed(4)} PAXG!`);
      
      // Reset form
      setTimeout(() => {
        setAmount('');
        setActiveStep(0);
      }, 2000);
    } catch (error) {
      toast.error('Redemption failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    {
      label: 'Approve GRAMX',
      description: 'Allow the vault to burn your GRAMX tokens',
      action: approveGRAMX,
    },
    {
      label: 'Execute Redemption',
      description: 'Burn GRAMX tokens and receive PAXG',
      action: executeRedeem,
    },
  ];

  const validation = validateAmount();

  const getReserveStatus = () => {
    const ratio = parseFloat(vaultStats.reserveRatio);
    if (ratio >= 200) return { color: 'success', text: 'Excellent', icon: CheckIcon };
    if (ratio >= 150) return { color: 'warning', text: 'Good', icon: WarningIcon };
    return { color: 'error', text: 'Low', icon: WarningIcon };
  };

  const reserveStatus = getReserveStatus();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Redeem GRAMX Tokens
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Burn your GRAMX tokens to receive PAXG from the vault reserves
          </Typography>
        </Box>
      </motion.div>

      <Grid container spacing={4}>
        {/* Main Redeem Form */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight="600" gutterBottom>
                  Redemption Form
                </Typography>

                {/* Reserve Status Alert */}
                <Alert severity={reserveStatus.color} icon={<reserveStatus.icon />} sx={{ mb: 3 }}>
                  <AlertTitle>Reserve Status: {reserveStatus.text}</AlertTitle>
                  Current reserve ratio is {vaultStats.reserveRatio}%. 
                  {reserveStatus.color === 'success' && ' Vault has excellent PAXG backing for redemptions.'}
                  {reserveStatus.color === 'warning' && ' Vault reserves are adequate but monitor closely.'}
                  {reserveStatus.color === 'error' && ' Limited PAXG available for redemptions.'}
                </Alert>

                {/* Amount Input */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Amount to Redeem
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
                              disabled={!gramxBalance}
                            >
                              MAX
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                              GRAMX
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
                  
                  {gramxBalance && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Balance: {parseFloat(ethers.utils.formatEther(gramxBalance.value)).toFixed(4)} GRAMX
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
                      <Card variant="outlined" sx={{ mb: 4, bgcolor: 'rgba(255, 107, 107, 0.05)' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Redemption Summary
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  PAXG to Receive
                                </Typography>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                  {paxgToReceive.toFixed(4)} PAXG
                                </Typography>
                              </Box>
                            </Grid>
                            <Grid item xs={6}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Redemption Fee ({vaultStats.redemptionFee}%)
                                </Typography>
                                <Typography variant="h6" color="warning.main" fontWeight="bold">
                                  {redemptionFeeAmount.toFixed(4)} GRAMX
                                </Typography>
                              </Box>
                            </Grid>
                          </Grid>
                          
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Exchange Rate
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={95} 
                              sx={{ 
                                height: 8, 
                                borderRadius: 4,
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: '#4CAF50'
                                }
                              }} 
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              1 GRAMX = {(1 - parseFloat(vaultStats.redemptionFee) / 100).toFixed(3)} PAXG
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Transaction Steps */}
                {isConnected && amount && validation.valid && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Redemption Steps
                    </Typography>
                    <Stepper activeStep={activeStep} orientation="vertical">
                      {steps.map((step, index) => (
                        <Step key={step.label}>
                          <StepLabel>
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
                                disabled={isLoading}
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
                          <AlertTitle>Redemption Successful!</AlertTitle>
                          Your GRAMX tokens have been burned and PAXG has been transferred to your wallet.
                        </Alert>
                      </motion.div>
                    )}
                  </Box>
                )}

                {/* Connect Wallet Prompt */}
                {!isConnected && (
                  <Alert severity="info">
                    <AlertTitle>Connect Wallet</AlertTitle>
                    Please connect your wallet to start redeeming GRAMX tokens.
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
            {/* Vault Reserves */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Vault Reserves
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">PAXG Available</Typography>
                    <Typography fontWeight="600">{vaultStats.totalPAXGReserves} PAXG</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Reserve Ratio</Typography>
                    <Chip
                      label={`${vaultStats.reserveRatio}%`}
                      size="small"
                      color={reserveStatus.color}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Redemption Fee</Typography>
                    <Typography fontWeight="600">{vaultStats.redemptionFee}%</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Min Redemption</Typography>
                    <Typography fontWeight="600">{vaultStats.minRedeemAmount} GRAMX</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* How Redemption Works */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  How Redemption Works
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                      1
                    </Box>
                    <Typography variant="body2">
                      Approve GRAMX token spending
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'warning.main',
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
                      GRAMX tokens are burned
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
                      Receive PAXG from vault reserves
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SecurityIcon color="warning" />
                  <Typography variant="h6">
                    Important Notes
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    • A {vaultStats.redemptionFee}% fee is charged on all redemptions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Redemptions are subject to available PAXG reserves
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • GRAMX tokens are permanently burned upon redemption
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Minimum redemption amount applies
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Redeem;