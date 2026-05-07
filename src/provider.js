import { ethers } from 'ethers';

const ARC_RPC = "https://rpc.testnet.arc.network";

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return new ethers.JsonRpcProvider(ARC_RPC);
};

export const getSigner = async () => {
  if (!window.ethereum) {
    throw new Error("No wallet detected. Please install MetaMask to perform this action.");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider.getSigner();
};
