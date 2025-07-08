import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Container,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalance as VaultIcon,
  TrendingUp as AnalyticsIcon,
  SwapHoriz as SwapIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: DashboardIcon },
    { name: 'Mint', path: '/mint', icon: VaultIcon },
    { name: 'Redeem', path: '/redeem', icon: SwapIcon },
    { name: 'Analytics', path: '/analytics', icon: AnalyticsIcon },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Typography
        variant="h6"
        sx={{
          px: 2,
          pb: 2,
          background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 'bold',
        }}
      >
        GRAMX VAULT
      </Typography>
      <List>
        {navigation.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem
              key={item.name}
              component={Link}
              to={item.path}
              onClick={handleDrawerToggle}
              sx={{
                borderRadius: 2,
                mx: 1,
                mb: 0.5,
                backgroundColor: isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(0, 210, 255, 0.05)',
                },
              }}
            >
              <IconComponent 
                sx={{ 
                  mr: 2, 
                  color: isActive ? 'primary.main' : 'text.secondary' 
                }} 
              />
              <ListItemText 
                primary={item.name}
                sx={{
                  color: isActive ? 'primary.main' : 'text.primary',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          background: 'rgba(26, 31, 38, 0.8)',
          backdropFilter: 'blur(20px)',
          border: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Typography
                  variant="h5"
                  component={Link}
                  to="/"
                  sx={{
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <VaultIcon sx={{ color: '#00D2FF' }} />
                  GRAMX VAULT
                </Typography>
              </motion.div>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navigation.map((item, index) => {
                  const IconComponent = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Button
                        component={Link}
                        to={item.path}
                        startIcon={<IconComponent />}
                        sx={{
                          color: isActive ? 'primary.main' : 'text.primary',
                          backgroundColor: isActive ? 'rgba(0, 210, 255, 0.1)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 210, 255, 0.05)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s ease',
                          borderRadius: 2,
                          px: 2,
                        }}
                      >
                        {item.name}
                      </Button>
                    </motion.div>
                  );
                })}
              </Box>
            )}

            {/* Wallet Connection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ConnectButton
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
                chainStatus={{
                  smallScreen: 'icon',
                  largeScreen: 'full',
                }}
                showBalance={{
                  smallScreen: false,
                  largeScreen: true,
                }}
              />
            </motion.div>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            background: 'rgba(26, 31, 38, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;