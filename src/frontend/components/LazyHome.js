// Show all NFTs (including vouchers) have listed status
import React, { useState, useEffect, useCallback, useContext } from "react";
import { ethers } from "ethers";
import ListNFTCard from "./GUI/Component/Section/ListNFTCard";
import { gql } from "@apollo/client";
import { apolloClient } from "../../index";
import { useNavigate } from "react-router-dom";
import {
  SET_ACTIVE_NFT_ITEM,
  SET_ACTIVE_MARKET_ITEMS,
  NFTItemContext,
  NFTStatus,
  NFTListedType,
} from "../Provider/NFTItemProvider";

export const HomePageSlag = "/tr7-nft-marketplace";

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

const GET_NFT_ITEM_VOUCHER = gql`
  query GetNFTVouchers {
    getNFTVouchers {
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
const DELETE_NFT_VOUCHER = gql`
  mutation DeleteVoucher($nftTokenId: String) {
    deleteNFTVoucher(nftTokenId: $nftTokenId) {
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

const NFTVoucher = ({ nft, signer }) => {
  const [loading, $loading] = useState(true);
  const [voucherItems, $voucherItems] = useState([]);

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
      console.log(
        "signer addr",
        signerAddress,
        "balance",
        signerBalance.toString()
      );
      let redeemTokenId = await (
        await nft.redeem(signerAddress, signedVoucher, {
          value: minPrice,
        })
      ).wait();
      console.log("redeemTokenId", redeemTokenId);
      if (redeemTokenId) {
        deleteVoucher(item.tokenId);
        // reloadVoucher();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const loadVoucherInformation = async (result) => {
    // console.log("result", result);
    const vouchers = result;
    // console.log("vouchers", vouchers);
    const itemCount = vouchers.length;
    // console.log("voucher count", vouchers.length);
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = vouchers[i];
      const uri = item.uri;
      const response = await fetch(uri);
      const metadata = await response.json();
      // get total price of item (item price + fee)
      const totalPrice = item.minPrice; //TODO + fee
      // Add item to items array
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
    $voucherItems(items);
  };
  const LoadNFTVouchers = async () => {
    await apolloClient
      .query({ query: GET_VOUCHER, fetchPolicy: "no-cache" })
      .then((result) => loadVoucherInformation(result.data.getVouchers));
  };

  async function deleteVoucher(tokenId) {
    await apolloClient
      .mutate({
        mutation: DELETE_VOUCHER,
        variables: { tokenId },
      })
      .then((result) => loadVoucherInformation(result.data.deleteVoucher));
  }

  useEffect(async () => {
    await LoadNFTVouchers();
    // console.log("loading", loading);
    $loading(false);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!voucherItems.length) return <p>Not any vouchers</p>;
  // console.log("items", items);

  return (
    <ListNFTCard
      listItem={voucherItems}
      buyMarketItem={mintingVoucher}
      type="voucher"
    />
  );
};

const Home = ({ marketplace, nft, account, signer }) => {
  const [loadingNFT, $loadingNFT] = useState(true);
  const [nftItems, $nftItems] = useState([]);
  const { state, dispatch } = useContext(NFTItemContext);

  const LoadListedNFTItems = async () => {
    let listedItems = [];
    await apolloClient
      .query({
        query: GET_NFT_ITEM_VOUCHER,
        fetchPolicy: "no-cache",
      })
      .then(async (result) => {
        const items = result.data.getNFTVouchers;
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const nftTokenId = ethers.BigNumber.from(item.nftTokenId);
          const blExist = true; //nft._exists(nftTokenId);
          if (blExist) {
            const uri = await nft.tokenURI(nftTokenId);
            const response = await fetch(uri);
            const nftMetaData = await response.json();
            // get total price of item (item price + fee)
            // console.log("item", item);
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
        }
      });
    return listedItems;
  };
  const loadMarketplaceItems = async () => {
    let listedNFTItems = await LoadListedNFTItems();
    dispatch({
      type: SET_ACTIVE_MARKET_ITEMS,
      payload: listedNFTItems,
    });
    $nftItems(listedNFTItems);
    $loadingNFT(false);
  };
  const buyMarketItem = async (nftItem) => {
    console.log("nftItem", nftItem);
    const nftItemVoucher = {
      owner: nftItem.owner,
      nftTokenId: nftItem.nftTokenId,
      status: nftItem.status,
      listedType: nftItem.listedType,
      price: nftItem.price,
      startingPrice: nftItem.startingPrice,
      endPrice: nftItem.endPrice,
      duration: nftItem.duration,
      signature: nftItem.signature,
    };
    console.log("nftItemVoucher", nftItemVoucher);
    const price = ethers.utils.parseEther(nftItem.price);
    const nftTokenId = ethers.BigNumber.from(nftItemVoucher.nftTokenId);
    const feePercent = await marketplace.feePercent();
    const numberPrice = parseInt(nftItem.price);
    const percent = 100 + feePercent.toNumber();
    const numberTotalPriceWithPercent = numberPrice * percent;
    const numberTotalPrice = numberTotalPriceWithPercent / 100;
    const strTotalPrice = numberTotalPrice.toString();
    const totalPrice = ethers.utils.parseEther(strTotalPrice);
    console.log(
      "feePercent",
      feePercent,
      "percent",
      percent,
      "numberTotalPriceWithPercent",
      numberTotalPriceWithPercent,
      "numberTotalPrice",
      numberTotalPrice
    );
    await (
      await marketplace.purchaseNFTItem(
        nftItemVoucher,
        price,
        nft.address,
        nftTokenId,
        { value: price }
      )
    ).wait();
    // update item status on server
    const nftTokenIdStr = nftItemVoucher.nftTokenId;
    await apolloClient
      .mutate({
        mutation: DELETE_NFT_VOUCHER,
        variables: { nftTokenId: nftTokenIdStr },
      })
      .then((result) => {
        // loadVoucherInformation(result.data.deleteVoucher)
      });

    await loadMarketplaceItems();
  };

  const navigate = useNavigate();
  const nftItemClickHandler = useCallback(
    (nftItem) => {
      console.log("nftItem", nftItem);
      console.log("nftItems", nftItems);

      const nftTokenId = nftItem.nftTokenId;
      const itemIndex = nftItems.findIndex((element) => {
        if (element.nftData.nftTokenId == nftTokenId) {
          return true;
        }
        return false;
      });
      const curItem = nftItems[itemIndex];
      if (curItem.listedType == NFTListedType.FixPrice) {
        buyMarketItem(curItem);
      } else {
        dispatch({
          type: SET_ACTIVE_NFT_ITEM,
          payload: curItem,
        });
        navigate(`${HomePageSlag}/nft-item-sale`, { replace: false });
      }
    },
    [navigate, nftItems]
  );

  useEffect(async () => {
    await loadMarketplaceItems();
    $loadingNFT(false);
  }, []);

  if (loadingNFT) {
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  }
  // function handleOpenseaIframe() {}
  return (
    <div className="flex justify-content">
      {/* <Button onClick={handleOpenseaIframe}>OpenSea.io</Button> */}
      <h1>NFTS FOR SALE</h1>
      {nftItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <ListNFTCard
            listItem={nftItems}
            buyMarketItem={nftItemClickHandler}
            type="market-nft"
          />
        </div>
      ) : (
        <main
          style={{
            padding: "1rem 0",
          }}
        >
          <h4>No listed NFTs for sale</h4>
        </main>
      )}
      <h1>NFT VOUCHERS</h1>
      <div className="px-5 container">
        <NFTVoucher nft={nft} signer={signer} />
      </div>
    </div>
  );
};

export default Home;
