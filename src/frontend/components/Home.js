import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card, Button } from "react-bootstrap";
import NFTCard from "./GUI/Component/Common/NFTCard";
export const HomePageSlag = "/tr7-nft-marketplace";

const Home = ({ marketplace, nft }) => {
  const [items, $items] = useState([]);
  const [loading, $loading] = useState(true);

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
          });
        }
      } catch (error) {
        console.log("load item", i, "got error", error);
      }
    }
    $items(items);
    $loading(false);
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

  if (loading) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  }

  return (
    <div className="flex justify-content">
      {items.length > 0 ? (
        <div className="px-5 container">
          <Row xs={1} sm={2} xl={4} className="g-4 py-5">
            {items.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <NFTCard item={item} buyMarketItem={buyMarketItem} />
              </Col>
            ))}
          </Row>
        </div>
      ) : (
        <main
          style={{
            padding: "1rem 0",
          }}
        >
          <h2>No listed NFTs for sale</h2>
        </main>
      )}
    </div>
  );
};

export default Home;
