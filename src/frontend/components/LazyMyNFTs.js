import { ethers } from "ethers";
import React, { useCallback, useEffect, useState, useContext } from "react";
import { Card, Row, Col } from "react-bootstrap";
import NFTCard from "./GUI/Component/Common/NFTCard";
import { useNavigate } from "react-router-dom";
import ListNFTCard from "./GUI/Component/Section/ListNFTCard";
import { HomePageSlag } from "./Home";
import {
  SET_ACTIVE_NFT_ITEM,
  NFTItemContext,
  NFTStatus,
  NFTListedType,
} from "../Provider/NFTItemProvider";
import { apolloClient } from "../../index";
import { gql, useQuery } from "@apollo/client";
import ModalError from "./GUI/Component/Common/ModalError";

const GET_VOUCHER = gql`
  query GetVoucher {
    getVouchers {
      tokenId
      minPrice
      uri
      signature
      account
    }
  }
`;
const DELETE_VOUCHER = gql`
  mutation DeleteVoucher($tokenId: String) {
    deleteVoucher(tokenId: $tokenId) {
      tokenId
      minPrice
      uri
      signature
      account
    }
  }
`;

const GET_NFT_ITEM_VOUCHER_BY_ACCOUNT = gql`
  query GetNFTVouchersByAccount($owner: String!) {
    getNFTVouchersByAccount(owner: $owner) {
      owner
      nftTokenId
      status
      listedType
      price
      startingPrice
      endPrice
      duration
      listedTimeStamp
      signature
    }
  }
`;

const LazyMyNFTs = ({ marketplace, nft, account, signer }) => {
  const [loading, $loading] = useState(true);
  const [error, $error] = useState({});
  const [nftItems, $nftItems] = useState([]);
  const [voucherItems, $voucherItems] = useState([]);
  const { state, dispatch } = useContext(NFTItemContext);

  async function loadAllItems() {
    $loading(true);
    // load voucher items
    await LoadNFTVouchers();
    // NFT items - mix server and contract
    let nftItems = [];
    // from server
    let listedNFTItems = await LoadListedNFTItems();
    // from smart contract
    // Load nft items belong to the account
    const nftCount = await nft.totalSupply();
    for (let index = 0; index < nftCount; index++) {
      const nftTokenId = index + 1;
      const nftOwner = await nft.ownerOf(nftTokenId);
      const approveAddress = await nft.getApproved(nftTokenId);
      const bItemIndex = listedNFTItems.findIndex((element) => {
        if (element.nftTokenId == nftTokenId) {
          return true;
        }
        return false;
      });
      if (approveAddress == 0 && nftOwner.toString().toLowerCase() == account) {
        let nftItem = {};
        if (bItemIndex >= 0) {
          nftItem = listedNFTItems[bItemIndex];
        } else {
          const nftTokenUri = await nft.tokenURI(nftTokenId);
          // set uri to fetch the nft metadata stored on ipfs
          const nftData = await fetch(nftTokenUri);
          const nftMetaData = await nftData.json();
          let nftBlockData = {
            totalPrice: "",
            price: "",
            itemId: "",
            nftTokenId: nftTokenId,
            name: nftMetaData.name,
            description: nftMetaData.description,
            image: nftMetaData.image,
            type: nftMetaData.type,
            owner: account,
          };
          nftItem = {
            nftData: nftBlockData,
            owner: nftBlockData.owner,
            status: NFTStatus.Minted,
            listedType: NFTListedType.NotListed,
            price: "",
            startingPrice: "",
            endPrice: "",
            duration: "",
            history: [],
          };
        }
        //
        nftItems.push(nftItem);
      }
    }
    //
    $nftItems(nftItems);
    $loading(false);
  }
  const navigate = useNavigate();
  const listNftForSale = useCallback(
    (item) => {
      dispatch({
        type: SET_ACTIVE_NFT_ITEM,
        payload: item,
      });
      navigate(`${HomePageSlag}/listing-nft-item`, { replace: false });
    },
    [navigate]
  );
  const mintedNFTClickHandler = (nftItem) => {
    // console.log("nftItem", nftItem);
    const nftTokenId = nftItem.nftTokenId;
    // console.log("nftItems", nftItems);

    const itemIndex = nftItems.findIndex((element) => {
      if (element.nftData.nftTokenId == nftTokenId) {
        return true;
      }
      return false;
    });
    // console.log("itemIndex", itemIndex);
    const curItem = nftItems[itemIndex];
    // console.log("curItem", curItem);
    if (!curItem.listedType || curItem.listedType == NFTListedType.NotListed) {
      listNftForSale(curItem);
    } else {
    }
  };

  //Vouchers
  const loadVoucherInformation = async (result) => {
    // console.log("result", result);
    const vouchers = result;
    const itemCount = vouchers.length;
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = vouchers[i];
      if (item.account.toString().toLowerCase() == account) {
        const uri = item.uri;
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = item.minPrice; //TODO + fee
        let nftItemData = {
          totalPrice,
          itemId: 1, //item.itemId, //TODO
          seller: item.account,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          type: metadata.type,
          externalLink: metadata.externalLink,
          voucher: item,
        };
        let nftItem = {};
        nftItem.nftData = nftItemData;
        items.push(nftItem);
      }
    }
    $voucherItems(items);
  };
  const LoadNFTVouchers = async () => {
    await apolloClient
      .query({ query: GET_VOUCHER, fetchPolicy: "no-cache" })
      .then((result) => loadVoucherInformation(result.data.getVouchers));
  };
  const LoadListedNFTItems = async () => {
    let listedItems = [];
    await apolloClient
      .query({
        query: GET_NFT_ITEM_VOUCHER_BY_ACCOUNT,
        fetchPolicy: "no-cache",
        variables: {
          owner: account.toString(),
        },
      })
      .then(async (result) => {
        const items = result.data.getNFTVouchersByAccount;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const nftTokenId = ethers.BigNumber.from(item.nftTokenId);
          const uri = await nft.tokenURI(nftTokenId);
          const response = await fetch(uri);
          const nftMetaData = await response.json();
          // get total price of item (item price + fee)
          const itemPrice =
            Number(item.listedType) == NFTListedType.FixPrice
              ? item.price
              : item.startingPrice;
          const totalPrice = ethers.utils.parseEther(itemPrice); //TODO + fee
          let nftItemData = {
            totalPrice,
            price: "",
            itemId: "",
            nftTokenId: nftTokenId,
            name: nftMetaData.name,
            description: nftMetaData.description,
            image: nftMetaData.image,
            type: nftMetaData.type,
            owner: item.owner,
          };
          let nftItem = item;
          nftItem.nftData = nftItemData;
          listedItems.push(nftItem);
        }
      });
    return listedItems;
  };
  async function deleteVoucher(tokenId) {
    await apolloClient
      .mutate({
        mutation: DELETE_VOUCHER,
        variables: { tokenId },
      })
      .then((result) => {
        loadAllItems();
      });
  }
  const mintingVoucher = async (itemData) => {
    const item = itemData.voucher;
    const tokenId = ethers.BigNumber.from(item.tokenId);
    const minPrice = ethers.BigNumber.from(item.minPrice);
    // verify redeem
    const signedVoucher = {
      tokenId,
      minPrice,
      uri: item.uri,
      signature: item.signature,
    };

    try {
      const signerAddress = await signer.getAddress();
      const signerBalance = await signer.getBalance();
      let redeemTokenId = await (
        await nft.redeem(signerAddress, signedVoucher, {
          value: minPrice,
        })
      ).wait();
      if (redeemTokenId) {
        deleteVoucher(item.tokenId);
      }
    } catch (error) {
      console.log("error", error);
      $error(error);
    }
  };
  function errorClose() {
    $error({});
  }

  useEffect(() => {
    loadAllItems();
  }, []);

  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );

  return (
    <>
      {nftItems.length > 0 || voucherItems.length > 0 ? (
        <div>
          {nftItems.length > 0 && (
            <div className="px-5 py-3 container">
              <h2 className="text-primary">Minted NFTs</h2>
              <ListNFTCard
                listItem={nftItems}
                buyMarketItem={mintedNFTClickHandler}
                type="my-nft"
              />
            </div>
          )}
          {voucherItems.length > 0 && (
            <div className="px-5 py-3 container">
              <h2 className="text-primary">NFT Vouchers</h2>
              <ListNFTCard
                listItem={voucherItems}
                buyMarketItem={mintingVoucher}
                type="voucher"
              />
            </div>
          )}
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>You does not have any NFTs</h2>
        </main>
      )}
      {/* {error && <ModalError onCloseHandler={errorClose} />} */}
    </>
  );
};

export default LazyMyNFTs;
