import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Spinner, Modal } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import InputText from "./GUI/Component/Common/InputText";
import InputNumber from "./GUI/Component/Common/InputNumber";
import CryptoJS from "crypto-js";
import { useMutation, gql } from "@apollo/client";
function createTokenId(string) {
  const input = Math.random().toString();
  const decimals = 18;
  // const input = CryptoJS.SHA3(string, { outputLength: 256 }).toString(); // Note: this is a string, e.g. user input
  return ethers.utils.parseUnits(input, decimals);
}
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
console.log("client", client);

const MintingModal = ({ mintState }) => {
  return (
    <Modal
      // {...props}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show
      // onHide={closeHandler}
    >
      {/* <Modal.Body> */}
      <Button variant="primary" disabled>
        <Spinner
          as="span"
          animation="grow"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        {mintState.split("\n").map((i, key) => {
          return <div key={key}>{i}</div>;
        })}
      </Button>
      {/* </Modal.Body> */}
    </Modal>
  );
};

const ADD_VOUCHER = gql`
  mutation AddVoucher(
    $tokenId: String
    $minPrice: String
    $uri: String
    $signature: String
    $account: String
  ) {
    addVoucher(
      tokenId: $tokenId
      minPrice: $minPrice
      uri: $uri
      signature: $signature
      account: $account
    ) {
      tokenId
      minPrice
      uri
      signature
      account
    }
  }
`;

const LazyCreate = ({ marketplace, nft, account, signer }) => {
  console.log("account", account);
  const [image, $image] = useState("");
  const [type, $type] = useState("");
  const [price, $price] = useState(null);
  const [name, $name] = useState("");
  const [description, $description] = useState("");
  const [externalLink, $externalLink] = useState("");
  const [attributes, $attributes] = useState({});

  const [mintState, $mintState] = useState("");
  const [file, $file] = useState("");
  const [minting, $minting] = useState(false);
  const [submitVoucher, $submitVoucher] = useState(false);
  const [signedVoucher, $signedVoucher] = useState(false);

  function onSubmitComplete() {
    $submitVoucher(false);
  }
  const SubmitVoucher = ({ signedVoucher, onSubmitComplete }) => {
    console.log("submit voucher", signedVoucher);
    const [addVoucher, { loading, error, data }] = useMutation(ADD_VOUCHER, {
      variables: {
        tokenId: signedVoucher.tokenId.toString(),
        minPrice: signedVoucher.minPrice.toString(),
        uri: signedVoucher.uri.toString(),
        signature: signedVoucher.signature.toString(),
        account: account.toString(),
      },
    });
    useEffect(async () => {
      await addVoucher();
    }, []);

    if (loading)
      return <MintingModal mintState={"submitting NFT to server..."} />;
    if (error) return <MintingModal mintState={"submit to server failed"} />;

    onSubmitComplete();
    return <></>;
  };

  function setFile(event) {
    event.preventDefault();
    $file(event.target.files[0]);
  }

  useEffect(async () => {
    if (minting) {
      $mintState("creating NFT...");
      if (!image || !name || !description) return;
      try {
        const metadataJson = JSON.stringify({
          image,
          type,
          name,
          description,
          externalLink,
          attributes,
        });
        console.log("nft-metadata", metadataJson);
        const result = await client.add(metadataJson);
        await lazyMinting(result);
      } catch (error) {
        console.log("ipfs uri upload error:", error);
      }
      $minting(false);
    }
  }, [minting]);

  const uploadToIPFS = async (file) => {
    console.log("file", file);
    if (typeof file !== "undefined") {
      try {
        const result = await client.add(file);
        console.log(result);
        $image(`https://ipfs.infura.io/ipfs/${result.path}`);
        let type = file.name.split(".").pop();
        console.log("file type", type);
        $type(type);
      } catch (error) {
        console.log("ipfs image upload error:", error);
      }
    }
  };

  const createNFT = async () => {
    console.log("create nft click");
    $mintState("uploading to IPFS...");
    await uploadToIPFS(file);
    $minting(true);
  };

  const SIGNING_DOMAIN_NAME = "LazyNFT-Voucher";
  const SIGNING_DOMAIN_VERSION = "1";
  const voucher = { tokenId: 1, uri: "https://tr7-marketplace", minPrice: 0 };
  let payload = ethers.utils.defaultAbiCoder.encode(
    ["tuple(uint256,uint256,string)"],
    [[voucher.tokenId, voucher.minPrice, voucher.uri]]
  );
  console.log("payload", payload);

  async function createVoucher(tokenId, uri, minPrice = 0) {
    const voucher = { tokenId, minPrice, uri };
    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    console.log("chainId", chainId);
    const domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: nft.address,
      chainId,
    };
    const types = {
      NFTVoucher: [
        { name: "tokenId", type: "uint256" },
        { name: "minPrice", type: "uint256" },
        { name: "uri", type: "string" },
      ],
    };
    const signature = await signer._signTypedData(domain, types, voucher);
    console.log("signature", signature);
    const signedVoucher = {
      ...voucher,
      signature,
    };
    console.log("signedVoucher", signedVoucher);

    // // verify redeem
    // try {
    //   let redeemTokenId = await (
    //     await nft.redeem(account, signedVoucher)
    //   ).wait();
    //   console.log("redeemTokenId", redeemTokenId);
    // } catch (error) {
    //   console.log(error);
    // }

    return signedVoucher;
  }

  const lazyMinting = async (result) => {
    console.log("lazy minting", result);
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
    // create NFT voucher and request for signing from wallet provider
    const mintingNFT = `creating NFT voucher...
    please sign message on metamask wallet`;
    console.log("mintingNFT", mintingNFT);
    $mintState(mintingNFT);
    const tokenId = createTokenId(uri); // should be random token id from uri
    console.log("tokenId", tokenId);
    const minPrice = ethers.utils.parseEther(price);
    console.log("create minPrice", minPrice);
    const signedVoucher = await createVoucher(tokenId, uri, minPrice);
    console.log("signedVoucher", signedVoucher);
    $signedVoucher(signedVoucher);
    $submitVoucher(true);
    $mintState("");
  };

  return (
    <div className="container-fluid-md mt-5 mx-2">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label className="d-flex text-primary text-start fs-4">
                    Image, Video, Audio, or 3D Model
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="file"
                    accept="image/*,audio/*,video/*,.glb"
                    onChange={setFile}
                  />
                </Form.Group>
                <InputText
                  size="sm"
                  label="Name"
                  labelDes=""
                  description="Item name"
                  onChangeHandler={(e) => {
                    $name(e.target.value);
                  }}
                />
                <InputText
                  size="sm"
                  label="External Link"
                  labelDes="This is the URL that will appear below the asset's image, and will allow users to leave marketplace and view the item on your site."
                  description="https://yoursite.io/item/123"
                  onChangeHandler={(e) => {
                    $externalLink(e.target.value);
                  }}
                />
                <InputText
                  size="lg"
                  label="Desciption"
                  labelDes="The description will be included on the item's detail page underneath its image. Markdown syntax is supported."
                  description="Provide a detailed description of your item."
                  onChangeHandler={(e) => {
                    $description(e.target.value);
                  }}
                />
                <InputNumber
                  size="lg"
                  label="Minting Price"
                  labelDes="Price to mint this NFT, will be redeemed on first sale to the buyer"
                  description="Price to mint the NFT in $ETH"
                  onChangeHandler={(e) => {
                    $price(e.target.value);
                  }}
                />
              </Form>

              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Lazy Create
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      {/* modal showing status of minting and listing */}
      {mintState !== "" && <MintingModal mintState={mintState} />}
      {submitVoucher && (
        <SubmitVoucher
          signedVoucher={signedVoucher}
          onSubmitComplete={onSubmitComplete}
        />
      )}
    </div>
  );
};

export default LazyCreate;
