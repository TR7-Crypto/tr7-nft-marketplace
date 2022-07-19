import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalError = ({ error, closeHandler }) => {
  return (
    <Modal
      // {...props}
      size="sm"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      // show
      // onHide={closeHandler}
    >
      <Modal.Header closeButton>
        <Modal.Title
          id="contained-modal-title-vcenter"
          className="text-primary"
        >
          Error
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-warning">{error}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={closeHandler}>CLOSE</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalError;
