import React from "react";
import { Row, Col } from "react-bootstrap";
import NFTCard from "../Common/NFTCard";
import { NFTListedType } from "../../../../Provider/NFTItemProvider";
import { ethers } from "ethers";

const ListNFTCard = ({ listItem, buyMarketItem, type }) => {
  return (
    <Row xs={1} sm={2} xl={4} className="g-4 py-5">
      {listItem.map((item, idx) => {
        let nftCardItem = { ...item.nftData };
        let footer = "";
        if (type === "voucher") {
          footer = `Mint for ${ethers.utils.formatEther(
            nftCardItem.totalPrice
          )} ETH`;
        } else if (type === "my-nft") {
          console.log("item.listedType", item.listedType);
          if (item.listedType == NFTListedType.NotListed) {
            footer = `List for Sale`;
          } else if (item.listedType == NFTListedType.FixPrice) {
            footer = `Listed for ${ethers.utils.formatEther(
              nftCardItem.totalPrice
            )} ETH`;
          } else if (item.listedType == NFTListedType.AuctionHighest) {
            footer = `Listed as highest bid with start price ${ethers.utils.formatEther(
              nftCardItem.totalPrice
            )} ETH`;
          } else {
            footer = `Listed as declining with start price ${ethers.utils.formatEther(
              nftCardItem.totalPrice
            )} ETH`;
          }
        } else {
          if (item.listedType == NFTListedType.FixPrice) {
            footer = `Buy for ${ethers.utils.formatEther(
              nftCardItem.totalPrice
            )} ETH`;
          } else {
            footer = `Place Order with start price ${ethers.utils.formatEther(
              nftCardItem.totalPrice
            )} ETH`;
          }
        }
        nftCardItem.footer = footer;

        return (
          <Col key={idx} className="overflow-hidden">
            <NFTCard item={nftCardItem} buyMarketItem={buyMarketItem} />
          </Col>
        );
      })}
    </Row>
  );
};

export default ListNFTCard;
