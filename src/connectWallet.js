import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

// =====================================
// MetaMask / Trust Wallet
// =====================================
export async function connectInjectedWallet() {
  if (!window.ethereum) {
    throw new Error("No wallet found");
  }

  await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  const provider = new ethers.BrowserProvider(window.ethereum);

  const signer = await provider.getSigner();

  return {
    provider,
    signer,
    account: await signer.getAddress(),
  };
}

// =====================================
// WalletConnect
// =====================================
export async function connectWalletConnect() {
  const wcProvider = await EthereumProvider.init({
    projectId: "ca94c15175d6fb73e39d48de506f6a10",
    chains: [1],
    showQrModal: true,
  });

  await wcProvider.connect();

  const provider = new ethers.BrowserProvider(wcProvider);

  const signer = await provider.getSigner();

  return {
    provider,
    signer,
    account: await signer.getAddress(),
  };
}