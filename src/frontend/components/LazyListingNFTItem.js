import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import {
  Row,
  Col,
  Button,
  ButtonGroup,
  ToggleButton,
  Form,
  Modal,
} from "react-bootstrap";
import NFTSaleCard from "./GUI/Component/Common/NFTSaleCard";
import {
  NFTStatus,
  NFTListedType,
  NFTItemContext,
} from "../Provider/NFTItemProvider";
import InputNumber from "./GUI/Component/Common/InputNumber";
import InputDropdown from "./GUI/Component/Common/InputDropdown";
import { HomePageSlag } from "./Home";
import { apolloClient } from "../../index";
import ModalProcessingInfo from "./GUI/Component/Common/ModalProcessingInfo";

const ADD_NFT_VOUCHER = gql`
  mutation AddNFTVoucher(
    $owner: String
    $nftTokenId: String
    $status: String
    $listedType: String
    $startingPrice: String
    $endPrice: String
    $duration: String
    $signature: String
    $price: String
  ) {
    addNFTVoucher(
      owner: $owner
      nftTokenId: $nftTokenId
      status: $status
      listedType: $listedType
      startingPrice: $startingPrice
      endPrice: $endPrice
      duration: $duration
      signature: $signature
      price: $price
    ) {
      owner
      nftTokenId
      status
      listedType
      startingPrice
      endPrice
      duration
      listedTimeStamp
      signature
      price
    }
  }
`;

// display listing page
// ask for approval for all if not approved before
// isApprovedForAll(address owner, address operator) → bool
// setApprovalForAll(address to, bool approved)
// ask to sign listing-voucher
// submit listing-voucher to the central-server
// jump to item page or home page

const ListingComponent = ({ marketFee, onPriceChange, onSubmit }) => {
  const [type, $type] = useState("fix");
  const [auctionType, $auctionType] = useState("highestBid");
  const [price, $price] = useState("");
  const [startPrice, $startPrice] = useState("");
  const [endPrice, $endPrice] = useState("");
  const [duration, $duration] = useState("");

  const radios = [
    { name: "Fixed Price", value: "fix" },
    { name: "Timed Auction", value: "auction" },
  ];
  const AuctionTypeList = [
    "Sell to highest bidder",
    "Sell with declining price",
  ];
  const onSubmitHandler = (event) => {
    event.preventDefault();
    const listingParam = {
      type,
      auctionType,
      price,
      startPrice,
      endPrice,
      duration,
    };
    onSubmit(listingParam);
  };

  useEffect(() => {
    const previewPrice = type === "fix" ? price : startPrice;
    onPriceChange(previewPrice);
  }, [price, startPrice]);

  return (
    <Form className="d-flex-col text-start" onSubmit={onSubmitHandler}>
      <h2>List item for sale</h2>
      <div className="">
        <Form.Group className="d-flex-col justify-content-around mb-4">
          <Form.Label className="d-flex text-primary fs-4">Type</Form.Label>
          <div className="d-flex text-secondary text-start fs-6">
            <ButtonGroup>
              {radios.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  id={`radio-${idx}`}
                  type="radio"
                  variant="outline-primary"
                  name="radio"
                  value={radio.value}
                  checked={type === radio.value}
                  onChange={(e) => {
                    $type(e.currentTarget.value);
                  }}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
          </div>
        </Form.Group>
      </div>

      {type === "fix" && (
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
      )}
      {type === "auction" && (
        <div>
          <div>
            <InputDropdown
              label="Method"
              labelDes=""
              onChangeHandler={(e) => {
                $auctionType(e.target.value);
              }}
              items={AuctionTypeList}
            />
          </div>
          <div>
            <Col xs={6}>
              <InputNumber
                size="sm"
                label="Starting Price"
                labelDes=""
                description="$ETH"
                onChangeHandler={(e) => {
                  $startPrice(e.target.value);
                }}
              />
            </Col>
          </div>
        </div>
      )}
      {/* <label>Duration</label> */}
      <div>
        <Col xs={6}>
          <InputNumber
            size="sm"
            label="Duration"
            labelDes=""
            description="duration in minute"
            onChangeHandler={(e) => {
              $duration(e.target.value);
            }}
          />
        </Col>
      </div>

      {type === "auction" && auctionType === AuctionTypeList[1] && (
        <div>
          <Col xs={6}>
            <InputNumber
              size="sm"
              label="Ending Price"
              labelDes=""
              description="$ETH"
              onChangeHandler={(e) => {
                $endPrice(e.target.value);
              }}
            />
          </Col>
        </div>
      )}
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
const SubmitNFTVoucher = ({
  marketplace,
  nft,
  account,
  signer,
  nftItemVoucher,
}) => {
  const [message, $message] = useState("");

  const navigate = useNavigate();
  const changeToMyNFT = useCallback(() => {
    navigate(`${HomePageSlag}/my-nfts`, { replace: true });
  }, [navigate]);

  async function submitNFTVoucher(signedNFTVoucher) {
    await apolloClient
      .mutate({
        mutation: ADD_NFT_VOUCHER,
        variables: { ...signedNFTVoucher },
      })
      .then((result) => {
        console.log("nftVouchers", result);
      });
  }
  async function createNFTVoucher(nftVoucher) {
    const SIGNING_DOMAIN_NAME = "LazyNFT-Voucher";
    const SIGNING_DOMAIN_VERSION = "1";
    const voucher = { ...nftVoucher };
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    console.log("chainId", chainId);
    const domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: marketplace.address,
      chainId,
    };
    const types = {
      NFTItemVoucher: [
        { name: "owner", type: "string" },
        { name: "nftTokenId", type: "string" },
        { name: "status", type: "string" },
        { name: "listedType", type: "string" },
        { name: "price", type: "string" },
        { name: "startingPrice", type: "string" },
        { name: "endPrice", type: "string" },
        { name: "duration", type: "string" },
      ],
    };
    const signature = await signer._signTypedData(domain, types, voucher);
    const signedVoucher = {
      ...voucher,
      signature,
    };
    return signedVoucher;
  }

  useEffect(async () => {
    $message("submitting NFT Voucher...");
    // ask for approval for all if not approved before
    let blApproved = await nft.isApprovedForAll(account, marketplace.address);
    // setApprovalForAll(address to, bool approved)
    if (!blApproved) {
      $message(`submitting NFT Voucher...
      please approve on MetaMask`);
      blApproved = await (
        await nft.setApprovalForAll(marketplace.address, true)
      ).wait();
    }
    // await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    // ask to sign listing-voucher
    $message(`submitting NFT Voucher...
      please sign message on MetaMask`);
    const signedNFTVoucher = await createNFTVoucher(nftItemVoucher);
    // submit listing-voucher to the central-server
    $message(`uploading to server...
      please wait a moment`);
    const submittedNFTVoucher = await submitNFTVoucher(signedNFTVoucher);
    // console.log("submittedNFTVoucher", submittedNFTVoucher);
    // jump to item page or home page
    // navigate(`${HomePageSlag}/my-nfts`, { replace: true });
    changeToMyNFT();
  }, []);

  return <ModalProcessingInfo messages={message} />;
};

const LazyListingNFTItem = ({ marketplace, nft, account, signer }) => {
  const [loading, $loading] = useState(true);
  const [onSubmitting, $onSubmitting] = useState(false);
  const { state, dispatch } = useContext(NFTItemContext);
  const [nftItemPreview, $nftItemPreview] = useState(state.curItem.nftData);
  const [nftItemVoucher, $nftItemVoucher] = useState({});
  const [marketFee, $marketFee] = useState();

  function onPriceChange(value) {
    const newItem = { ...nftItemPreview };
    newItem.previewPrice = value;
    $nftItemPreview(newItem);
  }

  function onSubmit(listingParam) {
    const listedType =
      listingParam.type === "fix"
        ? NFTListedType.FixPrice
        : listingParam.auctionType === "Sell to highest bidder"
        ? NFTListedType.AuctionHighest
        : NFTListedType.AuctionDecline;

    const item = {
      owner: account.toString(),
      nftTokenId: state.curItem.nftData.nftTokenId.toString(),
      status: NFTStatus.Minted.toString(),
      listedType: listedType.toString(),
      price: listingParam.price.toString(),
      startingPrice: listingParam.startPrice.toString(),
      endPrice: listingParam.endPrice.toString(),
      duration: listingParam.duration.toString(),
    };
    $nftItemVoucher(item);
    $onSubmitting(true);
  }

  useEffect(async () => {
    const fee = await marketplace.feePercent();
    $marketFee(fee.toString());
    $loading(false);
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <>
      <Row className="g-4 px-2 mx-4">
        <Col xs={7}>
          <ListingComponent
            marketFee={marketFee}
            onPriceChange={onPriceChange}
            onSubmit={onSubmit}
          />
        </Col>
        <Col>
          <h3>Preview</h3>
          <NFTSaleCard item={nftItemPreview} />
        </Col>
      </Row>
      {onSubmitting && (
        <SubmitNFTVoucher
          nftItemVoucher={nftItemVoucher}
          marketplace={marketplace}
          nft={nft}
          account={account}
          signer={signer}
        />
      )}
    </>
  );
};

export default LazyListingNFTItem;
