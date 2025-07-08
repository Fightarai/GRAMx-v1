import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useProvider, useAccount } from 'wagmi';
import { VaultABI } from '../abi/VaultABI';
import contractsConfig from '../config/contracts.json';

const useContractNonce = () => {
  const [nonce, setNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const provider = useProvider();
  const { address, isConnected } = useAccount();

  const fetchNonce = useCallback(async () => {
    if (!provider || !address || !isConnected) {
      setNonce(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const vaultAddress = contractsConfig.CONTRACTS?.GRAMX_VAULT;
      if (!vaultAddress) {
        throw new Error('Vault contract address not configured');
      }

      const contract = new ethers.Contract(vaultAddress, VaultABI, provider);
      const currentNonce = await contract.nonces(address);
      
      setNonce(currentNonce.toNumber());
      setLoading(false);
      
    } catch (err) {
      console.error('Failed to fetch nonce:', err);
      setError(err.message || 'Failed to fetch nonce');
      setLoading(false);
    }
  }, [provider, address, isConnected]);

  // Fetch nonce when account or provider changes
  useEffect(() => {
    fetchNonce();
  }, [fetchNonce]);

  // Increment nonce locally (optimistic update)
  const incrementNonce = useCallback(() => {
    setNonce(prev => prev + 1);
  }, []);

  return {
    nonce,
    loading,
    error,
    refreshNonce: fetchNonce,
    incrementNonce
  };
};

export default useContractNonce;