import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  initializeUmi,
  mintRandomBeast,
  fetchUserNFTs,
} from "./MintingService";
import "./App.css";
import logo from "./assets/images/logo.png";
import beastpod from "./assets/images/beastpod.png";

function App() {
  const wallet = useWallet();
  const [umi, setUmi] = useState(null);
  const [error, setError] = useState(null);
  const [userNFTs, setUserNFTs] = useState([]);

  useEffect(() => {
    if (wallet.publicKey) {
      const umiInstance = initializeUmi(wallet);
      setUmi(umiInstance);
    }
  }, [wallet.publicKey]);

  useEffect(() => {
    if (umi && wallet.publicKey) {
      fetchUserNFTs(umi, wallet.publicKey.toString())
        .then(setUserNFTs)
        .catch((error) => console.error("Error fetching user NFTs:", error));
    }
  }, [umi, wallet.publicKey]);

  const handleMintBeast = async () => {
    if (!umi || !wallet.publicKey) {
      setError("UMI not initialized or wallet not connected.");
      return;
    }

    try {
      const { assetId, randomBeastNumber } = await mintRandomBeast(
        umi,
        wallet.publicKey
      );
      alert(`Beast #${randomBeastNumber} minted successfully!`);
      // Refresh the user's NFTs after minting
      const updatedNFTs = await fetchUserNFTs(umi, wallet.publicKey.toString());
      setUserNFTs(updatedNFTs);
    } catch (error) {
      console.error("Error minting beast:", error);
      setError(error.message);
    }
  };

  return (
    <div className="App">
      <nav className="navbar">
        <img src={logo} alt="Logo" className="logo" />
        <div className="menu-links">
          <a href="#home">Home</a>
          <a href="#mint" className="active">
            Mint
          </a>
          <a href="#play">Play</a>
        </div>
        <WalletMultiButton />
      </nav>
      <div className="container">
        <div className="mint-section">
          <div className="inner-container">
            <img src={beastpod} alt="Beastpod" className="beastpod-img" />
            <p className="mint-text">Mint a Beast!</p>
            <button
              onClick={handleMintBeast}
              disabled={!umi || !wallet.publicKey}
            >
              Mint
            </button>
          </div>
        </div>
        <div className="inventory-section">
          {!wallet.publicKey ? (
            <div id="wallet-message">
              <h2>Please Connect Your Wallet</h2>
              <WalletMultiButton />
            </div>
          ) : (
            <div className="beast-list">
              <h2>Your Beasts</h2>
              {userNFTs.map((nft) => (
                <div key={nft.id} className="beast-item">
                  <img src={nft.metadata.image} alt={nft.metadata.name} />
                  <p>{nft.metadata.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
