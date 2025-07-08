import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Update as UpdateIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../contexts/CurrencyContext';

const PriceBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [priceChanges, setPriceChanges] = useState({ gramx: 0, paxg: 0 });
  const [previousPrices, setPreviousPrices] = useState({ gramx: 0, paxg: 0 });

  const {
    prices,
    formatDualCurrency,
    userCurrency,
    userLocation,
    refreshData,
    loading,
    isDataFresh
  } = useCurrency();

  // Track price changes for trending indicators
  useEffect(() => {
    if (prices && !loading) {
      setPriceChanges({
        gramx: prices.gramx.usd - previousPrices.gramx,
        paxg: prices.paxg.usd - previousPrices.paxg
      });
      
      setPreviousPrices({
        gramx: prices.gramx.usd,
        paxg: prices.paxg.usd
      });
      
      setLastUpdate(new Date());
    }
  }, [prices?.gramx?.usd, prices?.paxg?.usd]);

  const handleRefresh = () => {
    refreshData();
    setLastUpdate(new Date());
  };

  if (loading || !prices) {
    return (
      <Box
        sx={{
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          borderBottom: '1px solid rgba(0, 210, 255, 0.2)',
          py: 1
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Loading real-time gold prices...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const renderPriceCard = (token, price, change, color) => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: isMobile ? 1 : 2,
          bgcolor: `rgba(${color}, 0.1)`,
          borderRadius: 2,
          border: `1px solid rgba(${color}, 0.3)`,
          minWidth: isMobile ? 'auto' : 200,
          flex: 1
        }}
      >
        {/* Token Name */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography
            variant={isMobile ? "body2" : "h6"}
            fontWeight="bold"
            color={`rgb(${color})`}
          >
            {token}
          </Typography>
          {change !== 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {change > 0 ? (
                <TrendingUpIcon color="success" fontSize="small" />
              ) : (
                <TrendingDownIcon color="error" fontSize="small" />
              )}
            </Box>
          )}
        </Box>

        {/* Price Display */}
        <Box sx={{ flex: 1, textAlign: isMobile ? 'left' : 'center' }}>
          <Typography
            variant={isMobile ? "caption" : "body2"}
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            1 {token} =
          </Typography>
          <Typography
            variant={isMobile ? "body2" : "h6"}
            fontWeight="600"
            color="text.primary"
          >
            {formatDualCurrency(price, { compact: isMobile })}
          </Typography>
          {!isMobile && change !== 0 && (
            <Chip
              label={`${change >= 0 ? '+' : ''}${change.toFixed(2)}`}
              size="small"
              color={change >= 0 ? 'success' : 'error'}
              sx={{ mt: 0.5, fontSize: '0.7rem', height: 18 }}
            />
          )}
        </Box>
      </Box>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(0, 210, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Gradient */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, rgba(0, 210, 255, 0.05) 0%, rgba(255, 107, 107, 0.05) 50%, rgba(0, 210, 255, 0.05) 100%)',
              backgroundSize: '200% 100%',
              animation: 'gradient 10s ease infinite',
              '@keyframes gradient': {
                '0%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
                '100%': { backgroundPosition: '0% 50%' }
              }
            }}
          />

          <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: isMobile ? 1.5 : 2,
                gap: 2
              }}
            >
              {/* Left Section - Real-time Gold Prices */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 0.5,
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    borderRadius: 2,
                    border: '1px solid rgba(255, 215, 0, 0.3)'
                  }}
                >
                  <Typography
                    variant={isMobile ? "caption" : "body2"}
                    color="warning.main"
                    fontWeight="600"
                  >
                    🏆 LIVE GOLD PRICES
                  </Typography>
                  <Chip
                    label="REAL-TIME"
                    size="small"
                    color="warning"
                    sx={{ 
                      height: 16, 
                      fontSize: '0.6rem',
                      animation: 'pulse 2s infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 1 },
                        '50%': { opacity: 0.7 },
                        '100%': { opacity: 1 }
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Center Section - Price Cards */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? 1 : 3,
                  flex: 1,
                  justifyContent: 'center'
                }}
              >
                {/* GRAMX Price */}
                {renderPriceCard('GRAMX', prices.gramx.usd, priceChanges.gramx, '0, 210, 255')}

                {!isMobile && (
                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      mx: 1
                    }}
                  />
                )}

                {/* PAXG Price */}
                {renderPriceCard('PAXG', prices.paxg.usd, priceChanges.paxg, '255, 215, 0')}
              </Box>

              {/* Right Section - Controls & Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Location Info */}
                {!isMobile && userLocation && (
                  <Tooltip title={`Exchange rate updated for ${userLocation.city}, ${userLocation.countryName}`}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.5,
                        bgcolor: 'rgba(0, 210, 255, 0.1)',
                        borderRadius: 2,
                        border: '1px solid rgba(0, 210, 255, 0.2)'
                      }}
                    >
                      <Typography variant="caption" color="primary.main">
                        📍 {userCurrency.code}
                      </Typography>
                    </Box>
                  </Tooltip>
                )}

                {/* Refresh Button */}
                <Tooltip title="Refresh prices">
                  <IconButton
                    onClick={handleRefresh}
                    size="small"
                    sx={{
                      color: isDataFresh() ? 'success.main' : 'warning.main',
                      '&:hover': {
                        bgcolor: 'rgba(0, 210, 255, 0.1)',
                      }
                    }}
                  >
                    <UpdateIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                {/* Info Button */}
                <Tooltip title={`Last updated: ${lastUpdate.toLocaleTimeString()}\nBased on live gold market prices`}>
                  <IconButton size="small" sx={{ color: 'text.secondary' }}>
                    <InfoIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Mobile Bottom Row - Additional Info */}
            {isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 1,
                  pt: 0
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Based on live gold market • Updated every 5min
                </Typography>
                {userLocation && (
                  <Typography variant="caption" color="primary.main">
                    📍 {userLocation.city}, {userCurrency.code}
                  </Typography>
                )}
              </Box>
            )}
          </Container>
        </Box>
      </motion.div>
    </AnimatePresence>
  );
};

export default PriceBanner;