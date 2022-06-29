const { gql } = require("apollo-server");

// Construct a schema using GraphQL schema language
const typeDefs = gql`
  type Voucher {
    tokenId: String
    minPrice: String
    uri: String
    signature: String
    account: String
  }
  type Query {
    getVouchers: [Voucher]
    getVouchersByAccount(account: String!): [Voucher]!
  }
  type Mutation {
    addVoucher(
      tokenId: String
      minPrice: String
      uri: String
      signature: String
      account: String
    ): Voucher!
  }
`;

module.exports = typeDefs;
