import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useProvider, useAccount } from 'wagmi';
import { VaultABI } from '../abi/VaultABI';
import contractsConfig from '../config/contracts.json';

const useVaultStats = (autoRefresh = true, refreshInterval = 30000) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const provider = useProvider();
  const { isConnected } = useAccount();

  const fetchStats = useCallback(async () => {
    if (!provider) {
      setError('No provider available');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      const vaultAddress = contractsConfig.CONTRACTS?.GRAMX_VAULT;
      if (!vaultAddress) {
        throw new Error('Vault contract address not configured');
      }

      const contract = new ethers.Contract(vaultAddress, VaultABI, provider);

      // Fetch main vault statistics
      const [paxgBalance, gramxSupply, lpBalance, reserveRatio] = await contract.getVaultStats();
      
      // Fetch additional data
      const [lpReserves, currentReserveRatio] = await Promise.all([
        contract.getLPReserves(),
        contract.getReserveRatio()
      ]);

      const formattedStats = {
        // Main stats (in readable format)
        paxgBalance: parseFloat(ethers.utils.formatEther(paxgBalance)),
        gramxSupply: parseFloat(ethers.utils.formatEther(gramxSupply)),
        lpBalance: parseFloat(ethers.utils.formatEther(lpBalance)),
        reserveRatio: parseFloat(reserveRatio.toString()) / 100, // Convert from basis points
        
        // LP reserves
        lpReservePAXG: parseFloat(ethers.utils.formatEther(lpReserves[0])),
        lpReserveGRAMX: parseFloat(ethers.utils.formatEther(lpReserves[1])),
        
        // Current reserve ratio (more precise)
        currentReserveRatio: parseFloat(currentReserveRatio.toString()) / 100,
        
        // Raw values for precision
        raw: {
          paxgBalance,
          gramxSupply,
          lpBalance,
          reserveRatio,
          lpReservePAXG: lpReserves[0],
          lpReserveGRAMX: lpReserves[1],
          currentReserveRatio
        },
        
        // Calculated metrics
        totalValueLocked: parseFloat(ethers.utils.formatEther(paxgBalance.add(lpReserves[0]))),
        backingRatio: gramxSupply.gt(0) 
          ? parseFloat(ethers.utils.formatEther(paxgBalance.mul(10000).div(gramxSupply))) / 100
          : 100,
        liquidityDepth: parseFloat(ethers.utils.formatEther(lpReserves[0].add(lpReserves[1]))),
      };

      setStats(formattedStats);
      setLastUpdated(new Date());
      setLoading(false);
      
    } catch (err) {
      console.error('Failed to fetch vault stats:', err);
      setError(err.message || 'Failed to fetch vault statistics');
      setLoading(false);
    }
  }, [provider]);

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || !provider) return;

    const interval = setInterval(() => {
      fetchStats();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats, provider]);

  // Refresh when connection status changes
  useEffect(() => {
    if (isConnected && provider) {
      fetchStats();
    }
  }, [isConnected, provider, fetchStats]);

  return {
    stats,
    loading,
    error,
    lastUpdated,
    refresh: fetchStats,
    isStale: lastUpdated && (new Date() - lastUpdated) > refreshInterval * 2
  };
};

export default useVaultStats;