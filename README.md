🌌 NFTverse — Premium Web3 Marketplace
A next-generation NFT marketplace featuring live auctions, instant offers, real-time activity feeds, and a cinematic holographic UI.
    

🎬 Live Experience
Platform
Link
🌐 Live Website
https://nft-marketplace-tau-sepia.vercel.app/
🎥 Video Demo
https://youtu.be/0r8txMyb2Gk

✨ Feature Overview

🔐 Multi-Wallet Integration
    • MetaMask & WalletConnect support with premium animated connection buttons
    • Real-time wallet status with neon pulse indicators
    • One-click copy / disconnect / profile view
    • Auto-detect connected account changes
    
🎨 NFT Minting
    • Drag-and-drop image upload with instant preview
    • Automatic IPFS upload via Pinata (image + metadata JSON)
    • On-chain minting with transaction confirmation
    • Gas estimation before minting
    
🛒 Advanced Marketplace
Feature
Description
Instant Buy
Purchase listed NFTs with ETH in one click
Fixed Listing
List NFTs with custom ETH pricing
Live Auctions
Time-bound auctions with countdown timers, minimum bids, and auto-settlement
Offers
Make time-expiring offers on unlisted NFTs; sellers can accept anytime
Royalties
Creator royalty display and enforcement on every sale

⚡ Real-Time Engine
    • Live Activity Feed — WebSocket-style event listening for mints, sales, bids, listings, and offers
    • Transaction History — Persistent local record with Etherscan deep-links
    • Auto-refresh — Market data syncs automatically after every blockchain event
    
📊 Analytics Dashboard
    • Total volume, floor price, highest sale tracking
    • Rarity distribution (Legendary → Common) with progress bars
    • Weekly activity trend charts
    • Transaction type breakdown
    
❤️ Social & UX
    • Favorites / Wishlist — Saved to localStorage with heart animations
    • Rarity System — Algorithmic rarity scoring with color-coded badges (👑 Legendary, 💎 Epic, ⚡ Rare, 🔹 Common)
    • 3D Holographic Cards — Tilt, glow, and glass-sheen effects on hover
    • Gas Estimator — Pre-transaction cost preview for every action
    
⚙️ Admin Controls (Owner Only)
    • Pause / unpause entire contract
    • Ban / unban specific NFT token IDs
    • Ban / unban user addresses
    • Protected by wallet ownership verification

🛠 Technology Stack
Layer
Technology
Frontend
React 18 (Vite), Custom CSS with CSS Variables
Web3
Ethers.js v6, BrowserProvider / JsonRpcProvider
Wallets
MetaMask Injected, WalletConnect v2
Smart Contract
Solidity ^0.8 (ERC-721 with custom marketplace logic)
Storage
IPFS via Pinata Gateway + multi-gateway fallback
Network
Ethereum Sepolia Testnet

🏗 Architecture
┌─────────────────────────────────────┐
│         React Frontend (Vite)       │
│  ├─ Holographic UI / Glassmorphism  │
│  ├─ Real-time Event Listeners       │
│  └─ IPFS Image Fallback Gateways    │
└──────────────┬──────────────────────┘
               │ Ethers.js v6
┌──────────────▼──────────────────────┐
│      Smart Contract (Solidity)      │
│  ├─ ERC-721 Minting                 │
│  ├─ Fixed-Price Listings            │
│  ├─ English Auctions                │
│  ├─ Offer System                    │
│  ├─ Royalty Enforcement             │
│  └─ Admin (Pause / Ban)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│   IPFS (Pinata) — Images + JSON     │
│   Alchemy RPC — Sepolia Node        │
└─────────────────────────────────────┘

📂 Project Structure
src/
├── App.jsx                 # Main application shell
├── connectWallet.js        # MetaMask + WalletConnect logic
├── contract.js             # ABI and contract constants
├── ipfs.js                 # Pinata upload helpers
├── App.css / styles        # Premium CSS (glassmorphism, 3D, keyframes)
└── assets/                 # Static images & icons
public/
├── _redirects              # SPA routing fix for Netlify/Vercel
└── ...

⚙️ Installation & Setup
1. Clone the repository
git clone https://github.com/akk26121993-ship-it/nftverse-marketplace.git
cd nftverse-marketplace
2. Install dependencies
npm install
3. Configure environment variables
Create a .env file in the project root:
# Contract
VITE_CONTRACT_ADDRESS=0x3833c2134803378288C42247AA27227e63d28953

# RPC Providers
VITE_ALCHEMY_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
⚠️ Never commit your .env file. Add it to .gitignore.

4. Run locally
npm run dev

6. Production build
npm run build
npm run preview

🚀 Deployment Notes

Vercel / Netlify
    • Build Command: npm run build
    • Publish Directory: dist
    
SPA Routing Fix
Create public/_redirects:
/*    /index.html   200

🔮 Smart Contract Interface

The dApp expects a Solidity contract implementing:
function mint(string memory uri) external;
function list(uint256 tokenId, uint256 price) external;
function buy(uint256 tokenId) external payable;
function cancelListing(uint256 tokenId) external;

function createAuction(uint256 tokenId, uint256 startPrice, uint256 duration) external;
function bid(uint256 tokenId) external payable;
function endAuction(uint256 tokenId) external;
function cancelAuction(uint256 tokenId) external;

function makeOffer(uint256 tokenId, uint256 expiry) external payable;
function acceptOffer(uint256 tokenId, address buyer) external;
function cancelOffer(uint256 tokenId) external;

function withdraw() external;
function balances(address) external view returns (uint256);

// Admin
function pause() / unpause() external;
function banNFT(uint256) / unbanNFT(uint256) external;
function banUser(address) / unbanUser(address) external;

// Views
function tokenURI(uint256) external view returns (string memory);
function ownerOf(uint256) external view returns (address);
function listings(uint256) external view returns (address seller, uint256 price, bool active);
function auctions(uint256) external view returns (...);
function offers(uint256, address) external view returns (...);
function royalty(uint256) external view returns (uint256);

🧠 Key Engineering Highlights

Challenge
Solution
IPFS Gateway Reliability
Multi-gateway fallback system (Pinata, Cloudflare, ipfs.io, w3s.link) with retry logic
Blockchain Latency
Optimistic UI updates + background re-sync after tx.wait()
Real-Time Events
contract.on("Transfer", ...) + custom event parser for bids/offers
Gas UX
estimateGas() wrapper showing ETH cost before every transaction
Mobile Responsiveness
CSS-grid auto-fill, scrollable tabs, and adaptive stat cards
Metadata Resilience
Base64 data-URI parsing + standard IPFS CID extraction

🖼 UI Showcase
The interface features a cinematic dark theme with neon accents (#00ffcc), glassmorphism panels, 3D card tilts, holographic sheens, and floating ambient orbs.
Screens: - 🏪 Marketplace — Filterable, sortable grid with instant search - 🎨 My Collection — Mint, list, or auction your NFTs - ⏱️ Auctions — Live countdowns, highest bid tracking, bid placement - 📊 Analytics — Volume charts, rarity bars, floor price tracker - ⚡ Activity — Real-time feed of all marketplace events - 📋 History — Personal transaction log with Etherscan links - ❤️ Favorites — Saved wishlist across sessions

👨‍💻 Author
Ashok Kumar (AK)
    • 🌐 Portfolio: https://www.iamak.in
    • 💼 LinkedIn: Ashok Kumar Sekar
    • 🐙 GitHub: @akk26121993-ship-it

📜 License
This project is open-source and available under the MIT License.

⭐ Star this repo if you found it useful — it helps others discover the project!
