// const mutations = require("./mutations");
// const queries = require("./queries");

// module.exports = {
//   Mutation: {
//     ...mutations,
//   },
//   Query: {
//     ...queries,
//   },
// };

const { Voucher, NFTVoucher } = require("../models");

// Provide resolver functions for the GraphQL schema
const resolvers = {
  /**
   * A GraphQL Query for posts that uses a Post model to query MongoDB
   * and get all Post documents.
   */
  Query: {
    getVouchers: async () => await Voucher.find({}),
    getVouchersByAccount: async (_, { account }) =>
      await Voucher.find({ account }),
    getNFTVouchers: async () => await NFTVoucher.find({}),
    getNFTVouchersByAccount: async (_, { owner }) =>
      await NFTVoucher.find({ owner }),
  },
  /**
   * A GraphQL Mutation that provides functionality for adding post to
   * the posts list and return post after successfully adding to list
   */
  Mutation: {
    addVoucher: async (_, { tokenId, minPrice, uri, signature, account }) => {
      const newVoucher = new Voucher({
        tokenId,
        minPrice,
        uri,
        signature,
        account,
      });
      const savedVoucher = await newVoucher.save();
      return savedVoucher;
    },
    deleteVoucher: async (_, { tokenId }) => {
      await Voucher.deleteOne({ tokenId: tokenId });
      return await Voucher.find({});
    },
    addNFTVoucher: async (
      _,
      {
        owner,
        nftTokenId,
        status,
        listedType,
        price,
        startingPrice,
        endPrice,
        duration,
        listedTimeStamp,
        signature,
      }
    ) => {
      const newNFTVoucher = new NFTVoucher({
        owner,
        nftTokenId,
        status,
        listedType,
        price,
        startingPrice,
        endPrice,
        duration,
        listedTimeStamp,
        signature,
      });
      const savedNFTVoucher = await newNFTVoucher.save();
      return savedNFTVoucher;
    },
    updateNFTVoucher: async (
      _,
      {
        owner,
        nftTokenId,
        status,
        listedType,
        price,
        startingPrice,
        endPrice,
        duration,
        listedTimeStamp,
        signature,
      }
    ) => {
      const filter = { nftTokenId: nftTokenId };
      const updateVoucher = {
        owner,
        nftTokenId,
        status,
        listedType,
        price,
        startingPrice,
        endPrice,
        duration,
        listedTimeStamp,
        signature,
      };
      const updatedNFTVoucher = await NFTVoucher.findOneAndUpdate(
        filter,
        updateVoucher,
        {
          new: true,
        }
      );
      return updatedNFTVoucher;
    },
    deleteNFTVoucher: async (_, { tokenId }) => {
      await NFTVoucher.deleteOne({ tokenId: tokenId });
      return await NFTVoucher.find({});
    },
  },
};

module.exports = resolvers;
