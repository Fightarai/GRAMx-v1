import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  AlertTitle,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Waves as LiquidityIcon,
  TrendingUp as TrendingUpIcon,
  SwapHoriz as SwapIcon,
  AccountBalance as VaultIcon,
  OpenInNew as ExternalLinkIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useAccount } from 'wagmi';
import useVaultStats from '../hooks/useVaultStats';
import contractsConfig from '../config/contracts.json';

// Mock trading data - in real app, this would come from DEX APIs
const mockTradingHistory = [
  { timestamp: '2024-01-01', volume: 125000, price: 0.998, liquidity: 2000000 },
  { timestamp: '2024-01-02', volume: 89000, price: 1.001, liquidity: 2100000 },
  { timestamp: '2024-01-03', volume: 156000, price: 0.999, liquidity: 2200000 },
  { timestamp: '2024-01-04', volume: 203000, price: 1.002, liquidity: 2350000 },
  { timestamp: '2024-01-05', volume: 167000, price: 0.997, liquidity: 2400000 },
  { timestamp: '2024-01-06', volume: 289000, price: 1.003, liquidity: 2600000 },
  { timestamp: '2024-01-07', volume: 234000, price: 1.000, liquidity: 2750000 },
];

const mockRecentTrades = [
  { hash: '0x1234...5678', type: 'Buy', amount: '50.00 GRAMX', price: '1.001', time: '2 mins ago' },
  { hash: '0x2345...6789', type: 'Sell', amount: '25.50 GRAMX', price: '0.999', time: '8 mins ago' },
  { hash: '0x3456...789a', type: 'Buy', amount: '100.00 GRAMX', price: '1.000', time: '15 mins ago' },
  { hash: '0x4567...89ab', type: 'Buy', amount: '75.25 GRAMX', price: '1.002', time: '23 mins ago' },
  { hash: '0x5678...9abc', type: 'Sell', amount: '30.00 GRAMX', price: '0.998', time: '31 mins ago' },
];

const liquidityComposition = [
  { name: 'PAXG', value: 50, amount: 1228395, color: '#FFD700' },
  { name: 'GRAMX', value: 50, amount: 1228395, color: '#00D2FF' },
];

const Liquidity = () => {
  const { address, isConnected } = useAccount();
  const { stats, loading, error, lastUpdated, refresh } = useVaultStats(true, 30000);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

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

  const getLiquidityHealth = (depth) => {
    if (depth > 5000000) return { status: 'Excellent', color: 'success' };
    if (depth > 2000000) return { status: 'Good', color: 'primary' };
    if (depth > 1000000) return { status: 'Fair', color: 'warning' };
    return { status: 'Low', color: 'error' };
  };

  const liquidityHealth = getLiquidityHealth(stats?.liquidityDepth * 2000 || 0);

  const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography color="text.secondary" variant="body2" gutterBottom>
                {title}
              </Typography>
              <Typography variant="h4" component="div" color={`${color}.main`} fontWeight="bold">
                {value}
              </Typography>
              {subtitle && (
                <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Icon sx={{ fontSize: 40, color: `${color}.main`, mb: 1 }} />
              {trend && (
                <Chip
                  label={trend}
                  size="small"
                  color={trend.startsWith('+') ? 'success' : 'error'}
                  sx={{ fontSize: '0.75rem' }}
                />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            GRAMX/PAXG Liquidity Pool
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time liquidity metrics and trading data for the GRAMX/PAXG Uniswap V2 pair
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={refresh} color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            endIcon={<ExternalLinkIcon />}
            href={`https://app.uniswap.org/#/pool/${contractsConfig.CONTRACTS?.LP_PAIR}`}
            target="_blank"
          >
            View on Uniswap
          </Button>
        </Box>
      </Box>

      {/* Liquidity Health Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Alert severity={liquidityHealth.color} sx={{ mb: 4 }}>
          <AlertTitle>Liquidity Status: {liquidityHealth.status}</AlertTitle>
          Current total liquidity depth is {formatCurrency((stats?.liquidityDepth || 0) * 2000)} - 
          {liquidityHealth.status === 'Excellent' && ' Deep liquidity ensures minimal slippage for large trades.'}
          {liquidityHealth.status === 'Good' && ' Adequate liquidity for most trading activities.'}
          {liquidityHealth.status === 'Fair' && ' Moderate liquidity - larger trades may experience some slippage.'}
          {liquidityHealth.status === 'Low' && ' Limited liquidity - trades may have higher slippage.'}
        </Alert>
      </motion.div>

      {/* Key LP Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Liquidity (TVL)"
            value={formatCurrency((stats?.liquidityDepth || 0) * 2000)}
            subtitle="USD value in LP"
            icon={LiquidityIcon}
            color="primary"
            trend="+12.5%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="PAXG Reserves"
            value={`${formatNumber(stats?.lpReservePAXG || 0, 3)} PAXG`}
            subtitle="Gold backing in LP"
            icon={VaultIcon}
            color="warning"
            trend="+8.3%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="GRAMX Reserves"
            value={`${formatNumber(stats?.lpReserveGRAMX || 0, 3)} GRAMX`}
            subtitle="GRAMX tokens in LP"
            icon={SwapIcon}
            color="secondary"
            trend="+8.3%"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="LP Tokens Held"
            value={`${formatNumber(stats?.lpBalance || 0, 3)} LP`}
            subtitle="Vault's LP position"
            icon={TrendingUpIcon}
            color="success"
            trend="+15.7%"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Liquidity Chart */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight="600">
                    Liquidity & Volume History
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {['24h', '7d', '30d'].map((timeframe) => (
                      <Button
                        key={timeframe}
                        size="small"
                        variant={selectedTimeframe === timeframe ? 'contained' : 'outlined'}
                        onClick={() => setSelectedTimeframe(timeframe)}
                      >
                        {timeframe}
                      </Button>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockTradingHistory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis 
                        dataKey="timestamp" 
                        stroke="#B0BEC5"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#B0BEC5"
                        fontSize={12}
                        tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                      />
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F26', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [
                          name === 'liquidity' ? `$${value.toLocaleString()}` : value.toLocaleString(),
                          name === 'liquidity' ? 'Liquidity' : 'Volume'
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="liquidity"
                        stroke="#00D2FF"
                        strokeWidth={2}
                        fill="url(#colorLiquidity)"
                      />
                      <defs>
                        <linearGradient id="colorLiquidity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00D2FF" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#00D2FF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* LP Composition */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Liquidity Pool Composition
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={liquidityComposition}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {liquidityComposition.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F26', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value, name) => [`${value}%`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {liquidityComposition.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            backgroundColor: item.color,
                            borderRadius: '50%',
                            mr: 1,
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600">
                        {item.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* LP Information Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* How LP Works */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <LiquidityIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h6" fontWeight="600">
                    How Liquidity Works
                  </Typography>
                  <Tooltip title="Automatic liquidity provision on every mint">
                    <InfoIcon color="action" fontSize="small" />
                  </Tooltip>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      1
                    </Box>
                    <Typography variant="body2">
                      User deposits PAXG to mint GRAMX
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'secondary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      2
                    </Box>
                    <Typography variant="body2">
                      Vault mints 2x GRAMX: 1x to user, 1x for LP
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'success.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      3
                    </Box>
                    <Typography variant="body2">
                      PAXG + GRAMX automatically added to Uniswap LP
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: 'warning.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      4
                    </Box>
                    <Typography variant="body2">
                      Vault receives LP tokens representing the position
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* LP Benefits */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Liquidity Benefits
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      <strong>Growing Liquidity:</strong> Every mint increases total liquidity
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <SwapIcon fontSize="small" color="primary" />
                    <Typography variant="body2">
                      <strong>Instant Trading:</strong> No need to wait for market makers
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <VaultIcon fontSize="small" color="warning" />
                    <Typography variant="body2">
                      <strong>Deep Reserves:</strong> Stable 1:1 PAXG backing maintained
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LiquidityIcon fontSize="small" color="secondary" />
                    <Typography variant="body2">
                      <strong>Protocol Owned:</strong> Vault holds all LP tokens permanently
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Trades */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Recent Trades
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ExternalLinkIcon />}
                href={`https://info.uniswap.org/#/pools/${contractsConfig.CONTRACTS?.LP_PAIR}`}
                target="_blank"
              >
                View on Uniswap Info
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRecentTrades.map((trade, index) => (
                    <TableRow
                      key={index}
                      sx={{ '&:hover': { backgroundColor: 'rgba(0, 210, 255, 0.05)' } }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {trade.hash}
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <ExternalLinkIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trade.type}
                          size="small"
                          color={trade.type === 'Buy' ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{trade.amount}</TableCell>
                      <TableCell>{trade.price} PAXG</TableCell>
                      <TableCell color="text.secondary">{trade.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Liquidity;