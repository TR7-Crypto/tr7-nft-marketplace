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
  type NFTVoucher {
    owner: String
    nftTokenId: String
    status: String
    listedType: String
    price: String
    startingPrice: String
    endPrice: String
    duration: String
    listedTimeStamp: String
    signature: String
  }

  type Query {
    getVouchers: [Voucher]
    getVouchersByAccount(account: String!): [Voucher]!
    getNFTVouchers: [NFTVoucher]
    getNFTVouchersByAccount(owner: String!): [NFTVoucher]!
  }
  type Mutation {
    addVoucher(
      tokenId: String
      minPrice: String
      uri: String
      signature: String
      account: String
    ): Voucher!
    deleteVoucher(tokenId: String): [Voucher]!
    addNFTVoucher(
      owner: String
      nftTokenId: String
      status: String
      listedType: String
      price: String
      startingPrice: String
      endPrice: String
      duration: String
      listedTimeStamp: String
      signature: String
    ): NFTVoucher!
    updateNFTVoucher(
      owner: String
      nftTokenId: String
      status: String
      listedType: String
      price: String
      startingPrice: String
      endPrice: String
      duration: String
      listedTimeStamp: String
      signature: String
    ): NFTVoucher!
    deleteNFTVoucher(nftTokenId: String): [NFTVoucher]!
  }
`;

module.exports = typeDefs;
