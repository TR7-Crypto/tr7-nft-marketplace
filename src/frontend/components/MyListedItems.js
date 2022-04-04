import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import NFTCard from "./GUI/Component/Common/NFTCard";

import ListNFTCard from "./GUI/Component/Section/ListNFTCard";

function renderSoldItems(items) {
  return (
    <>
      <h2 className="text-primary">Sold NFTs</h2>
      <ListNFTCard listItem={items} buyMarketItem="" type="sold" />
    </>
  );
}

const MyListedItems = ({ marketplace, nft, account }) => {
  const [loading, $loading] = useState(true);
  const [listedItems, $listedItems] = useState([]);
  const [soldItems, $soldItems] = useState([]);
  async function loadListedItems() {
    $loading(true);
    // Load all items that the user (account) listed
    const itemCount = await marketplace.itemCount();
    let listedItems = [];
    let soldItems = [];
    for (let idx = 1; idx <= itemCount; idx++) {
      const i = await marketplace.items(idx);
      if (i.seller.toLowerCase() === account) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId);
        // set uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // define listed item object
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          type: metadata.type,
        };
        listedItems.push(item);
        // Add listed item to sold items list if sold
        if (i.sold) soldItems.push(item);
      }
    }
    $loading(false);
    $listedItems(listedItems);
    $soldItems(soldItems);
  }
  useEffect(() => {
    loadListedItems();
  }, []);

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div>
      {listedItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <h2 className="text-primary">Listed NFTs</h2>
          <ListNFTCard listItem={listedItems} buyMarketItem="" type="listed" />
          {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>You have not listed any NFTs</h2>
        </main>
      )}
    </div>
  );
};

export default MyListedItems;
