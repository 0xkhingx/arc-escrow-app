export const CONTRACT_ADDRESS = "0x21e5f5F14A78f506419dDB141fc61420C58cC3F4"; // keep for reference
export const FACTORY_ADDRESS = "0x2382d0E87F72534a4cA2D552Cf10A131bA2BC5CA";

export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000";

export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

export const FACTORY_ABI = [
  {
    type: "function",
    name: "createEscrow",
    inputs: [
      { name: "_agent", type: "address" },
      { name: "_conditionHash", type: "bytes32" },
    ],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getEscrows",
    inputs: [],
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "EscrowCreated",
    inputs: [
      { name: "escrowAddress", type: "address", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "agent", type: "address", indexed: true },
      { name: "conditionHash", type: "bytes32", indexed: false },
    ],
  },
];

export const ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "_amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "confirmCompletion",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "dispute",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "refund",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "currentState",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
];
