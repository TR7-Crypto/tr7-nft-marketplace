import React from "react";
import { render } from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import App from "./frontend/components/App";
import LazyApp from "./frontend/components/LazyApp";
import * as serviceWorker from "./serviceWorker";
import {
  ApolloProvider,
  ApolloClient,
  NormalizedCacheObject,
  gql,
} from "@apollo/client";
import { cache } from "./cache";
// import apolloClient from "./config/createApolloClient";

const apolloClient = new ApolloClient({
  cache,
  uri: "http://localhost:4000/graphql",
});

apolloClient
  .query({
    query: gql`
      query TestQuery {
        getVouchers {
          tokenId
          minPrice
          uri
          signature
          account
        }
      }
    `,
  })
  .then((result) => console.log(result));

const rootElement = document.getElementById("root");
render(
  <ApolloProvider client={apolloClient}>
    <LazyApp />
  </ApolloProvider>,
  rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
