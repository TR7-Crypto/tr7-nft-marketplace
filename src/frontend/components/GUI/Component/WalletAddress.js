import React from "react";

const WalletAddress = ({ account }) => {
  return <span>{account.slice(0, 5) + "..." + account.slice(38, 42)}</span>;
};

export default WalletAddress;
