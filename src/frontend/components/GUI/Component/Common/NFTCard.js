import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { ethers } from "ethers";

import { ReactAudio, ReactVideo } from "reactjs-media";

const NFTCard = ({ item, buyMarketItem }) => {
  function IsItemImage(itemType) {
    if (itemType == "jpeg" || itemType == "svg") {
      return true;
    }
    return false;
  }
  function IsAudioItem(itemType) {
    if (itemType == "mp3" || itemType == "wav") {
      return true;
    }
    return false;
  }
  function IsVideoItem(itemType) {
    if (itemType == "mp4" || itemType == "webm") {
      return true;
    }
    return false;
  }

  return (
    <Card>
      {IsItemImage(item.type) && <Card.Img variant="top" src={item.image} />}
      {IsAudioItem(item.type) && <ReactAudio src={item.image} poster="" />}
      {IsVideoItem(item.type) && (
        <ReactVideo src={item.image} poster="" primaryColor="red" />
      )}
      <Card.Body color="secondary">
        <Card.Title>{item.name}</Card.Title>
        <Card.Text>{item.description}</Card.Text>
      </Card.Body>
      <Card.Footer>
        <div className="d-grid">
          <Button
            onClick={() => buyMarketItem(item)}
            variant="primary"
            size="lg"
          >
            Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default NFTCard;
