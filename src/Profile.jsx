import { ethers } from "ethers";

export default function Profile({ wallet, myNFTs, nfts, buyNFT }) {

  const listedByUser = nfts.filter(
    (nft) =>
      nft.seller &&
      wallet &&
      nft.seller.toLowerCase() === wallet.account.toLowerCase()
  );

  return (
    <div style={{ padding: "20px" }}>

      {/* HEADER */}
      <h2>👤 Wallet Profile</h2>

      {/* ADDRESS */}
      <p style={{ color: "#aaa" }}>
        {wallet?.account}
      </p>

      {/* OWNED NFTs */}
      <h3 style={{ marginTop: "30px" }}>🧑‍🎨 Your NFTs</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        {myNFTs.map((nft) => (
          <div key={nft.id} style={{
            border: "1px solid #444",
            borderRadius: "12px",
            padding: "10px"
          }}>
            <img src={nft.image} style={{ width: "100%" }} />
            <p>{nft.name}</p>
          </div>
        ))}
      </div>

      {/* LISTED NFTs */}
      <h3 style={{ marginTop: "30px" }}>💰 Listed by You</h3>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px"
      }}>
        {listedByUser.map((nft) => (
          <div key={nft.id} style={{
            border: "1px solid #444",
            borderRadius: "12px",
            padding: "10px"
          }}>
            <img src={nft.image} style={{ width: "100%" }} />
            <p>{nft.name}</p>
            <p>💰 {ethers.formatEther(nft.price)} ETH</p>
          </div>
        ))}
      </div>

    </div>
  );
}