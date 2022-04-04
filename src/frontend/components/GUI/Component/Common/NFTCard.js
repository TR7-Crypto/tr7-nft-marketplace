import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import { ethers } from "ethers";

import { ReactAudio, ReactVideo } from "reactjs-media";
import ReactPlayer from "react-player/lazy";

import Frame3D from "./Frame3D";
import TR7Logo from "../../../tr7-logo-001.png";
const NFTCard = ({ item, buyMarketItem, type }) => {
  console.log("item.type", item.type);
  function IsItemImage(itemType) {
    if (
      itemType === "jpeg" ||
      itemType === "svg" ||
      itemType === "gif" ||
      itemType === "webp"
    ) {
      return true;
    }
    return false;
  }
  function IsAudioItem(itemType) {
    // if (itemType.match(/audio\/*/g) != null) {
    //   return true;
    // }
    if (itemType === "mp3" || itemType === "wav") {
      return true;
    }
    return false;
  }
  function IsVideoItem(itemType) {
    if (itemType === "mp4" || itemType === "webm") {
      return true;
    }
    return false;
  }
  function Is3DItem(itemType) {
    if (itemType === "glb" || itemType === "gltf") {
      console.log("itemType", itemType);
      return true;
    }
    return false;
  }

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
      <div
        style={{
          width: "100%",
          height: "240px",
          maxHeight: "320px",
          backgroundColor: "gray",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {IsItemImage(item.type) && (
          <Card.Img
            variant="top"
            src={item.image}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        )}
        {IsAudioItem(item.type) && (
          <ReactPlayer
            url={item.image}
            controls
            width="100%"
            height="100%"
            volume={0.5}
            // light="/music.webp"
          />
        )}
        {IsVideoItem(item.type) && (
          <ReactPlayer
            url={item.image}
            controls
            width="100%"
            height="100%"
            volume={0.5}
            // light={true}
          />
        )}
        {Is3DItem(item.type) && <Frame3D url={item.image} type={item.type} />}
      </div>

      <Card.Body color="secondary">
        <Card.Title style={{ height: "1.5rem" }} className="text-truncate">
          {item.name}
        </Card.Title>
        <Card.Text style={{ height: "1.5rem" }} className="text-truncate">
          {item.description}
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        {type === "sale" ? (
          <Button
            onClick={() => buyMarketItem(item)}
            variant="primary"
            size="lg"
          >
            Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
          </Button>
        ) : type === "sold" ? (
          <>
            For {ethers.utils.formatEther(item.totalPrice)} ETH - Received{" "}
            {ethers.utils.formatEther(item.price)} ETH
          </>
        ) : (
          <>{ethers.utils.formatEther(item.totalPrice)} ETH</>
        )}
      </Card.Footer>
    </Card>
  );
};

export default NFTCard;
