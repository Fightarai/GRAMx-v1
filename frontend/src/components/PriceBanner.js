import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useCurrency } from '../contexts/CurrencyContext';

const PriceBanner = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    prices,
    formatDualCurrency,
    userCurrency,
    loading
  } = useCurrency();

  if (loading || !prices) {
    return (
      <Box
        sx={{
          bgcolor: '#fafafa',
          borderBottom: '1px solid #e0e0e0',
          py: 2
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Loading current prices...
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        borderBottom: '1px solid #e0e0e0',
        py: isMobile ? 2 : 3
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 3 : 6,
            flexDirection: isMobile ? 'column' : 'row'
          }}
        >
          {/* PAXG Price */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#333',
                mb: 0.5,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              1 PAXG
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#2563eb',
                fontSize: isMobile ? '1.5rem' : '2rem'
              }}
            >
              {formatDualCurrency(prices.paxg.usd, { compact: false })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Current gold spot price
            </Typography>
          </Box>

          {/* Separator */}
          {!isMobile && (
            <Box
              sx={{
                width: 1,
                height: 60,
                bgcolor: '#e0e0e0',
                mx: 3
              }}
            />
          )}

          {/* GRAMX Price */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: '#333',
                mb: 0.5,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              1 GRAMX
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: '#059669',
                fontSize: isMobile ? '1.5rem' : '2rem'
              }}
            >
              {formatDualCurrency(prices.gramx.usd, { compact: false })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Gold price ÷ 31.0115 grams
            </Typography>
          </Box>
        </Box>

        {/* Location indicator - minimal */}
        {userCurrency && userCurrency.code !== 'USD' && (
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Prices shown in USD and {userCurrency.code}
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PriceBanner;