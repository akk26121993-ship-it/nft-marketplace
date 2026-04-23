import { ethers } from "ethers";

export const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
export const contractABI = [
  "function mintNFT(string memory _tokenURI)",
  "function listNFT(uint _tokenId, uint _price)",
  "function buyNFT(uint _tokenId) payable",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function tokenId() view returns (uint256)",
  "function listings(uint256) view returns (address seller, uint256 price)"
];