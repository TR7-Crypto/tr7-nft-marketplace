// Show all NFTs (including vouchers) have listed status
import React, { useState, useEffect, lazy } from "react";
import { ethers, providers } from "ethers";
import ListNFTCard from "./GUI/Component/Section/ListNFTCard";
import { gql, useQuery } from "@apollo/client";
import { apolloClient } from "../../index";
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
    console.log("vouchers", vouchers);
    const itemCount = vouchers.length;
    console.log("voucher count", vouchers.length);
    let items = [];
    for (let i = 0; i < itemCount; i++) {
      const item = vouchers[i];
      const uri = item.uri;
      const response = await fetch(uri);
      const metadata = await response.json();
      // get total price of item (item price + fee)
      const totalPrice = item.minPrice; //TODO + fee
      // Add item to items array
      items.push({
        totalPrice,
        itemId: 1, //item.itemId, //TODO
        seller: item.account,
        name: metadata.name,
        description: metadata.description,
        image: metadata.image,
        type: metadata.type,
        externalLink: metadata.externalLink,
        voucher: item,
      });
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
  function reloadVoucher() {
    $loading(true);
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
      type="mint"
    />
  );
};

const Home = ({ marketplace, nft, account, signer }) => {
  const [items, $items] = useState([]);
  const [loadingNFT, $loadingNFT] = useState(true);

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();
    let items = [];
    // console.log("itemCount ", itemCount);
    for (let i = 1; i <= itemCount; i++) {
      // console.log("try load item", i);
      try {
        const item = await marketplace.items(i);
        if (!item.sold) {
          // get uri url from nft contract
          const uri = await nft.tokenURI(item.tokenId);
          // console.log("uri", uri);
          // use uri to fetch the nft metadata stored on ipfs
          const response = await fetch(uri);
          // console.log("response ", i, response);
          const metadata = await response.json();
          // console.log("json scheme:", metadata);
          // console.log("item", i, "json", metadata);
          // get total price of item (item price + fee)
          const totalPrice = await marketplace.getTotalPrice(item.itemId);
          // console.log("item", i, "total price", totalPrice);
          // Add item to items array
          items.push({
            totalPrice,
            itemId: item.itemId,
            seller: item.seller,
            name: metadata.name,
            description: metadata.description,
            image: metadata.image,
            type: metadata.type,
            externalLink: metadata.externalLink,
          });
        }
      } catch (error) {
        console.log("load item", i, "got error", error);
      }
    }
    $items(items);
    $loadingNFT(false);
  };
  const buyMarketItem = async (item) => {
    await (
      await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })
    ).wait();
    loadMarketplaceItems();
  };
  useEffect(() => {
    loadMarketplaceItems();
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
      {items.length > 0 ? (
        <div className="px-5 container">
          <ListNFTCard listItem={items} buyMarketItem="" type="sale" />
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
