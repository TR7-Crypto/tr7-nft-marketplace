import React from "react";
import { Spinner } from "react-bootstrap";

const Loading = ({ description }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Spinner animation="border" style={{ display: "flex" }} />
      <p className="mx-3 my-0">{description}</p>
    </div>
  );
};

export default Loading;
