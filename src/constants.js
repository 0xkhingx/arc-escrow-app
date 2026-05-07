export const FACTORY_ADDRESS = "0x0034dB6eB38a11A4d93B9562276670283AD5d10a";
export const REGISTRY_ADDRESS = "0xEFE6Eaf3E2cD1C85A3687E73BdA424F7B39A139D";
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

export const REGISTRY_ABI = [
  {
    type: "function",
    name: "register",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_description", type: "string" },
      { name: "_serviceType", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getAgent",
    inputs: [{ name: "_wallet", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "serviceType", type: "string" },
          { name: "completedJobs", type: "uint256" },
          { name: "disputedJobs", type: "uint256" },
          { name: "totalUSDCSettled", type: "uint256" },
          { name: "registeredAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgents",
    inputs: [
      { name: "_from", type: "uint256" },
      { name: "_to", type: "uint256" },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "name", type: "string" },
          { name: "description", type: "string" },
          { name: "serviceType", type: "string" },
          { name: "completedJobs", type: "uint256" },
          { name: "disputedJobs", type: "uint256" },
          { name: "totalUSDCSettled", type: "uint256" },
          { name: "registeredAt", type: "uint256" },
          { name: "isActive", type: "bool" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReputation",
    inputs: [{ name: "_agent", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAgentCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deactivate",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "AgentRegistered",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "serviceType", type: "string", indexed: false },
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
