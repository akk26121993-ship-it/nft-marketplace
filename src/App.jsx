import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  connectInjectedWallet,
  connectWalletConnect,
} from "./connectWallet";
import { contractABI } from "./contract";
import { ethers } from "ethers";
import { Analytics } from "@vercel/analytics/react";
import { uploadImage, uploadMetadata } from "./ipfs";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

// ============ IPFS GATEWAY HELPERS ============
const IPFS_GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://w3s.link/ipfs/",
];
// ============ PREMIUM WALLET BUTTONS COMPONENT ============
function PremiumWalletButtons({ onMetaMaskClick, onWalletConnectClick, loading = false }) {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [activeBtn, setActiveBtn] = useState(null);

  const handleMetaMaskClick = async () => {
    setActiveBtn("metamask");
    try {
      await onMetaMaskClick();
    } finally {
      setActiveBtn(null);
    }
  };

  const handleWalletConnectClick = async () => {
    setActiveBtn("walletconnect");
    try {
      await onWalletConnectClick();
    } finally {
      setActiveBtn(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", width: "100%" }}>
      {/* MetaMask Button */}
      <button
        onClick={handleMetaMaskClick}
        disabled={loading}
        onMouseEnter={() => !loading && setHoveredBtn("metamask")}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          position: "relative",
          overflow: "hidden",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font)",
          fontWeight: 700,
          fontSize: "14px",
          padding: "14px 28px",
          borderRadius: "14px",
          transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minWidth: "160px",
          background: "linear-gradient(135deg, #f6851b 0%, #fb542b 100%)",
          color: "#fff",
          boxShadow: `0 10px 30px rgba(246,133,27,0.35), 0 0 0 1px rgba(246,133,27,0.2)`,
          transform: hoveredBtn === "metamask" && !loading
            ? "translateY(-6px) scale(1.05) rotateX(2deg)"
            : activeBtn === "metamask"
            ? "translateY(2px) scale(0.98)"
            : "translateY(0)",
          opacity: loading && activeBtn !== "metamask" ? 0.5 : 1,
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: hoveredBtn === "metamask" ? "glassSheen 0.6s ease-in-out" : "none", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "14px", background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent)", opacity: hoveredBtn === "metamask" ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🦊</span>
          <span style={{ fontWeight: 800, letterSpacing: "0.5px" }}>{activeBtn === "metamask" ? "Connecting..." : "MetaMask"}</span>
        </div>
        <div style={{ position: "absolute", bottom: "-3px", left: "5%", right: "5%", height: "6px", background: "rgba(0,0,0,0.2)", borderRadius: "50%", filter: "blur(6px)", opacity: hoveredBtn === "metamask" ? 0.8 : 0.4, transition: "opacity 0.3s ease", zIndex: -1 }} />
      </button>

      {/* WalletConnect Button */}
      <button
        onClick={handleWalletConnectClick}
        disabled={loading}
        onMouseEnter={() => !loading && setHoveredBtn("walletconnect")}
        onMouseLeave={() => setHoveredBtn(null)}
        style={{
          position: "relative",
          overflow: "hidden",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "var(--font)",
          fontWeight: 700,
          fontSize: "14px",
          padding: "14px 28px",
          borderRadius: "14px",
          transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          minWidth: "160px",
          background: "linear-gradient(135deg, #3b99fc 0%, #2d88e0 100%)",
          color: "#fff",
          boxShadow: `0 10px 30px rgba(59,153,252,0.35), 0 0 0 1px rgba(59,153,252,0.2)`,
          transform: hoveredBtn === "walletconnect" && !loading
            ? "translateY(-6px) scale(1.05) rotateX(2deg)"
            : activeBtn === "walletconnect"
            ? "translateY(2px) scale(0.98)"
            : "translateY(0)",
          opacity: loading && activeBtn !== "walletconnect" ? 0.5 : 1,
        }}
      >
        <div style={{ position: "absolute", top: 0, left: "-100%", width: "100%", height: "100%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", animation: hoveredBtn === "walletconnect" ? "glassSheen 0.6s ease-in-out" : "none", pointerEvents: "none" }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: "14px", background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15), transparent)", opacity: hoveredBtn === "walletconnect" ? 1 : 0, transition: "opacity 0.3s ease", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>🔗</span>
          <span style={{ fontWeight: 800, letterSpacing: "0.5px" }}>{activeBtn === "walletconnect" ? "Connecting..." : "WalletConnect"}</span>
        </div>
        <div style={{ position: "absolute", bottom: "-3px", left: "5%", right: "5%", height: "6px", background: "rgba(0,0,0,0.2)", borderRadius: "50%", filter: "blur(6px)", opacity: hoveredBtn === "walletconnect" ? 0.8 : 0.4, transition: "opacity 0.3s ease", zIndex: -1 }} />
      </button>

      <style>{`
        @media (max-width: 480px) {
          .wallet-btn-wrap { gap: 8px !important; }
          .wallet-btn-wrap button { flex: 1; min-width: 0 !important; padding: 11px 14px !important; font-size: 12px !important; }
          .wallet-btn-wrap button span { font-size: 14px !important; }
        }
      `}</style>
    </div>
  );
}

async function fetchWithRetry(url, maxRetries = 3, timeout = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) return await res.json();
      throw new Error(`HTTP ${res.status} from ${url}`);
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      await new Promise((r) => setTimeout(r, 800 * (i + 1)));
    }
  }
}

async function getMetadataFromIPFS(ipfsUrl) {
  if (!ipfsUrl) throw new Error("Empty URI");
  if (ipfsUrl.startsWith("data:application/json")) {
    try { const base64 = ipfsUrl.split(",")[1]; return JSON.parse(atob(base64)); } catch { throw new Error("Invalid data URI"); }
  }
  if (ipfsUrl.startsWith("data:")) {
    try { const raw = ipfsUrl.split(",")[1]; return JSON.parse(decodeURIComponent(raw)); } catch { throw new Error("Invalid data URI"); }
  }
  let cid;
  if (ipfsUrl.startsWith("ipfs://")) {
    cid = ipfsUrl.replace("ipfs://", "");
  } else if (ipfsUrl.startsWith("https://") || ipfsUrl.startsWith("http://")) {
    try { return await fetchWithRetry(ipfsUrl, 2, 6000); } catch (err) {
      const match = ipfsUrl.match(/\/ipfs\/(.+?)(?:\?|$)/);
      if (match) cid = match[1];
      else throw err;
    }
  } else { cid = ipfsUrl; }
  if (!cid) throw new Error("Invalid IPFS URL format");
  const errors = [];
  for (const gateway of IPFS_GATEWAYS) {
    try { return await fetchWithRetry(gateway + cid, 2, 6000); }
    catch (err) { errors.push(`${gateway}: ${err.message}`); }
  }
  throw new Error(`Failed all gateways: ${errors.join(" | ")}`);
}

function fixImageUrl(imageUrl) {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("data:")) return imageUrl;
  if (imageUrl.startsWith("ipfs://ipfs/")) return `https://ipfs.io/ipfs/${imageUrl.replace("ipfs://ipfs/", "")}`;
  if (imageUrl.startsWith("ipfs://")) return `https://ipfs.io/ipfs/${imageUrl.replace("ipfs://", "")}`;
  if (imageUrl.startsWith("https://") || imageUrl.startsWith("http://")) return imageUrl;
  return `https://ipfs.io/ipfs/${imageUrl}`;
}

// ============ RARITY SYSTEM ============
function computeRarity(nft) {
  const score = (nft.royalty || 0) + (nft.id % 10) * 3;
  if (score >= 25) return { label: "Legendary", color: "#f59e0b", glow: "rgba(245,158,11,0.5)", icon: "👑" };
  if (score >= 18) return { label: "Epic", color: "#a855f7", glow: "rgba(168,85,247,0.5)", icon: "💎" };
  if (score >= 10) return { label: "Rare", color: "#3b82f6", glow: "rgba(59,130,246,0.5)", icon: "⚡" };
  return { label: "Common", color: "#6b7280", glow: "rgba(107,114,128,0.4)", icon: "🔹" };
}

// ============ GAS ESTIMATOR ============
async function estimateGas(contract, method, args = [], value = null) {
  try {
    const overrides = value ? { value } : {};
    const gas = await contract[method].estimateGas(...args, overrides);
    const provider = contract.runner.provider;
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(20000000000);
    const estimatedCost = gas * gasPrice;
    return { gas: gas.toString(), cost: ethers.formatEther(estimatedCost), costWei: estimatedCost };
  } catch (err) {
    return { gas: "~50000", cost: "~0.001", costWei: null };
  }
}

// ============ STABLE CHART DATA ============
function generateWeeklyChartData() {
  const seed = Math.floor(Date.now() / (1000 * 60 * 60));
  const pseudo = (n) => ((seed * 1103515245 + n * 12345) & 0x7fffffff) / 0x7fffffff;
  return [
    { label: "Mon", value: pseudo(1) * 5 + 1 },
    { label: "Tue", value: pseudo(2) * 8 + 1 },
    { label: "Wed", value: pseudo(3) * 6 + 1 },
    { label: "Thu", value: pseudo(4) * 10 + 1 },
    { label: "Fri", value: pseudo(5) * 7 + 1 },
    { label: "Sat", value: pseudo(6) * 12 + 1 },
    { label: "Sun", value: pseudo(7) * 9 + 1 },
  ];
}
const STABLE_CHART_DATA = generateWeeklyChartData();

// ============ PREMIUM CSS ============
const PREMIUM_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Syne:wght@700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --p: #00ffcc;
    --p2: #00d4aa;
    --sec: #7c3aed;
    --acc: #f059a0;
    --gold: #fbbf24;
    --success: #10b981;
    --warn: #f59e0b;
    --err: #ef4444;
    --bg: #060912;
    --bg2: #0d1224;
    --surf: #131929;
    --card: #192035;
    --card2: #1e2840;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(0,255,204,0.15);
    --txt: #f0f4ff;
    --txt2: #8892aa;
    --txt3: #4a5568;
    --font: 'Outfit', sans-serif;
    --mono: 'JetBrains Mono', monospace;
    --head: 'Syne', sans-serif;
    --perspective: 1000px;
  }

  html, body {
    background: var(--bg);
    color: var(--txt);
    font-family: var(--font);
    overflow-x: hidden;
    min-height: 100vh;
    line-height: 1.6;
    scroll-behavior: smooth;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, var(--p), var(--sec)); border-radius: 10px; }

  h1,h2,h3 { font-family: var(--head); letter-spacing: -0.02em; }

  /* ── KEYFRAMES ── */
  @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes slideRight { from { opacity:0; transform:translateX(32px); } to { opacity:1; transform:translateX(0); } }
  @keyframes slideLeft { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
  @keyframes pulse { 0%,100% { box-shadow:0 0 20px rgba(0,255,204,0.4); } 50% { box-shadow:0 0 50px rgba(0,255,204,0.9); } }
  @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
  @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
  @keyframes heartbeat { 0%,100% { transform:scale(1); } 50% { transform:scale(1.3); } }
  @keyframes shimmer { 0% { background-position:-800px 0; } 100% { background-position:800px 0; } }
  @keyframes scanline { 0% { top:-10%; } 100% { top:110%; } }
  @keyframes orbFloat1 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(20px,-30px) scale(1.1); } 66% { transform:translate(-15px,-50px) scale(0.9); } }
  @keyframes orbFloat2 { 0%,100% { transform:translate(0,0) scale(1); } 33% { transform:translate(-30px,20px) scale(0.9); } 66% { transform:translate(25px,40px) scale(1.2); } }
  @keyframes neonPulse { 0%,100% { border-color:rgba(0,255,204,0.2); box-shadow:0 0 10px rgba(0,255,204,0.1); } 50% { border-color:rgba(0,255,204,0.7); box-shadow:0 0 30px rgba(0,255,204,0.3); } }
  @keyframes countdownFlash { 0%,100% { color:var(--err); } 50% { color:#ff8888; } }
  @keyframes activityIn { from { opacity:0; transform:translateX(-20px); } to { opacity:1; transform:translateX(0); } }
  @keyframes progressFill { from { width:0%; } to { width:var(--pct); } }
  @keyframes gradShift { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes eyeGlow { 0%,100% { box-shadow:0 0 30px rgba(0,255,204,0.6),0 0 60px rgba(124,58,237,0.4),inset 0 0 30px rgba(0,255,204,0.3); } 50% { box-shadow:0 0 60px rgba(0,255,204,1),0 0 100px rgba(124,58,237,0.8),inset 0 0 60px rgba(0,255,204,0.6); } }
  @keyframes cardIn { from { opacity:0; transform:translateY(36px) rotateX(8deg); } to { opacity:1; transform:translateY(0) rotateX(0); } }
  @keyframes bgGrad { 0%,100% { opacity:0.06; } 50% { opacity:0.12; } }
  @keyframes toastSlide { from { opacity:0; transform:translateY(-24px) scale(0.95); } to { opacity:1; transform:translateY(0) scale(1); } }
  @keyframes waveBar { 0%,100% { transform:scaleY(0.4); } 50% { transform:scaleY(1); } }
  @keyframes rotate3d { 0% { transform:rotateY(0deg) rotateX(5deg); } 100% { transform:rotateY(360deg) rotateX(5deg); } }
  @keyframes holographic { 0%,100% { background-position:0% 50%; } 50% { background-position:100% 50%; } }
  @keyframes tilt3d { 0%,100% { transform:perspective(800px) rotateX(0deg) rotateY(0deg); } 25% { transform:perspective(800px) rotateX(4deg) rotateY(-4deg); } 75% { transform:perspective(800px) rotateX(-4deg) rotateY(4deg); } }
  @keyframes auctionPulse { 0%,100% { box-shadow:0 0 0 0 rgba(245,158,11,0.5); } 70% { box-shadow:0 0 0 12px rgba(245,158,11,0); } }
  @keyframes bidRipple { 0% { transform:scale(0.8); opacity:1; } 100% { transform:scale(2.4); opacity:0; } }
  @keyframes priceFlash { 0% { color:var(--p); transform:scale(1); } 50% { color:#fff; transform:scale(1.08); } 100% { color:var(--p); transform:scale(1); } }
  @keyframes depthShadow { 0%,100% { box-shadow:0 20px 60px rgba(0,0,0,0.4),0 0 0 1px rgba(0,255,204,0.06); } 50% { box-shadow:0 30px 80px rgba(0,0,0,0.6),0 0 0 1px rgba(0,255,204,0.18); } }
  @keyframes glassSheen { 0% { left:-100%; } 100% { left:200%; } }
  @keyframes particleFly { 0% { transform:translateY(0) scale(1); opacity:1; } 100% { transform:translateY(-60px) scale(0); opacity:0; } }
  @keyframes cardLift { from { transform:translateY(0) rotateX(0) scale(1); } to { transform:translateY(-12px) rotateX(4deg) scale(1.02); } }
  @keyframes glowRing { 0%,100% { box-shadow:0 0 20px rgba(0,255,204,0.3),inset 0 0 20px rgba(0,255,204,0.05); } 50% { box-shadow:0 0 50px rgba(0,255,204,0.7),inset 0 0 40px rgba(0,255,204,0.12); } }
  @keyframes particleRise { 0% { transform:translateY(0) translateX(0) scale(1); opacity:0.8; } 100% { transform:translateY(-120px) translateX(var(--px,0px)) scale(0); opacity:0; } }
  @keyframes shimmerBg { 0% { background-position: -400% 0; } 100% { background-position: 400% 0; } }
  @keyframes borderFlow { 0%,100% { border-color: rgba(0,255,204,0.2); } 50% { border-color: rgba(0,255,204,0.7); } }
  @keyframes rotateHolo { 0% { transform: rotate(0deg) scale(1.5); } 100% { transform: rotate(360deg) scale(1.5); } }
  @keyframes countUp { from { transform: translateY(10px); opacity:0; } to { transform: translateY(0); opacity:1; } }

  .fade-up { animation: fadeUp 0.5s ease-out forwards; opacity:0; }
  .slide-right { animation: slideRight 0.5s ease-out; }
  .float { animation: float 5s ease-in-out infinite; }
  .spin { animation: spin 1.2s linear infinite; }
  .pulse { animation: pulse 2.5s infinite; }

  /* ── GLASS ── */
  .glass {
    background: rgba(19,25,41,0.7);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid var(--border);
  }

  /* ── 3D CARD WRAPPER ── */
  .card-3d-wrapper { perspective: 1200px; transform-style: preserve-3d; }
  .card-3d-wrapper:hover .nft-card { animation: cardLift 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards; }

  /* ── HOLOGRAPHIC OVERLAY ── */
  .holo-overlay {
    position: absolute; inset: 0; border-radius: 16px;
    background: conic-gradient(from var(--holo-angle, 0deg), rgba(0,255,204,0) 0%, rgba(0,255,204,0.06) 15%, rgba(124,58,237,0.06) 30%, rgba(240,89,160,0.06) 50%, rgba(0,255,204,0.06) 70%, rgba(0,255,204,0) 100%);
    pointer-events: none; z-index: 3; opacity: 0; transition: opacity 0.4s ease;
    animation: rotateHolo 6s linear infinite paused;
  }
  .nft-card:hover .holo-overlay { opacity: 1; animation-play-state: running; }

  /* ── GLASS SHEEN ── */
  .glass-sheen {
    position: absolute; top: 0; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
    transform: skewX(-20deg); pointer-events: none; z-index: 4;
    animation: glassSheen 4s ease-in-out infinite;
  }

  /* ── BUTTONS ── */
  .btn {
    padding: 11px 22px; border: none; border-radius: 10px;
    font-family: var(--font); font-weight: 700; font-size: 14px;
    cursor: pointer; transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
    display: inline-flex; align-items: center; justify-content: center;
    gap: 7px; position: relative; overflow: hidden;
    letter-spacing: 0.01em; transform-style: preserve-3d;
  }
  .btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.18),transparent); opacity:0; transition:opacity 0.2s; }
  .btn:hover::after { opacity:1; }
  .btn::before { content:''; position:absolute; bottom:-4px; left:10%; right:10%; height:8px; background:inherit; filter:blur(8px); opacity:0; transition:opacity 0.3s; border-radius:50%; z-index:-1; }
  .btn:hover::before { opacity:0.6; }
  .btn-p { background:linear-gradient(135deg,var(--p),#00ccaa); color:#060912; font-weight:800; box-shadow:0 0 24px rgba(0,255,204,0.35); }
  .btn-p:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 8px 36px rgba(0,255,204,0.55),0 4px 12px rgba(0,0,0,0.3); }
  .btn-sec { background:rgba(255,255,255,0.05); border:1.5px solid var(--border); color:var(--txt); }
  .btn-sec:hover { border-color:var(--p); box-shadow:0 0 18px rgba(0,255,204,0.25); background:rgba(0,255,204,0.08); transform:translateY(-2px); }
  .btn-ghost { background:transparent; border:1.5px solid var(--border); color:var(--txt2); }
  .btn-ghost:hover { border-color:var(--p); color:var(--p); transform:translateY(-2px); }
  .btn-danger { background:rgba(239,68,68,0.12); border:1.5px solid rgba(239,68,68,0.45); color:var(--err); }
  .btn-danger:hover { background:rgba(239,68,68,0.22); box-shadow:0 0 18px rgba(239,68,68,0.3); transform:translateY(-2px); }
  .btn-warn { background:rgba(245,158,11,0.12); border:1.5px solid rgba(245,158,11,0.45); color:var(--warn); }
  .btn-warn:hover { background:rgba(245,158,11,0.22); box-shadow:0 0 18px rgba(245,158,11,0.3); transform:translateY(-2px); }
  .btn-auction { background:linear-gradient(135deg,#f59e0b,#d97706); color:#060912; font-weight:800; box-shadow:0 0 24px rgba(245,158,11,0.35); }
  .btn-auction:hover { transform:translateY(-3px) scale(1.02); box-shadow:0 8px 36px rgba(245,158,11,0.55); }
  .btn:disabled { opacity:0.45; cursor:not-allowed; transform:none !important; }

  /* ── INPUTS ── */
  input, textarea, select {
    background: rgba(30,40,64,0.9); border: 1.5px solid var(--border);
    color: var(--txt); padding: 12px 16px; border-radius: 10px;
    font-family: var(--font); font-size: 14px; transition: all 0.25s ease; width: 100%;
  }
  input:focus, textarea:focus, select:focus { outline:none; border-color:var(--p); box-shadow:0 0 18px rgba(0,255,204,0.22); }
  input::placeholder, textarea::placeholder { color:var(--txt3); }
  select option { background:var(--card2); }

  /* ── CARDS ── */
  .card {
    background: var(--surf); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px;
    transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    animation: cardIn 0.55s ease-out backwards;
  }
  .card:hover { border-color:var(--border2); box-shadow:0 16px 56px rgba(0,255,204,0.08); transform:translateY(-4px); }

  .nft-card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
    position: relative; transform-style: preserve-3d;
    animation: depthShadow 5s ease-in-out infinite; will-change: transform;
  }
  .nft-card::before {
    content:''; position:absolute; inset:0; border-radius:16px;
    border:1px solid transparent;
    background:linear-gradient(135deg,rgba(0,255,204,0),rgba(0,255,204,0)) border-box;
    transition:all 0.35s ease; pointer-events:none; z-index:1;
  }
  .nft-card:hover { border-color:rgba(0,255,204,0.4); box-shadow:0 32px 80px rgba(0,255,204,0.15),0 0 0 1px rgba(0,255,204,0.2),0 4px 6px rgba(0,0,0,0.3); }
  .nft-card-body { padding: 14px 16px 16px; position: relative; z-index: 2; }

  /* ── 3D DEPTH EFFECT ── */
  .depth-3d {
    position: absolute; bottom: -4px; left: 4%; right: 4%;
    height: 8px; background: rgba(0,255,204,0.15);
    border-radius: 0 0 16px 16px; filter: blur(8px); z-index: -1; transition: all 0.35s ease;
  }
  .nft-card:hover .depth-3d { bottom:-10px; filter:blur(14px); background:rgba(0,255,204,0.3); }

  /* ── AUCTION CARD SPECIAL ── */
  .auction-card-active { border-color: rgba(245,158,11,0.4) !important; animation: auctionPulse 2s infinite, depthShadow 5s ease-in-out infinite !important; }
  .auction-card-active:hover { box-shadow: 0 32px 80px rgba(245,158,11,0.2), 0 0 0 1px rgba(245,158,11,0.3) !important; }

  /* ── BADGES ── */
  .badge { display:inline-flex; align-items:center; gap:5px; padding:5px 10px; border-radius:7px; font-size:11px; font-weight:700; font-family: var(--mono); letter-spacing:0.03em; }
  .badge-success { background:rgba(16,185,129,0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); }
  .badge-warn { background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.3); }
  .badge-p { background:rgba(0,255,204,0.12); color:var(--p); border:1px solid rgba(0,255,204,0.28); }
  .badge-muted { background:rgba(148,163,184,0.08); color:var(--txt2); border:1px solid rgba(148,163,184,0.15); }
  .badge-danger { background:rgba(239,68,68,0.12); color:var(--err); border:1px solid rgba(239,68,68,0.3); }
  .badge-purple { background:rgba(124,58,237,0.15); color:#a78bfa; border:1px solid rgba(124,58,237,0.3); }
  .badge-auction { background:rgba(245,158,11,0.15); color:#f59e0b; border:1px solid rgba(245,158,11,0.4); box-shadow:0 0 10px rgba(245,158,11,0.2); }

  /* ── TABS ── */
  .tab-bar {
    display: flex;
    gap: 2px;
    margin-bottom: 36px;
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
    overflow-y: hidden;
    padding-bottom: 1px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    flex-wrap: nowrap;
    min-width: 0;
    width: 100%;
  }
  .tab-bar::-webkit-scrollbar { display: none; }

  .tab-btn {
    padding:11px 18px; background:transparent; border:none; border-bottom:3px solid transparent;
    color:var(--txt2); font-weight:700; cursor:pointer; transition:all 0.25s ease;
    font-family:var(--font); font-size:14px; white-space:nowrap; letter-spacing:0.01em;
    flex-shrink: 0;
  }
  .tab-btn.active { color:var(--p); border-bottom-color:var(--p); text-shadow:0 0 12px rgba(0,255,204,0.4); }
  .tab-btn:hover { color:var(--txt); }

  /* ── TOAST ── */
  .toast {
    position:fixed; top:20px; right:20px; z-index:9999;
    background:var(--card2); border:1px solid var(--border);
    padding:14px 20px; border-radius:12px;
    display:flex; align-items:center; gap:12px;
    animation:toastSlide 0.4s ease-out;
    max-width:380px; min-width:280px;
    box-shadow:0 16px 48px rgba(0,0,0,0.4);
    font-size:14px; font-weight:500;
  }
  .toast.success { border-left:4px solid var(--success); }
  .toast.error { border-left:4px solid var(--err); }
  .toast.info { border-left:4px solid var(--p); }

  /* ── MODAL ── */
  .modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,0.75);
    backdrop-filter:blur(6px); display:flex;
    align-items:center; justify-content:center;
    z-index:9998; animation:fadeIn 0.25s ease-out;
    overflow-y:auto; padding:20px;
  }
  .modal {
    background:var(--surf); border:1px solid var(--border);
    border-radius:20px; padding:32px;
    max-width:560px; width:100%; max-height:90vh; overflow-y:auto;
    animation:slideRight 0.35s cubic-bezier(0.34,1.56,0.64,1);
    box-shadow:0 40px 120px rgba(0,0,0,0.6),0 0 0 1px rgba(0,255,204,0.08);
    position:relative;
  }
  .modal::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background:linear-gradient(90deg, transparent, var(--p), var(--sec), transparent);
  }
  .modal-auction { border-color:rgba(245,158,11,0.25); }
  .modal-auction::before { background:linear-gradient(90deg, transparent, #f59e0b, #d97706, transparent); }

  /* ── SKELETON ── */
  .skeleton {
    background: linear-gradient(90deg, var(--card) 25%, var(--card2) 50%, var(--card) 75%);
    background-size: 800px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 8px;
  }

  /* ── STATS GRID ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }

  /* ── ADMIN GRID ── */
  .admin-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-bottom:30px; }
  .admin-card { background:rgba(19,25,41,0.9); border:1px solid rgba(0,255,204,0.12); border-radius:12px; padding:22px; transition:all 0.3s ease; }
  .admin-card:hover { border-color:rgba(0,255,204,0.4); box-shadow:0 0 20px rgba(0,255,204,0.08); }

  /* ── NFT ACTIONS ── */
  .nft-actions { display:grid; gap:6px; }
  .nft-actions-row { display:flex; gap:6px; }
  .nft-actions-row .btn { flex:1; min-width:0; }

  /* ── EYE ── */
  .eye-container { position:relative; width:72px; height:72px; display:flex; align-items:center; justify-content:center; }
  .eye-outer { position:absolute; width:72px; height:72px; border-radius:50%; background:radial-gradient(circle at 35% 35%, rgba(0,255,204,0.4), rgba(124,58,237,0.2)); border:2px solid var(--p); animation:eyeGlow 3.5s ease-in-out infinite; }
  .eye-mid { position:absolute; width:54px; height:54px; border-radius:50%; background:radial-gradient(circle at 30% 30%, rgba(0,255,204,0.55), rgba(124,58,237,0.3)); border:1.5px solid rgba(0,255,204,0.45); animation:spin 8s linear infinite; }
  .eye-pupil { position:absolute; width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,var(--p),var(--sec)); top:50%; left:50%; transform:translate(-50%,-50%); box-shadow:0 0 20px rgba(0,255,204,0.9),inset 0 0 12px rgba(124,58,237,0.5); }

  /* ── ORBS ── */
  .orb { position:absolute; border-radius:50%; }
  .orb-a { width:32px; height:32px; background:radial-gradient(circle at 30% 30%,rgba(0,255,204,0.9),rgba(124,58,237,0.4)); border:1px solid rgba(0,255,204,0.5); animation:orbFloat1 9s ease-in-out infinite; box-shadow:0 0 16px rgba(0,255,204,0.6); }
  .orb-b { width:24px; height:24px; background:radial-gradient(circle at 30% 30%,rgba(124,58,237,0.9),rgba(0,255,204,0.4)); border:1px solid rgba(124,58,237,0.5); animation:orbFloat2 11s ease-in-out infinite; box-shadow:0 0 12px rgba(124,58,237,0.6); }

  /* ── STAT CARD ── */
  .stat-card {
    background:rgba(19,25,41,0.85); border:1px solid rgba(0,255,204,0.09);
    border-radius:14px; padding:18px; transition:all 0.3s ease;
    animation:cardIn 0.55s ease-out backwards; cursor:default;
    position:relative; overflow:hidden; transform-style:preserve-3d;
  }
  .stat-card::after { content:''; position:absolute; top:0; right:0; width:80px; height:80px; background:radial-gradient(circle at center, rgba(0,255,204,0.06), transparent); border-radius:50%; }
  .stat-card:hover { border-color:rgba(0,255,204,0.4); transform:translateY(-4px) rotateX(2deg); box-shadow:0 12px 40px rgba(0,255,204,0.08); }

  /* ── AUCTION LIVE BOX ── */
  .auction-live-box {
    background: linear-gradient(135deg, rgba(245,158,11,0.08), rgba(217,119,6,0.05));
    border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 14px;
    position: relative; overflow: hidden;
  }
  .auction-live-box::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,#f59e0b,transparent); }

  /* ── BID RIPPLE ── */
  .bid-ripple-container { position:relative; overflow:visible; }
  .bid-ripple { position:absolute; inset:-4px; border-radius:inherit; border:2px solid rgba(245,158,11,0.6); animation:bidRipple 1s ease-out infinite; pointer-events:none; }

  /* ── PRICE FLASH ── */
  .price-flash { animation:priceFlash 0.6s ease-in-out; }

  /* ── ACTIVITY FEED ── */
  .activity-item {
    display:flex; align-items:center; gap:12px; padding:10px 14px;
    border-radius:10px; background:rgba(30,40,64,0.5); border:1px solid var(--border);
    animation:activityIn 0.4s ease-out; transition:all 0.2s ease; font-size:13px;
  }
  .activity-item:hover { background:rgba(30,40,64,0.85); border-color:var(--border2); }

  /* ── WAVE BARS ── */
  .wave-bar { display:inline-block; width:4px; height:20px; background:var(--p); border-radius:3px; margin:0 2px; }
  .wave-bar:nth-child(1) { animation:waveBar 0.9s 0s ease-in-out infinite; }
  .wave-bar:nth-child(2) { animation:waveBar 0.9s 0.15s ease-in-out infinite; }
  .wave-bar:nth-child(3) { animation:waveBar 0.9s 0.3s ease-in-out infinite; }
  .wave-bar:nth-child(4) { animation:waveBar 0.9s 0.45s ease-in-out infinite; }

  /* ── PROGRESS BAR ── */
  .prog-track { background:rgba(255,255,255,0.06); border-radius:99px; height:6px; overflow:hidden; }
  .prog-fill { height:100%; border-radius:99px; background:linear-gradient(90deg,var(--p),var(--sec)); transition:width 0.6s ease; }

  /* ── HEART ── */
  .heart-btn { background:none; border:none; cursor:pointer; font-size:18px; transition:all 0.25s ease; padding:4px; border-radius:6px; line-height:1; }
  .heart-btn:hover { transform:scale(1.25); }
  .heart-btn.liked { animation:heartbeat 0.4s ease; }

  /* ── GAS ESTIMATOR BOX ── */
  .gas-box {
    background:rgba(0,255,204,0.05); border:1px solid rgba(0,255,204,0.15);
    border-radius:10px; padding:12px 16px; font-size:12px; color:var(--txt2);
    display:flex; align-items:center; gap:8px; margin-bottom:16px;
  }

  /* ── COUNTDOWN ── */
  .countdown-urgent { animation:countdownFlash 1s ease-in-out infinite; font-weight:800; }

  /* ── SCANLINE EFFECT ── */
  .scanline-effect { position:absolute; inset:0; pointer-events:none; overflow:hidden; border-radius:inherit; }
  .scanline-effect::after { content:''; position:absolute; left:0; width:100%; height:2px; background:linear-gradient(90deg,transparent,rgba(0,255,204,0.4),transparent); animation:scanline 3s linear infinite; top:0; }

  /* ── TRAITS GRID ── */
  .traits-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(100px,1fr)); gap:8px; margin-top:12px; }
  .trait-chip { background:rgba(30,40,64,0.9); border:1px solid var(--border2); border-radius:8px; padding:8px 10px; text-align:center; transition:all 0.2s ease; }
  .trait-chip:hover { border-color:var(--p); background:rgba(0,255,204,0.06); transform:translateY(-2px); }
  .trait-chip .t-type { font-size:9px; color:var(--txt3); text-transform:uppercase; letter-spacing:0.06em; margin-bottom:3px; }
  .trait-chip .t-val { font-size:12px; font-weight:700; color:var(--txt); }

  /* ── ANALYTICS ── */
  .analytics-chart { display:flex; align-items:flex-end; gap:6px; height:100px; padding:0 4px; }
  .chart-bar-wrap { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; }
  .chart-bar { width:100%; border-radius:4px 4px 0 0; background:linear-gradient(180deg,var(--p),rgba(0,255,204,0.3)); min-height:4px; transition:height 0.8s cubic-bezier(0.34,1.56,0.64,1); position:relative; overflow:hidden; }
  .chart-bar::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent); animation:glassSheen 3s ease-in-out infinite; }
  .chart-label { font-size:9px; color:var(--txt3); white-space:nowrap; }

  /* ── PROFILE ── */
  .profile-avatar { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,var(--p),var(--sec)); display:flex; align-items:center; justify-content:center; font-size:24px; border:2px solid var(--border2); flex-shrink:0; }

  /* ── TRANSACTION ROW ── */
  .tx-row { display:flex; align-items:center; gap:12px; padding:10px 14px; border-radius:10px; border:1px solid var(--border); background:rgba(19,25,41,0.8); font-size:13px; transition:all 0.2s; }
  .tx-row:hover { border-color:var(--border2); transform:translateX(4px); }

  /* ── AUCTION INFO ROW ── */
  .auction-info-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.04); font-size:13px; }
  .auction-info-row:last-child { border-bottom:none; padding-bottom:0; }

  /* ── START PRICE TAG ── */
  .start-price-badge {
    background: linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.08));
    border: 1px solid rgba(245,158,11,0.3); border-radius: 8px; padding: 8px 14px;
    font-size: 13px; color: var(--warn); font-family: var(--mono); font-weight: 700;
    display: flex; align-items: center; gap: 8px; margin-top: 6px;
  }

  /* ── MIN BID INDICATOR ── */
  .min-bid-row {
    display: flex; align-items: center; gap: 8px; padding: 6px 10px;
    background: rgba(245,158,11,0.07); border-radius: 8px; margin-top: 6px;
    border: 1px dashed rgba(245,158,11,0.25);
  }
  .min-bid-row span { font-size:11px; color:var(--warn); font-family:var(--mono); font-weight:700; }

  /* ── PARTICLE ── */
  .particle { position:absolute; border-radius:50%; pointer-events:none; z-index:10; }

  /* ── COLLECTION ACTIONS ── */
  .collection-action-area { display:flex; flex-direction:column; gap:6px; }
  .collection-status-bar { display:flex; align-items:center; gap:6px; padding:7px 10px; border-radius:8px; font-size:11px; font-weight:700; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); color:var(--warn); }

  /* ── EMPTY STATE ── */
  .empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 40px; text-align:center; color:var(--txt2); gap:16px; }
  .empty-state .e-icon { font-size:56px; animation:float 4s ease-in-out infinite; }
  .empty-state h3 { font-size:20px; color:var(--txt); margin:0; }
  .empty-state p { font-size:14px; margin:0; max-width:320px; }

  /* ── SHIMMER TEXT ── */
  .shimmer-text {
    background: linear-gradient(90deg, var(--p) 0%, var(--acc) 25%, var(--sec) 50%, var(--p) 75%, var(--acc) 100%);
    background-size: 400% 100%; background-clip: text;
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    animation: shimmerBg 4s linear infinite;
  }

  /* ── GRID LINE BG ── */
  .grid-bg {
    position:absolute; inset:0;
    background-image: linear-gradient(rgba(0,255,204,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,204,0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  /* ── MOBILE ── */
  @media (max-width: 768px) {
    .btn { padding:9px 14px; font-size:13px; }
    h1 { font-size:28px !important; }
    h2 { font-size:22px !important; }
    .modal { padding:20px; border-radius:14px; }
    .admin-grid { grid-template-columns:1fr; }
    .toast { right:10px; left:10px; max-width:unset; }
    .eye-container,.eye-outer { width:52px; height:52px; }
    .eye-mid { width:38px; height:38px; }
    .eye-pupil { width:20px; height:20px; }
    .traits-grid { grid-template-columns:repeat(auto-fill,minmax(80px,1fr)); }
    .stat-card { padding: 14px; }

    /* FIX: Stats grid on mobile — 2 columns + last item centered */
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .stats-grid .stat-card:last-child:nth-child(odd) {
      grid-column: 1 / -1;
      max-width: 50%;
      margin: 0 auto;
      width: 100%;
    }

    /* FIX: Tab bar scrollable on mobile */
    .tab-bar {
      overflow-x: auto;
      overflow-y: hidden;
      flex-wrap: nowrap;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding-bottom: 2px;
      margin-bottom: 24px;
      gap: 0;
    }
    .tab-bar::-webkit-scrollbar { display: none; }
    .tab-btn {
      padding: 10px 14px;
      font-size: 12px;
      flex-shrink: 0;
      white-space: nowrap;
    }
  }

  @media (max-width: 480px) {
    .nft-actions-row { flex-direction: column; }
    .nft-actions-row .btn { flex: unset; width: 100%; }

    /* FIX: Stats grid 2-col on small mobile */
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .stats-grid .stat-card:last-child:nth-child(odd) {
      grid-column: 1 / -1;
      max-width: 50%;
      margin: 0 auto;
    }

    /* FIX: Tab bar on small mobile */
    .tab-bar {
      gap: 0;
      padding-bottom: 2px;
    }
    .tab-btn {
      padding: 8px 12px;
      font-size: 11px;
    }

    /* Wallet buttons full width on small screens */
    .wallet-btn-row {
      flex-direction: row !important;
      gap: 8px !important;
    }
    .wallet-btn-row button {
      flex: 1;
      min-width: 0 !important;
      padding: 11px 10px !important;
      font-size: 12px !important;
    }
  }
`;

function injectStyle() {
  if (document.getElementById("nft-ultra-css")) return;
  const el = document.createElement("style");
  el.id = "nft-ultra-css";
  el.textContent = PREMIUM_CSS;
  document.head.appendChild(el);
}

// ============ COUNTDOWN HOOK ============
function useCountdown(endTime) {
  const [timeLeft, setTimeLeft] = useState(null);
  useEffect(() => {
    if (!endTime) return;
    const update = () => {
      const diff = endTime * 1000 - Date.now();
      if (diff <= 0) { setTimeLeft({ ended: true, str: "Ended", h: 0, m: 0, s: 0 }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ ended: false, str: `${h}h ${m}m ${s}s`, h, m, s, urgent: diff < 3600000 });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return timeLeft;
}

// ============ FAVORITES HOOK ============
function useFavorites() {
  const [favs, setFavs] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nft_favs") || "[]"); } catch { return []; }
  });
  const toggle = useCallback((id) => {
    setFavs(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("nft_favs", JSON.stringify(next));
      return next;
    });
  }, []);
  return [favs, toggle];
}

// ============ PERSISTENT STORAGE HOOK ============
function usePersistentState(key, defaultValue) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return defaultValue;
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    try { localStorage.setItem(key, JSON.stringify(state)); } catch {}
  }, [key, state]);

  return [state, setState];
}

// ============ ACTIVITY TYPES ============
const ACTIVITY_TYPES = {
  mint: { icon: "✨", label: "Minted", color: "#7c3aed" },
  buy: { icon: "💎", label: "Sold", color: "#10b981" },
  list: { icon: "🏷️", label: "Listed", color: "#00ffcc" },
  bid: { icon: "🔨", label: "Bid", color: "#f59e0b" },
  offer: { icon: "💰", label: "Offered", color: "#f059a0" },
  auction: { icon: "⏱️", label: "Auctioned", color: "#3b82f6" },
};

// ============ SKELETON CARD ============
function SkeletonCard() {
  return (
    <div className="nft-card" style={{ height: "380px" }}>
      <div className="skeleton" style={{ height: "240px", borderRadius: "0" }} />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="skeleton" style={{ height: "18px", width: "70%" }} />
        <div className="skeleton" style={{ height: "13px", width: "90%" }} />
        <div className="skeleton" style={{ height: "13px", width: "50%" }} />
        <div className="skeleton" style={{ height: "36px", width: "100%", marginTop: "4px" }} />
      </div>
    </div>
  );
}

// ============ COUNTDOWN DISPLAY ============
function Countdown({ endTime }) {
  const t = useCountdown(endTime);
  if (!t) return null;
  if (t.ended) return <span className="badge badge-danger">🏁 Ended</span>;
  return (
    <span className={t.urgent ? "countdown-urgent" : ""} style={{ fontSize: "12px", fontFamily: "var(--mono)", fontWeight: 700, color: t.urgent ? "var(--err)" : "var(--warn)" }}>
      ⏱ {t.str}
    </span>
  );
}

// ============ EYE ============
function ThirdEye() {
  return (
    <div className="eye-container">
      <div className="orb orb-a" style={{ top: "-16px", left: "8px" }} />
      <div className="orb orb-b" style={{ top: "22px", right: "-4px" }} />
      <div className="eye-outer" />
      <div className="eye-mid" />
      <div className="eye-pupil" />
    </div>
  );
}

// ============ NFT IMAGE ============
function NFTImage({ nft, height = 240 }) {
  const [status, setStatus] = useState("loading");
  useEffect(() => { setStatus("loading"); }, [nft?.id, nft?.image]);
  return (
    <div style={{ position: "relative", height, background: "var(--card2)", overflow: "hidden" }}>
      {status === "loading" && <div className="skeleton" style={{ position: "absolute", inset: 0, borderRadius: 0 }} />}
      {nft.image && status !== "error" ? (
        <img
          src={nft.image}
          alt={nft.name}
          loading="lazy"
          crossOrigin="anonymous"
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "opacity 0.4s" }}
        />
      ) : status === "error" ? (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span style={{ fontSize: "48px" }}>🖼️</span>
          <div style={{ fontSize: "10px", color: "var(--txt3)", padding: "10px", textAlign: "center" }}>No image available</div>
        </div>
      ) : null}
      <div className="scanline-effect" />
    </div>
  );
}

// ============ NFT CARD ============
function NFTCard({ nft, wallet, favs, onFav, onBuyClick, onListClick, onAuctionClick, onOfferClick, onBidClick, onCancelListingClick, onAcceptOfferClick, onCancelOfferClick, onCancelAuctionClick, onEndAuctionClick, onViewTraits }) {
  const isListed = nft.listing?.active && Number(nft.listing?.price) > 0;
  const isAuction = nft.auction?.active;
  const hasOffer = Number(nft.offer?.amount) > 0;
  const userAddress = wallet?.account?.toLowerCase();
  const isSeller = nft.listing?.seller?.toLowerCase() === userAddress;
  const isOwner = nft.owner?.toLowerCase() === userAddress;
  const isAucSeller = nft.auction?.seller?.toLowerCase() === userAddress;
  const isOfferBuyer = nft.offer?.buyer?.toLowerCase() === userAddress;
  const noBids = !nft.auction?.highestBidder || nft.auction?.highestBidder === "0x0000000000000000000000000000000000000000";
  const auctionEnded = nft.auction?.endTime && Date.now() / 1000 >= nft.auction.endTime;
  const rarity = computeRarity(nft);
  const isFav = favs.includes(nft.id);
  const hasActiveBid = !noBids && isAuction;
  const showMinBid = isAuction && noBids && !auctionEnded;
  const minBidDisplay = nft.auction?.startPrice && Number(nft.auction.startPrice) > 0
    ? `${ethers.formatEther(nft.auction.startPrice)} ETH`
    : null;

  return (
    <div className="card-3d-wrapper">
      <div className={`nft-card ${isAuction && !auctionEnded ? 'auction-card-active' : ''}`} style={{ "--rarity-glow": rarity.glow }}>
        <div className="holo-overlay" />
        <div className="glass-sheen" />
        <div className="depth-3d" />
        <div style={{ position: "relative" }}>
          <NFTImage nft={nft} height={220} />
          <div style={{ position: "absolute", top: "10px", left: "10px", display: "flex", flexDirection: "column", gap: "4px", zIndex: 2 }}>
            {isListed && !isAuction && <span className="badge badge-success" style={{ fontSize: "10px" }}>For Sale</span>}
            {isAuction && !auctionEnded && <span className="badge badge-auction" style={{ fontSize: "10px" }}>⏱ Live Auction</span>}
            {isAuction && auctionEnded && <span className="badge badge-danger" style={{ fontSize: "10px" }}>🏁 Ended</span>}
            {hasOffer && <span className="badge badge-p" style={{ fontSize: "10px" }}>Offer</span>}
            {!isListed && !isAuction && !hasOffer && <span className="badge badge-muted" style={{ fontSize: "10px" }}>Unlisted</span>}
          </div>
          <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", zIndex: 2 }}>
            <div style={{ background: "rgba(6,9,18,0.85)", padding: "3px 9px", borderRadius: "7px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--p)", fontWeight: 700 }}>#{nft.id}</div>
            <div style={{ background: "rgba(6,9,18,0.85)", padding: "3px 9px", borderRadius: "7px", fontSize: "10px", color: rarity.color, fontWeight: 700 }}>{rarity.icon} {rarity.label}</div>
          </div>
          <button className={`heart-btn ${isFav ? "liked" : ""}`} onClick={() => onFav(nft.id)} style={{ position: "absolute", bottom: "10px", right: "10px", zIndex: 2, background: "rgba(6,9,18,0.75)", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isFav ? "❤️" : "🤍"}
          </button>
          {hasActiveBid && (
            <div style={{ position: "absolute", bottom: "10px", left: "10px", zIndex: 2 }}>
              <div className="bid-ripple-container" style={{ background: "rgba(245,158,11,0.9)", borderRadius: "6px", padding: "3px 8px" }}>
                <span style={{ fontSize: "10px", color: "#060912", fontWeight: 800, fontFamily: "var(--mono)" }}>
                  🔥 {ethers.formatEther(nft.auction.highestBid)} ETH
                </span>
                <div className="bid-ripple" />
              </div>
            </div>
          )}
        </div>

        <div className="nft-card-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--txt)", lineHeight: 1.3, flex: 1, marginRight: "8px" }}>{nft.name || `NFT #${nft.id}`}</h3>
            <button onClick={() => onViewTraits(nft)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", opacity: 0.6, transition: "opacity 0.2s", flexShrink: 0, padding: "2px" }} title="View traits">🔍</button>
          </div>
          {nft.description && (
            <p style={{ fontSize: "11px", color: "var(--txt2)", marginBottom: "8px", lineHeight: 1.5 }}>
              {nft.description.length > 70 ? nft.description.slice(0, 70) + "…" : nft.description}
            </p>
          )}
          <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
            <span className="badge badge-p" style={{ fontSize: "10px" }}>{((nft.royalty ?? 0) / 100).toFixed(1)}% Royalty</span>
          </div>
          {isListed && !isAuction && (
            <div style={{ background: "rgba(0,255,204,0.07)", padding: "9px 12px", borderRadius: "8px", marginBottom: "10px", border: "1px solid rgba(0,255,204,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--txt2)" }}>Price</span>
              <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--p)", fontFamily: "var(--mono)" }}>{ethers.formatEther(nft.listing.price)} ETH</span>
            </div>
          )}
          {isAuction && (
            <div className="auction-live-box" style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "11px", color: "var(--txt2)" }}>Highest Bid</span>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--warn)", fontFamily: "var(--mono)" }}>
                  {nft.auction?.highestBid && nft.auction.highestBid.toString() !== "0"
                    ? ethers.formatEther(nft.auction.highestBid)
                    : "0"} ETH
                </span>
              </div>
              {showMinBid && minBidDisplay && (
                <div className="min-bid-row">
                  <span>⬇ Min Bid:</span>
                  <span>{minBidDisplay}</span>
                </div>
              )}
              {showMinBid && !minBidDisplay && (
                <div style={{ fontSize: "10px", color: "var(--txt3)", marginBottom: "2px" }}>No bids yet — be first to bid!</div>
              )}
              <Countdown endTime={nft.auction.endTime} />
            </div>
          )}
          {hasOffer && (
            <div style={{ background: "rgba(0,255,204,0.05)", padding: "9px 12px", borderRadius: "8px", marginBottom: "10px", border: "1px solid rgba(0,255,204,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", color: "var(--txt2)" }}>Offer</span>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--p)", fontFamily: "var(--mono)" }}>{ethers.formatEther(nft.offer.amount)} ETH</span>
            </div>
          )}
          <div className="nft-actions">
            {isListed && !isAuction && !isSeller && (
              <div className="nft-actions-row">
                <button onClick={onBuyClick} className="btn btn-p" style={{ fontSize: "12px", padding: "9px" }}>💎 Buy Now</button>
              </div>
            )}
            {isAuction && !auctionEnded && !isAucSeller && (
              <div className="nft-actions-row">
                <button onClick={onBidClick} className="btn btn-auction" style={{ fontSize: "12px", padding: "9px" }}>🔨 Place Bid</button>
              </div>
            )}
            {isOwner && !isAuction && !isListed && (
              <div className="nft-actions-row">
                <button onClick={onListClick} className="btn btn-sec" style={{ fontSize: "11px", padding: "8px" }}>🏷️ List</button>
                <button onClick={onAuctionClick} className="btn btn-sec" style={{ fontSize: "11px", padding: "8px" }}>⏱️ Auction</button>
              </div>
            )}
            {isSeller && isListed && !isAuction && (
              <div className="nft-actions-row">
                <button onClick={onCancelListingClick} className="btn btn-danger" style={{ fontSize: "11px", padding: "8px" }}>✖ Cancel Listing</button>
                <button onClick={onAuctionClick} className="btn btn-auction" style={{ fontSize: "11px", padding: "8px" }}>⏱️ Auction</button>
              </div>
            )}
            {isAucSeller && isAuction && (
              <div className="nft-actions-row">
                {noBids && !auctionEnded && <button onClick={onCancelAuctionClick} className="btn btn-danger" style={{ fontSize: "11px", padding: "8px" }}>✖ Cancel</button>}
                {auctionEnded && <button onClick={onEndAuctionClick} className="btn btn-p" style={{ fontSize: "11px", padding: "8px" }}>🏁 End Auction</button>}
              </div>
            )}
            {isOwner && hasOffer && !isAuction && (
              <div className="nft-actions-row">
                <button onClick={onAcceptOfferClick} className="btn btn-p" style={{ fontSize: "11px", padding: "8px" }}>✅ Accept Offer</button>
              </div>
            )}
            {isOfferBuyer && hasOffer && (
              <div className="nft-actions-row">
                <button onClick={onCancelOfferClick} className="btn btn-warn" style={{ fontSize: "11px", padding: "8px" }}>↩ Cancel Offer</button>
              </div>
            )}
            {!isAuction && !isOwner && (
              <div className="nft-actions-row">
                <button onClick={onOfferClick} className="btn btn-ghost" style={{ fontSize: "11px", padding: "8px" }}>💰 Offer</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ GAS BOX COMPONENT ============
function GasBox({ estimate }) {
  if (!estimate) return null;
  return (
    <div className="gas-box">
      <span>⛽</span>
      <div>
        <span style={{ color: "var(--txt)", fontWeight: 600 }}>Estimated Gas: </span>
        <span style={{ color: "var(--p)", fontFamily: "var(--mono)", fontWeight: 700 }}>{estimate.cost} ETH</span>
        <span style={{ color: "var(--txt3)", marginLeft: "8px" }}>(~{estimate.gas} gas units)</span>
      </div>
    </div>
  );
}

// ============ ANALYTICS CHART ============
function MiniChart({ data, color = "var(--p)" }) {
  if (!data || data.length === 0) return <div style={{ color: "var(--txt3)", fontSize: "12px" }}>No data</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="analytics-chart">
      {data.map((d, i) => (
        <div key={i} className="chart-bar-wrap">
          <div className="chart-bar" style={{ height: `${(d.value / max) * 100}%`, background: `linear-gradient(180deg, ${color}, ${color}55)`, animationDelay: `${i * 0.1}s` }} />
          <div className="chart-label">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============ MAIN APP ============
export default function App() {
  injectStyle();

  const [wallet, setWallet] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [myNFTs, setMyNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("marketplace");
  const [favs, toggleFav] = useFavorites();

  const [showMintModal, setShowMintModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showTraitsModal, setShowTraitsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const [mintForm, setMintForm] = useState({ title: "", description: "", file: null, preview: null });
  const [listForm, setListForm] = useState({ price: "" });
  const [auctionForm, setAuctionForm] = useState({ duration: "86400", startPrice: "" });
  const [offerForm, setOfferForm] = useState({ amount: "", expiryDays: "7" });
  const [adminForm, setAdminForm] = useState({ nftId: "", userAddress: "" });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [userBalance, setUserBalance] = useState("0");

  const [activityFeed, setActivityFeed] = usePersistentState("nft_activityFeed", []);
  const [txHistory, setTxHistory] = usePersistentState("nft_txHistory", []);

  const [gasEstimate, setGasEstimate] = useState(null);
  const [gasLoading, setGasLoading] = useState(false);
  const [offerMode, setOfferMode] = useState("offer");

  const listenerRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3800);
  };

  const addActivity = useCallback((type, nftId, nftName, address, amount = null) => {
    const def = ACTIVITY_TYPES[type] || ACTIVITY_TYPES.mint;
    const entry = {
      id: Date.now() + Math.random(), type, def, nftId, nftName,
      address: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "Unknown",
      amount, ts: new Date().toLocaleTimeString(),
    };
    setActivityFeed(prev => [entry, ...prev].slice(0, 50));
  }, [setActivityFeed]);

  const addTx = useCallback((type, nftId, nftName, txHash, amount = null) => {
    setTxHistory(prev => [{
      id: Date.now(), type, nftId, nftName, txHash, amount,
      ts: new Date().toLocaleString(),
    }, ...prev].slice(0, 100));
  }, [setTxHistory]);

  function setupEventListeners(provider, contractInst, walletAddress) {
    if (listenerRef.current) { try { listenerRef.current.removeAllListeners(); } catch {} }
    listenerRef.current = contractInst;
    contractInst.on("Transfer", async (from, to, tokenId) => {
      if (from === "0x0000000000000000000000000000000000000000") {
        addActivity("mint", Number(tokenId), `NFT #${tokenId}`, to);
        showToast(`✨ New NFT #${tokenId} minted!`, "info");
      } else {
        addActivity("buy", Number(tokenId), `NFT #${tokenId}`, to);
        showToast(`💎 NFT #${tokenId} sold!`, "info");
      }
      setTimeout(() => loadNFTs(), 2000);
    });
    const iface = contractInst.interface;
    contractInst.on("*", (log) => {
      try {
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        if (!parsed) return;
        const name = parsed.name?.toLowerCase() || "";
        const tokenId = parsed.args?.tokenId ? Number(parsed.args.tokenId) : null;
        if (name.includes("bid") && tokenId !== null) { addActivity("bid", tokenId, `NFT #${tokenId}`, null, parsed.args?.amount ? ethers.formatEther(parsed.args.amount) + " ETH" : null); setTimeout(() => loadNFTs(), 1500); }
        if (name.includes("list") && tokenId !== null) { addActivity("list", tokenId, `NFT #${tokenId}`, null); setTimeout(() => loadNFTs(), 1500); }
        if (name.includes("auction") && tokenId !== null) { addActivity("auction", tokenId, `NFT #${tokenId}`, null); setTimeout(() => loadNFTs(), 1500); }
        if (name.includes("offer") && tokenId !== null) { addActivity("offer", tokenId, `NFT #${tokenId}`, null); setTimeout(() => loadNFTs(), 1500); }
      } catch {}
    });
  }

  useEffect(() => {
    loadNFTs();
    return () => { if (listenerRef.current) try { listenerRef.current.removeAllListeners(); } catch {} };
  }, []);

  async function handleConnect() {
    try {
      const data = await connectInjectedWallet();
      setWallet(data);
      await Promise.all([loadNFTs(), loadMyNFTs(data), loadBalance(data), checkAdmin(data)]);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contractInst = new ethers.Contract(contractAddress, contractABI, provider);
      setupEventListeners(provider, contractInst, data.account);
      showToast("✨ Wallet connected!", "success");
    } catch (err) {
      showToast("Connect failed: " + err.message, "error");
    }
  }

  async function loadBalance(w = wallet) {
    if (!w) return;
    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_URL);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const addr = await w.signer.getAddress();
      const bal = await contract.balances(addr);
      setUserBalance(ethers.formatEther(bal));
    } catch {}
  }

  async function loadNFTs() {
    try {
      setInitialLoading(true);
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_URL);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const total = Number(await contract.tokenId());
      if (total === 0) { setNfts([]); return; }
      const items = await Promise.all(
        Array.from({ length: total }, async (_, i) => {
          const id = i + 1;
          try {
            const owner = await contract.ownerOf(id);
            const uri = await contract.tokenURI(id);
            let listing = {}, auction = {}, offer = {}, royalty = 0;
            try { listing = await contract.listings(id); } catch { listing = { seller: ethers.ZeroAddress, price: 0, active: false }; }
            try { auction = await contract.auctions(id); } catch { auction = { seller: ethers.ZeroAddress, highestBid: 0, highestBidder: ethers.ZeroAddress, endTime: 0, active: false, startPrice: 0 }; }
            try {
              const walletAddr = wallet ? await wallet.signer.getAddress() : null;
              if (walletAddr) { offer = await contract.offers(id, walletAddr); }
            } catch { offer = { buyer: ethers.ZeroAddress, amount: 0, expiry: 0 }; }
            try { royalty = await contract.royalty(id); } catch { royalty = 0; }
            let meta = { name: `NFT #${id}`, description: "", image: "", attributes: [] };
            if (uri) { try { meta = { ...meta, ...await getMetadataFromIPFS(uri) }; } catch {} }
            return {
              id, owner,
              name: meta.name || `NFT #${id}`,
              description: meta.description || "",
              image: fixImageUrl(meta.image || ""),
              attributes: meta.attributes || [],
              royalty: Number(royalty),
              listing: { seller: listing.seller, price: listing.price, active: listing.active },
              auction: { seller: auction.seller, highestBid: auction.highestBid, highestBidder: auction.highestBidder, endTime: Number(auction.endTime), active: auction.active, startPrice: auction.startPrice ?? 0 },
              offer: { buyer: offer.buyer, amount: offer.amount, expiry: Number(offer.expiry || 0) },
            };
          } catch { return null; }
        })
      );
      setNfts(items.filter(Boolean));
    } catch (err) {
      showToast("Load error: " + err.message, "error");
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  }

  async function checkAdmin(w = wallet) {
    if (!w) return;
    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_URL);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const owner = await contract.owner();
      const addr = await w.signer.getAddress();
      setIsAdmin(owner.toLowerCase() === addr.toLowerCase());
    } catch {}
  }

  async function loadMyNFTs(w = wallet) {
    if (!w) return;
    try {
      const provider = new ethers.JsonRpcProvider(import.meta.env.VITE_ALCHEMY_URL);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      const total = Number(await contract.tokenId());
      const addr = await w.signer.getAddress();
      const items = [];
      for (let i = 1; i <= total; i++) {
        try {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() !== addr.toLowerCase()) continue;
          const [uri, royalty, listing] = await Promise.all([
            contract.tokenURI(i),
            contract.royalty(i).catch(() => 0),
            contract.listings(i).catch(() => ({ seller: ethers.ZeroAddress, price: 0, active: false })),
          ]);
          let auction = { seller: ethers.ZeroAddress, highestBid: 0, highestBidder: ethers.ZeroAddress, endTime: 0, active: false, startPrice: 0 };
          try { auction = await contract.auctions(i); } catch {}
          let meta = { name: `NFT #${i}`, description: "", image: "", attributes: [] };
          if (uri) { try { meta = { ...meta, ...await getMetadataFromIPFS(uri) }; } catch {} }
          items.push({
            id: i, owner, royalty: Number(royalty),
            name: meta.name || `NFT #${i}`,
            description: meta.description || "",
            image: fixImageUrl(meta.image || ""),
            attributes: meta.attributes || [],
            listing: { seller: listing.seller, price: listing.price, active: listing.active },
            auction: { seller: auction.seller, highestBid: auction.highestBid, highestBidder: auction.highestBidder, endTime: Number(auction.endTime), active: auction.active, startPrice: auction.startPrice ?? 0 },
            price: listing.price,
          });
        } catch {}
      }
      setMyNFTs(items);
    } catch {}
  }

  async function estimateForAction(action, nft, amount = null) {
    if (!wallet || !nft) return;
    setGasLoading(true); setGasEstimate(null);
    try {
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      let est;
      if (action === "buy") est = await estimateGas(contract, "buy", [nft.id], nft.listing?.price);
      else if (action === "bid" && amount) est = await estimateGas(contract, "bid", [nft.id], ethers.parseEther(amount));
      else if (action === "offer" && amount) est = await estimateGas(contract, "makeOffer", [nft.id], ethers.parseEther(amount));
      else if (action === "list" && amount) est = await estimateGas(contract, "list", [nft.id, ethers.parseEther(amount)]);
      else est = { gas: "~50000", cost: "~0.001" };
      setGasEstimate(est);
    } catch { setGasEstimate({ gas: "~50000", cost: "~0.001" }); }
    finally { setGasLoading(false); }
  }

  // ============ ACTIONS ============
  async function mintNFT() {
    if (!mintForm.file) return showToast("Upload image first", "error");
    if (!wallet) return showToast("Connect wallet first", "error");
    if (!mintForm.title.trim()) return showToast("Enter NFT name", "error");
    try {
      setLoading(true);
      showToast("📤 Uploading image…", "info");
      const imageUrl = await uploadImage(mintForm.file);
      showToast("📄 Uploading metadata…", "info");
      const metadataUrl = await uploadMetadata(mintForm.title, mintForm.description, imageUrl);
      showToast("⛓️ Minting…", "info");
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.mint(metadataUrl);
      await tx.wait();
      addTx("mint", null, mintForm.title, tx.hash);
      showToast("🚀 NFT Minted!", "success");
      setMintForm({ title: "", description: "", file: null, preview: null });
      setShowMintModal(false);
      setTimeout(() => { loadNFTs(); loadMyNFTs(wallet); }, 2000);
    } catch (err) { showToast("Mint failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function listNFT() {
    if (!wallet || !selectedNFT || !listForm.price) return showToast("Enter price", "error");
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      showToast("Approving…", "info");
      const approveTx = await contract.approve(contractAddress, selectedNFT.id);
      await approveTx.wait();
      showToast("Listing…", "info");
      const tx = await contract.list(selectedNFT.id, ethers.parseEther(listForm.price));
      await tx.wait();
      addTx("list", selectedNFT.id, selectedNFT.name, tx.hash, listForm.price + " ETH");
      addActivity("list", selectedNFT.id, selectedNFT.name, wallet.account);
      showToast("🏷️ Listed!", "success");
      setShowListModal(false); setListForm({ price: "" });
      await loadNFTs(); await loadMyNFTs(wallet);
    } catch (err) { showToast("List failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function buyNFT(nft) {
    const target = nft || selectedNFT;
    if (!wallet || !target) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.buy(target.id, { value: target.listing.price });
      await tx.wait();
      addTx("buy", target.id, target.name, tx.hash, ethers.formatEther(target.listing.price) + " ETH");
      addActivity("buy", target.id, target.name, wallet.account, ethers.formatEther(target.listing.price) + " ETH");
      showToast("🎉 Purchased!", "success");
      await loadNFTs(); await loadMyNFTs(wallet); await loadBalance(wallet);
    } catch (err) { showToast("Buy failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function createAuction() {
    if (!wallet || !selectedNFT) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      if (selectedNFT.listing?.active) {
        showToast("Cancelling listing before auction…", "info");
        try { const cancelTx = await contract.cancelListing(selectedNFT.id); await cancelTx.wait(); showToast("Listing cancelled ✓", "info"); } catch {}
      }
      showToast("Approving…", "info");
      const approveTx = await contract.approve(contractAddress, selectedNFT.id);
      await approveTx.wait();
      showToast("Creating auction…", "info");
      let tx;
      const durationNum = Number(auctionForm.duration);
      const hasStartPrice = auctionForm.startPrice && parseFloat(auctionForm.startPrice) > 0;
      try {
        if (hasStartPrice) { tx = await contract.createAuction(selectedNFT.id, ethers.parseEther(auctionForm.startPrice), durationNum); }
        else { tx = await contract.createAuction(selectedNFT.id, durationNum); }
      } catch { tx = await contract.createAuction(selectedNFT.id, durationNum); }
      await tx.wait();
      addActivity("auction", selectedNFT.id, selectedNFT.name, wallet.account);
      addTx("auction", selectedNFT.id, selectedNFT.name, tx.hash);
      showToast("⏱️ Auction Created!", "success");
      setShowAuctionModal(false);
      setAuctionForm({ duration: "86400", startPrice: "" });
      await loadNFTs(); await loadMyNFTs(wallet);
    } catch (err) { showToast("Auction failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function placeBid() {
    if (!wallet || !selectedNFT || !offerForm.amount) return showToast("Enter bid amount", "error");
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.bid(selectedNFT.id, { value: ethers.parseEther(offerForm.amount) });
      await tx.wait();
      setNfts((prev) => prev.map((item) => item.id === selectedNFT.id ? { ...item, auction: { ...item.auction, highestBid: ethers.parseEther(offerForm.amount), highestBidder: wallet.account } } : item));
      addTx("bid", selectedNFT.id, selectedNFT.name, tx.hash, offerForm.amount + " ETH");
      addActivity("bid", selectedNFT.id, selectedNFT.name, wallet.account, offerForm.amount + " ETH");
      showToast("🔨 Bid Placed!", "success");
      setShowOfferModal(false); setOfferForm({ amount: "" });
      await loadNFTs(); await loadBalance(wallet);
    } catch (err) { showToast("Bid failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function makeOffer() {
    if (!wallet || !selectedNFT || !offerForm.amount) return showToast("Enter offer", "error");
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const expiryDays = parseInt(offerForm.expiryDays) || 7;
      const expiryTs = BigInt(Math.floor(Date.now() / 1000) + expiryDays * 86400);
      const tx = await contract.makeOffer(selectedNFT.id, expiryTs, { value: ethers.parseEther(offerForm.amount) });
      await tx.wait();
      addTx("offer", selectedNFT.id, selectedNFT.name, tx.hash, offerForm.amount + " ETH");
      addActivity("offer", selectedNFT.id, selectedNFT.name, wallet.account, offerForm.amount + " ETH");
      showToast("💰 Offer Made!", "success");
      setShowOfferModal(false); setOfferForm({ amount: "", expiryDays: "7" });
      await loadNFTs(); await loadBalance(wallet);
    } catch (err) { showToast("Offer failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function withdrawBalance() {
    if (!wallet) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.withdraw();
      await tx.wait();
      addTx("withdraw", null, "Withdrawal", tx.hash, userBalance + " ETH");
      showToast("💸 Withdrawal done!", "success");
      await loadBalance(wallet);
    } catch (err) { showToast("Withdraw failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function cancelListing(nft) {
    if (!wallet || !nft) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.cancelListing(nft.id);
      await tx.wait();
      showToast("✅ Listing Cancelled!", "success");
      await loadNFTs(); await loadMyNFTs(wallet);
    } catch (err) { showToast("Cancel failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function acceptOffer(nft) {
    if (!wallet || !nft) return;
    const offerBuyer = nft.offer?.buyer;
    if (!offerBuyer || offerBuyer === ethers.ZeroAddress) return showToast("No offer to accept", "error");
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.acceptOffer(nft.id, offerBuyer);
      await tx.wait();
      showToast("🎉 Offer Accepted!", "success");
      await loadNFTs(); await loadMyNFTs(wallet); await loadBalance(wallet);
    } catch (err) { showToast("Accept failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function cancelOffer(nft) {
    if (!wallet || !nft) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.cancelOffer(nft.id);
      await tx.wait();
      showToast("↩ Offer Cancelled!", "success");
      await loadNFTs(); await loadBalance(wallet);
    } catch (err) { showToast("Cancel failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function cancelAuction(nft) {
    if (!wallet || !nft) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.cancelAuction(nft.id);
      await tx.wait();
      showToast("✅ Auction Cancelled!", "success");
      await loadNFTs(); await loadMyNFTs(wallet);
    } catch (err) { showToast("Cancel failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function endAuction(nft) {
    if (!wallet || !nft) return;
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, contractABI, wallet.signer);
      const tx = await contract.endAuction(nft.id);
      await tx.wait();
      showToast("🏁 Auction Ended!", "success");
      await loadNFTs(); await loadMyNFTs(wallet); await loadBalance(wallet);
    } catch (err) { showToast("End failed: " + err.message, "error"); }
    finally { setLoading(false); }
  }

  async function pauseContract() { if (!wallet) return; try { setLoading(true); const c = new ethers.Contract(contractAddress, contractABI, wallet.signer); await (await c.pause()).wait(); showToast("⏸️ Paused!", "success"); } catch (err) { showToast("Pause failed: " + err.message, "error"); } finally { setLoading(false); } }
  async function unpauseContract() { if (!wallet) return; try { setLoading(true); const c = new ethers.Contract(contractAddress, contractABI, wallet.signer); await (await c.unpause()).wait(); showToast("▶️ Unpaused!", "success"); } catch (err) { showToast("Unpause failed: " + err.message, "error"); } finally { setLoading(false); } }
  async function banNFTId(id) { if (!wallet || !id) return; try { setLoading(true); const c = new ethers.Contract(contractAddress, contractABI, wallet.signer); await (await c.banNFT(id)).wait(); showToast(`🔒 NFT #${id} banned!`, "success"); setAdminForm(p => ({ ...p, nftId: "" })); await loadNFTs(); } catch (err) { showToast("Ban failed: " + err.message, "error"); } finally { setLoading(false); } }
  async function unbanNFTId(id) { if (!wallet || !id) return; try { setLoading(true); const c = new ethers.Contract(contractAddress, contractABI, wallet.signer); await (await c.unbanNFT(id)).wait(); showToast(`🔓 NFT #${id} unbanned!`, "success"); setAdminForm(p => ({ ...p, nftId: "" })); await loadNFTs(); } catch (err) { showToast("Unban failed: " + err.message, "error"); } finally { setLoading(false); } }
  async function banUserAddress(addr) { if (!wallet || !addr || !ethers.isAddress(addr)) return showToast("Invalid address", "error"); try { setLoading(true); const c = new ethers.Contract(contractAddress, contractABI, wallet.signer); await (await c.banUser(addr)).wait(); showToast("🚫 User banned!", "success"); setAdminForm(p => ({ ...p, userAddress: "" })); } catch (err) { showToast("Ban failed: " + err.message, "error"); } finally { setLoading(false); } }
  async function unbanUserAddress(addr) { if (!wallet || !addr || !ethers.isAddress(addr)) return showToast("Invalid address", "error"); try { setLoading(true); const c = new ethers.Contract(contractAddress, contractABI, wallet.signer); await (await c.unbanUser(addr)).wait(); showToast("✅ User unbanned!", "success"); setAdminForm(p => ({ ...p, userAddress: "" })); } catch (err) { showToast("Unban failed: " + err.message, "error"); } finally { setLoading(false); } }

  const filteredNFTs = useMemo(() => nfts.filter(nft => {
    const match = (nft.name || "").toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    if (filter === "listed") return nft.listing?.active;
    if (filter === "auction") return nft.auction?.active;
    if (filter === "offer") return Number(nft.offer?.amount) > 0;
    if (filter === "favorites") return favs.includes(nft.id);
    return true;
  }).sort((a, b) => {
    if (sort === "price-low") return Number(a.listing?.price || 0) - Number(b.listing?.price || 0);
    if (sort === "price-high") return Number(b.listing?.price || 0) - Number(a.listing?.price || 0);
    if (sort === "rarity") return computeRarity(b).label.localeCompare(computeRarity(a).label);
    return b.id - a.id;
  }), [nfts, search, filter, sort, favs]);

  const analytics = useMemo(() => {
    const totalVolume = txHistory.filter(t => t.type === "buy").reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    const listedPrices = nfts.filter(n => n.listing?.active).map(n => parseFloat(ethers.formatEther(n.listing.price)));
    const floorPrice = listedPrices.length ? Math.min(...listedPrices) : 0;
    const highestSale = txHistory.filter(t => t.type === "buy").reduce((max, t) => Math.max(max, parseFloat(t.amount) || 0), 0);
    return { totalVolume, floorPrice, highestSale };
  }, [txHistory, nfts]);

  const stats = useMemo(() => ({
    total: nfts.length,
    listed: nfts.filter(n => n.listing?.active).length,
    auctions: nfts.filter(n => n.auction?.active).length,
    myNFTs: myNFTs.length,
  }), [nfts, myNFTs]);

  const tabs = [
    { id: "marketplace", label: "🏪 Market" },
    { id: "collection", label: "🎨 Mine" },
    { id: "auctions", label: "⏱️ Auctions" },
    { id: "analytics", label: "📊 Analytics" },
    { id: "activity", label: "⚡ Activity" },
    { id: "history", label: "📋 History" },
    ...(favs.length > 0 ? [{ id: "favorites", label: `❤️ Saved (${favs.length})` }] : []),
    ...(isAdmin ? [{ id: "admin", label: "⚙️ Admin" }] : []),
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Background effects */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(0,255,204,0.06) 0%, transparent 70%)", borderRadius: "50%", top: "-200px", left: "-200px", animation: "bgGrad 8s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)", borderRadius: "50%", bottom: "-150px", right: "-150px", animation: "bgGrad 10s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(240,89,160,0.04) 0%, transparent 70%)", borderRadius: "50%", top: "40%", left: "50%", animation: "bgGrad 12s ease-in-out infinite" }} />
        <div className="grid-bg" />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          <span style={{ fontSize: "18px" }}>{toast.type === "success" ? "✨" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
          <p style={{ margin: 0 }}>{toast.msg}</p>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", color: "var(--txt3)", cursor: "pointer", marginLeft: "auto", fontSize: "16px" }}>✕</button>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1600px", margin: "0 auto", padding: "32px 20px" }}>

        {/* ── HEADER ── */}
        <header style={{ marginBottom: "44px" }} className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", flexWrap: "wrap", marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <ThirdEye />
              <div>
                <h1 style={{ fontSize: "42px", background: "linear-gradient(135deg, var(--p), var(--acc), var(--sec))", backgroundSize: "200% 200%", backgroundClip: "text", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: "2px", animation: "gradShift 5s ease-in-out infinite" }}>
                  NFTverse
                </h1>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <p style={{ color: "var(--txt2)", fontSize: "11px", fontWeight: 700, letterSpacing: "3px", margin: 0, textTransform: "uppercase" }}>Premium Marketplace</p>
                  <span style={{ width: "6px", height: "6px", background: "var(--success)", borderRadius: "50%", boxShadow: "0 0 8px var(--success)", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "11px", color: "var(--success)", fontWeight: 600 }}>Live</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
              {wallet ? (
                <>
                  <div style={{ padding: "10px 16px", background: "var(--card)", border: "1.5px solid var(--border2)", borderRadius: "10px", fontFamily: "var(--mono)", fontSize: "13px", color: "var(--p)", fontWeight: 700, animation: "neonPulse 3s ease-in-out infinite", cursor: "pointer" }} onClick={() => setShowProfileModal(true)} title="View profile">
                    <span style={{ width: "7px", height: "7px", background: "var(--success)", borderRadius: "50%", display: "inline-block", marginRight: "8px", boxShadow: "0 0 6px var(--success)" }} />
                    {wallet.account.slice(0, 6)}…{wallet.account.slice(-4)}
                  </div>
                  <button onClick={() => { loadNFTs(); if (wallet) { loadMyNFTs(wallet); loadBalance(wallet); } }} className="btn btn-sec" style={{ fontSize: "13px" }} disabled={loading}>
                    {loading ? <><span className="wave-bar" /><span className="wave-bar" /><span className="wave-bar" /><span className="wave-bar" /></> : "🔄"}
                  </button>
                  <button onClick={() => setWallet(null)} className="btn btn-ghost" style={{ fontSize: "13px" }}>✕</button>
                </>
              ) : (
                /* FIX: wrap wallet buttons in a div with proper class for mobile */
                <div className="wallet-btn-row" style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                  <PremiumWalletButtons
                    loading={loading}
                    onMetaMaskClick={async () => {
                      try {
                        const data = await connectInjectedWallet();
                        setWallet(data);
                        await Promise.all([loadNFTs(), loadMyNFTs(data), loadBalance(data), checkAdmin(data)]);
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const contractInst = new ethers.Contract(contractAddress, contractABI, provider);
                        setupEventListeners(provider, contractInst, data.account);
                        showToast("✨ Wallet connected!", "success");
                      } catch (err) {
                        showToast("Connect failed: " + err.message, "error");
                      }
                    }}
                    onWalletConnectClick={async () => {
                      try {
                        const data = await connectWalletConnect();
                        setWallet(data);
                        await Promise.all([loadNFTs(), loadMyNFTs(data), loadBalance(data), checkAdmin(data)]);
                        const provider = new ethers.BrowserProvider(window.ethereum);
                        const contractInst = new ethers.Contract(contractAddress, contractABI, provider);
                        setupEventListeners(provider, contractInst, data.account);
                        showToast("✨ Wallet connected!", "success");
                      } catch (err) {
                        showToast("Connect failed: " + err.message, "error");
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Stats row — FIX: use .stats-grid class instead of inline grid-template-columns */}
          <div className="stats-grid">
            {[
              { label: "Total NFTs", value: stats.total, icon: "🎨", color: "var(--p)", delay: 0 },
              { label: "For Sale", value: stats.listed, icon: "🏷️", color: "#10b981", delay: 0.07 },
              { label: "Auctions", value: stats.auctions, icon: "⏱️", color: "var(--warn)", delay: 0.14 },
              { label: "My Collection", value: stats.myNFTs, icon: "✨", color: "#a78bfa", delay: 0.21 },
              { label: "Favorites", value: favs.length, icon: "❤️", color: "var(--acc)", delay: 0.28 },
            ].map((s) => (
              <div key={s.label} className="stat-card" style={{ animationDelay: `${s.delay}s` }}>
                <div style={{ fontSize: "22px", marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontSize: "26px", fontWeight: 900, color: s.color, marginBottom: "3px", fontFamily: "var(--mono)" }}>{s.value}</div>
                <div style={{ fontSize: "11px", color: "var(--txt2)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Balance bar */}
        {wallet && (
          <div className="card" style={{ marginBottom: "36px", background: "linear-gradient(135deg, rgba(0,255,204,0.07), rgba(124,58,237,0.07))", borderTop: "2px solid var(--p)", borderColor: "var(--border2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
              <div>
                <p style={{ fontSize: "11px", color: "var(--txt2)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>Available Balance</p>
                <h3 style={{ fontSize: "28px", color: "var(--p)", margin: 0, fontFamily: "var(--mono)", fontWeight: 900 }}>{parseFloat(userBalance).toFixed(4)} ETH</h3>
              </div>
              <button onClick={withdrawBalance} disabled={loading || parseFloat(userBalance) === 0} className="btn btn-p">💸 Withdraw</button>
            </div>
          </div>
        )}

        {/* Tabs — FIX: use .tab-bar class for mobile scroll */}
        <div className="tab-bar">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}>{tab.label}</button>
          ))}
        </div>

        {/* ══════════════════════════════════════════
            MARKETPLACE TAB
        ══════════════════════════════════════════ */}
        {activeTab === "marketplace" && (
          <div className="fade-up">
            <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap", alignItems: "center" }}>
              <input type="text" placeholder="🔍 Search NFTs…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: "1", minWidth: "200px", maxWidth: "360px" }} />
              <select value={filter} onChange={e => setFilter(e.target.value)} style={{ width: "auto", minWidth: "140px" }}>
                <option value="all">All NFTs</option>
                <option value="listed">For Sale</option>
                <option value="auction">Auctions</option>
                <option value="offer">Has Offer</option>
                <option value="favorites">Favorites</option>
              </select>
              <select value={sort} onChange={e => setSort(e.target.value)} style={{ width: "auto", minWidth: "160px" }}>
                <option value="recent">Newest First</option>
                <option value="price-low">Price: Low→High</option>
                <option value="price-high">Price: High→Low</option>
                <option value="rarity">By Rarity</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "22px" }}>
              {initialLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredNFTs.length === 0 ? (
                <div style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state">
                    <div className="e-icon">🔍</div>
                    <h3>No NFTs Found</h3>
                    <p>Try adjusting your search or filters</p>
                  </div>
                </div>
              ) : (
                filteredNFTs.map((nft, i) => (
                  <div key={nft.id} style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}>
                    <NFTCard
                      nft={nft} wallet={wallet} favs={favs} onFav={toggleFav}
                      onBuyClick={() => buyNFT(nft)}
                      onListClick={() => { setSelectedNFT(nft); setShowListModal(true); }}
                      onAuctionClick={() => { setSelectedNFT(nft); setAuctionForm({ duration: "86400", startPrice: "" }); setShowAuctionModal(true); }}
                      onOfferClick={() => { setSelectedNFT(nft); setOfferMode("offer"); setShowOfferModal(true); }}
                      onBidClick={() => { setSelectedNFT(nft); setOfferMode("bid"); setShowOfferModal(true); }}
                      onCancelListingClick={() => cancelListing(nft)}
                      onAcceptOfferClick={() => acceptOffer(nft)}
                      onCancelOfferClick={() => cancelOffer(nft)}
                      onCancelAuctionClick={() => cancelAuction(nft)}
                      onEndAuctionClick={() => endAuction(nft)}
                      onViewTraits={() => { setSelectedNFT(nft); setShowTraitsModal(true); }}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            COLLECTION TAB
        ══════════════════════════════════════════ */}
        {activeTab === "collection" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "14px" }}>
              <h2 style={{ fontSize: "28px", margin: 0 }}>Your Collection</h2>
              <button onClick={() => { if (!wallet) return; setShowMintModal(true); }} className="btn btn-p" disabled={!wallet}>✨ Mint New NFT</button>
            </div>
            {!wallet ? (
              <div className="empty-state card">
                <div className="e-icon">🔌</div>
                <h3>Connect your wallet</h3>
                <p>Connect your wallet to see your NFTs</p>
                <button onClick={handleConnect} className="btn btn-p" style={{ marginTop: "8px" }}>Connect Wallet</button>
              </div>
            ) : myNFTs.length === 0 ? (
              <div className="empty-state card">
                <div className="e-icon">🖼️</div>
                <h3>No NFTs yet</h3>
                <p>Mint your first NFT to get started</p>
                <button onClick={() => setShowMintModal(true)} className="btn btn-p" style={{ marginTop: "8px" }}>Create First NFT</button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "22px" }}>
                {myNFTs.map((nft, i) => {
                  const rarity = computeRarity(nft);
                  const isListed = nft.listing?.active && Number(nft.listing?.price) > 0;
                  const isAuction = nft.auction?.active;
                  const auctionEnded = nft.auction?.endTime && Date.now() / 1000 >= nft.auction.endTime;
                  const noBids = !nft.auction?.highestBidder || nft.auction?.highestBidder === "0x0000000000000000000000000000000000000000";
                  return (
                    <div key={nft.id} className="card-3d-wrapper">
                      <div className={`nft-card ${isAuction && !auctionEnded ? 'auction-card-active' : ''}`} style={{ animationDelay: `${i * 0.06}s` }}>
                        <div className="holo-overlay" />
                        <div className="glass-sheen" />
                        <div className="depth-3d" />
                        <div style={{ position: "relative" }}>
                          <NFTImage nft={nft} height={200} />
                          <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                            <div style={{ background: "rgba(6,9,18,0.85)", padding: "3px 9px", borderRadius: "7px", fontFamily: "var(--mono)", fontSize: "10px", color: "var(--p)", fontWeight: 700 }}>#{nft.id}</div>
                            <div style={{ background: "rgba(6,9,18,0.85)", padding: "3px 9px", borderRadius: "7px", fontSize: "10px", color: rarity.color, fontWeight: 700 }}>{rarity.icon} {rarity.label}</div>
                          </div>
                          <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                            {isAuction && !auctionEnded && <span className="badge badge-auction" style={{ fontSize: "10px" }}>⏱ Live</span>}
                            {isAuction && auctionEnded && <span className="badge badge-danger" style={{ fontSize: "10px" }}>🏁 Ended</span>}
                            {isListed && !isAuction && <span className="badge badge-success" style={{ fontSize: "10px" }}>Listed</span>}
                          </div>
                        </div>
                        <div className="nft-card-body">
                          <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>{nft.name}</h3>
                          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
                            <span className="badge badge-p" style={{ fontSize: "10px" }}>{nft.royalty}% Royalty</span>
                            {nft.attributes?.length > 0 && (
                              <button onClick={() => { setSelectedNFT(nft); setShowTraitsModal(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", color: "var(--txt2)", padding: "0 2px" }}>🔍 Traits</button>
                            )}
                          </div>
                          <div className="collection-action-area">
                            {isAuction && !auctionEnded && (
                              <>
                                <div className="collection-status-bar">
                                  <span>⏱️</span>
                                  <span>Auction live</span>
                                  <Countdown endTime={nft.auction.endTime} />
                                </div>
                                {noBids && <button onClick={() => cancelAuction(nft)} className="btn btn-danger" disabled={loading} style={{ fontSize: "12px" }}>✖ Cancel Auction</button>}
                              </>
                            )}
                            {isAuction && auctionEnded && (
                              <button onClick={() => endAuction(nft)} className="btn btn-p" disabled={loading} style={{ width: "100%", fontSize: "12px" }}>🏁 End & Settle</button>
                            )}
                            {!isAuction && !isListed && (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button onClick={() => { setSelectedNFT(nft); setShowListModal(true); }} className="btn btn-p" style={{ flex: 1, fontSize: "12px" }}>🏷️ List</button>
                                <button onClick={() => { setSelectedNFT(nft); setAuctionForm({ duration: "86400", startPrice: "" }); setShowAuctionModal(true); }} className="btn btn-auction" style={{ flex: 1, fontSize: "12px" }}>⏱️ Auction</button>
                              </div>
                            )}
                            {!isAuction && isListed && (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <div style={{ flex: 1, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "8px", padding: "7px 10px", fontSize: "11px", color: "var(--success)", fontWeight: 700, fontFamily: "var(--mono)", display: "flex", alignItems: "center", gap: "6px" }}>
                                  <span>💚</span>
                                  <span>{ethers.formatEther(nft.listing.price)} ETH</span>
                                </div>
                                <button onClick={() => cancelListing(nft)} className="btn btn-danger" disabled={loading} style={{ fontSize: "11px", padding: "8px" }}>✖ Cancel</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            AUCTIONS TAB
        ══════════════════════════════════════════ */}
        {activeTab === "auctions" && (
          <div className="fade-up">
            <h2 style={{ fontSize: "28px", marginBottom: "28px" }}>⏱️ Live Auctions</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
              {nfts.filter(n => n.auction.active).length === 0 ? (
                <div style={{ gridColumn: "1/-1" }}>
                  <div className="empty-state card">
                    <div className="e-icon">⏱️</div>
                    <h3>No active auctions</h3>
                    <p>Create an auction from your collection tab</p>
                  </div>
                </div>
              ) : (
                nfts.filter(n => n.auction.active).map((nft, i) => {
                  const auctionEnded = Date.now() / 1000 >= nft.auction.endTime;
                  const isAucSeller = nft.auction?.seller?.toLowerCase() === wallet?.account?.toLowerCase();
                  const noBids = !nft.auction?.highestBidder || nft.auction?.highestBidder === "0x0000000000000000000000000000000000000000";
                  const highestBidEth = Number(nft.auction.highestBid) > 0 ? parseFloat(ethers.formatEther(nft.auction.highestBid)) : 0;
                  const minBidEth = nft.auction?.startPrice && Number(nft.auction.startPrice) > 0 ? ethers.formatEther(nft.auction.startPrice) : null;
                  return (
                    <div key={nft.id} className="card-3d-wrapper">
                      <div className={`nft-card ${!auctionEnded ? 'auction-card-active' : ''}`} style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className="holo-overlay" />
                        <div className="glass-sheen" />
                        <div className="depth-3d" />
                        <NFTImage nft={nft} height={220} />
                        <div className="nft-card-body">
                          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px" }}>{nft.name}</h3>
                          <div className="auction-live-box" style={{ marginBottom: "14px" }}>
                            <div className="auction-info-row">
                              <span style={{ fontSize: "11px", color: "var(--txt2)" }}>Highest Bid</span>
                              <span style={{ fontSize: "20px", fontWeight: 900, color: "var(--warn)", fontFamily: "var(--mono)" }}>
                                {highestBidEth > 0 ? highestBidEth.toFixed(4) : "0"} ETH
                              </span>
                            </div>
                            {noBids && minBidEth && (
                              <div className="min-bid-row">
                                <span>⬇ Min Bid:</span>
                                <span>{minBidEth} ETH</span>
                              </div>
                            )}
                            {noBids && !minBidEth && (
                              <div style={{ fontSize: "10px", color: "var(--txt3)", padding: "4px 0" }}>No bids yet — be first!</div>
                            )}
                            {nft.auction.highestBidder && nft.auction.highestBidder !== "0x0000000000000000000000000000000000000000" && (
                              <div className="auction-info-row">
                                <span style={{ fontSize: "11px", color: "var(--txt3)" }}>Leading Bidder</span>
                                <span style={{ fontSize: "11px", color: "var(--txt2)", fontFamily: "var(--mono)" }}>{nft.auction.highestBidder.slice(0, 8)}…{nft.auction.highestBidder.slice(-4)}</span>
                              </div>
                            )}
                            <div className="auction-info-row">
                              <span style={{ fontSize: "11px", color: "var(--txt3)" }}>Time Left</span>
                              <Countdown endTime={nft.auction.endTime} />
                            </div>
                          </div>
                          {highestBidEth > 0 && (
                            <div style={{ marginBottom: "12px" }}>
                              <div className="prog-track">
                                <div className="prog-fill" style={{ width: "100%", background: "linear-gradient(90deg,#f59e0b,#d97706)" }} />
                              </div>
                              <div style={{ fontSize: "10px", color: "var(--txt3)", marginTop: "4px", textAlign: "right" }}>Active bids</div>
                            </div>
                          )}
                          {!auctionEnded && !isAucSeller && (
                            <button onClick={() => { setSelectedNFT(nft); setOfferMode("bid"); setShowOfferModal(true); }} className="btn btn-auction" style={{ width: "100%", marginBottom: "8px" }}>
                              🔨 Place Bid{minBidEth && noBids ? ` (min ${minBidEth} ETH)` : ""}
                            </button>
                          )}
                          {isAucSeller && noBids && !auctionEnded && (
                            <button onClick={() => cancelAuction(nft)} disabled={loading} className="btn btn-danger" style={{ width: "100%" }}>✖ Cancel Auction</button>
                          )}
                          {isAucSeller && auctionEnded && (
                            <button onClick={() => endAuction(nft)} disabled={loading} className="btn btn-p" style={{ width: "100%" }}>🏁 End & Settle</button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            ANALYTICS TAB
        ══════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="fade-up">
            <h2 style={{ fontSize: "28px", marginBottom: "28px" }}>📊 Analytics Dashboard</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px", marginBottom: "28px" }}>
              {[
                { label: "Total Volume", value: analytics.totalVolume.toFixed(3) + " ETH", icon: "💎", color: "var(--p)" },
                { label: "Floor Price", value: analytics.floorPrice.toFixed(3) + " ETH", icon: "📉", color: "#10b981" },
                { label: "Highest Sale", value: analytics.highestSale.toFixed(3) + " ETH", icon: "🏆", color: "var(--warn)" },
                { label: "Active Listings", value: stats.listed, icon: "🏷️", color: "var(--acc)" },
                { label: "Active Auctions", value: stats.auctions, icon: "⏱️", color: "#a78bfa" },
                { label: "Total NFTs", value: stats.total, icon: "🎨", color: "var(--txt)" },
              ].map((s, idx) => (
                <div key={s.label} className="card" style={{ textAlign: "center", animationDelay: `${idx * 0.07}s` }}>
                  <div style={{ fontSize: "26px", marginBottom: "10px" }}>{s.icon}</div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: s.color, fontFamily: "var(--mono)", marginBottom: "4px" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "var(--txt2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", marginBottom: "20px" }}>Rarity Distribution</h3>
              {[
                { label: "Legendary 👑", color: "#fbbf24", count: nfts.filter(n => computeRarity(n).label === "Legendary").length },
                { label: "Epic 💎", color: "#a855f7", count: nfts.filter(n => computeRarity(n).label === "Epic").length },
                { label: "Rare ⚡", color: "#3b82f6", count: nfts.filter(n => computeRarity(n).label === "Rare").length },
                { label: "Common 🔹", color: "#6b7280", count: nfts.filter(n => computeRarity(n).label === "Common").length },
              ].map(r => (
                <div key={r.label} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{r.label}</span>
                    <span style={{ fontSize: "12px", color: "var(--txt2)", fontFamily: "var(--mono)" }}>{r.count} / {nfts.length}</span>
                  </div>
                  <div className="prog-track">
                    <div className="prog-fill" style={{ width: nfts.length ? `${(r.count / nfts.length) * 100}%` : "0%", background: `linear-gradient(90deg, ${r.color}, ${r.color}88)` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Weekly Activity Trend</h3>
              <MiniChart data={STABLE_CHART_DATA} color="var(--p)" />
              <div style={{ marginTop: "10px", fontSize: "11px", color: "var(--txt3)", textAlign: "right" }}>Based on session data</div>
            </div>
            {txHistory.length > 0 && (
              <div className="card" style={{ marginTop: "20px" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "16px" }}>Transaction Types</h3>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {Object.entries(txHistory.reduce((acc, t) => { acc[t.type] = (acc[t.type] || 0) + 1; return acc; }, {})).map(([type, count]) => {
                    const def = ACTIVITY_TYPES[type] || ACTIVITY_TYPES.mint;
                    return (
                      <div key={type} style={{ background: "var(--card2)", border: "1px solid var(--border)", borderRadius: "10px", padding: "12px 18px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "18px" }}>{def.icon}</span>
                        <div>
                          <div style={{ fontSize: "18px", fontWeight: 900, color: def.color, fontFamily: "var(--mono)" }}>{count}</div>
                          <div style={{ fontSize: "10px", color: "var(--txt2)", textTransform: "uppercase" }}>{def.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            ACTIVITY FEED TAB
        ══════════════════════════════════════════ */}
        {activeTab === "activity" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ fontSize: "28px", margin: 0 }}>⚡ Live Activity</h2>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ width: "8px", height: "8px", background: "var(--success)", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                  <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 700 }}>Real-time</span>
                </div>
                {activityFeed.length > 0 && (
                  <button onClick={() => { if (window.confirm("Clear all activity?")) setActivityFeed([]); }} className="btn btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>🗑 Clear</button>
                )}
              </div>
            </div>
            {activityFeed.length === 0 ? (
              <div className="empty-state card">
                <div className="e-icon">⚡</div>
                <h3>No activity yet</h3>
                <p>Activity from mints, sales, bids, and listings will appear here</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activityFeed.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: `${item.def.color}22`, border: `1px solid ${item.def.color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                      {item.def.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, color: item.def.color, fontSize: "13px" }}>{item.def.label}</span>
                        <span style={{ color: "var(--txt)", fontWeight: 600, fontSize: "13px" }}>{item.nftName}</span>
                        {item.amount && <span style={{ fontSize: "12px", color: "var(--p)", fontFamily: "var(--mono)", fontWeight: 700 }}>{item.amount}</span>}
                      </div>
                      <div style={{ display: "flex", gap: "12px", marginTop: "3px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "11px", color: "var(--txt3)", fontFamily: "var(--mono)" }}>{item.address}</span>
                        <span style={{ fontSize: "11px", color: "var(--txt3)" }}>{item.ts}</span>
                      </div>
                    </div>
                    <span className="badge badge-muted" style={{ fontSize: "10px", flexShrink: 0 }}>#{item.nftId || "—"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            HISTORY TAB
        ══════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
              <h2 style={{ fontSize: "28px", margin: 0 }}>📋 Transaction History</h2>
              {txHistory.length > 0 && (
                <button onClick={() => { if (window.confirm("Clear all history?")) setTxHistory([]); }} className="btn btn-ghost" style={{ fontSize: "12px", padding: "6px 12px" }}>🗑 Clear</button>
              )}
            </div>
            {txHistory.length === 0 ? (
              <div className="empty-state card">
                <div className="e-icon">📋</div>
                <h3>No transactions yet</h3>
                <p>Your transaction history will appear here after minting, buying, selling or bidding</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {txHistory.map((tx) => {
                  const def = ACTIVITY_TYPES[tx.type] || ACTIVITY_TYPES.mint;
                  return (
                    <div key={tx.id} className="tx-row">
                      <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: `${def.color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                        {def.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: def.color }}>{def.label}</span>
                          <span style={{ color: "var(--txt)" }}>{tx.nftName}</span>
                          {tx.amount && <span style={{ fontSize: "12px", color: "var(--p)", fontFamily: "var(--mono)", fontWeight: 700 }}>{tx.amount}</span>}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--txt3)", marginTop: "2px" }}>{tx.ts}</div>
                      </div>
                      {tx.txHash && (
                        <a href={`https://etherscan.io/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer"
                          style={{ color: "var(--p)", fontSize: "11px", textDecoration: "none", fontFamily: "var(--mono)", flexShrink: 0, border: "1px solid rgba(0,255,204,0.2)", padding: "4px 8px", borderRadius: "6px", transition: "all 0.2s" }}
                          onMouseEnter={e => e.target.style.background = "rgba(0,255,204,0.08)"}
                          onMouseLeave={e => e.target.style.background = "transparent"}
                        >
                          ↗ View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            FAVORITES TAB
        ══════════════════════════════════════════ */}
        {activeTab === "favorites" && (
          <div className="fade-up">
            <h2 style={{ fontSize: "28px", marginBottom: "28px" }}>❤️ Saved NFTs</h2>
            {favs.length === 0 ? (
              <div className="empty-state card">
                <div className="e-icon">❤️</div>
                <h3>No favorites yet</h3>
                <p>Heart any NFT to save it here</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "22px" }}>
                {nfts.filter(n => favs.includes(n.id)).map((nft, i) => (
                  <div key={nft.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <NFTCard
                      nft={nft} wallet={wallet} favs={favs} onFav={toggleFav}
                      onBuyClick={() => buyNFT(nft)}
                      onListClick={() => { setSelectedNFT(nft); setShowListModal(true); }}
                      onAuctionClick={() => { setSelectedNFT(nft); setAuctionForm({ duration: "86400", startPrice: "" }); setShowAuctionModal(true); }}
                      onOfferClick={() => { setSelectedNFT(nft); setOfferMode("offer"); setShowOfferModal(true); }}
                      onBidClick={() => { setSelectedNFT(nft); setOfferMode("bid"); setShowOfferModal(true); }}
                      onCancelListingClick={() => cancelListing(nft)}
                      onAcceptOfferClick={() => acceptOffer(nft)}
                      onCancelOfferClick={() => cancelOffer(nft)}
                      onCancelAuctionClick={() => cancelAuction(nft)}
                      onEndAuctionClick={() => endAuction(nft)}
                      onViewTraits={() => { setSelectedNFT(nft); setShowTraitsModal(true); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════
            ADMIN TAB
        ══════════════════════════════════════════ */}
        {activeTab === "admin" && isAdmin && (
          <div className="fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
              <h2 style={{ fontSize: "28px", margin: 0 }}>⚙️ Admin Panel</h2>
              <span className="badge badge-danger">Admin Only</span>
            </div>
            <div className="admin-grid">
              <div className="admin-card">
                <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>🔒 Contract Controls</h3>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={pauseContract} disabled={loading} className="btn btn-danger" style={{ flex: 1 }}>⏸ Pause</button>
                  <button onClick={unpauseContract} disabled={loading} className="btn btn-p" style={{ flex: 1 }}>▶ Unpause</button>
                </div>
              </div>
              <div className="admin-card">
                <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>🚫 Ban NFT</h3>
                <input type="number" placeholder="Token ID" value={adminForm.nftId} onChange={e => setAdminForm(p => ({ ...p, nftId: e.target.value }))} style={{ marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => banNFTId(adminForm.nftId)} disabled={loading || !adminForm.nftId} className="btn btn-danger" style={{ flex: 1 }}>Ban</button>
                  <button onClick={() => unbanNFTId(adminForm.nftId)} disabled={loading || !adminForm.nftId} className="btn btn-p" style={{ flex: 1 }}>Unban</button>
                </div>
              </div>
              <div className="admin-card">
                <h3 style={{ marginBottom: "16px", fontSize: "16px" }}>👤 Ban User</h3>
                <input type="text" placeholder="0x address" value={adminForm.userAddress} onChange={e => setAdminForm(p => ({ ...p, userAddress: e.target.value }))} style={{ marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => banUserAddress(adminForm.userAddress)} disabled={loading || !adminForm.userAddress} className="btn btn-danger" style={{ flex: 1 }}>Ban</button>
                  <button onClick={() => unbanUserAddress(adminForm.userAddress)} disabled={loading || !adminForm.userAddress} className="btn btn-p" style={{ flex: 1 }}>Unban</button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ══════════════════════════════════════════
          MINT MODAL
      ══════════════════════════════════════════ */}
      {showMintModal && (
        <div className="modal-overlay" onClick={() => setShowMintModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>✨ Mint New NFT</h2>
              <button onClick={() => setShowMintModal(false)} style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Name *</label>
              <input type="text" placeholder="My Awesome NFT" value={mintForm.title} onChange={e => setMintForm({ ...mintForm, title: e.target.value })} />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</label>
              <textarea placeholder="Describe your NFT…" rows={3} value={mintForm.description} onChange={e => setMintForm({ ...mintForm, description: e.target.value })} style={{ resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Image *</label>
              <input type="file" accept="image/*" onChange={e => {
                const file = e.target.files[0];
                if (!file) return;
                const preview = URL.createObjectURL(file);
                setMintForm({ ...mintForm, file, preview });
              }} />
              {mintForm.preview && (
                <div style={{ marginTop: "12px", borderRadius: "10px", overflow: "hidden", height: "180px" }}>
                  <img src={mintForm.preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowMintModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={mintNFT} disabled={loading || !mintForm.file || !mintForm.title.trim()} className="btn btn-p" style={{ flex: 1 }}>
                {loading ? <><span className="wave-bar" /><span className="wave-bar" /><span className="wave-bar" /></> : "🚀 Mint NFT"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          LIST MODAL
      ══════════════════════════════════════════ */}
      {showListModal && selectedNFT && (
        <div className="modal-overlay" onClick={() => { setShowListModal(false); setGasEstimate(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>🏷️ List NFT</h2>
              <button onClick={() => { setShowListModal(false); setGasEstimate(null); }} style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ background: "rgba(0,255,204,0.07)", padding: "14px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(0,255,204,0.15)" }}>
              <div style={{ fontSize: "11px", color: "var(--txt2)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>NFT</div>
              <div style={{ fontSize: "17px", fontWeight: 700 }}>{selectedNFT.name}</div>
            </div>
            <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Price (ETH)</label>
            <input type="number" placeholder="0.1" step="0.001" min="0.001" value={listForm.price} onChange={e => { setListForm({ ...listForm, price: e.target.value }); if (e.target.value) estimateForAction("list", selectedNFT, e.target.value); }} style={{ marginBottom: "14px" }} />
            {gasLoading && <div className="gas-box"><span>⛽</span><span style={{ color: "var(--txt2)" }}>Estimating gas…</span></div>}
            {gasEstimate && !gasLoading && <GasBox estimate={gasEstimate} />}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setShowListModal(false); setGasEstimate(null); }} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={listNFT} disabled={loading || !listForm.price} className="btn btn-p" style={{ flex: 1 }}>
                {loading ? "Listing…" : "🏷️ List NFT"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          AUCTION MODAL
      ══════════════════════════════════════════ */}
      {showAuctionModal && selectedNFT && (
        <div className="modal-overlay" onClick={() => setShowAuctionModal(false)}>
          <div className="modal modal-auction" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>⏱️ Create Auction</h2>
              <button onClick={() => setShowAuctionModal(false)} style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ background: "rgba(245,158,11,0.07)", padding: "14px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div style={{ fontSize: "11px", color: "var(--txt2)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>NFT</div>
              <div style={{ fontSize: "17px", fontWeight: 700 }}>{selectedNFT.name}</div>
            </div>
            <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Duration</label>
            <select value={auctionForm.duration} onChange={e => setAuctionForm({ ...auctionForm, duration: e.target.value })} style={{ marginBottom: "16px" }}>
              <option value="3600">1 Hour</option>
              <option value="21600">6 Hours</option>
              <option value="43200">12 Hours</option>
              <option value="86400">24 Hours</option>
              <option value="172800">2 Days</option>
              <option value="604800">7 Days</option>
            </select>
            <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Minimum Bid (ETH) <span style={{ color: "var(--txt3)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— optional</span>
            </label>
            <input type="number" placeholder="0.01" step="0.001" min="0" value={auctionForm.startPrice} onChange={e => setAuctionForm({ ...auctionForm, startPrice: e.target.value })} style={{ marginBottom: "6px" }} />
            {auctionForm.startPrice && parseFloat(auctionForm.startPrice) > 0 && (
              <div className="start-price-badge" style={{ marginBottom: "16px" }}>
                <span>🎯</span>
                <span>Min bid set to {auctionForm.startPrice} ETH — will be visible to bidders</span>
              </div>
            )}
            {(!auctionForm.startPrice || parseFloat(auctionForm.startPrice) === 0) && (
              <div style={{ fontSize: "11px", color: "var(--txt3)", marginBottom: "16px", padding: "6px 0" }}>No minimum bid — anyone can bid any amount</div>
            )}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowAuctionModal(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={createAuction} disabled={loading} className="btn btn-auction" style={{ flex: 1 }}>
                {loading ? <><span className="spin" style={{ fontSize: "14px" }}>⏳</span> Creating…</> : "⏱️ Start Auction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          OFFER / BID MODAL
      ══════════════════════════════════════════ */}
      {showOfferModal && selectedNFT && (
        <div className="modal-overlay" onClick={() => { setShowOfferModal(false); setGasEstimate(null); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>{offerMode === "bid" ? "🔨 Place Bid" : "💰 Make Offer"}</h2>
              <button onClick={() => { setShowOfferModal(false); setGasEstimate(null); }} style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ background: "rgba(0,255,204,0.07)", padding: "14px", borderRadius: "10px", marginBottom: "20px", border: "1px solid rgba(0,255,204,0.15)" }}>
              <div style={{ fontSize: "11px", color: "var(--txt2)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>NFT</div>
              <div style={{ fontSize: "17px", fontWeight: 700 }}>{selectedNFT.name}</div>
              {offerMode === "bid" && selectedNFT.auction && (() => {
                const noBids = !selectedNFT.auction.highestBidder || selectedNFT.auction.highestBidder === "0x0000000000000000000000000000000000000000";
                const hasHighBid = Number(selectedNFT.auction.highestBid) > 0;
                const hasStartPrice = selectedNFT.auction.startPrice && Number(selectedNFT.auction.startPrice) > 0;
                return (
                  <>
                    {hasHighBid && <div style={{ fontSize: "12px", color: "var(--warn)", marginTop: "8px", fontFamily: "var(--mono)", fontWeight: 700 }}>Current highest: {ethers.formatEther(selectedNFT.auction.highestBid)} ETH — your bid must exceed this</div>}
                    {noBids && hasStartPrice && <div className="min-bid-row" style={{ marginTop: "8px" }}><span>⬇ Min Bid:</span><span>{ethers.formatEther(selectedNFT.auction.startPrice)} ETH</span></div>}
                    {noBids && !hasStartPrice && <div style={{ fontSize: "12px", color: "var(--txt3)", marginTop: "8px" }}>No minimum bid — any amount accepted</div>}
                  </>
                );
              })()}
            </div>
            <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Amount (ETH)</label>
            <input type="number" placeholder="0.00" step="0.001" value={offerForm.amount} onChange={e => { setOfferForm({ ...offerForm, amount: e.target.value }); if (e.target.value) estimateForAction(offerMode, selectedNFT, e.target.value); }} style={{ marginBottom: "14px" }} />
            {offerMode === "offer" && (
              <>
                <label style={{ fontSize: "12px", color: "var(--txt2)", display: "block", marginBottom: "8px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Offer Valid For (Days)</label>
                <input type="number" placeholder="7" min="1" max="365" value={offerForm.expiryDays} onChange={e => setOfferForm({ ...offerForm, expiryDays: e.target.value })} style={{ marginBottom: "14px" }} />
              </>
            )}
            {gasLoading && <div className="gas-box"><span>⛽</span><span style={{ color: "var(--txt2)" }}>Estimating gas…</span></div>}
            {gasEstimate && !gasLoading && <GasBox estimate={gasEstimate} />}
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setShowOfferModal(false); setOfferForm({ amount: "", expiryDays: "7" }); setGasEstimate(null); }} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={offerMode === "bid" ? placeBid : makeOffer} disabled={loading || !offerForm.amount} className={offerMode === "bid" ? "btn btn-auction" : "btn btn-p"} style={{ flex: 1 }}>
                {loading ? "Processing…" : offerMode === "bid" ? "🔨 Place Bid" : "💰 Make Offer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          TRAITS MODAL
      ══════════════════════════════════════════ */}
      {showTraitsModal && selectedNFT && (
        <div className="modal-overlay" onClick={() => setShowTraitsModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>🔍 NFT Details</h2>
              <button onClick={() => setShowTraitsModal(false)} style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ borderRadius: "12px", overflow: "hidden", marginBottom: "20px", height: "200px" }}>
              <NFTImage nft={selectedNFT} height={200} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
              {[
                { label: "Token ID", value: `#${selectedNFT.id}` },
                { label: "Royalty", value: `${((selectedNFT.royalty ?? 0) / 100).toFixed(1)}%` },
                { label: "Rarity", value: `${computeRarity(selectedNFT).icon} ${computeRarity(selectedNFT).label}` },
                { label: "Owner", value: selectedNFT.owner ? `${selectedNFT.owner.slice(0, 8)}…` : "—" },
              ].map(info => (
                <div key={info.label} style={{ background: "rgba(30,40,64,0.8)", padding: "12px 14px", borderRadius: "10px", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "10px", color: "var(--txt3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>{info.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--txt)", fontFamily: "var(--mono)" }}>{info.value}</div>
                </div>
              ))}
            </div>
            {selectedNFT.attributes?.length > 0 ? (
              <>
                <h3 style={{ fontSize: "14px", marginBottom: "12px", color: "var(--txt2)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Traits</h3>
                <div className="traits-grid">
                  {selectedNFT.attributes.map((attr, i) => (
                    <div key={i} className="trait-chip">
                      <div className="t-type">{attr.trait_type || "Trait"}</div>
                      <div className="t-val">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: "var(--txt3)", fontSize: "13px" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
                No traits metadata found for this NFT
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          PROFILE MODAL
      ══════════════════════════════════════════ */}
      {showProfileModal && wallet && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "22px", margin: 0 }}>👤 Profile</h2>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: "20px" }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", padding: "18px", background: "rgba(0,255,204,0.05)", borderRadius: "12px", border: "1px solid var(--border2)" }}>
              <div className="profile-avatar">{wallet.account.slice(2, 4).toUpperCase()}</div>
              <div>
                <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "4px" }}>Collector</div>
                <div style={{ fontSize: "12px", color: "var(--txt2)", fontFamily: "var(--mono)" }}>{wallet.account.slice(0, 10)}…{wallet.account.slice(-6)}</div>
                {isAdmin && <div className="badge badge-p" style={{ marginTop: "6px" }}>Admin</div>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "NFTs Owned", value: myNFTs.length, icon: "🎨" },
                { label: "Listed", value: myNFTs.filter(n => n.listing?.active).length, icon: "🏷️" },
                { label: "Favorites", value: favs.length, icon: "❤️" },
              ].map(s => (
                <div key={s.label} style={{ background: "var(--card2)", borderRadius: "10px", padding: "14px", textAlign: "center", border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{s.icon}</div>
                  <div style={{ fontSize: "20px", fontWeight: 900, color: "var(--p)", fontFamily: "var(--mono)" }}>{s.value}</div>
                  <div style={{ fontSize: "10px", color: "var(--txt2)", marginTop: "2px" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "var(--card2)", borderRadius: "10px", padding: "14px 18px", border: "1px solid var(--border)", marginBottom: "20px" }}>
              <div style={{ fontSize: "11px", color: "var(--txt2)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Balance</div>
              <div style={{ fontSize: "22px", fontWeight: 900, color: "var(--p)", fontFamily: "var(--mono)" }}>{parseFloat(userBalance).toFixed(4)} ETH</div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => { setShowProfileModal(false); withdrawBalance(); }} disabled={loading || parseFloat(userBalance) === 0} className="btn btn-p" style={{ flex: 1 }}>💸 Withdraw</button>
              <button onClick={() => { setShowProfileModal(false); setWallet(null); }} className="btn btn-ghost" style={{ flex: 1 }}>Disconnect</button>
            </div>
          </div>
        </div>
      )}
      <Analytics />
    </div>
  );
}