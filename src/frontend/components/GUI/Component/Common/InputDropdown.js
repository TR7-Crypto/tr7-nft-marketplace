import React, { useState } from "react";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";

const InputDropdown = ({ label, labelDes, onChangeHandler, items }) => {
  const [activeItem, $activeItem] = useState(0);

  return (
    <Form.Group className="d-flex-col justify-content-around mb-4">
      <Form.Label className="d-flex text-primary fs-4">{label}</Form.Label>
      {labelDes.length > 0 && (
        <Form.Label className="d-flex text-secondary text-start fs-6">
          {labelDes}
        </Form.Label>
      )}
      <DropdownButton
        id="dropdown-item-button"
        // variant="secondary"
        // menuVariant="dark"
        title={items[activeItem]}
      >
        {items.map((item, idx) => (
          <Dropdown.Item
            key={idx}
            as="button"
            active={activeItem == idx ? true : false}
            value={item}
            onClick={(e) => {
              e.preventDefault();
              $activeItem(idx);
              console.log("item clicked", e.target.value);
              onChangeHandler(e);
            }}
          >
            {item}
          </Dropdown.Item>
        ))}
      </DropdownButton>
    </Form.Group>
  );
};

export default InputDropdown;
