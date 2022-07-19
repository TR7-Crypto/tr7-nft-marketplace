import React, { createContext, useReducer } from "react";
//
/* 
  nftData: contain data for blockchain identification
  nftState: contain more fields for manage a specific nft item on the marketplace
  nftAllItemsState: contain all nft items on the marketplace
 */

export const NFTStatus = {
  NotMint: 0,
  Minted: 1,
};
export const NFTListedType = {
  NotListed: 0,
  FixPrice: 1,
  AuctionHighest: 2,
  AuctionDecline: 3,
};
const nftInitState = {
  nftData: {},
  owner: "",
  status: NFTStatus.NotMint,
  listedType: NFTListedType.NotListed,
  price: "",
  startingPrice: "",
  endPrice: "",
  duration: "",
  history: [] /* store history of all actions - stick with timestamp */,
};

const nftAllItemsInitState = {
  marketItems: [],
  curItem: {},
};

export const NFTItemContext = createContext();

export const SET_ACTIVE_NFT_ITEM = Symbol("SET_ACTIVE_NFT_ITEM");
export const SET_ACTIVE_MARKET_ITEMS = Symbol("SET_ACTIVE_MARKET_ITEMS");

const NFTItemProvider = ({ children }) => {
  const reducerFunction = (state, action) => {
    const currentState = { ...state };
    switch (action.type) {
      case SET_ACTIVE_MARKET_ITEMS:
        currentState.marketItems = action.payload;
        return currentState;

      case SET_ACTIVE_NFT_ITEM:
        const nftItem = action.payload;
        if (
          !nftItem.listedType ||
          nftItem.listedType == NFTListedType.NotListed
        ) {
          currentState.curItem = nftItem;
        } else {
          const nftTokenId = nftItem.nftTokenId;
          console.log("marketItems", currentState.marketItems);
          const itemIndex = currentState.marketItems.findIndex((element) => {
            if (element.nftTokenId == nftTokenId) {
              return true;
            }
            return false;
          });
          console.log("itemIndex", itemIndex);

          const curNftItem = currentState.marketItems[itemIndex];
          console.log("curNftItem", curNftItem);
          currentState.curItem = curNftItem;
        }

        return currentState;

      default:
        return currentState;
    }
  };

  const isPromise = (obj) => {
    return (
      !!obj &&
      (typeof obj === "object" || typeof obj === "function") &&
      typeof obj.then === "function"
    );
  };
  const middleware = (dispatch) => {
    return (action) => {
      if (isPromise(action.payload)) {
        action.payload.then((v) => {
          dispatch({ type: action.type, payload: v });
        });
      } else {
        dispatch(action);
      }
    };
  };
  const [state, dispatch] = useReducer(reducerFunction, nftAllItemsInitState);

  return (
    <NFTItemContext.Provider value={{ state, dispatch: middleware(dispatch) }}>
      {children}
    </NFTItemContext.Provider>
  );
};
export default NFTItemProvider;
