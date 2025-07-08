import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  ButtonGroup,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  OpenInNew as ExternalLinkIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, subMonths, subYears } from 'date-fns';

// Mock historical data
const generateMockData = (days, baseValue = 1000000) => {
  const data = [];
  let value = baseValue;
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const volatility = 0.02; // 2% daily volatility
    const trend = 0.001; // 0.1% daily growth trend
    const change = (Math.random() - 0.5) * volatility + trend;
    
    value *= (1 + change);
    
    data.push({
      date: format(date, 'yyyy-MM-dd'),
      timestamp: date.getTime(),
      tvl: Math.round(value),
      volume: Math.round(Math.random() * 50000 + 10000),
      transactions: Math.floor(Math.random() * 50 + 10),
      reserveRatio: Math.round((180 + Math.random() * 40) * 100) / 100,
      apy: Math.round((5 + Math.random() * 3) * 100) / 100,
    });
  }
  
  return data;
};

const mockData30d = generateMockData(30, 2000000);
const mockData90d = generateMockData(90, 1500000);
const mockData1y = generateMockData(365, 1000000);

const mockUserAnalytics = [
  { address: '0x1234...5678', totalMinted: '125.50', totalRedeemed: '45.25', netPosition: '80.25', firstTx: '2024-01-15' },
  { address: '0x2345...6789', totalMinted: '250.00', totalRedeemed: '100.00', netPosition: '150.00', firstTx: '2024-01-20' },
  { address: '0x3456...789a', totalMinted: '75.75', totalRedeemed: '0.00', netPosition: '75.75', firstTx: '2024-02-01' },
  { address: '0x4567...89ab', totalMinted: '500.00', totalRedeemed: '200.00', netPosition: '300.00', firstTx: '2024-01-10' },
  { address: '0x5678...9abc', totalMinted: '89.25', totalRedeemed: '89.25', netPosition: '0.00', firstTx: '2024-01-25' },
];

const mockTokenDistribution = [
  { name: 'Top 10 Holders', value: 45, color: '#00D2FF' },
  { name: 'Medium Holders', value: 35, color: '#3A7BD5' },
  { name: 'Small Holders', value: 20, color: '#6B73FF' },
];

const Analytics = () => {
  const [timeframe, setTimeframe] = useState('30d');
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(mockData30d);

  const timeframeOptions = [
    { label: '30D', value: '30d', data: mockData30d },
    { label: '90D', value: '90d', data: mockData90d },
    { label: '1Y', value: '1y', data: mockData1y },
  ];

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    const option = timeframeOptions.find(opt => opt.value === newTimeframe);
    setData(option.data);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Calculate metrics
  const currentMetrics = data[data.length - 1];
  const previousMetrics = data[data.length - 2];
  const firstMetrics = data[0];

  const tvlChange = currentMetrics && previousMetrics 
    ? ((currentMetrics.tvl - previousMetrics.tvl) / previousMetrics.tvl) * 100 
    : 0;

  const tvlChangeTotal = currentMetrics && firstMetrics
    ? ((currentMetrics.tvl - firstMetrics.tvl) / firstMetrics.tvl) * 100
    : 0;

  const totalVolume = data.reduce((sum, item) => sum + item.volume, 0);
  const avgReserveRatio = data.reduce((sum, item) => sum + item.reserveRatio, 0) / data.length;

  const MetricCard = ({ title, value, change, prefix = '', suffix = '', trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardContent>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="div" fontWeight="bold">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </Typography>
            {change !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {change >= 0 ? (
                  <TrendingUpIcon color="success" fontSize="small" />
                ) : (
                  <TrendingDownIcon color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={change >= 0 ? 'success.main' : 'error.main'}
                  fontWeight="600"
                >
                  {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                </Typography>
              </Box>
            )}
          </Box>
          {trend && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {trend}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: '#1A1F26',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 2,
            p: 2,
          }}
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            {format(new Date(label), 'MMM dd, yyyy')}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toLocaleString()}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

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
            Analytics Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive analytics and performance metrics for GRAMX Vault
          </Typography>
        </motion.div>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            {timeframeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeframe === option.value ? 'contained' : 'outlined'}
                onClick={() => handleTimeframeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
          <IconButton color="primary">
            <RefreshIcon />
          </IconButton>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="small"
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Value Locked"
            value={currentMetrics?.tvl}
            change={tvlChangeTotal}
            prefix="$"
            trend={`Daily: ${tvlChange >= 0 ? '+' : ''}${tvlChange.toFixed(2)}%`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Volume"
            value={totalVolume}
            prefix="$"
            trend={`${timeframe.toUpperCase()} period`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Avg Reserve Ratio"
            value={avgReserveRatio.toFixed(2)}
            suffix="%"
            trend="Healthy reserves"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Current APY"
            value={currentMetrics?.apy}
            suffix="%"
            trend="LP rewards included"
          />
        </Grid>
      </Grid>

      {/* Tabs for different analytics views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Overview" />
          <Tab label="Performance" />
          <Tab label="Users" />
          <Tab label="Distribution" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {/* TVL Chart */}
          <Grid item xs={12} md={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Total Value Locked Over Time
                  </Typography>
                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="timestamp"
                          domain={['dataMin', 'dataMax']}
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                          stroke="#B0BEC5"
                          fontSize={12}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                          stroke="#B0BEC5"
                          fontSize={12}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="tvl"
                          stroke="#00D2FF"
                          strokeWidth={2}
                          fill="url(#colorTVL)"
                        />
                        <defs>
                          <linearGradient id="colorTVL" x1="0" y1="0" x2="0" y2="1">
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

          {/* Volume & Transactions */}
          <Grid item xs={12} md={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Daily Activity
                  </Typography>
                  <Box sx={{ height: 340 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={(value) => format(new Date(value), 'dd')}
                          stroke="#B0BEC5"
                          fontSize={10}
                        />
                        <YAxis yAxisId="left" stroke="#B0BEC5" fontSize={10} />
                        <YAxis yAxisId="right" orientation="right" stroke="#B0BEC5" fontSize={10} />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Bar yAxisId="left" dataKey="volume" fill="#3A7BD5" />
                        <Line yAxisId="right" type="monotone" dataKey="transactions" stroke="#FF6B6B" strokeWidth={2} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Reserve Ratio Trend */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Reserve Ratio Trend
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                          stroke="#B0BEC5"
                          fontSize={12}
                        />
                        <YAxis 
                          domain={[180, 220]}
                          tickFormatter={(value) => `${value}%`}
                          stroke="#B0BEC5"
                          fontSize={12}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="reserveRatio"
                          stroke="#4CAF50"
                          strokeWidth={2}
                          dot={{ fill: '#4CAF50', strokeWidth: 2, r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* APY Performance */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    APY Performance
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="timestamp"
                          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                          stroke="#B0BEC5"
                          fontSize={12}
                        />
                        <YAxis 
                          tickFormatter={(value) => `${value}%`}
                          stroke="#B0BEC5"
                          fontSize={12}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="apy"
                          stroke="#FF9800"
                          strokeWidth={2}
                          fill="url(#colorAPY)"
                        />
                        <defs>
                          <linearGradient id="colorAPY" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF9800" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FF9800" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Top Users Analytics
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ExternalLinkIcon />}
                >
                  View All Users
                </Button>
              </Box>
              
              <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Address</TableCell>
                      <TableCell>Total Minted</TableCell>
                      <TableCell>Total Redeemed</TableCell>
                      <TableCell>Net Position</TableCell>
                      <TableCell>First Transaction</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockUserAnalytics.map((user, index) => (
                      <TableRow
                        key={index}
                        sx={{ '&:hover': { backgroundColor: 'rgba(0, 210, 255, 0.05)' } }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace' }}>
                          {user.address}
                        </TableCell>
                        <TableCell>{user.totalMinted} GRAMX</TableCell>
                        <TableCell>{user.totalRedeemed} GRAMX</TableCell>
                        <TableCell>
                          <Typography
                            color={parseFloat(user.netPosition) > 0 ? 'success.main' : 'text.secondary'}
                            fontWeight="600"
                          >
                            {user.netPosition} GRAMX
                          </Typography>
                        </TableCell>
                        <TableCell>{user.firstTx}</TableCell>
                        <TableCell>
                          <Chip
                            label={parseFloat(user.netPosition) > 0 ? 'Active' : 'Exited'}
                            size="small"
                            color={parseFloat(user.netPosition) > 0 ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          {/* Token Distribution */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    GRAMX Token Distribution
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={mockTokenDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {mockTokenDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {mockTokenDistribution.map((item, index) => (
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
                          {item.name}: {item.value}%
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Holder Statistics */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Holder Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Total Unique Holders
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        1,247
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Average Holding
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        985.2 GRAMX
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Holder Growth (30d)
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          +12.5%
                        </Typography>
                        <TrendingUpIcon color="success" />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Analytics;