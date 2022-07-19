import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";

import { ReactAudio, ReactVideo } from "reactjs-media";
import ReactPlayer from "react-player/lazy";

import Frame3D from "./Frame3D";
import TR7Logo from "../../../tr7-logo-001.png";
import CardMedia from "./CardMedia";
import WalletAddress from "./WalletAddress";

const NFTCard = ({ item, buyMarketItem }) => {
  const itemData = item.nftData;

  return (
    <Card
      style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        // height: "550px",
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
          {item.description}
        </Card.Text>
        <Card.Text style={{ height: "1.5rem" }} className="text-truncate">
          {item.externalLink}
        </Card.Text>
        {item.voucher && (
          <Card.Text style={{ height: "1.5rem" }} className="text-truncate">
            <span>Owner: </span>
            <WalletAddress account={item.voucher.account} />
          </Card.Text>
        )}
      </Card.Body>
      <Card.Footer>
        <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
          {item.footer}
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default NFTCard;
