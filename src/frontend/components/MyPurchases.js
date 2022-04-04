import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { ethers } from "ethers";
import NFTCard from "./GUI/Component/Common/NFTCard";
import ListNFTCard from "./GUI/Component/Section/ListNFTCard";
const MyPurchases = ({ marketplace, nft, account }) => {
  const [loading, $loading] = useState(true);
  const [purchasedItems, $purchasedItems] = useState([]);

  const loadPurchasedItems = async () => {
    $loading(true);
    // Fetch purchased items from marketplace by querying Offered events
    // with the buyer set as the user
    const filter = marketplace.filters.Bought(
      null,
      null,
      null,
      null,
      null,
      account
    );
    const results = await marketplace.queryFilter(filter);
    // Fetch metadata of each nft and add that to listedItem object
    const purchases = await Promise.all(
      results.map(async (i) => {
        // fetch arguments from each result
        i = i.args;
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId);
        // user uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // define item object
        let purchasedItem = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          type: metadata.type,
        };
        return purchasedItem;
      })
    );
    $purchasedItems(purchases);
    $loading(false);
  };
  useEffect(() => {
    loadPurchasedItems();
  }, []);

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {purchasedItems.length > 0 ? (
        <div className="px-5 container">
          <ListNFTCard
            listItem={purchasedItems}
            buyMarketItem=""
            type="purchased"
          />
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>You have not purchased any NFTs</h2>
        </main>
      )}
    </div>
  );
};

export default MyPurchases;
