import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    alert("Install MetaMask");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);

  return {
    provider,
    signer: await provider.getSigner(),
    account: accounts[0],
  };
}