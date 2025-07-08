import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import currencyService from '../services/currencyService';
import toast from 'react-hot-toast';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // Currency data state
  const [currencyData, setCurrencyData] = useState({
    userCurrency: { code: 'USD', symbol: '$', name: 'US Dollar' },
    userLocation: null,
    goldPriceUSD: 2000,
    exchangeRates: {},
    lastUpdate: null
  });

  // Real-time price state
  const [prices, setPrices] = useState({
    paxg: {
      usd: 2000,
      local: 2000,
      localCurrency: 'USD'
    },
    gramx: {
      usd: 64.48, // 2000 / 31.0115
      local: 64.48,
      localCurrency: 'USD'
    }
  });

  // Initialize currency service
  const initializeCurrency = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await currencyService.initialize();
      
      setCurrencyData({
        userCurrency: data.currency,
        userLocation: data.location,
        goldPriceUSD: data.goldPrice,
        exchangeRates: data.exchangeRates,
        lastUpdate: new Date()
      });

      // Update prices with real data
      updatePrices(data.goldPrice, data.currency.code);
      
      setInitialized(true);
      
      // Show location detection result
      if (data.location) {
        toast.success(
          `Location detected: ${data.location.city}, ${data.location.countryName}\nCurrency: ${data.currency.name}`,
          { duration: 4000 }
        );
      }

    } catch (err) {
      console.error('Currency initialization failed:', err);
      setError(err.message);
      toast.error('Failed to detect location. Using USD as default currency.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update price calculations
  const updatePrices = useCallback((goldPriceUSD, localCurrencyCode) => {
    const paxgUSD = goldPriceUSD;
    const gramxUSD = goldPriceUSD / 31.0115;
    
    const paxgLocal = currencyService.convertToLocal(paxgUSD);
    const gramxLocal = currencyService.convertToLocal(gramxUSD);

    setPrices({
      paxg: {
        usd: paxgUSD,
        local: paxgLocal,
        localCurrency: localCurrencyCode
      },
      gramx: {
        usd: gramxUSD,
        local: gramxLocal,
        localCurrency: localCurrencyCode
      }
    });
  }, []);

  // Refresh currency data
  const refreshData = useCallback(async () => {
    try {
      await currencyService.refreshData();
      
      const goldPrice = currencyService.getPAXGPriceUSD();
      const userCurrency = currencyService.getUserCurrency();
      
      setCurrencyData(prev => ({
        ...prev,
        goldPriceUSD: goldPrice,
        exchangeRates: currencyService.exchangeRates,
        lastUpdate: new Date()
      }));

      updatePrices(goldPrice, userCurrency.code);
      
    } catch (err) {
      console.error('Currency refresh failed:', err);
      setError(err.message);
    }
  }, [updatePrices]);

  // Format currency helper functions
  const formatCurrency = useCallback((amount, options = {}) => {
    return currencyService.formatCurrency(amount, currencyData.userCurrency.code, options);
  }, [currencyData.userCurrency.code]);

  const formatUSD = useCallback((amount, options = {}) => {
    return currencyService.formatCurrency(amount, 'USD', options);
  }, []);

  const formatDualCurrency = useCallback((usdAmount, options = {}) => {
    return currencyService.formatDualCurrency(usdAmount, options);
  }, []);

  // Convert between currencies
  const convertToLocal = useCallback((usdAmount) => {
    return currencyService.convertToLocal(usdAmount);
  }, []);

  const convertToUSD = useCallback((localAmount) => {
    return currencyService.convertToUSD(localAmount);
  }, []);

  // Calculate token values
  const calculateTokenValue = useCallback((amount, tokenType = 'GRAMX') => {
    return currencyService.calculateTokenValues(amount, tokenType);
  }, []);

  // Get price for specific token
  const getTokenPrice = useCallback((tokenType = 'GRAMX') => {
    if (tokenType === 'PAXG') {
      return prices.paxg;
    } else if (tokenType === 'GRAMX') {
      return prices.gramx;
    }
    return prices.gramx;
  }, [prices]);

  // Initialize on mount
  useEffect(() => {
    initializeCurrency();
  }, [initializeCurrency]);

  // Set up periodic refresh (every 5 minutes)
  useEffect(() => {
    if (!initialized) return;

    const interval = setInterval(() => {
      refreshData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [initialized, refreshData]);

  const contextValue = {
    // State
    loading,
    error,
    initialized,
    currencyData,
    prices,
    
    // User info
    userCurrency: currencyData.userCurrency,
    userLocation: currencyData.userLocation,
    
    // Actions
    refreshData,
    initializeCurrency,
    
    // Formatters
    formatCurrency,
    formatUSD,
    formatDualCurrency,
    
    // Converters
    convertToLocal,
    convertToUSD,
    calculateTokenValue,
    getTokenPrice,
    
    // Utilities
    isDataFresh: currencyService.isDataFresh.bind(currencyService),
    getSupportedCurrencies: currencyService.getSupportedCurrencies.bind(currencyService)
  };

  return (
    <CurrencyContext.Provider value={contextValue}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;