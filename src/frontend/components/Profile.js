import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";

const Profile = ({ marketplace, nft, account, signer }) => {
  const [balance, $balance] = useState();
  const [adminAccount, $adminAccount] = useState();
  function withdrawHandler() {
    // call marketplace contract to withdraw all market fee has been collected
  }
  useEffect(async () => {
    const accountBalance = await signer.getBalance();
    $balance(ethers.utils.formatEther(accountBalance).slice(0, 10));
    const admin = await marketplace.feeAccount();
    $adminAccount(admin.toString().toLowerCase());
  });
  return (
    <div className="d-flex-col">
      <h1>Your Wallet</h1>
      <div className="mx-5">
        <ButtonGroup className="mb-2">
          <Button variant="primary" disabled>
            Address
          </Button>
          <Button variant="outline-dark" disabled>
            {account}
          </Button>
        </ButtonGroup>
        <br />
        <ButtonGroup className="mb-2">
          <Button variant="primary" disabled>
            Balance
          </Button>
          <Button variant="outline-dark" disabled>
            {balance} $ETH
          </Button>
        </ButtonGroup>
      </div>
      {/* {account == adminAccount && (
        <Button onClick={withdrawHandler}>Withdraw Market Fee</Button>
      )} */}
    </div>
  );
};

export default Profile;
