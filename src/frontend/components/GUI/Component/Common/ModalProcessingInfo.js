import React from "react";
import { Modal, Button, Spinner } from "react-bootstrap";

const ModalProcessingInfo = ({ messages }) => {
  return (
    <Modal
      // {...props}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show
      // onHide={closeHandler}
    >
      {/* <Modal.Body> */}
      <Button variant="primary" disabled>
        <Spinner
          as="span"
          animation="grow"
          size="sm"
          role="status"
          aria-hidden="true"
        />
        {messages.split("\n").map((i, key) => {
          return <div key={key}>{i}</div>;
        })}
      </Button>
      {/* </Modal.Body> */}
    </Modal>
  );
};

export default ModalProcessingInfo;
