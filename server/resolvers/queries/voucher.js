const Voucher = require("./models");

// Provide resolver functions for the GraphQL schema
const resolvers = {
  /**
   * A GraphQL Query for posts that uses a Post model to query MongoDB
   * and get all Post documents.
   */
  Query: {
    getVouchers: () => Voucher.find({}),
    getVouchersByAccount: (account) => Voucher.find({ account: $account }),
  },
  /**
   * A GraphQL Mutation that provides functionality for adding post to
   * the posts list and return post after successfully adding to list
   */
  Mutation: {
    addVoucher: (parent, voucher) => {
      const newVoucher = new Voucher(voucher);
      return newVoucher.save();
    },
  },
};

module.exports = resolvers;
