import React from "react";
import { Card } from "react-bootstrap";
import ReactPlayer from "react-player/lazy";
import Frame3D from "./Frame3D";

const CardMedia = ({ item }) => {
  function IsItemImage(itemType) {
    if (
      itemType === "jpeg" ||
      itemType === "svg" ||
      itemType === "gif" ||
      itemType === "png" ||
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
      return true;
    }
    return false;
  }

  return (
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
  );
};

export default CardMedia;
