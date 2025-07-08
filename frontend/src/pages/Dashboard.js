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
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  AccountBalance as VaultIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  OpenInNew as ExternalLinkIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAccount, useBlockNumber } from 'wagmi';

// Mock data for demonstration - in real app, this would come from the blockchain
const mockVaultStats = {
  totalValueLocked: '2,456,789.50',
  totalGRAMXSupply: '1,228,394.75',
  reserveRatio: '200.15',
  lpTokensHeld: '89,234.12',
  totalTransactions: '1,847',
  activeUsers: '429',
};

const mockTVLHistory = [
  { timestamp: '2024-01-01', tvl: 1000000 },
  { timestamp: '2024-01-02', tvl: 1150000 },
  { timestamp: '2024-01-03', tvl: 1300000 },
  { timestamp: '2024-01-04', tvl: 1450000 },
  { timestamp: '2024-01-05', tvl: 1600000 },
  { timestamp: '2024-01-06', tvl: 1750000 },
  { timestamp: '2024-01-07', tvl: 2000000 },
  { timestamp: '2024-01-08', tvl: 2200000 },
  { timestamp: '2024-01-09', tvl: 2400000 },
  { timestamp: '2024-01-10', tvl: 2456789 },
];

const mockRecentTransactions = [
  { hash: '0x1234...5678', type: 'Mint', amount: '50.00 PAXG', user: '0xabcd...ef01', timestamp: '2 mins ago' },
  { hash: '0x2345...6789', type: 'Redeem', amount: '25.50 GRAMX', user: '0xbcde...f012', timestamp: '15 mins ago' },
  { hash: '0x3456...789a', type: 'Mint', amount: '100.00 PAXG', user: '0xcdef...0123', timestamp: '1 hour ago' },
  { hash: '0x4567...89ab', type: 'Mint', amount: '75.25 PAXG', user: '0xdef0...1234', timestamp: '2 hours ago' },
  { hash: '0x5678...9abc', type: 'Redeem', amount: '30.00 GRAMX', user: '0xef01...2345', timestamp: '3 hours ago' },
];

const reserveBreakdown = [
  { name: 'PAXG in Vault', value: 1228395, color: '#00D2FF' },
  { name: 'PAXG in LP', value: 1228395, color: '#3A7BD5' },
];

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'primary' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { data: blockNumber } = useBlockNumber();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    setLastUpdated(new Date());
  }, [blockNumber]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // In real implementation, trigger data refresh
  };

  const getReserveRatioStatus = (ratio) => {
    if (ratio >= 200) return { status: 'Excellent', color: 'success', icon: CheckIcon };
    if (ratio >= 150) return { status: 'Good', color: 'primary', icon: CheckIcon };
    if (ratio >= 110) return { status: 'Warning', color: 'warning', icon: WarningIcon };
    return { status: 'Critical', color: 'error', icon: WarningIcon };
  };

  const reserveStatus = getReserveRatioStatus(parseFloat(mockVaultStats.reserveRatio));

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
            GRAMX Vault Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time overview of the GRAMX vault protocol backed by PAXG gold
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
          <IconButton onClick={handleRefresh} color="primary">
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Status Alert */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Alert 
          severity={reserveStatus.color} 
          icon={<reserveStatus.icon />}
          sx={{ mb: 4 }}
        >
          <AlertTitle>Reserve Status: {reserveStatus.status}</AlertTitle>
          Current reserve ratio is {mockVaultStats.reserveRatio}% - 
          {reserveStatus.color === 'success' ? ' Protocol is fully collateralized with excess reserves.' : 
           reserveStatus.color === 'warning' ? ' Reserve ratio is adequate but monitor closely.' :
           ' Reserve ratio is below recommended levels.'}
        </Alert>
      </motion.div>

      {/* Key Metrics Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value Locked"
            value={`$${mockVaultStats.totalValueLocked}`}
            subtitle="USD Value"
            icon={VaultIcon}
            trend="+12.5%"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="GRAMX Supply"
            value={mockVaultStats.totalGRAMXSupply}
            subtitle="Total minted tokens"
            icon={TrendingUpIcon}
            trend="+8.3%"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reserve Ratio"
            value={`${mockVaultStats.reserveRatio}%`}
            subtitle="PAXG backing"
            icon={SecurityIcon}
            trend="+2.1%"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="LP Tokens"
            value={mockVaultStats.lpTokensHeld}
            subtitle="Liquidity provided"
            icon={VaultIcon}
            trend="+15.7%"
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* TVL Chart */}
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
                    Total Value Locked (TVL)
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ExternalLinkIcon />}
                    href="https://defipulse.com"
                    target="_blank"
                  >
                    View on DeFiPulse
                  </Button>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockTVLHistory}>
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
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F26', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, 'TVL']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="tvl" 
                        stroke="#00D2FF" 
                        strokeWidth={3}
                        dot={{ fill: '#00D2FF', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: '#00D2FF', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Reserve Breakdown */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Reserve Breakdown
                </Typography>
                <Box sx={{ height: 250 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reserveBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {reserveBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1A1F26', 
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px'
                        }}
                        formatter={(value) => [value.toLocaleString(), 'PAXG']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ mt: 2 }}>
                  {reserveBreakdown.map((item, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: item.color,
                          borderRadius: '50%',
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {item.name}: {item.value.toLocaleString()} PAXG
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="600">
                Recent Transactions
              </Typography>
              <Button
                variant="outlined"
                size="small"
                endIcon={<ExternalLinkIcon />}
                href="https://etherscan.io"
                target="_blank"
              >
                View All on Etherscan
              </Button>
            </Box>
            
            <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transaction Hash</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockRecentTransactions.map((tx, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': { backgroundColor: 'rgba(0, 210, 255, 0.05)' },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {tx.hash}
                          </Typography>
                          <IconButton size="small" sx={{ ml: 1 }}>
                            <ExternalLinkIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tx.type}
                          size="small"
                          color={tx.type === 'Mint' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>{tx.amount}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{tx.user}</TableCell>
                      <TableCell color="text.secondary">{tx.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Proof of Reserves */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <Card sx={{ mt: 4, background: 'linear-gradient(135deg, rgba(0, 210, 255, 0.1) 0%, rgba(58, 123, 213, 0.1) 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="h6" fontWeight="600" gutterBottom>
                  Proof of Reserves
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Real-time verification of PAXG backing for all minted GRAMX tokens
                </Typography>
              </Box>
              <SecurityIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total PAXG Reserves
                  </Typography>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {(parseFloat(mockVaultStats.totalGRAMXSupply.replace(',', '')) * parseFloat(mockVaultStats.reserveRatio) / 100).toLocaleString()} PAXG
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    GRAMX Total Supply
                  </Typography>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    {mockVaultStats.totalGRAMXSupply} GRAMX
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Reserve Ratio
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {mockVaultStats.reserveRatio}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(parseFloat(mockVaultStats.reserveRatio), 300)}
                      sx={{ 
                        flex: 1, 
                        height: 8, 
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: parseFloat(mockVaultStats.reserveRatio) >= 200 ? '#4CAF50' : '#FF9800'
                        }
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Dashboard;