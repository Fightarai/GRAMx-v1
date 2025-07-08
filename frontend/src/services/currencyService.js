import axios from 'axios';

// Currency configuration for different countries
export const CURRENCY_CONFIG = {
  MY: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  TH: { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  ID: { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  PH: { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  VN: { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  TW: { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  EU: { code: 'EUR', symbol: '€', name: 'Euro' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  // Default fallback
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  DEFAULT: { code: 'USD', symbol: '$', name: 'US Dollar' }
};

// Gold and crypto price APIs
const PRICE_APIS = {
  GOLD: 'https://api.metals.live/v1/spot/gold',
  CRYPTO: 'https://api.coingecko.com/api/v3/simple/price',
  EXCHANGE_RATES: 'https://api.exchangerate-api.com/v4/latest/USD',
  IP_LOCATION: 'https://ipapi.co/json/'
};

class CurrencyService {
  constructor() {
    this.exchangeRates = {};
    this.goldPriceUSD = 0;
    this.lastUpdate = null;
    this.userLocation = null;
    this.userCurrency = CURRENCY_CONFIG.DEFAULT;
    this.updateInterval = 5 * 60 * 1000; // 5 minutes
  }

  // Detect user location based on IP
  async detectUserLocation() {
    try {
      const response = await axios.get(PRICE_APIS.IP_LOCATION, {
        timeout: 5000
      });
      
      const { country_code, country_name, city, region } = response.data;
      
      this.userLocation = {
        countryCode: country_code,
        countryName: country_name,
        city,
        region
      };
      
      // Set user currency based on country
      this.userCurrency = CURRENCY_CONFIG[country_code] || CURRENCY_CONFIG.DEFAULT;
      
      console.log(`Detected location: ${city}, ${country_name} (${country_code})`);
      console.log(`Currency set to: ${this.userCurrency.code}`);
      
      return this.userLocation;
    } catch (error) {
      console.warn('IP location detection failed, using default USD:', error.message);
      this.userCurrency = CURRENCY_CONFIG.DEFAULT;
      return null;
    }
  }

  // Fetch current gold price in USD per troy ounce
  async fetchGoldPrice() {
    try {
      const response = await axios.get(PRICE_APIS.GOLD, {
        timeout: 10000
      });
      
      this.goldPriceUSD = response.data.price || 2000; // Fallback price
      return this.goldPriceUSD;
    } catch (error) {
      console.warn('Gold price fetch failed, using fallback:', error.message);
      this.goldPriceUSD = 2000; // Fallback gold price
      return this.goldPriceUSD;
    }
  }

  // Fetch exchange rates from USD to other currencies
  async fetchExchangeRates() {
    try {
      const response = await axios.get(PRICE_APIS.EXCHANGE_RATES, {
        timeout: 10000
      });
      
      this.exchangeRates = response.data.rates;
      this.lastUpdate = new Date();
      return this.exchangeRates;
    } catch (error) {
      console.warn('Exchange rates fetch failed, using fallbacks:', error.message);
      // Fallback exchange rates (approximate)
      this.exchangeRates = {
        MYR: 4.7,
        SGD: 1.35,
        THB: 36.0,
        IDR: 15800,
        PHP: 56.0,
        VND: 24500,
        INR: 83.0,
        JPY: 150,
        KRW: 1340,
        CNY: 7.3,
        HKD: 7.8,
        TWD: 32.0,
        AUD: 1.55,
        NZD: 1.65,
        GBP: 0.79,
        EUR: 0.92,
        CHF: 0.88,
        CAD: 1.37,
        BRL: 5.0,
        MXN: 17.0,
        AED: 3.67,
        SAR: 3.75,
        ZAR: 18.5
      };
      return this.exchangeRates;
    }
  }

  // Initialize the service
  async initialize() {
    try {
      await Promise.all([
        this.detectUserLocation(),
        this.fetchGoldPrice(),
        this.fetchExchangeRates()
      ]);
      
      // Set up periodic updates
      setInterval(() => {
        this.fetchGoldPrice();
        this.fetchExchangeRates();
      }, this.updateInterval);
      
      return {
        location: this.userLocation,
        currency: this.userCurrency,
        goldPrice: this.goldPriceUSD,
        exchangeRates: this.exchangeRates
      };
    } catch (error) {
      console.error('Currency service initialization failed:', error);
      throw error;
    }
  }

  // Convert USD amount to user's local currency
  convertToLocal(usdAmount) {
    if (this.userCurrency.code === 'USD') {
      return usdAmount;
    }
    
    const rate = this.exchangeRates[this.userCurrency.code] || 1;
    return usdAmount * rate;
  }

  // Convert local currency amount to USD
  convertToUSD(localAmount) {
    if (this.userCurrency.code === 'USD') {
      return localAmount;
    }
    
    const rate = this.exchangeRates[this.userCurrency.code] || 1;
    return localAmount / rate;
  }

  // Get PAXG price in USD (1 PAXG = 1 troy ounce of gold)
  getPAXGPriceUSD() {
    return this.goldPriceUSD;
  }

  // Get PAXG price in local currency
  getPAXGPriceLocal() {
    return this.convertToLocal(this.goldPriceUSD);
  }

  // Get GRAMX price in USD (1 GRAMX = 1 gram of gold)
  getGRAMXPriceUSD() {
    return this.goldPriceUSD / 31.0115; // 1 troy ounce = 31.0115 grams
  }

  // Get GRAMX price in local currency
  getGRAMXPriceLocal() {
    return this.convertToLocal(this.getGRAMXPriceUSD());
  }

  // Format currency amount with proper symbols and decimals
  formatCurrency(amount, currencyCode = 'USD', options = {}) {
    const {
      showSymbol = true,
      decimals = 2,
      compact = false
    } = options;

    const currency = Object.values(CURRENCY_CONFIG).find(c => c.code === currencyCode) || CURRENCY_CONFIG.DEFAULT;
    
    // Handle large numbers with compact notation
    if (compact && amount >= 1000000) {
      const millions = amount / 1000000;
      return `${showSymbol ? currency.symbol : ''}${millions.toFixed(1)}M`;
    } else if (compact && amount >= 1000) {
      const thousands = amount / 1000;
      return `${showSymbol ? currency.symbol : ''}${thousands.toFixed(1)}K`;
    }

    // Special handling for currencies with no decimal places
    const decimalPlaces = ['JPY', 'KRW', 'VND', 'IDR'].includes(currencyCode) ? 0 : decimals;
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    }).format(amount);

    return showSymbol ? `${currency.symbol}${formattedAmount}` : formattedAmount;
  }

  // Format dual currency display (USD + Local)
  formatDualCurrency(usdAmount, options = {}) {
    const {
      showLocal = true,
      compact = false,
      separator = ' / '
    } = options;

    const usdFormatted = this.formatCurrency(usdAmount, 'USD', { compact });
    
    if (!showLocal || this.userCurrency.code === 'USD') {
      return usdFormatted;
    }
    
    const localAmount = this.convertToLocal(usdAmount);
    const localFormatted = this.formatCurrency(localAmount, this.userCurrency.code, { compact });
    
    return `${usdFormatted}${separator}${localFormatted}`;
  }

  // Get current user currency info
  getUserCurrency() {
    return this.userCurrency;
  }

  // Get current user location
  getUserLocation() {
    return this.userLocation;
  }

  // Check if exchange rates are fresh (less than 10 minutes old)
  isDataFresh() {
    if (!this.lastUpdate) return false;
    return (new Date() - this.lastUpdate) < (10 * 60 * 1000);
  }

  // Force refresh all data
  async refreshData() {
    return Promise.all([
      this.fetchGoldPrice(),
      this.fetchExchangeRates()
    ]);
  }

  // Get supported currencies list
  getSupportedCurrencies() {
    return Object.entries(CURRENCY_CONFIG)
      .filter(([key]) => key !== 'DEFAULT')
      .map(([countryCode, currency]) => ({
        countryCode,
        ...currency
      }));
  }

  // Calculate token values for different amounts
  calculateTokenValues(tokenAmount, tokenType = 'GRAMX') {
    let usdValue;
    
    if (tokenType === 'GRAMX') {
      usdValue = tokenAmount * this.getGRAMXPriceUSD();
    } else if (tokenType === 'PAXG') {
      usdValue = tokenAmount * this.getPAXGPriceUSD();
    } else {
      usdValue = tokenAmount; // Assume USD value
    }
    
    const localValue = this.convertToLocal(usdValue);
    
    return {
      usd: usdValue,
      local: localValue,
      localCurrency: this.userCurrency.code,
      formatted: {
        usd: this.formatCurrency(usdValue, 'USD'),
        local: this.formatCurrency(localValue, this.userCurrency.code),
        dual: this.formatDualCurrency(usdValue)
      }
    };
  }
}

// Create singleton instance
const currencyService = new CurrencyService();

export default currencyService;