import React, { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Spinner, Modal } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
console.log("client", client);
// let ipfs = undefined;
// try {
//   ipfs = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
//   console.log("ipfs", ipfs);
// } catch (error) {
//   console.error("IPFS error ", error);
//   ipfs = undefined;
// }

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
        {mintState}
      </Button>
      {/* </Modal.Body> */}
    </Modal>
  );
};

const Create = ({ marketplace, nft }) => {
  const [image, $image] = useState("");
  const [type, $type] = useState("");
  const [price, $price] = useState(null);
  const [name, $name] = useState("");
  const [description, $description] = useState("");

  const [mintState, $mintState] = useState("");

  const uploadToIPFS = async (event) => {
    event.preventDefault();
    console.log("upload image to ipfs");
    const file = event.target.files[0];
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
    console.log(
      "image",
      image,
      "price",
      price,
      "name",
      name,
      "description",
      description
    );

    if (!image || !price || !name || !description) return;
    try {
      const json = JSON.stringify({ image, type, name, description });
      console.log("json scheme:", json);
      const result = await client.add(
        JSON.stringify({ image, type, name, description })
      );
      mintThenList(result);
    } catch (error) {
      console.log("ipfs uri upload error:", error);
    }
  };
  const mintThenList = async (result) => {
    console.log("mint then list", result);
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
    // mint nft
    $mintState("minting NFT...");
    await (await nft.mint(uri)).wait();
    console.log("already minted");
    // get tokenId of new nft
    const id = await nft.tokenCount();
    // approve marketplace to spend nft
    $mintState("approving for marketplace to use");
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    console.log("already approved for all");
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    $mintState("listing NFT to marketplace for sale");
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
    console.log("already list item to market");
    $mintState("");
  };
  return (
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
            <Row className="g-4">
              <Form.Control type="file" name="file" onChange={uploadToIPFS} />
              <Form.Control
                onChange={(e) => {
                  $name(e.target.value);
                }}
                size="lg"
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => {
                  $description(e.target.value);
                }}
                size="lg"
                as="textarea"
                placeholder="Desciption"
              />
              <Form.Control
                onChange={(e) => {
                  $price(e.target.value);
                }}
                size="lg"
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
      {/* modal showing status of minting and listing */}
      {mintState != "" && <MintingModal mintState={mintState} />}
    </div>
  );
};

export default Create;
