import React from "react";
import logo from "./logo.png";
import "./App.css";

import { ethers } from "ethers";
import { useState } from "react";
import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAddress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/LazyNFT.json";
import NFTAddress from "../contractsData/LazyNFT-address.json";

import Navigation from "./Navbar";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import LazyHome from "./LazyHome";
import LazyCreate from "./LazyCreate";
import LazyMyNFT from "./LazyMyNFTs";
import LazyListingNFTItem from "./LazyListingNFTItem";
import MyPurchases from "./MyPurchases";
import { HomePageSlag } from "./Home";
import NFTItemProvider from "../Provider/NFTItemProvider";
import Profile from "./Profile";
import LazySaleNFTItem from "./LazySaleNFTItem";

function LazyApp() {
  const [loading, $loading] = useState(true);
  const [account, $account] = useState(null);
  const [signer, $signer] = useState(null);
  const [marketplace, $marketplace] = useState({});
  const [nft, $nft] = useState({});
  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    $account(accounts[0]);
    // console.log("account[0]", accounts[0]);
    // Get provider from MetaMask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();
    $signer(signer);
    loadContracts(signer);
    $loading(false);
  };
  const loadContracts = async (signer) => {
    // console.log("signer", signer);
    // Get deployed copies of contracts
    const marketplace = new ethers.Contract(
      MarketplaceAddress.address,
      MarketplaceAbi.abi,
      signer
    );
    $marketplace(marketplace);
    const nft = new ethers.Contract(NFTAddress.address, NFTAbi.abi, signer);
    // console.log("nft contract", nft);
    $nft(nft);
  };
  return (
    <BrowserRouter>
      <NFTItemProvider>
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
                path={`${HomePageSlag}/`}
                element={
                  <LazyHome
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                    signer={signer}
                  />
                }
              />
              <Route
                path={`${HomePageSlag}/create`}
                element={
                  <LazyCreate
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                    signer={signer}
                  />
                }
              />
              <Route
                path={`${HomePageSlag}/my-nfts`}
                element={
                  <LazyMyNFT
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                    signer={signer}
                  />
                }
              />
              <Route
                path={`${HomePageSlag}/listing-nft-item`}
                element={
                  <LazyListingNFTItem
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                    signer={signer}
                  />
                }
              />
              <Route
                path={`${HomePageSlag}/nft-item-sale`}
                element={
                  <LazySaleNFTItem
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                    signer={signer}
                  />
                }
              />
              <Route
                path={`${HomePageSlag}/profile`}
                element={
                  <Profile
                    marketplace={marketplace}
                    nft={nft}
                    account={account}
                    signer={signer}
                  />
                }
              />
              <Route
                path={`${HomePageSlag}/my-purchases`}
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
      </NFTItemProvider>
    </BrowserRouter>
  );
}

export default LazyApp;
