import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Web3 Configuration
import { wagmiConfig, chains } from './config/web3';

// Currency Context
import { CurrencyProvider } from './contexts/CurrencyContext';

// Pages and Components
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Mint from './pages/Mint';
import Redeem from './pages/Redeem';
import Analytics from './pages/Analytics';
import Footer from './components/Footer';

// Import RainbowKit styles
import '@rainbow-me/rainbowkit/styles.css';

// Create query client
const queryClient = new QueryClient();

// Dark theme configuration
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00D2FF',
      light: '#33DBFF',
      dark: '#0093B3',
    },
    secondary: {
      main: '#FF6B6B',
      light: '#FF8F8F',
      dark: '#E55555',
    },
    background: {
      default: '#0A0E13',
      paper: '#1A1F26',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FF9800',
    },
    error: {
      main: '#F44336',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, rgba(26, 31, 38, 0.8) 0%, rgba(26, 31, 38, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          padding: '12px 24px',
        },
        contained: {
          background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #00B8E6 0%, #2E5AA3 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 210, 255, 0.3)',
          },
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider 
          chains={chains} 
          theme={darkTheme({
            accentColor: '#00D2FF',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <CurrencyProvider>
              <Router>
                <Box 
                  sx={{ 
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #0A0E13 0%, #1A1F26 50%, #0A0E13 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Header />
                  <Box component="main" sx={{ flex: 1, pt: 8 }}>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/mint" element={<Mint />} />
                      <Route path="/redeem" element={<Redeem />} />
                      <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                  </Box>
                  <Footer />
                  
                  {/* Toast Notifications */}
                  <Toaster
                    position="bottom-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#1A1F26',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                      },
                      success: {
                        iconTheme: {
                          primary: '#4CAF50',
                          secondary: '#FFFFFF',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#F44336',
                          secondary: '#FFFFFF',
                        },
                      },
                    }}
                  />
                </Box>
              </Router>
            </CurrencyProvider>
          </ThemeProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}

export default App;