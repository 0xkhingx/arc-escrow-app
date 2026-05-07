import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { REGISTRY_ADDRESS, REGISTRY_ABI } from './constants';
import { getProvider, getSigner } from './provider';

const SERVICE_TYPES = ['Data', 'Security', 'Development', 'Research', 'Finance', 'Other'];

const getRegistry = async (withSigner = false) => {
  if (withSigner) {
    const signer = await getSigner();
    return new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
  }
  return new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, getProvider());
};

const ReputationBadge = ({ score }) => {
  const level = score === 0 ? 'New' : score < 50 ? 'Rising' : score < 200 ? 'Trusted' : 'Elite';
  const colors = {
    New: 'bg-gray-100 text-gray-500',
    Rising: 'bg-blue-50 text-blue-500',
    Trusted: 'bg-green-50 text-green-600',
    Elite: 'bg-yellow-50 text-yellow-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${colors[level]}`}>
      {level} · {score.toString()}
    </span>
  );
};

const AgentCard = ({ agent, reputation, onHire }) => {
  const navigate = useNavigate();
  const settled = Number(agent.totalUSDCSettled) / 1_000_000;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-gray-900">{agent.name}</span>
          <span className="text-[11px] text-gray-400 font-mono">
            {agent.wallet.slice(0, 6)}...{agent.wallet.slice(-4)}
          </span>
        </div>
        <ReputationBadge score={Number(reputation)} />
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">{agent.description}</p>

      <div className="flex items-center gap-3 pt-1">
        <span className="px-2.5 py-1 bg-gray-50 rounded-full text-[11px] font-medium text-gray-600">
          {agent.serviceType}
        </span>
        <span className="text-[11px] text-gray-400">
          {agent.completedJobs.toString()} jobs · ${settled.toLocaleString()} settled
        </span>
        {Number(agent.disputedJobs) > 0 && (
          <span className="text-[11px] text-red-400">
            {agent.disputedJobs.toString()} disputed
          </span>
        )}
      </div>

      <button
        onClick={() => navigate(`/agent/${agent.wallet}`)}
        className="w-full py-2 rounded-xl bg-[#0052FF] text-white text-xs font-bold hover:bg-[#003FCC] transition-colors"
      >
        View Profile
      </button>
    </div>
  );
};

const RegisterPanel = ({ walletAddress, onRegistered }) => {
  const [form, setForm] = useState({ name: '', description: '', serviceType: 'Data' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!walletAddress) return;
      try {
        const registry = await getRegistry();
        const agent = await registry.getAgent(walletAddress);
        if (agent.isActive) setAlreadyRegistered(true);
      } catch {}
    };
    check();
  }, [walletAddress]);

  const handleRegister = async () => {
    if (!form.name || !form.description) {
      setError('Name and description are required.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const registry = await getRegistry(true);
      const tx = await registry.register(form.name, form.description, form.serviceType);
      await tx.wait();
      setAlreadyRegistered(true);
      onRegistered();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (alreadyRegistered) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
        <p className="text-sm font-bold text-green-700">You're registered as an agent</p>
        <p className="text-xs text-green-500 mt-1">Your profile is live in the registry</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
      <div>
        <h3 className="text-sm font-extrabold text-gray-900">Register as an Agent</h3>
        <p className="text-xs text-gray-400 mt-0.5">List your services on-chain and start building reputation</p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Agent name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0052FF] transition-colors"
        />
        <textarea
          placeholder="Describe what you do — be specific"
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0052FF] transition-colors resize-none"
        />
        <select
          value={form.serviceType}
          onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#0052FF] transition-colors bg-white"
        >
          {SERVICE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border border-red-100 rounded-xl text-xs text-red-500 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold ml-2">✕</button>
        </div>
      )}

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full py-2.5 rounded-xl bg-[#0052FF] text-white text-xs font-bold hover:bg-[#003FCC] disabled:opacity-50 transition-colors"
      >
        {loading ? 'Registering...' : 'Register on Arc'}
      </button>
    </div>
  );
};

const Registry = ({ walletAddress, onHireAgent }) => {
  const [agents, setAgents] = useState([]);
  const [reputations, setReputations] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const registry = await getRegistry();
        const count = await registry.getAgentCount();
        const total = Number(count);
        if (total === 0) { setAgents([]); return; }

        const fetched = await registry.getAgents(0, total);
        const active = fetched.filter(a => a.isActive);
        setAgents(active);

        const reps = {};
        await Promise.all(active.map(async a => {
          const r = await registry.getReputation(a.wallet);
          reps[a.wallet] = r;
        }));
        setReputations(reps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [refreshTrigger]);

  const allTypes = ['All', ...SERVICE_TYPES];
  const filtered = filter === 'All' ? agents : agents.filter(a => a.serviceType === filter);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-8">

      {/* Register panel */}
      <RegisterPanel
        walletAddress={walletAddress}
        onRegistered={() => setRefreshTrigger(t => t + 1)}
      />

      {/* Browse agents */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-gray-900">
            Agent Directory
          </h2>
          <span className="text-xs text-gray-400">{filtered.length} agents</span>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {allTypes.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-colors ${
                filter === t
                  ? 'bg-[#0052FF] text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-xs text-gray-400">Loading agents...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 gap-2">
            <p className="text-sm text-gray-400 font-medium">No agents yet</p>
            <p className="text-xs text-gray-300">Be the first to register</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map(agent => (
              <AgentCard
                key={agent.wallet}
                agent={agent}
                reputation={reputations[agent.wallet] ?? 0n}
                onHire={onHireAgent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Registry;