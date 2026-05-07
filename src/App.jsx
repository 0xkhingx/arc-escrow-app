import React, { useReducer, useMemo, useEffect } from 'react';
import { ethers } from 'ethers';
import { FACTORY_ADDRESS, FACTORY_ABI, ABI, USDC_ADDRESS, USDC_ABI } from './constants';
import { saveEscrow, getEscrowHistory } from './storage';
import Registry from './Registry';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AgentProfile from './AgentProfile';
import { getProvider, getSigner } from './provider';

// --- Minimalist Animations & Modern Layout Styles ---
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

    .input-field {
      background: #F9F9F9;
      border: 1px solid #EAEAEA;
      border-radius: 20px;
      padding: 18px 24px;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .input-field:focus {
      outline: none;
      border-color: #0052FF;
      background: #FFFFFF;
    }

    @keyframes entrance {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .animate-entrance {
      animation: entrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes pulse-soft {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }

    .pulse-indicator {
      animation: pulse-soft 2s infinite ease-in-out;
    }
  `}</style>
);

// --- Logic (UNTOUCHED) ---
const STATES = {
  AWAITING_PAYMENT: "awaiting_payment",
  AWAITING_COMPLETION: "awaiting_completion",
  COMPLETE: "complete",
  DISPUTED: "disputed",
  REFUNDED: "refunded",
};

const initialState = {
  status: STATES.AWAITING_PAYMENT,
  walletConnected: false,
  walletAddress: '',
  escrowAddress: '',
  error: '',
  loading: false,
  history: [],
  historyOpen: false,
  view: 'escrow',
  agentAddress: '',
  taskDescription: '',
  amount: '',
};

function escrowReducer(state, action) {
  switch (action.type) {
    case "CONNECT_WALLET":
      return { ...state, walletConnected: true, walletAddress: action.address, error: "" };
    case 'DISCONNECT_WALLET':
      return {
        ...state,
        walletConnected: false,
        walletAddress: '',
        history: [],
        escrowAddress: '',
        status: STATES.AWAITING_PAYMENT
      };
    case "SET_ERROR":
      return { ...state, error: action.message };
    case "UPDATE_FIELD":
      if (state.status !== STATES.AWAITING_PAYMENT) return state;
      return { ...state, [action.field]: action.value };
    case "LOCK_FUNDS":
      if (state.status === STATES.AWAITING_PAYMENT) return { ...state, status: STATES.AWAITING_COMPLETION };
      return state;
    case "CONFIRM_COMPLETION":
      if (state.status === STATES.AWAITING_COMPLETION) return { ...state, status: STATES.COMPLETE };
      return state;
    case "DISPUTE":
      if (state.status === STATES.AWAITING_COMPLETION) return { ...state, status: STATES.DISPUTED };
      return state;
    case "RESOLVE_REFUND":
      if (state.status === STATES.DISPUTED) return { ...state, status: STATES.REFUNDED };
      return state;
    case 'SET_ESCROW':
      return { ...state, escrowAddress: action.address };
    case 'SET_LOADING':
      return { ...state, loading: action.value };
    case 'CLEAR_ERROR':
      return { ...state, error: '' };
    case 'SET_HISTORY':
      return { ...state, history: action.history };
    case 'TOGGLE_HISTORY':
      return { ...state, historyOpen: !state.historyOpen };
    case 'SET_VIEW':
      return { ...state, view: action.view };
    default:
      return state;
  }
}

const generateHash = (text) => {
  if (!text) return '0x0000000000000000000000000000000000000000000000000000000000000000';
  return ethers.id(text);
};

// --- Specialized Components (Referencing image_5c13cb.jpg) ---

const AppHeader = ({ connected, address, onConnect, onDisconnect, onHistoryOpen, historyCount, currentView, onViewChange }) => (
  <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-8 px-4 gap-4 sm:gap-0">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-xs font-black italic">№</div>
      <div>
        <h1 className="text-sm font-bold tracking-tight">ARC</h1>
        <p className="text-[11px] text-gray-400 font-medium">Escrow Dashboard</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={() => onViewChange('escrow')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
          currentView === 'escrow'
            ? 'bg-[#0052FF] text-white'
            : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-md'
        }`}
      >
        Escrow
      </button>
      <button
        onClick={() => onViewChange('registry')}
        className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
          currentView === 'registry'
            ? 'bg-[#0052FF] text-white'
            : 'bg-white text-gray-600 border border-gray-100 shadow-sm hover:shadow-md'
        }`}
      >
        Agents
      </button>
    </div>

    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
      {connected && (
        <button
          onClick={onHistoryOpen}
          className="px-3 sm:px-4 py-2 rounded-full bg-white text-xs font-bold border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          History
          {historyCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#0052FF] text-white text-[9px] flex items-center justify-center">
              {historyCount}
            </span>
          )}
        </button>
      )}
      {connected ? (
        <>
          <span className="hidden sm:inline px-4 py-2 rounded-full bg-white text-xs font-bold border border-gray-100 shadow-sm">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button
            onClick={onDisconnect}
            className="px-3 sm:px-4 py-2 rounded-full bg-red-50 text-xs font-bold text-red-500 border border-red-100 hover:bg-red-100 transition-all"
          >
            Disconnect
          </button>
        </>
      ) : (
        <button
          onClick={onConnect}
          className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-xs font-bold border border-gray-100 shadow-sm hover:shadow-md transition-all"
        >
          Connect Wallet
        </button>
      )}
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-white flex-shrink-0">
        <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-blue-600" />
      </div>
    </div>
  </header>
);

const Timeline = ({ status }) => {
  const steps = [
    { id: STATES.AWAITING_PAYMENT, label: "Awaiting Lock" },
    { id: STATES.AWAITING_COMPLETION, label: "Executing Task" },
    { id: STATES.COMPLETE, label: "Finalized" }
  ];

  return (
    <div className="flex gap-2 sm:gap-4 mt-6 sm:mt-8 overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isCurrent = status === step.id;
        const isPast = steps.findIndex(s => s.id === status) > i;
        return (
          <div key={step.id} className="flex flex-col gap-2 flex-shrink-0">
            <div className={`h-1.5 w-12 sm:w-16 rounded-full transition-all duration-700 ${isPast || isCurrent ? 'bg-[#0052FF]' : 'bg-gray-200'}`} />
            <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-black' : 'text-gray-300'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const HistoryPanel = ({ history, isOpen, onClose }) => (
  <>
    {/* Backdrop */}
    {isOpen && (
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
    )}

    {/* Panel */}
    <div className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-sm font-extrabold uppercase tracking-widest">Past Escrows</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-6 overflow-y-auto h-full pb-20">
        {!history || history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <p className="text-sm text-gray-400 font-medium">No escrows yet</p>
            <p className="text-xs text-gray-300 text-center">Your created escrows will appear here</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((escrow, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-2 border border-gray-100">
                <div className="flex items-center justify-between">
                  <a
                    href={`https://testnet.arcscan.app/address/${escrow.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-[#0052FF] hover:underline"
                  >
                    {escrow.address.slice(0, 6)}...{escrow.address.slice(-4)}
                  </a>
                  <span className="text-xs font-bold">{escrow.amount} USDC</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{escrow.task}</p>
                <p className="text-[10px] text-gray-300">{new Date(escrow.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
);

const ActionButtons = ({ status, isValid, onLock, onConfirm, onDispute, onResolve, loading }) => {
  return (
    <div className="flex flex-col gap-3 pt-2">
      {status === STATES.AWAITING_PAYMENT && (
        <button
          onClick={onLock}
          disabled={!isValid || loading}
          className="w-full py-2.5 text-sm font-medium text-white bg-[#0052FF] rounded-md hover:bg-[#003FCC] disabled:bg-[#E6EAF0] disabled:text-[#6B7280] transition-colors"
        >
          {loading ? 'Processing...' : 'Lock Funds'}
        </button>
      )}

      {status === STATES.AWAITING_COMPLETION && (
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#0052FF] rounded-md hover:bg-[#003FCC] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Confirm Completion'}
          </button>
          <button
            onClick={onDispute}
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-[#FF3B30] bg-transparent border border-[#FF3B30] rounded-md hover:bg-[#FFF5F5] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Processing...' : 'Dispute Task'}
          </button>
        </div>
      )}

      {status === STATES.DISPUTED && (
        <button
          onClick={onResolve}
          disabled={loading}
          className="w-full py-2.5 text-sm font-medium text-[#0A0A0A] bg-[#E6EAF0] rounded-md hover:bg-[#D1D5DB] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : 'Resolve & Refund'}
        </button>
      )}

      {(status === STATES.COMPLETE || status === STATES.REFUNDED) && (
        <div className="w-full py-2.5 text-sm font-medium text-[#6B7280] text-center bg-[#F7F9FC] border border-[#E6EAF0] rounded-md">
          Contract Closed
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [state, dispatch] = useReducer(escrowReducer, initialState);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hireAddress = params.get('hire');
    if (hireAddress) {
      dispatch({ type: 'UPDATE_FIELD', field: 'agentAddress', value: hireAddress });
      dispatch({ type: 'SET_VIEW', view: 'escrow' });
      navigate('/', { replace: true });
    }
  }, []);

  const hash = useMemo(() => generateHash(state.taskDescription), [state.taskDescription]);
  const isFormValid = state.walletConnected && state.agentAddress.trim() !== "" && state.taskDescription.trim() !== "" && Number(state.amount) > 0;

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        dispatch({ type: 'SET_ERROR', message: 'No wallet detected. Please install MetaMask.' });
        return;
      }
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      dispatch({ type: 'CONNECT_WALLET', address: accounts[0] });
      const history = getEscrowHistory(accounts[0]);
      dispatch({ type: 'SET_HISTORY', history });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message });
    }
  };

  const getContract = async () => {
    const signer = await getSigner();
    return new ethers.Contract(state.escrowAddress, ABI, signer);
  };

const lockFunds = async () => {
  try {
    dispatch({ type: 'SET_LOADING', value: true });

    if (!ethers.isAddress(state.agentAddress)) {
      dispatch({ type: 'SET_ERROR', message: 'Invalid agent address. Please check and try again.' });
      dispatch({ type: 'SET_LOADING', value: false });
      return;
    }

    const signer = await getSigner();
    const amountInUnits = ethers.parseUnits(parseFloat(state.amount).toFixed(6), 6);
    const agentAddress = ethers.getAddress(state.agentAddress);

    const factory = new ethers.Contract(FACTORY_ADDRESS, FACTORY_ABI, signer);
    const conditionHash = ethers.id(state.taskDescription);
    const tx = await factory.createEscrow(agentAddress, conditionHash);
    const receipt = await tx.wait();

    const event = receipt.logs.find(log => {
      try { return factory.interface.parseLog(log)?.name === 'EscrowCreated'; }
      catch { return false; }
    });
    const parsedEvent = factory.interface.parseLog(event);
    const newEscrowAddress = parsedEvent.args.escrowAddress;

    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    const approveTx = await usdc.approve(newEscrowAddress, amountInUnits);
    await approveTx.wait();

    const escrow = new ethers.Contract(newEscrowAddress, ABI, signer);
    const depositTx = await escrow.deposit(amountInUnits);
    await depositTx.wait();

    const escrowData = {
      address: newEscrowAddress,
      agent: agentAddress,
      task: state.taskDescription,
      amount: state.amount,
      createdAt: new Date().toISOString(),
    };
    saveEscrow(state.walletAddress, escrowData);
    dispatch({ type: 'SET_HISTORY', history: getEscrowHistory(state.walletAddress) });
    dispatch({ type: 'SET_ESCROW', address: newEscrowAddress });
    dispatch({ type: 'LOCK_FUNDS' });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', message: err.message });
  } finally {
    dispatch({ type: 'SET_LOADING', value: false });
  }
};

const confirmCompletion = async () => {
  try {
    dispatch({ type: 'SET_LOADING', value: true });
    const contract = await getContract();
    const tx = await contract.confirmCompletion();
    await tx.wait();
    dispatch({ type: 'CONFIRM_COMPLETION' });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', message: err.message });
  } finally {
    dispatch({ type: 'SET_LOADING', value: false });
  }
};

const disputeTask = async () => {
  try {
    dispatch({ type: 'SET_LOADING', value: true });
    const contract = await getContract();
    const tx = await contract.dispute();
    await tx.wait();
    dispatch({ type: 'DISPUTE' });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', message: err.message });
  } finally {
    dispatch({ type: 'SET_LOADING', value: false });
  }
};

const resolveRefund = async () => {
  try {
    dispatch({ type: 'SET_LOADING', value: true });
    const contract = await getContract();
    const tx = await contract.refund();
    await tx.wait();
    dispatch({ type: 'RESOLVE_REFUND' });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', message: err.message });
  } finally {
    dispatch({ type: 'SET_LOADING', value: false });
  }
};

  return (
    <Routes>
      <Route path="/agent/:address" element={<AgentProfile />} />
      <Route path="/*" element={
        <div className="min-h-screen max-w-7xl mx-auto px-3 sm:px-6 pb-10 sm:pb-20">
          <GlobalStyles />
      <AppHeader
        connected={state.walletConnected}
        address={state.walletAddress}
        onConnect={connectWallet}
        onDisconnect={() => dispatch({ type: 'DISCONNECT_WALLET' })}
        onHistoryOpen={() => dispatch({ type: 'TOGGLE_HISTORY' })}
        historyCount={state.history.length}
        currentView={state.view}
        onViewChange={(v) => dispatch({ type: 'SET_VIEW', view: v })}
      />

      <HistoryPanel
        history={state.history}
        isOpen={state.historyOpen}
        onClose={() => dispatch({ type: 'TOGGLE_HISTORY' })}
      />

      <div className="animate-entrance">
        {/* Hero Section */}
        <div className="mb-6 sm:mb-12 mt-4 sm:mt-6">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2">Hey, Need help? 👋</h2>
          <p className="text-lg sm:text-2xl text-gray-400 font-medium tracking-tight">Review and manage your agent settlements.</p>
        </div>

        {state.view === 'escrow' ? (
          <div className="grid grid-cols-12 gap-4 sm:gap-8 items-start">

            {/* Main Controls Card */}
          <div className="col-span-12 lg:col-span-8 dashboard-card p-4 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-3 sm:gap-0">
              <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-gray-400">Settlement Details</h3>
              <div className="px-4 py-1.5 bg-gray-50 rounded-lg text-[10px] font-bold text-gray-500 border border-gray-100">
                2026 ACTIVE SESSION
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold ml-1">Agent Destination</label>
                <input 
                  className="input-field" 
                  placeholder="0x..." 
                  value={state.agentAddress}
                  disabled={state.status !== STATES.AWAITING_PAYMENT}
                  onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "agentAddress", value: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-3">
                <label className="text-xs font-bold ml-1">Security Hash</label>
                <div className="input-field bg-gray-50 text-gray-400 font-mono truncate text-[12px] flex items-center">
                  {hash}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6 sm:mb-10">
              <label className="text-xs font-bold ml-1">Task Manifest</label>
              <textarea
                rows={3}
                className="input-field resize-none min-h-[80px] sm:min-h-[96px]"
                placeholder="Describe specific conditions for fund release..."
                value={state.taskDescription}
                disabled={state.status !== STATES.AWAITING_PAYMENT}
                onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "taskDescription", value: e.target.value })}
              />
            </div>

            <Timeline status={state.status} />
          </div>

          {/* Action Card */}
          <div className="col-span-12 lg:col-span-4 space-y-4 sm:space-y-8">
            <div className="dashboard-card p-4 sm:p-8 bg-black text-white relative overflow-hidden">
              {/* Geometric pattern overlay */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Lock Amount</h3>
              
              <div className="flex items-end gap-2 mb-6 sm:mb-8">
                <span className="text-2xl sm:text-4xl font-extrabold">$</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="bg-white/90 border-none text-2xl sm:text-4xl font-extrabold text-black focus:outline-none focus:bg-white w-full placeholder:text-gray-500 min-h-[44px] touch-manipulation"
                  value={state.amount}
                  disabled={state.status !== STATES.AWAITING_PAYMENT}
                  onChange={(e) => dispatch({ type: "UPDATE_FIELD", field: "amount", value: e.target.value })}
                />
                <div className="bg-[#0052FF] px-3 py-1.5 rounded-xl text-[10px] font-black shadow-lg shadow-blue-900/20">USDC</div>
              </div>

              <ActionButtons
                status={state.status}
                isValid={isFormValid}
                onLock={lockFunds}
                onConfirm={confirmCompletion}
                onDispute={disputeTask}
                onResolve={resolveRefund}
                loading={state.loading}
              />

              {state.error && (
                <div className="w-full px-3 py-2 text-xs text-[#FF3B30] bg-[#FFF5F5] border border-[#FF3B30] rounded-md flex items-center justify-between mt-4">
                  <span>{state.error}</span>
                  <button
                    onClick={() => dispatch({ type: 'CLEAR_ERROR' })}
                    className="ml-2 text-[#FF3B30] font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {state.escrowAddress && (
                <div className="w-full px-3 py-2 text-[10px] sm:text-xs text-[#6B7280] bg-[#F7F9FC] border border-[#E6EAF0] rounded-md font-mono break-all mt-4">
                  Escrow: <a
                    href={`https://testnet.arcscan.app/address/${state.escrowAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0052FF] hover:underline"
                  >
                    {state.escrowAddress}
                  </a>
                </div>
              )}
            </div>

            {/* Status Visualizer */}
            <div className="dashboard-card p-4 sm:p-8 flex flex-col items-center justify-center gap-4">
               <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      className="text-[#0052FF] transition-all duration-1000"
                      strokeDasharray="251.2"
                      strokeDashoffset={state.status === STATES.COMPLETE ? "0" : state.status === STATES.AWAITING_COMPLETION ? "125" : "251"}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs font-black">{state.status === STATES.COMPLETE ? "100%" : state.status === STATES.AWAITING_COMPLETION ? "50%" : "0%"}</span>
                  </div>
               </div>
               <div className="text-center">
                 <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Current Growth</p>
                 <p className="text-sm font-bold">Session Integrity: High</p>
               </div>
            </div>
          </div>
        </div>
        ) : (
          <Registry
            walletAddress={state.walletAddress}
            onHireAgent={(address) => {
              dispatch({ type: 'SET_VIEW', view: 'escrow' });
              dispatch({ type: 'UPDATE_FIELD', field: 'agentAddress', value: address });
            }}
          />
        )}
      </div>
    </div>
    } />
  </Routes>
);
}