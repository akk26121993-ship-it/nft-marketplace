import { ethers } from "ethers";
import EthereumProvider from "@walletconnect/ethereum-provider";

export async function connectWallet() {
  let provider;

  // 🖥️ DESKTOP (MetaMask extension)
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);

    await window.ethereum.request({
      method: "eth_requestAccounts",
    });
  }

  // 📱 MOBILE (MetaMask app via WalletConnect)
  else {
    const wcProvider = await EthereumProvider.init({
      projectId: "ca94c15175d6fb73e39d48de506f6a10",
      chains: [1], // Ethereum mainnet (change if needed)
      showQrModal: true,
    });

    await wcProvider.connect();

    provider = new ethers.BrowserProvider(wcProvider);
  }

  const signer = await provider.getSigner();
  const account = await signer.getAddress();

  return {
    provider,
    signer,
    account,
  };
}