import React from "react";
import Loading from "./Loading";
import { useCallback, useState, useContext, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import InputNumber from "./GUI/Component/Common/InputNumber";
import NFTSaleCard from "./GUI/Component/Common/NFTSaleCard";
import {
  SET_ACTIVE_NFT_ITEM,
  NFTItemContext,
  NFTStatus,
  NFTListedType,
} from "../Provider/NFTItemProvider";

const PlaceOrder = ({ marketFee, onSubmit }) => {
  const [price, $price] = useState("");
  const onSubmitHandler = (event) => {
    event.preventDefault();

    onSubmit(price);
  };

  return (
    <Form className="d-flex-col text-start" onSubmit={onSubmitHandler}>
      <h2>Placing Order</h2>
      <div className="">
        <div>
          <Col xs={6}>
            <InputNumber
              size="sm"
              label="Price"
              labelDes=""
              description="$ETH"
              onChangeHandler={(e) => {
                $price(e.target.value);
              }}
            />
          </Col>
        </div>
      </div>
      {marketFee && (
        <Form.Label className="d-flex text-warning fs-4">
          Market Fee: {marketFee}%
        </Form.Label>
      )}
      <Button variant="primary" type="submit">
        Complete listing
      </Button>
    </Form>
  );
};

const LazySaleNFTItem = ({ marketplace, nft, account, signer }) => {
  const [loading, $loading] = useState(true);
  const { state, dispatch } = useContext(NFTItemContext);
  const [marketFee, $marketFee] = useState();

  const nftItemPreview = state.curItem.nftData;
  console.log("nftItemPreview", nftItemPreview);
  function onSubmit(orderParam) {
    console.log("orderParam", orderParam);
  }

  useEffect(async () => {
    const fee = await marketplace.feePercent();
    $marketFee(fee.toString());
    $loading(false);
  }, []);

  if (loading) return <Loading description="Loading..." />;

  return (
    <>
      <Row className="g-4 px-2 mx-4">
        <Col xs={7}>
          <PlaceOrder marketFee={marketFee} onSubmit={onSubmit} />
        </Col>
        <Col>
          <h3>Preview</h3>
          <NFTSaleCard item={nftItemPreview} />
        </Col>
      </Row>
    </>
  );
};

export default LazySaleNFTItem;
