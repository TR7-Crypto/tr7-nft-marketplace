import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";

function renderSoldItems(items) {
  return (
    <>
      <h2 className="text-primary">Sold NFTs</h2>
      <Row>
        {items.map((item, idx) => (
          <Col key={idx} className="overflow-hidden">
            <Card>
              <Card.Img variant="top" src={item.image} />
              <Card.Footer>
                For {ethers.utils.formatEther(item.totalPrice)} ETH - Received{" "}
                {ethers.utils.formatEther(item.price)} ETH
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
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
          <Row>
            {listedItems.map((item, idx) => (
              <Col key={idx} className="overflow-hidden">
                <Card>
                  <Card.Img variant="top" src={item.image} />
                  <Card.Footer>
                    {ethers.utils.formatEther(item.totalPrice)} ETH
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
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
