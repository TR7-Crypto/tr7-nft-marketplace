import logo from "./logo.png";
import "./App.css";

import { ethers } from "ethers";
import { useState } from "react";
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";

import Navigation from "./Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import Home from "./Home";
import Create from "./Create";
import MyListedItems from "./MyListedItems";
import MyPurchases from "./MyPurchases";

function App() {
  const [loading, $loading] = useState(true);
  const [account, $account] = useState(null);
  const [marketplace, $marketplace] = useState({});
  const [nft, $nft] = useState({});
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    $account(accounts[0]);
    // Get provider from MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();
    loadContracts(signer);
    $loading(false);
  };
  const loadContracts = async (signer) => {
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    $marketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    $nft(nft);
  };
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minHeight: "80vh",
            }}
          >
            <Spinner animation="border" style={{ display: "flex" }} />
            <p className="mx-3 my-0">Awaiting Metamask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/create"
              element={<Create marketplace={marketplace} nft={nft} />}
            />
            <Route
              path="/my-listed-items"
              element={
                <MyListedItems
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
            <Route
              path="/my-purchases"
              element={
                <MyPurchases
                  marketplace={marketplace}
                  nft={nft}
                  account={account}
                />
              }
            />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
