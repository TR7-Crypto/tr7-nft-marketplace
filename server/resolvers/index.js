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

const { Voucher } = require("../models");

// Provide resolver functions for the GraphQL schema
const resolvers = {
  /**
   * A GraphQL Query for posts that uses a Post model to query MongoDB
   * and get all Post documents.
   */
  Query: {
    getVouchers: async () => await Voucher.find({}),
    getVouchersByAccount: async (_, { account }) =>
      await Voucher.find({ account: { account } }),
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
  },
};

module.exports = resolvers;
