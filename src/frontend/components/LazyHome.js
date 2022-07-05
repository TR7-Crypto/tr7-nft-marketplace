// Show all NFTs (including vouchers) have listed status
import React, { useState, useEffect, lazy } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";
import NFTCard from "./GUI/Component/Common/NFTCard";
import ListNFTCard from "./GUI/Component/Section/ListNFTCard";
import { gql, useQuery } from "@apollo/client";
import { apolloClient } from "../../index";
export const HomePageSlag = "/tr7-nft-marketplace";

const GET_VOUCHER = gql`
  query GetVoucher {
    getVouchers {
      tokenId
      minPrice
      uri
      signature
      account
    }
  }
`;

const NFTVoucher = () => {
  const [loading, $loading] = useState(true);
  const [items, $items] = useState([]);

  const loadVoucherInformation = async (result) => {
    console.log("result", result);
    const vouchers = result.data.getVouchers;
    const itemCount = vouchers.length;
    let items = [];
    console.log("nft voucher count ", itemCount);
    for (let i = 0; i < itemCount; i++) {
      const item = vouchers[i];
      console.log("item i", item);
      // uri
      const uri = item.uri;
      // use uri to fetch the nft metadata stored on ipfs
      const response = await fetch(uri);
      const metadata = await response.json();
      // get total price of item (item price + fee)
      const totalPrice = item.minPrice; //TODO + fee
      // Add item to items array
      items.push({
        totalPrice,
        itemId: 1, //item.itemId, //TODO
        seller: item.account,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        type: metadata.type,
        externalLink: metadata.externalLink,
      });
      $items(items);
    }
  };
  const LoadNFTVouchers = async (data) => {
    await apolloClient
      .query({ query: GET_VOUCHER })
      .then((result) => loadVoucherInformation(result));
  };
  useEffect(async () => {
    await LoadNFTVouchers();
    console.log("loading", loading);
    $loading(false);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!items.length) return <p>Not any vouchers</p>;
  console.log("items", items);

  return <ListNFTCard listItem={items} buyMarketItem="" type="mint" />;
};

const Home = ({ marketplace, nft }) => {
  const [items, $items] = useState([]);
  const [loadingNFT, $loadingNFT] = useState(true);

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();
    let items = [];
    console.log("itemCount ", itemCount);
    for (let i = 1; i <= itemCount; i++) {
      // console.log("try load item", i);
      try {
        const item = await marketplace.items(i);
        if (!item.sold) {
          // get uri url from nft contract
          const uri = await nft.tokenURI(item.tokenId);
          // console.log("uri", uri);
          // use uri to fetch the nft metadata stored on ipfs
          const response = await fetch(uri);
          // console.log("response ", i, response);
          const metadata = await response.json();
          console.log("json scheme:", metadata);
          // console.log("item", i, "json", metadata);
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(item.itemId);
          // console.log("item", i, "total price", totalPrice);
          // Add item to items array
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            type: metadata.type,
            externalLink: metadata.externalLink,
          });
        }
      } catch (error) {
        console.log("load item", i, "got error", error);
      }
    }
    $items(items);
    $loadingNFT(false);
  };
  const buyMarketItem = async (item) => {
    await (
      await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })
    ).wait();
    loadMarketplaceItems();
  };
  useEffect(() => {
    loadMarketplaceItems();
  }, []);

  if (loadingNFT) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  // function handleOpenseaIframe() {}
  return (
    <div className="flex justify-content">
      {/* <Button onClick={handleOpenseaIframe}>OpenSea.io</Button> */}
      <h1>NFTS FOR SALE</h1>
      {items.length > 0 ? (
        <div className="px-5 container">
          <ListNFTCard listItem={items} buyMarketItem="" type="sale" />
        </div>
      ) : (
        <main
          style={{
            padding: "1rem 0",
          }}
        >
          <h4>No listed NFTs for sale</h4>
        </main>
      )}
      <h1>NFT VOUCHERS</h1>
      <div className="px-5 container">
        <NFTVoucher />
      </div>
    </div>
  );
};

export default Home;
