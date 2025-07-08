# GRAMX Vault Multi-Currency Implementation

## Overview
The GRAMX Vault protocol now includes comprehensive multi-currency support with IP-based location detection, real-time exchange rates, and automatic currency conversion. The system displays values in both USD (as the base currency) and the user's local currency based on their geographic location.

## 🌍 Supported Regions & Currencies

### Asia-Pacific
- **Malaysia** 🇲🇾: USD + MYR (Malaysian Ringgit)
- **Singapore** 🇸🇬: USD + SGD (Singapore Dollar)
- **Thailand** 🇹🇭: USD + THB (Thai Baht)
- **Indonesia** 🇮🇩: USD + IDR (Indonesian Rupiah)
- **Philippines** 🇵🇭: USD + PHP (Philippine Peso)
- **Vietnam** 🇻🇳: USD + VND (Vietnamese Dong)
- **India** 🇮🇳: USD + INR (Indian Rupee)
- **Japan** 🇯🇵: USD + JPY (Japanese Yen)
- **South Korea** 🇰🇷: USD + KRW (South Korean Won)
- **China** 🇨🇳: USD + CNY (Chinese Yuan)
- **Hong Kong** 🇭🇰: USD + HKD (Hong Kong Dollar)
- **Taiwan** 🇹🇼: USD + TWD (Taiwan Dollar)
- **Australia** 🇦🇺: USD + AUD (Australian Dollar)
- **New Zealand** 🇳🇿: USD + NZD (New Zealand Dollar)

### Europe & Americas
- **United Kingdom** 🇬🇧: USD + GBP (British Pound)
- **European Union** 🇪🇺: USD + EUR (Euro)
- **Switzerland** 🇨🇭: USD + CHF (Swiss Franc)
- **Canada** 🇨🇦: USD + CAD (Canadian Dollar)
- **Brazil** 🇧🇷: USD + BRL (Brazilian Real)
- **Mexico** 🇲🇽: USD + MXN (Mexican Peso)

### Middle East & Africa
- **UAE** 🇦🇪: USD + AED (UAE Dirham)
- **Saudi Arabia** 🇸🇦: USD + SAR (Saudi Riyal)
- **South Africa** 🇿🇦: USD + ZAR (South African Rand)

### Default
- **Global/Unknown** 🌐: USD only

## 🏗️ Technical Architecture

### 1. Currency Service (`frontend/src/services/currencyService.js`)

**Core Features:**
- **IP Geolocation**: Automatic location detection using ipapi.co
- **Real-time Exchange Rates**: Live rates from exchangerate-api.com
- **Gold Price Feeds**: Real-time gold prices from metals.live API
- **Fallback Systems**: Robust fallback rates if APIs are unavailable
- **Auto-refresh**: Prices update every 5 minutes

**Key Methods:**
```javascript
// Initialize with location detection
await currencyService.initialize()

// Convert between currencies
const localAmount = currencyService.convertToLocal(usdAmount)
const usdAmount = currencyService.convertToUSD(localAmount)

// Format currencies with proper symbols
const formatted = currencyService.formatCurrency(amount, 'MYR')
const dualDisplay = currencyService.formatDualCurrency(usdAmount)

// Calculate token values
const values = currencyService.calculateTokenValues(100, 'GRAMX')
// Returns: { usd: 6448, local: 30307.6, localCurrency: 'MYR', formatted: {...} }
```

### 2. Currency Context (`frontend/src/contexts/CurrencyContext.js`)

**React Context Provider:**
- Manages global currency state
- Provides real-time price updates
- Handles loading and error states
- Offers utility functions throughout the app

**Usage:**
```jsx
import { useCurrency } from '../contexts/CurrencyContext'

const MyComponent = () => {
  const {
    userCurrency,        // { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' }
    userLocation,        // { city: 'Kuala Lumpur', countryName: 'Malaysia' }
    prices,             // Real-time PAXG & GRAMX prices
    formatDualCurrency, // Format function
    loading             // Loading state
  } = useCurrency()
}
```

### 3. Dual Currency Display Component (`frontend/src/components/DualCurrencyDisplay.js`)

**Multiple Display Variants:**
- **Compact**: `$2,000 / RM9,400`
- **Default**: Primary USD with secondary local currency
- **Detailed**: Full breakdown with exchange rates
- **Card**: Premium display with animations

**Component Usage:**
```jsx
<DualCurrencyDisplay 
  usdAmount={2000}
  variant="compact"
  showChange={true}
  changePercent={2.5}
/>
```

**Additional Components:**
- **CurrencySelector**: Shows current location and currency
- **PriceTicker**: Real-time PAXG/GRAMX prices in header

## 💰 USD Value Standards

### Token Pricing
- **PAXG**: 1 PAXG = 1 troy ounce of gold = Current gold spot price
- **GRAMX**: 1 GRAMX = 1 gram of gold = Gold price ÷ 31.0115

### Example Calculations (Gold at $2,000/oz)
```
PAXG Price: $2,000.00 USD
GRAMX Price: $64.48 USD (2000 ÷ 31.0115)

For Malaysian User:
PAXG: $2,000.00 / RM9,400.00
GRAMX: $64.48 / RM303.07

For Singapore User:  
PAXG: $2,000.00 / S$2,700.00
GRAMX: $64.48 / S$87.05
```

## 🎨 UI/UX Implementation

### Header Integration
```jsx
// Desktop: Navigation + Price Ticker + Currency Selector + Wallet
<Header>
  <Navigation />
  <PriceTicker />  {/* PAXG: $2,000 / RM9,400 */}
  <CurrencySelector />  {/* Kuala Lumpur, MY [MYR] */}
  <ConnectButton />
</Header>

// Mobile: All components in hamburger menu
```

### Dashboard Stats Cards
```jsx
<StatCard
  title="Total Value Locked"
  usdValue={2456789.50}
  showDualCurrency={true}
  // Displays: $2,456,789.50 / RM11,546,910.65
/>
```

### Transaction Pages
- **Mint Page**: Shows dual currency for PAXG input and GRAMX output
- **Redeem Page**: Shows dual currency for GRAMX input and PAXG output
- **Analytics**: All charts and metrics in dual currency

## 🔄 Real-time Updates

### Automatic Refresh Cycle
1. **Initial Load**: Detect location → Fetch rates → Display prices
2. **Every 5 Minutes**: Refresh gold prices and exchange rates
3. **Price Changes**: Update all components automatically
4. **Location Changes**: Re-initialize if IP changes

### Data Flow
```
IP Detection → Currency Selection → Exchange Rates → Gold Prices → Component Updates
```

## 🛠️ Implementation Examples

### For Malaysia Users (MY → MYR)
```jsx
// User visits from Kuala Lumpur, Malaysia
Location: "Kuala Lumpur, Malaysia"
Currency: Malaysian Ringgit (RM)
Exchange Rate: 1 USD = 4.70 MYR

Displays:
- TVL: $2,456,789 / RM11,546,910
- PAXG: $2,000.00 / RM9,400.00  
- GRAMX: $64.48 / RM303.07
```

### For Singapore Users (SG → SGD)
```jsx
// User visits from Singapore
Location: "Singapore, Singapore"
Currency: Singapore Dollar (S$)
Exchange Rate: 1 USD = 1.35 SGD

Displays:
- TVL: $2,456,789 / S$3,316,665
- PAXG: $2,000.00 / S$2,700.00
- GRAMX: $64.48 / S$87.05
```

## 🔧 Configuration & Customization

### Adding New Currencies
```javascript
// In currencyService.js
export const CURRENCY_CONFIG = {
  XX: { code: 'XXX', symbol: 'X$', name: 'New Currency' }
}
```

### Custom Formatting
```javascript
// Special formatting for currencies without decimals
const decimalPlaces = ['JPY', 'KRW', 'VND', 'IDR'].includes(currencyCode) ? 0 : 2
```

### Fallback Handling
- **API Failures**: Use hardcoded exchange rates
- **IP Detection Fails**: Default to USD
- **Slow Connections**: Show loading states
- **Stale Data**: Auto-refresh with warnings

## 📱 Mobile Responsiveness

### Adaptive Display
- **Desktop**: Full dual currency display
- **Tablet**: Compact dual currency
- **Mobile**: Stacked display or single currency with toggle

### Touch Interactions
- **Currency Selector**: Touch to view exchange rate details
- **Price Ticker**: Tap for detailed breakdown
- **Charts**: Touch points show dual currency tooltips

## 🔒 Security & Privacy

### Data Protection
- **No Personal Data**: Only IP geolocation for currency
- **API Security**: Rate limiting and timeout handling
- **Privacy First**: No tracking or data storage
- **HTTPS Only**: All external API calls are secure

### Error Handling
```javascript
try {
  await currencyService.initialize()
} catch (error) {
  // Graceful fallback to USD
  console.warn('Currency service failed, using USD default')
}
```

## 🚀 Performance Optimizations

### Caching Strategy
- **Exchange Rates**: Cached for 5 minutes
- **Location Data**: Cached for session
- **Gold Prices**: Real-time with 5-minute refresh
- **Component State**: Memoized calculations

### Lazy Loading
- **Currency Service**: Initialized on first use
- **Exchange Rates**: Fetched in background
- **Components**: Rendered progressively

## 📊 Analytics & Monitoring

### User Insights
- **Geographic Distribution**: Track user locations
- **Currency Preferences**: Monitor popular currencies
- **Conversion Rates**: Track engagement with dual display
- **Performance Metrics**: API response times

### Health Checks
- **API Availability**: Monitor external services
- **Exchange Rate Accuracy**: Validate against multiple sources
- **Location Detection**: Track success rates
- **Error Reporting**: Log and alert on failures

---

## 🎯 Next Steps & Roadmap

### Phase 2 Enhancements
1. **Manual Currency Override**: Let users choose their preferred currency
2. **Historical Charts**: Multi-currency price history
3. **Price Alerts**: Notifications in user's currency
4. **Advanced Analytics**: Currency-specific insights

### Phase 3 Features
1. **More Currencies**: Expand to 50+ global currencies
2. **Regional Settings**: Time zones, date formats, number formats
3. **DeFi Integration**: Cross-currency yield farming
4. **Mobile App**: Native currency detection

---

**The GRAMX Vault protocol now provides a truly global, localized experience with automatic currency detection and real-time conversion, making DeFi accessible to users worldwide while maintaining USD as the standard base currency.**