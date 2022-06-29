const { gql } = require("apollo-server");

// Construct a schema using GraphQL schema language
const typeDefs = gql`
  type User {
    userId: String!
    account: String!
    nonce: String!
    signature: String
  }
  type Query {
    getUsers: [User]!
  }
  type Mutation {
    addUser(account: String!, signature: String!): User!
  }
`;

module.exports = typeDefs;
