import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Stack
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Info as InfoIcon,
  Public as LocationIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';

const DualCurrencyDisplay = ({
  usdAmount,
  tokenAmount,
  tokenType = 'GRAMX',
  variant = 'default', // 'default', 'compact', 'detailed', 'card'
  showChange = false,
  changePercent = 0,
  showInfo = false,
  sx = {},
  ...props
}) => {
  const {
    formatUSD,
    formatCurrency,
    formatDualCurrency,
    userCurrency,
    userLocation,
    convertToLocal,
    getTokenPrice,
    loading
  } = useCurrency();

  // Calculate values
  const localAmount = convertToLocal(usdAmount);
  const tokenPrice = getTokenPrice(tokenType);

  // Format based on variant
  const renderCompact = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }} {...props}>
      <Typography variant="body2" fontWeight="600">
        {formatUSD(usdAmount, { compact: true })}
      </Typography>
      {userCurrency.code !== 'USD' && (
        <>
          <Typography variant="body2" color="text.secondary">
            /
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatCurrency(localAmount, { compact: true })}
          </Typography>
        </>
      )}
      {showChange && (
        <Chip
          size="small"
          icon={changePercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
          label={`${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
          color={changePercent >= 0 ? 'success' : 'error'}
          sx={{ height: 20, fontSize: '0.7rem' }}
        />
      )}
    </Box>
  );

  const renderDefault = () => (
    <Box sx={{ ...sx }} {...props}>
      <Typography variant="h6" fontWeight="600" color="primary.main">
        {formatUSD(usdAmount)}
      </Typography>
      {userCurrency.code !== 'USD' && (
        <Typography variant="body2" color="text.secondary">
          ≈ {formatCurrency(localAmount)}
        </Typography>
      )}
      {showChange && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <Chip
            size="small"
            icon={changePercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            label={`${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
            color={changePercent >= 0 ? 'success' : 'error'}
          />
        </Box>
      )}
    </Box>
  );

  const renderDetailed = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, ...sx }} {...props}>
        <Stack spacing={2}>
          {/* Main Value */}
          <Box>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {formatUSD(usdAmount)}
            </Typography>
            {userCurrency.code !== 'USD' && (
              <Typography variant="h6" color="text.secondary">
                ≈ {formatCurrency(localAmount)}
              </Typography>
            )}
          </Box>

          {/* Token Information */}
          {tokenAmount && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {tokenAmount.toFixed(6)} {tokenType}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @ {formatDualCurrency(tokenPrice.usd)} per {tokenType}
              </Typography>
            </Box>
          )}

          {/* Location & Currency Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {userLocation ? 
                `${userLocation.city}, ${userLocation.countryName}` : 
                'Location not detected'
              }
            </Typography>
            {showInfo && (
              <Tooltip title={`Exchange rate: 1 USD = ${(localAmount/usdAmount).toFixed(4)} ${userCurrency.code}`}>
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Price Change */}
          {showChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Chip
                icon={changePercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}% (24h)`}
                color={changePercent >= 0 ? 'success' : 'error'}
                size="small"
              />
            </Box>
          )}
        </Stack>
      </Box>
    </motion.div>
  );

  const renderCard = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: 'rgba(0, 210, 255, 0.05)',
          border: '1px solid rgba(0, 210, 255, 0.2)',
          borderRadius: 3,
          backdropFilter: 'blur(10px)',
          position: 'relative',
          overflow: 'hidden',
          ...sx
        }}
        {...props}
      >
        {/* Gradient Background */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%)',
            zIndex: -1
          }}
        />

        <Stack spacing={2}>
          {/* Primary Value */}
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="bold" color="primary.main">
              {formatUSD(usdAmount)}
            </Typography>
            {userCurrency.code !== 'USD' && (
              <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
                ≈ {formatCurrency(localAmount)}
              </Typography>
            )}
          </Box>

          {/* Token Info Row */}
          {tokenAmount && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body1" fontWeight="600">
                  {tokenAmount.toFixed(6)} {tokenType}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Token Amount
                </Typography>
              </Box>
              <Box textAlign="right">
                <Typography variant="body1" fontWeight="600">
                  {formatDualCurrency(tokenPrice.usd)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Per Token
                </Typography>
              </Box>
            </Box>
          )}

          {/* Footer with Location and Change */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {userCurrency.code}
              </Typography>
            </Box>
            
            {showChange && (
              <Chip
                icon={changePercent >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                label={`${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
                color={changePercent >= 0 ? 'success' : 'error'}
                size="small"
              />
            )}
          </Box>
        </Stack>
      </Box>
    </motion.div>
  );

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ ...sx }} {...props}>
        <Typography variant="body2" color="text.secondary">
          Loading prices...
        </Typography>
      </Box>
    );
  }

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'detailed':
      return renderDetailed();
    case 'card':
      return renderCard();
    default:
      return renderDefault();
  }
};

// Currency selector component
export const CurrencySelector = ({ sx = {}, ...props }) => {
  const { userCurrency, userLocation, loading } = useCurrency();

  if (loading) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        bgcolor: 'rgba(0, 210, 255, 0.1)',
        borderRadius: 2,
        border: '1px solid rgba(0, 210, 255, 0.2)',
        ...sx
      }}
      {...props}
    >
      <LocationIcon fontSize="small" color="primary" />
      <Typography variant="caption" color="text.secondary">
        {userLocation ? 
          `${userLocation.city}, ${userLocation.countryName}` : 
          'Global'
        }
      </Typography>
      <Chip
        label={userCurrency.code}
        size="small"
        color="primary"
        sx={{ height: 20, fontSize: '0.7rem' }}
      />
    </Box>
  );
};

// Price ticker component for header
export const PriceTicker = ({ sx = {}, ...props }) => {
  const { prices, formatDualCurrency, loading } = useCurrency();

  if (loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 1,
          bgcolor: 'rgba(0, 0, 0, 0.7)',
          borderRadius: 2,
          backdropFilter: 'blur(10px)',
          ...sx
        }}
        {...props}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            PAXG
          </Typography>
          <Typography variant="body2" fontWeight="600" color="warning.main">
            {formatDualCurrency(prices.paxg.usd, { compact: true })}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            GRAMX
          </Typography>
          <Typography variant="body2" fontWeight="600" color="primary.main">
            {formatDualCurrency(prices.gramx.usd, { compact: true })}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default DualCurrencyDisplay;