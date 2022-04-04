import React from "react";
import { Row, Col } from "react-bootstrap";
import NFTCard from "../Common/NFTCard";
const ListNFTCard = ({ listItem, buyMarketItem, type }) => {
  return (
    <Row xs={1} sm={2} xl={4} className="g-4 py-5">
      {listItem.map((item, idx) => (
        <Col key={idx} className="overflow-hidden">
          <NFTCard item={item} buyMarketItem={buyMarketItem} type={type} />
        </Col>
      ))}
    </Row>
  );
};

export default ListNFTCard;
