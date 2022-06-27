import React from "react";
import { Form } from "react-bootstrap";

const InputText = ({ size, label, labelDes, description, onChangeHandler }) => {
  return (
    <>
      <Form.Group className="d-flex-col justify-content-around mb-4">
        <Form.Label className="d-flex text-primary fs-4">{label}</Form.Label>
        {labelDes.length > 0 && (
          <Form.Label className="d-flex text-secondary text-start fs-6">
            {labelDes}
          </Form.Label>
        )}
        <Form.Control
          onChange={onChangeHandler}
          size={size}
          as="textarea"
          placeholder={description}
        />
      </Form.Group>
    </>
  );
};

export default InputText;
