import React from "react";
import CardMedia from "./CardMedia";
import { Card } from "react-bootstrap";
const NFTSaleCard = ({ item }) => {
  return (
    <Card
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
      }}
      border="info"
      bg="light"
    >
      <CardMedia item={item} />
      <Card.Body color="secondary">
        <Card.Title style={{ height: "1.5rem" }} className="text-truncate">
          {item.name}
        </Card.Title>
        <Card.Text style={{ height: "1.5rem" }} className="text-truncate">
          Price: {item.previewPrice} $ETH
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default NFTSaleCard;
