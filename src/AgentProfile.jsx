import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { REGISTRY_ADDRESS, REGISTRY_ABI } from './constants';

// --- Global Styles matching App.jsx ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      background-color: #F4F4F4;
      color: #1A1A1A;
      margin: 0;
    }

    .dashboard-card {
      background: #FFFFFF;
      border-radius: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
      border: 1px solid rgba(0, 0, 0, 0.02);
    }

    @keyframes entrance {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-entrance {
      animation: entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `}</style>
);

const getRegistry = async () => {
  const provider = window.ethereum
    ? new ethers.BrowserProvider(window.ethereum)
    : new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
  return new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, provider);
};

const ReputationBar = ({ score }) => {
  const level = score === 0 ? 'New' : score < 50 ? 'Rising' : score < 200 ? 'Trusted' : 'Elite';
  const percent = Math.min((Number(score) / 500) * 100, 100);
  const colors = {
    New: { bar: 'bg-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' },
    Rising: { bar: 'bg-[#0052FF]', text: 'text-[#0052FF]', bg: 'bg-blue-50' },
    Trusted: { bar: 'bg-[#0052FF]', text: 'text-[#0052FF]', bg: 'bg-[#F7F9FC]' },
    Elite: { bar: 'bg-[#0052FF]', text: 'text-[#0052FF]', bg: 'bg-[#F7F9FC]' },
  };
  const c = colors[level];

  return (
    <div className={`w-full dashboard-card p-5 ${c.bg} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-extrabold uppercase tracking-widest ${c.text}`}>
          {level}
        </span>
        <span className={`text-2xl font-black ${c.text}`}>
          {Number(score).toLocaleString()}
        </span>
      </div>
      <div className="w-full h-2 bg-white rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${c.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-[11px] text-gray-400">
        Reputation score — earned from completed escrows on Arc
      </p>
    </div>
  );
};

const StatCard = ({ label, value, sub }) => (
  <div className="flex-1 dashboard-card p-4 flex flex-col gap-1">
    <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{label}</span>
    <span className="text-xl font-black text-gray-900">{value}</span>
    {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
  </div>
);

const AgentProfile = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [reputation, setReputation] = useState(0n);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const registry = await getRegistry();
        const data = await registry.getAgent(address);
        
        if (!data.isActive) {
          setNotFound(true);
          return;
        }

        setAgent(data);
        const rep = await registry.getReputation(address);
        setReputation(rep);
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (address) fetch();
  }, [address]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleHire = () => {
    navigate(`/?hire=${address}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex items-center justify-center">
        <GlobalStyles />
        <p className="text-sm text-gray-400">Loading agent profile...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center gap-4">
        <GlobalStyles />
        <p className="text-sm font-bold text-gray-900">Agent not found</p>
        <p className="text-xs text-gray-400">This address isn't registered on Arc Escrow</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 rounded-full bg-[#0052FF] text-white text-xs font-bold hover:bg-[#003FCC] transition-colors"
        >
          Go to App
        </button>
      </div>
    );
  }

  const settled = Number(agent.totalUSDCSettled) / 1_000_000;
  const joinDate = new Date(Number(agent.registeredAt) * 1000).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#F4F4F4]">
      <GlobalStyles />
      
      {/* Header matching App.jsx style */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-8 px-4 gap-4 sm:gap-0 bg-white border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-xs font-black italic cursor-pointer" onClick={() => navigate('/')}>№</div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">ARC</h1>
            <p className="text-[11px] text-gray-400 font-medium">Agent Profile</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-full bg-white text-xs font-bold text-gray-600 border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            {copied ? 'Copied ✓' : 'Copy Link'}
          </button>
          <button
            onClick={handleHire}
            className="px-4 py-2 rounded-full bg-[#0052FF] text-white text-xs font-bold hover:bg-[#003FCC] transition-colors"
          >
            Hire This Agent
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="w-full max-w-2xl mx-auto px-3 sm:px-6 py-8 sm:py-12 animate-entrance">

        {/* Identity */}
        <div className="dashboard-card p-6 sm:p-8 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#0052FF] to-[#00C6FF] flex items-center justify-center text-white text-xl font-black">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-mono text-gray-400 mt-2 px-3 py-1 bg-gray-50 rounded-full">
              {address.slice(0, 8)}...{address.slice(-6)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">{agent.name}</h1>
            <span className="inline-block mt-2 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-bold text-gray-600">
              {agent.serviceType}
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{agent.description}</p>
          <p className="text-xs text-gray-400 font-medium">Member since {joinDate}</p>
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {/* Reputation */}
          <ReputationBar score={reputation} />

          {/* Stats */}
          <div className="flex gap-3">
            <StatCard
              label="Jobs Done"
              value={agent.completedJobs.toString()}
              sub="completed escrows"
            />
            <StatCard
              label="Disputed"
              value={agent.disputedJobs.toString()}
              sub="raised against"
            />
            <StatCard
              label="Settled"
              value={`$${settled.toLocaleString()}`}
              sub="USDC total"
            />
          </div>

          {/* Arcscan link */}
          <a
            href={`https://testnet.arcscan.app/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-500 hover:text-[#0052FF] hover:border-[#0052FF] hover:shadow-md transition-all text-center shadow-sm"
          >
            View on Arcscan ↗
          </a>
        </div>

      </div>
    </div>
  );
};

export default AgentProfile;