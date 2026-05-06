import React, { useReducer, useMemo } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, ABI, USDC_ADDRESS, USDC_ABI } from './constants';

// --- State Machine & Logic ---

const STATES = {
  AWAITING_PAYMENT: "AWAITING_PAYMENT",
  AWAITING_COMPLETION: "AWAITING_COMPLETION",
  COMPLETE: "COMPLETE",
  DISPUTED: "DISPUTED",
  REFUNDED: "REFUNDED",
};

const initialState = {
  status: STATES.AWAITING_PAYMENT,
  walletConnected: false,
  walletAddress: "",
  error: "",
  agentAddress: "",
  taskDescription: "",
  amount: "",
};

function escrowReducer(state, action) {
  switch (action.type) {
    case "CONNECT_WALLET":
      return {
        ...state,
        walletConnected: true,
        walletAddress: action.address,
        error: "",
      };
    case "DISCONNECT_WALLET":
      return {
        ...state,
        walletConnected: false,
        walletAddress: "",
      };
    case "SET_ERROR":
      return { ...state, error: action.message };
    case "UPDATE_FIELD":
      if (state.status !== STATES.AWAITING_PAYMENT) return state;
      return { ...state, [action.field]: action.value };
    case "LOCK_FUNDS":
      if (state.status === STATES.AWAITING_PAYMENT) {
        return { ...state, status: STATES.AWAITING_COMPLETION };
      }
      return state;
    case "CONFIRM_COMPLETION":
      if (state.status === STATES.AWAITING_COMPLETION) {
        return { ...state, status: STATES.COMPLETE };
      }
      return state;
    case "DISPUTE":
      if (state.status === STATES.AWAITING_COMPLETION) {
        return { ...state, status: STATES.DISPUTED };
      }
      return state;
    case "RESOLVE_REFUND":
      if (state.status === STATES.DISPUTED) {
        return { ...state, status: STATES.REFUNDED };
      }
      return state;
    default:
      return state;
  }
}

const generateHash = (text) => {
  if (!text) return '0x0000000000000000000000000000000000000000000000000000000000000000';
  return ethers.id(text);
};

// --- Components ---

const Header = ({ walletConnected, walletAddress, onConnectWallet }) => (
  <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[#FFFFFF] border-b border-[#E6EAF0]">
    <div className="flex flex-col">
      <h1 className="text-lg font-medium text-[#0A0A0A] font-sans tracking-tight">
        ARC Escrow
      </h1>
      <span className="text-xs text-[#6B7280]">
        Trustless Agent Payments on Arc
      </span>
    </div>
    <button
      onClick={onConnectWallet}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        walletConnected
          ? "bg-[#E6EAF0] text-[#0A0A0A]"
          : "bg-[#0052FF] text-white hover:bg-[#003FCC]"
      }`}
    >
      {walletConnected
        ? walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
        : "Connect Wallet"}
    </button>
  </header>
);

const InputField = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  multiline,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-[#6B7280]">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={3}
        className="w-full px-3 py-2 text-sm text-[#0A0A0A] bg-transparent border border-[#E6EAF0] rounded-md focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] disabled:bg-[#F7F9FC] disabled:text-[#6B7280] resize-none"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 text-sm text-[#0A0A0A] bg-transparent border border-[#E6EAF0] rounded-md focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] disabled:bg-[#F7F9FC] disabled:text-[#6B7280]"
      />
    )}
  </div>
);

const AmountInput = ({ value, onChange, disabled }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-[#6B7280]">Payment Amount</label>
    <div className="relative flex items-center">
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        disabled={disabled}
        className="w-full pl-3 pr-16 py-2 text-sm text-[#0A0A0A] bg-transparent border border-[#E6EAF0] rounded-md focus:outline-none focus:border-[#0052FF] focus:ring-1 focus:ring-[#0052FF] disabled:bg-[#F7F9FC] disabled:text-[#6B7280]"
      />
      <div className="absolute right-3 flex items-center gap-1 text-xs font-medium text-[#0A0A0A]">
        <div className="w-4 h-4 bg-[#2775CA] rounded-full flex items-center justify-center text-white text-[8px]">
          $
        </div>
        USDC
      </div>
    </div>
  </div>
);

const HashPreview = ({ hash }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-[#6B7280]">Condition Hash</label>
    <div className="w-full px-3 py-2 text-xs text-[#6B7280] bg-[#F7F9FC] border border-[#E6EAF0] rounded-md font-mono break-all">
      {hash}
    </div>
  </div>
);

const ActionButtons = ({ status, isValid, onLock, onConfirm, onDispute, onResolve }) => {
  return (
    <div className="flex flex-col gap-3 pt-2">
      {status === STATES.AWAITING_PAYMENT && (
        <button
          onClick={onLock}
          disabled={!isValid}
          className="w-full py-2.5 text-sm font-medium text-white bg-[#0052FF] rounded-md hover:bg-[#003FCC] disabled:bg-[#E6EAF0] disabled:text-[#6B7280] transition-colors"
        >
          Lock Funds
        </button>
      )}

      {status === STATES.AWAITING_COMPLETION && (
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-2.5 text-sm font-medium text-white bg-[#0052FF] rounded-md hover:bg-[#003FCC] transition-colors"
          >
            Confirm Completion
          </button>
          <button
            onClick={onDispute}
            className="w-full py-2.5 text-sm font-medium text-[#FF3B30] bg-transparent border border-[#FF3B30] rounded-md hover:bg-[#FFF5F5] transition-colors"
          >
            Dispute Task
          </button>
        </div>
      )}

      {status === STATES.DISPUTED && (
        <button
          onClick={onResolve}
          className="w-full py-2.5 text-sm font-medium text-[#0A0A0A] bg-[#E6EAF0] rounded-md hover:bg-[#D1D5DB] transition-colors"
        >
          Resolve & Refund
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

const StatusTimeline = ({ status }) => {
  const steps = [
    { key: "payment", label: "Payment Locked" },
    { key: "completion", label: "Task Execution" },
    {
      key: "resolution",
      label:
        status === STATES.REFUNDED
          ? "Refunded"
          : status === STATES.DISPUTED
            ? "Disputed"
            : "Completed",
    },
  ];

  const getStepState = (stepIndex) => {
    if (status === STATES.AWAITING_PAYMENT)
      return stepIndex === 0 ? "active" : "upcoming";
    if (status === STATES.AWAITING_COMPLETION)
      return stepIndex === 0 ? "completed" : stepIndex === 1 ? "active" : "upcoming";
    if (status === STATES.COMPLETE) return "completed";
    if (status === STATES.DISPUTED)
      return stepIndex === 0 ? "completed" : stepIndex === 1 ? "error" : "upcoming";
    if (status === STATES.REFUNDED)
      return stepIndex === 2 ? "error" : "completed";
    return "upcoming";
  };

  return (
    <div className="flex items-center justify-between w-full max-w-[520px] mx-auto mt-8 px-4">
      {steps.map((step, index) => {
        const stepState = getStepState(index);
        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full border-2 ${
                  stepState === "completed"
                    ? "bg-[#0052FF] border-[#0052FF]"
                    : stepState === "active"
                      ? "bg-white border-[#0052FF]"
                      : stepState === "error"
                        ? "bg-[#FF3B30] border-[#FF3B30]"
                        : "bg-[#F7F9FC] border-[#E6EAF0]"
                }`}
              />
              <span
                className={`text-[11px] font-medium ${
                  stepState === "active" || stepState === "completed"
                    ? "text-[#0A0A0A]"
                    : stepState === "error"
                      ? "text-[#FF3B30]"
                      : "text-[#6B7280]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-4 ${
                  getStepState(index + 1) === "upcoming" ? "bg-[#E6EAF0]" : "bg-[#0052FF]"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const EscrowCard = ({ children }) => (
  <div className="w-full max-w-[520px] mx-auto bg-[#FFFFFF] border border-[#E6EAF0] shadow-sm rounded-xl p-6 flex flex-col gap-5">
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  const [state, dispatch] = useReducer(escrowReducer, initialState);

  const hash = useMemo(
    () => generateHash(state.taskDescription),
    [state.taskDescription]
  );

  const isFormValid =
    state.walletConnected &&
    state.agentAddress.trim() !== "" &&
    state.taskDescription.trim() !== "" &&
    Number(state.amount) > 0;

  const isInputDisabled = state.status !== STATES.AWAITING_PAYMENT;

const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      dispatch({ type: 'SET_ERROR', message: 'MetaMask not found. Please install it.' });
      return;
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Switch to Arc testnet
try {
  await window.ethereum.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x4cef52' }],
  });
} catch (switchError) {
  // Chain not added yet — add it
  if (switchError.code === 4902) {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x4cef52',
        chainName: 'Arc Testnet',
        nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
        rpcUrls: ['https://rpc.testnet.arc.network'],
        blockExplorerUrls: ['https://testnet.arcscan.app'],
      }],
    });
  }
}

    dispatch({ type: 'CONNECT_WALLET', address: accounts[0] });
  } catch (err) {
    dispatch({ type: 'SET_ERROR', message: err.message });
  }
};

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

const lockFunds = async () => {
  try {
    console.log("amount:", state.amount);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const amountInUnits = ethers.parseUnits(parseFloat(state.amount).toFixed(6), 6);
    console.log("amountInUnits:", amountInUnits.toString());

    // Approve USDC
    const usdc = new ethers.Contract(USDC_ADDRESS, USDC_ABI, signer);
    console.log("Approving...");
    const approveTx = await usdc.approve(CONTRACT_ADDRESS, amountInUnits);
    console.log("Approve tx sent:", approveTx.hash);
    const approveReceipt = await approveTx.wait();
    console.log("Approve confirmed:", approveReceipt.status);

    // Deposit
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    console.log("Depositing...");
    const depositTx = await contract.deposit(amountInUnits);
    console.log("Deposit tx sent:", depositTx.hash);
    await depositTx.wait();
    console.log("Deposit confirmed");

    dispatch({ type: 'LOCK_FUNDS' });
  } catch (err) {
    console.error("Full error:", err);
    dispatch({ type: 'SET_ERROR', message: err.message });
  }
};

  const confirmCompletion = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.confirmCompletion();
      await tx.wait();
      dispatch({ type: 'CONFIRM_COMPLETION' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message });
    }
  };

  const disputeTask = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.dispute();
      await tx.wait();
      dispatch({ type: 'DISPUTE' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message });
    }
  };

  const resolveRefund = async () => {
    try {
      const contract = await getContract();
      const tx = await contract.refund();
      await tx.wait();
      dispatch({ type: 'RESOLVE_REFUND' });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', message: err.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0A0A0A] font-sans flex flex-col selection:bg-[#0052FF] selection:text-white">
      <Header
        walletConnected={state.walletConnected}
        walletAddress={state.walletAddress}
        onConnectWallet={connectWallet}
      />

      {state.error && (
        <div className="w-full max-w-[520px] mx-auto mt-4 px-4 py-2 text-sm text-[#FF3B30] bg-[#FFF5F5] border border-[#FF3B30] rounded-md">
          {state.error}
        </div>
      )}

      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <EscrowCard>
          <InputField
            label="Agent Address"
            placeholder="0x..."
            value={state.agentAddress}
            onChange={(val) => dispatch({ type: "UPDATE_FIELD", field: "agentAddress", value: val })}
            disabled={isInputDisabled}
          />

          <InputField
            label="Task Description"
            placeholder="Define the exact parameters for agent execution..."
            value={state.taskDescription}
            onChange={(val) => dispatch({ type: "UPDATE_FIELD", field: "taskDescription", value: val })}
            disabled={isInputDisabled}
            multiline
          />

          <HashPreview hash={hash} />

          <AmountInput
            value={state.amount}
            onChange={(val) => dispatch({ type: "UPDATE_FIELD", field: "amount", value: val })}
            disabled={isInputDisabled}
          />

          <div className="w-full h-px bg-[#E6EAF0] my-2" />

          <ActionButtons
            status={state.status}
            isValid={isFormValid}
            onLock={lockFunds}
            onConfirm={confirmCompletion}
            onDispute={disputeTask}
            onResolve={resolveRefund}
          />
        </EscrowCard>

        <StatusTimeline status={state.status} />
      </main>
    </div>
  );
}