import React from "react";
import { render } from "react-dom";
import "bootstrap/dist/css/bootstrap.css";
import App from "./frontend/components/App";
import LazyApp from "./frontend/components/LazyApp";
import * as serviceWorker from "./serviceWorker";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./config/createApolloClient";

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
