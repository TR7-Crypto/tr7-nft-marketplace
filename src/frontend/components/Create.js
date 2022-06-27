import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button, Spinner, Modal } from "react-bootstrap";
import { create as ipfsHttpClient } from "ipfs-http-client";
import InputText from "./GUI/Component/Common/InputText";

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
        {mintState.split("\n").map((i, key) => {
          return <div key={key}>{i}</div>;
        })}
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
  const [externalLink, $externalLink] = useState("");
  const [attributes, $attributes] = useState({});

  const [mintState, $mintState] = useState("");
  const [file, $file] = useState("");
  const [minting, $minting] = useState(false);
  function setFile(event) {
    event.preventDefault();
    $file(event.target.files[0]);
  }
  useEffect(async () => {
    if (minting) {
      $mintState("creating NFT...");
      if (!image || !price || !name || !description) return;
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
        mintThenList(result);
      } catch (error) {
        console.log("ipfs uri upload error:", error);
      }
      $minting(false);
    }
  }, [minting]);

  const uploadToIPFS = async (file) => {
    // event.preventDefault();
    // console.log("upload image to ipfs");
    // const file = event.target.files[0];
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

  const mintThenList = async (result) => {
    console.log("mint then list", result);
    const uri = `https://ipfs.infura.io/ipfs/${result.path}`;
    // mint nft
    const mintingNFT = `minting NFT
    waiting for metamask confirm...`;
    console.log("mintingNFT", mintingNFT);
    $mintState(mintingNFT);
    await (await nft.mint(uri)).wait();
    console.log("already minted");
    // get tokenId of new nft
    const id = await nft.tokenCount();
    // approve marketplace to spend nft
    $mintState(
      "approving all for marketplace as operator\nplease confirm transaction on metamask"
    );
    await (await nft.setApprovalForAll(marketplace.address, true)).wait();
    console.log("already approved for all");
    // add nft to marketplace
    const listingPrice = ethers.utils.parseEther(price.toString());
    $mintState(
      "listing NFT with price to marketplace for sale\nwaiting for metamask confirm"
    );
    await (await marketplace.makeItem(nft.address, id, listingPrice)).wait();
    console.log("already list item to market");
    $mintState("");
  };
  return (
    <div className="container-fluid-md mt-5">
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

                <Form.Group className="mb-3">
                  <Form.Control
                    onChange={(e) => {
                      $price(e.target.value);
                    }}
                    size="lg"
                    type="number"
                    placeholder="Price in $ETH"
                  />
                </Form.Group>
              </Form>

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
      {mintState !== "" && <MintingModal mintState={mintState} />}
    </div>
  );
};

export default Create;
