import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
} from '@mui/material';
import {
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Telegram as TelegramIcon,
  Description as DocsIcon,
  AccountBalance as VaultIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', icon: GitHubIcon, url: 'https://github.com/gramx-vault' },
    { name: 'Twitter', icon: TwitterIcon, url: 'https://twitter.com/gramxvault' },
    { name: 'Telegram', icon: TelegramIcon, url: 'https://t.me/gramxvault' },
  ];

  const quickLinks = [
    { name: 'Documentation', url: '#', icon: DocsIcon },
    { name: 'Audit Reports', url: '#' },
    { name: 'Bug Bounty', url: '#' },
    { name: 'Terms of Service', url: '#' },
    { name: 'Privacy Policy', url: '#' },
  ];

  const protocolLinks = [
    { name: 'PAXG Token', url: 'https://etherscan.io/token/0x45804880De22913dAFE09f4980848ECE6EcbAf78' },
    { name: 'Uniswap V2', url: 'https://app.uniswap.org/' },
    { name: 'Etherscan', url: 'https://etherscan.io/' },
    { name: 'DeFiPulse', url: 'https://defipulse.com/' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        background: 'rgba(26, 31, 38, 0.9)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        mt: 'auto',
        py: 6,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VaultIcon sx={{ color: 'primary.main', mr: 1, fontSize: 28 }} />
                <Typography
                  variant="h6"
                  sx={{
                    background: 'linear-gradient(135deg, #00D2FF 0%, #3A7BD5 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 'bold',
                  }}
                >
                  GRAMX VAULT
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                A decentralized vault protocol for minting GRAMX tokens backed by PAXG gold, 
                featuring gasless transactions and automatic liquidity provision.
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <IconButton
                      key={social.name}
                      component={Link}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'primary.main',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <IconComponent />
                    </IconButton>
                  );
                })}
              </Box>
            </motion.div>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Typography variant="h6" color="text.primary" gutterBottom>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.url}
                    color="text.secondary"
                    underline="none"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {link.icon && <link.icon sx={{ fontSize: 16 }} />}
                    {link.name}
                  </Link>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Protocol Links */}
          <Grid item xs={12} sm={6} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Typography variant="h6" color="text.primary" gutterBottom>
                Ecosystem
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {protocolLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    color="text.secondary"
                    underline="none"
                    sx={{
                      '&:hover': {
                        color: 'primary.main',
                        transform: 'translateX(4px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              © {currentYear} GRAMX Vault. Built on Ethereum. Secured by code.
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Made with ❤️ for DeFi
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Footer;