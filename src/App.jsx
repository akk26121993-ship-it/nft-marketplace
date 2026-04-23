import Profile from "./Profile";
import { useState, useEffect } from "react";
import { connectWallet } from "./connectWallet";
import { contractAddress, contractABI } from "./contract";
import { ethers } from "ethers";
import { uploadImage, uploadMetadata } from "./ipfs";


const cardStyle = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "20px",
  borderRadius: "16px",
  marginBottom: "20px",
  boxShadow: "0 0 20px rgba(0,255,255,0.08)",
  color: "white",
};

export default function App() {
  const [page, setPage] = useState("market");
  const [wallet, setWallet] = useState(null);
  const [tokenURI, setTokenURI] = useState("");
  const [tokenId, setTokenId] = useState("");
 useEffect(() => {
    loadNFTs();
  }, []);
  const [price, setPrice] = useState("");
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [nfts, setNfts] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(false);

  const totalNFTs = nfts.length;
  const myNFTCount = myNFTs.length;
  const listedNFTs = nfts.filter((n) => n.price > 0).length;
  const walletStatus = wallet ? "Connected" : "Disconnected";
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("default"); 



  const filterBtn = (active) => ({
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(0,255,255,0.3)",
  background: active
    ? "linear-gradient(135deg, #00f5ff, #a855f7)"
    : "rgba(255,255,255,0.05)",
  color: "white",
  cursor: "pointer",
});
   




  // 🔌 Connect Wallet
  async function handleConnect() {
    const data = await connectWallet();
    setWallet(data);

    await loadNFTs();
    await loadMyNFTs();
  }



  // 🖼 Mint NFT
 async function mintNFT() {
  if (!file) return alert("Upload image first");

  try {
    setLoading(true); // 🔥 START LOADING

    const imageUrl = await uploadImage(file);

    const metadataUrl = await uploadMetadata(
      tokenURI,
      description,
      imageUrl
    );

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet.signer
    );

    const tx = await contract.mintNFT(metadataUrl);
    await tx.wait();

    alert("NFT Minted Successfully 🚀");
  } catch (err) {
    console.error(err);
    alert("Mint failed");

   await loadNFTs();   // 🔥 ADD THIS
  }

  setLoading(false); // 🔥 STOP LOADING
}

  // 💰 List NFT
  async function listNFT() {
    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet.signer
    );

    const tx = await contract.listNFT(
      tokenId,
      ethers.parseEther(price)
    );

    await tx.wait();

    alert("NFT Listed!");
  }

  async function listNFTFromUI(id) {
    if (!wallet) return alert("Connect wallet first");

    const priceInput = prompt("Enter price in ETH:");
    if (!priceInput) return;

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet.signer
    );

    const tx = await contract.listNFT(
      id,
      ethers.parseEther(priceInput)
    );

    await tx.wait();

    alert("NFT Listed Successfully!");

    await loadNFTs();
    await loadMyNFTs();
  }

 async function buyNFTFromUI(id, price) {
  if (!wallet) return alert("Connect wallet first");

  try {
    setLoading(true);

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet.signer
    );

    const tx = await contract.buyNFT(id, {
      value: price,
    });

    await tx.wait();

    alert("NFT Purchased!");
    await loadNFTs();
  } catch (err) {
    console.error(err);
    alert("Transaction failed");
  }

  setLoading(false);
}

// ✅ NEW
function copyAddress() {
  if (!wallet) return;

  navigator.clipboard.writeText(wallet.account);
  alert("Wallet copied ⚡");
}

// ✅ NEW
function disconnectWallet() {
  setWallet(null);
  setNfts([]);
  setMyNFTs([]);
}
 

  // 🔥 LOAD MARKETPLACE NFTs
async function loadNFTs() {
  try {
    const provider = new ethers.JsonRpcProvider(
  import.meta.env.VITE_RPC_URL
);
const network = await provider.getNetwork();
    console.log("Connected to:", network);

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      provider
    );

    let items = [];
    const total = Number(await contract.tokenId());

    console.log("Total NFTs:", total); // 👈 DEBUG

    for (let i = 1; i <= total; i++) {
      try {
        const owner = await contract.ownerOf(i);
        const uri = await contract.tokenURI(i);

        const res = await fetch(uri);
        const metadata = await res.json();

        let listing = await contract.listings(i);

       
        items.push({
          id: i,
          owner,
          price: listing.price,
          seller: listing.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image.replace(
            "ipfs://",
            "https://gateway.pinata.cloud/ipfs/"
          ),
        });
      } catch (err) {
        console.log("Skipping NFT", i);
      }
    }

    console.log("Loaded NFTs:", items); // 👈 DEBUG
    setNfts(items);

  } catch (err) {
    console.error("LOAD ERROR:", err);
  }
}

  // 🔥 LOAD MY NFTs (FIXED OUTSIDE)
  async function loadMyNFTs() {
    if (!wallet) return;

    const contract = new ethers.Contract(
      contractAddress,
      contractABI,
      wallet.provider
    );

    let items = [];
    const total = Number(await contract.tokenId());
    const userAddress = await wallet.signer.getAddress();

    for (let i = 1; i <= total; i++) {
      try {
        const owner = await contract.ownerOf(i);

        if (owner.toLowerCase() !== userAddress.toLowerCase())
          continue;

        const uri = await contract.tokenURI(i);

       

        const res = await fetch(uri);
        const metadata = await res.json();

        items.push({
          id: i,
          owner,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image.replace(
            "ipfs://",
            "https://gateway.pinata.cloud/ipfs/"
          ),
        });
      } catch {}
    }

    setMyNFTs(items);
  }

const filteredNFTs = nfts
  .filter((nft) => {
    const matchSearch =
  nft.name?.toLowerCase().includes(search.toLowerCase());

    if (filter === "listed") {
      return matchSearch && nft.price && nft.price.toString() !== "0";
    }

    if (filter === "unlisted") {
      return matchSearch && (!nft.price || nft.price.toString() === "0");
    }

    return matchSearch;
  })
  .sort((a, b) => {
    if (sort === "low") {
      return Number(a.price) - Number(b.price);
    }

    if (sort === "high") {
      return Number(b.price) - Number(a.price);
    }

    return 0;
  });
 

  return (
    <div
  style={{
    padding: "20px",
    minHeight: "100vh",
    background: "radial-gradient(circle at top, #0b0f1a, #05060a)",
    color: "white",
  }}
>

      <div
  style={{
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    padding: "30px",
    borderRadius: "15px",
    marginBottom: "20px",
    color: "white",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 0 30px rgba(168,85,247,0.3)"
  }}
>
  {/* LEFT SIDE */}
  <div>
  <h1
    style={{
      margin: 0,
      fontSize: "32px",
      fontWeight: "bold",
      letterSpacing: "1px",
    }}
  >
    NFT Marketplace 🚀
  </h1>

  {/* 🔥 NEW CREATIVE TAGLINE */}
  <div style={{ display: "flex", gap: "15px", marginTop: "15px" }}>
    
    <span
      style={{
        background: "rgba(255,255,255,0.2)",
        padding: "10px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        backdropFilter: "blur(10px)",
      }}
    >
      🎨 CREATE
    </span>

    <span
      style={{
        background: "rgba(255,255,255,0.2)",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        backdropFilter: "blur(10px)",
      }}
    >
     🛍️ BUY
    </span>

    <span
      style={{
        background: "rgba(255,255,255,0.2)",
        padding: "5px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        backdropFilter: "blur(10px)",
      }}
    >
      💰 SELL
    </span>

  </div>
</div>

  {/* RIGHT SIDE */}
  <button
    onClick={handleConnect}
    style={{
      padding: "12px 20px",
      background: "white",
      color: "#333",
      border: "none",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer",
      boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    }}
  >
     {wallet
    ? wallet.account.slice(0, 6) + "..."
    : "Connect Wallet"}
</button>



  {/* COPY ADDRESS */}
  {wallet && (
    <button
      onClick={copyAddress}
      title="Copy address"
      style={{
        padding: "10px",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.2)",
        background: "rgba(255,255,255,0.05)",
        color: "white",
        cursor: "pointer",
      }}
    >
      📋
    </button>
  )}
{/* 🔥 DISCONNECT BUTTON */}
  {wallet && (
    <button
      onClick={disconnectWallet}
      style={{
        padding: "10px 14px",
        borderRadius: "10px",
        border: "none",
        background: "linear-gradient(135deg, #ff416c, #ff4b2b)",
        color: "white",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 0 15px rgba(255,0,0,0.3)",
      }}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = "0 0 25px rgba(255,0,0,0.6)";
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = "0 0 15px rgba(255,0,0,0.3)";
      }}
    >
      Disconnect
    </button>
  )}

</div>

{/* STATS */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <span>Total NFTs: {totalNFTs}</span>
        <span>Listed: {listedNFTs}</span>
        <span>My NFTs: {myNFTCount}</span>
        <span>{walletStatus}</span>
      </div>

      {/* SEARCH */}
     {/* 🔍 SEARCH */}
<input
  placeholder="Search NFTs..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>

{/* 🎯 FILTER */}
<div style={{ display: "flex", gap: "10px", margin: "10px 0" }}>
  <button onClick={() => setFilter("all")} style={filterBtn(filter === "all")}>
    All
  </button>

  <button onClick={() => setFilter("listed")} style={filterBtn(filter === "listed")}>
    Listed
  </button>

  <button onClick={() => setFilter("unlisted")} style={filterBtn(filter === "unlisted")}>
    Unlisted
  </button>
</div>

{/* 🔥 SORT */}
<div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  <button onClick={() => setSort("default")} style={filterBtn(sort === "default")}>
    🔄 Default
  </button>

  <button onClick={() => setSort("low")} style={filterBtn(sort === "low")}>
    💸 Low → High
  </button>

  <button onClick={() => setSort("high")} style={filterBtn(sort === "high")}>
    💰 High → Low
  </button>
</div>

      <div style={cardStyle}>
        <h3>Mint NFT</h3>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <input placeholder="NFT Name" onChange={(e) => setTokenURI(e.target.value)} />
        <input placeholder="Description" onChange={(e) => setDescription(e.target.value)} />
        <button
  onClick={mintNFT}
  disabled={loading}
  style={{
    background: loading ? "#ccc" : "#4CAF50",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: loading ? "not-allowed" : "pointer",
  }}
>
  {loading ? "MINTING..." : "Mint"}
</button>
      </div>

      <div style={cardStyle}>
        <h3>List NFT</h3>
        <input placeholder="Token ID" onChange={(e) => setTokenId(e.target.value)} />
        <input placeholder="Price in ETH" onChange={(e) => setPrice(e.target.value)} />
        <button
  onClick={() => listNFTFromUI(tokenId)}
  style={{
    marginTop: "12px",
    padding: "10px 16px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "14px",
    color: "white",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
  }}
  onMouseOver={(e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.3)";
  }}
  onMouseOut={(e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
  }}
>
  List
</button>
      </div>
{/* 📊 NFT STATS BAR */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap",
    padding: "14px 18px",
    borderRadius: "14px",
    marginBottom: "20px",
    background:
      "linear-gradient(135deg, rgba(0,245,255,0.08), rgba(168,85,247,0.08))",
    border: "1px solid rgba(0,245,255,0.2)",
    backdropFilter: "blur(12px)",
    color: "white",
    fontFamily: "sans-serif",
  }}
>
  <span>🧾 Total NFTs: {totalNFTs}</span>
  <span>🔥 Listed NFTs: {listedNFTs}</span>
  <span>🧑 Your NFTs: {myNFTCount}</span>
  <span>💼 Wallet: {walletStatus}</span>
</div>

  
<h2
  style={{
    fontSize: "28px",
    fontWeight: "bold",
    background: "linear-gradient(90deg, #00f5ff, #a855f7)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 15px rgba(0,245,255,0.5)",
    marginBottom: "20px",
  }}
>
  🚀 Marketplace
</h2>
{loading && (
  <div style={{ textAlign: "center", margin: "30px" }}>
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "5px solid rgba(255,255,255,0.2)",
        borderTop: "5px solid #00f5ff",
        borderRadius: "50%",
        margin: "auto",
        animation: "spin 1s linear infinite",
      }}
    />
  </div>
)}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}
      >
        {filteredNFTs.map((nft) => (
         <div


  key={nft.id}
  style={{
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(0,255,255,0.2)",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 0 25px rgba(0,255,255,0.08)",
    transition: "0.3s",
    cursor: "pointer",
  }}

            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
 <img
  src={nft.image}
  alt="nft"
  style={{
    width: "100%",
    height: "220px",
    objectFit: "cover",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  }}
/>

            <div style={{ padding: "12px" }}>
              <h3>{nft.name}</h3>

              <p style={{ fontSize: "13px", color: "#666" }}>
                {nft.description}
              </p>

 {nft.price > 0 ? (
  <p>💰 {ethers.formatEther(nft.price)} ETH</p>
) : (
  <span
    style={{
      display: "inline-block",
      padding: "5px 10px",
      background: "#ff4d4d",
      borderRadius: "8px",
      fontSize: "12px",
      fontWeight: "bold",
    }}
  >
    ✖️ Not for Sale
  </span>
)}
<p style={{ fontSize: "12px", color: "#aaa" }}>
  👤 Owner: {nft.owner.slice(0, 6)}...{nft.owner.slice(-4)}
</p>
             
  <button
  onClick={() => buyNFTFromUI(nft.id, nft.price)}
  disabled={loading}
  style={{
    width: "100%",
    padding: "10px",
    background: loading ? "#ccc" : "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "0.3s",
  }}
  onMouseEnter={(e) => {
    if (!loading) e.target.style.background = "#45a049";
  }}
  onMouseLeave={(e) => {
    if (!loading) e.target.style.background = "#4CAF50";
  }}
>
  {loading ? "Processing..." : "Buy Now"}
</button>
            </div>
          </div>
        ))}
      </div>

    <h2
  style={{
    marginTop: "40px",
    fontSize: "26px",
    fontWeight: "bold",
    background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 12px rgba(255,126,95,0.5)",
    letterSpacing: "1px",
  }}
>
  🧑‍🎨 Your NFT Collection
</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >
        {myNFTs.map((nft) => (
     <div
  key={nft.id}
  style={{
    border: "1px solid rgba(255,0,255,0.2)",
    borderRadius: "16px",
    padding: "10px",
    boxShadow: "0 0 20px rgba(255,0,255,0.08)",
    color: "white",
  }}
>
            <img src={nft.image} style={{ width: "100%" }} />
            <h3>{nft.name}</h3>

            <button
  onClick={() => listNFTFromUI(nft.id)}
  style={{
    marginTop: "12px",
    width: "100%",
    padding: "12px",
    background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontWeight: "bold",
    fontSize: "14px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = "scale(1.05)";
    e.target.style.boxShadow =
      "0 8px 20px rgba(0,0,0,0.3)";
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = "scale(1)";
    e.target.style.boxShadow =
      "0 4px 10px rgba(0,0,0,0.2)";
  }}
>
  🏷️ List for Sale
</button>
          </div>
        ))}
      </div>
    </div>
  );
}