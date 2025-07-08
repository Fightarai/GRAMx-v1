import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Button,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as VaultIcon,
  OpenInNew as ExternalLinkIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import useVaultStats from '../hooks/useVaultStats';
import contractsConfig from '../config/contracts.json';

const GoldProofCard = ({ autoRefresh = true, refreshInterval = 30000 }) => {
  const { stats, loading, error, lastUpdated, refresh, isStale } = useVaultStats(autoRefresh, refreshInterval);

  const getReserveStatus = (ratio) => {
    if (ratio >= 200) return { color: 'success', text: 'Excellent', icon: CheckIcon };
    if (ratio >= 150) return { color: 'primary', text: 'Good', icon: CheckIcon };
    if (ratio >= 110) return { color: 'warning', text: 'Fair', icon: WarningIcon };
    return { color: 'error', text: 'Low', icon: ErrorIcon };
  };

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatCurrency = (num, decimals = 2) => {
    if (num === undefined || num === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  if (error) {
    return (
      <Card sx={{ background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)' }}>
        <CardContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Failed to load vault statistics: {error}
            </Typography>
          </Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refresh}
            size="small"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const reserveStatus = stats ? getReserveStatus(stats.currentReserveRatio) : { color: 'info', text: 'Loading', icon: SecurityIcon };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(58, 123, 213, 0.1) 100%)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
        }}
      >
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SecurityIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Proof of Reserves
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time PAXG backing verification
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {lastUpdated && (
                <Tooltip title={`Last updated: ${lastUpdated.toLocaleTimeString()}`}>
                  <Typography variant="caption" color={isStale ? 'warning.main' : 'text.secondary'}>
                    {lastUpdated.toLocaleTimeString()}
                  </Typography>
                </Tooltip>
              )}
              <IconButton 
                onClick={refresh} 
                disabled={loading}
                size="small"
                sx={{ 
                  animation: loading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ExternalLinkIcon />}
                href={`https://etherscan.io/address/${contractsConfig.CONTRACTS?.GRAMX_VAULT}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contract
              </Button>
            </Box>
          </Box>

          {/* Reserve Status Alert */}
          <AnimatePresence>
            {stats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  severity={reserveStatus.color} 
                  icon={<reserveStatus.icon />}
                  sx={{ mb: 3 }}
                >
                  <Typography variant="body2">
                    <strong>Reserve Status: {reserveStatus.text}</strong> - Current backing ratio is {formatNumber(stats.currentReserveRatio, 2)}%
                  </Typography>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Statistics Grid */}
          <Grid container spacing={3}>
            {/* PAXG Reserves */}
            <Grid item xs={12} md={6}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total PAXG Reserves
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
                    {formatNumber(stats?.paxgBalance || 0, 3)} PAXG
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ≈ {formatCurrency((stats?.paxgBalance || 0) * 2000)} (est.)
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* GRAMX Supply */}
            <Grid item xs={12} md={6}>
              {loading ? (
                <Skeleton variant="rectangular" height={100} />
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total GRAMX Supply
                  </Typography>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold" gutterBottom>
                    {formatNumber(stats?.gramxSupply || 0, 3)} GRAMX
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Circulating supply
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Reserve Ratio */}
            <Grid item xs={12}>
              {loading ? (
                <Skeleton variant="rectangular" height={80} />
              ) : (
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reserve Backing Ratio
                    </Typography>
                    <Chip
                      label={`${formatNumber(stats?.currentReserveRatio || 0, 2)}%`}
                      color={reserveStatus.color}
                      size="small"
                      icon={<reserveStatus.icon />}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((stats?.currentReserveRatio || 0), 300)}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: reserveStatus.color === 'success' ? '#4CAF50' : 
                                       reserveStatus.color === 'warning' ? '#FF9800' : '#F44336',
                        borderRadius: 6,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {stats?.currentReserveRatio >= 200 ? 'Over-collateralized' : 
                     stats?.currentReserveRatio >= 100 ? 'Fully collateralized' : 'Under-collateralized'}
                  </Typography>
                </Box>
              )}
            </Grid>

            {/* Additional Metrics */}
            <Grid item xs={12} md={4}>
              {loading ? (
                <Skeleton variant="rectangular" height={60} />
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Value Locked
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency((stats?.totalValueLocked || 0) * 2000)}
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {loading ? (
                <Skeleton variant="rectangular" height={60} />
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    LP Token Balance
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatNumber(stats?.lpBalance || 0, 3)} LP
                  </Typography>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={4}>
              {loading ? (
                <Skeleton variant="rectangular" height={60} />
              ) : (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Liquidity Depth
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency((stats?.liquidityDepth || 0) * 1000)}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* LP Reserves Breakdown */}
          {stats && stats.lpReservePAXG > 0 && (
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Typography variant="h6" gutterBottom>
                Liquidity Pool Reserves
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    PAXG in LP
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {formatNumber(stats.lpReservePAXG, 3)} PAXG
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    GRAMX in LP
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {formatNumber(stats.lpReserveGRAMX, 3)} GRAMX
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Footer Info */}
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VaultIcon fontSize="small" />
              Data updates every {refreshInterval / 1000} seconds • Backed by PAXG gold tokens
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GoldProofCard;