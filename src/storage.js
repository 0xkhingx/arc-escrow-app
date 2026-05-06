const STORAGE_KEY = "arc_escrow_history";

export const saveEscrow = (walletAddress, escrowData) => {
  const existing = getEscrowHistory(walletAddress);
  const updated = [escrowData, ...existing];
  localStorage.setItem(
    `${STORAGE_KEY}_${walletAddress}`,
    JSON.stringify(updated),
  );
};

export const getEscrowHistory = (walletAddress) => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${walletAddress}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};
