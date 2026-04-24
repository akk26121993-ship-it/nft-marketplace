# 🚀 NFT Marketplace (Web3 DApp)

A modern, full-stack **NFT Marketplace** where users can **mint, list, buy, and manage NFTs** using blockchain technology.

Built with a sleek UI and real Web3 integrations, this project demonstrates end-to-end decentralized application (dApp) development.

---

## 🎥 Live Demo

👉 https://youtu.be/0r8txMyb2Gk

---

🌐 Live Website

👉  https://nft-marketplace-x6n4.vercel.app/

---

## ✨ Features

### 🔌 Wallet Integration

* Connect & disconnect wallet
* Copy wallet address
* Real-time wallet status

### 🎨 NFT Minting

* Upload images to IPFS
* Create metadata (name, description)
* Mint NFTs directly from the UI

### 🛒 Marketplace

* Browse all NFTs
* View owner & price
* Buy NFTs instantly

### 💰 Listing System

* List NFTs for sale
* Set price in ETH
* Dynamic marketplace updates

### 🧑‍🎨 Personal Collection

* View your owned NFTs
* List directly from your collection

### 🔍 Search, Filter & Sort

* Search NFTs by name
* Filter: All / Listed / Unlisted
* Sort by price (Low → High / High → Low)

### ⚡ UX Enhancements

* Loading states
* Animated UI
* Responsive grid layout
* Glassmorphism design

---

## 🛠 Tech Stack

### Frontend

* React (Vite)
* CSS (Custom styling)

### Web3

* Ethers.js
* MetaMask Wallet

### Backend / Blockchain

* Solidity Smart Contract
* Ethereum (Sepolia Testnet)

### Storage

* IPFS (via Pinata)

---

## 🧱 Project Architecture

```bash
Frontend (React + Vite)
        ↓
Ethers.js (Web3 Layer)
        ↓
Smart Contract (Ethereum / Sepolia)
        ↓
IPFS (Metadata + Images)
```

---

## 📂 Folder Structure

```bash
src/
 ├── App.jsx
 ├── connectWallet.js
 ├── contract.js
 ├── ipfs.js
 ├── Profile.jsx
public/
dist/ (build output)
```

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nft-marketplace.git
cd nft-marketplace
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run locally

```bash
npm run dev
```

---

## 🧪 Production Build

```bash
npm run build
npm run preview
```

---

## 🔐 Environment Variables

Create a `.env` file:

```env
VITE_CONTRACT_ADDRESS=0x3833c2134803378288C42247AA27227e63d28953
VITE_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/JC1Knp8rwl4WDnC93Ua3f
```


---

## 🚀 Deployment

This project is deployed using Netlify.

### Build Settings:

* Build Command: `npm run build`
* Publish Directory: `dist`

### Important Fix (Routing)

Create:

```bash
public/_redirects
```

Add:

```bash
/* /index.html 200
```

---

## 🧠 Key Learning Highlights

* Smart contract interaction using Ethers.js
* NFT metadata handling with IPFS
* Wallet-based authentication
* Decentralized marketplace logic
* Async blockchain data fetching
* UI/UX for Web3 applications

---

## 🚧 Challenges Faced

* Handling async blockchain calls efficiently
* Managing NFT metadata from IPFS
* Wallet connection & transaction errors
* Optimizing UI for real-time updates

---

## 🔮 Future Improvements

* 🔐 Add user authentication (ENS / profile system)
* 🧾 Transaction history
* ❤️ Favorites / Wishlist
* 📊 Analytics dashboard
* 🌍 Multi-chain support (Polygon, BNB)
* 🎨 Better UI animations (Framer Motion)

---


---

## 👨‍💻 Author

**Your Name** ASHOK KUMAR SEKAR

* GitHub: https://github.com/akk26121993-ship-it
* LinkedIn: https://www.linkedin.com/in/ashok-kumar-sekar-0320433aa/

---

## ⭐ Show your support

If you like this project:

* ⭐ Star the repo
* 🍴 Fork it
* 🚀 Share it

---

## 📜 License

This project is open-source and available under the MIT License.
