import React, { useState } from 'react';
import {Container, Form} from 'react-bootstrap';

const RedactorFill = ({redactFiller, setRedactFiller}) => {
  const [boldStyle, setBoldStyle] = useState(false);
  const [italicStyle, setItalicStyle] = useState(false);
  const [redColor, setRedColor] = useState(false);

  const handleInputChange = (event) => {
    setRedactFiller((prevRedactFiller) => ({
      ...prevRedactFiller,
      filler: event.target.value,
      styling: {
        bold: boldStyle,
        italic: italicStyle,
        color: redColor ? 'red' : 'black',
      },
    }));
  };

  console.log('redact', redactFiller)

  const handleStyleChange = (event) => {
    const targetId = event.target.id;
    let newStyling = {
      bold: boldStyle,
      italic: italicStyle,
      color: redColor ? 'red' : 'black',
    };
  
    switch (targetId) {
      case 'custom-switch-bold':
        setBoldStyle(!boldStyle);
        newStyling.bold = !boldStyle;
        break;
      case 'custom-switch-italic':
        setItalicStyle(!italicStyle);
        newStyling.italic = !italicStyle;
        break;
      case 'custom-switch-red':
        setRedColor(true);
        newStyling.color = 'red';
        break;
      case 'custom-switch-default':
        setRedColor(false);
        newStyling.color = 'black';
        break;
      default:
        break;
    }
  
    setRedactFiller((prevRedactFiller) => ({
      ...prevRedactFiller,
      styling: newStyling,
    }));
  };
  

  return (
    <div className="d-flex flex-column text-center align-items-center mb-5">
        <p className='p-2'><em><b>Step 2 Instructions:</b> Here you can change what word will be replace the redacted one. As a default, the word [redacted] will replace it. But, you may customize the redaction part if desired.</em></p>
      <Form >
        <h6>Style of redacted word</h6>
        <Container className='d-flex justify-content-around mb-3'>
          <Form.Check
            type="switch"
            id="custom-switch-bold"
            label="Bold"
            onChange={handleStyleChange}
          />
          <Form.Check
            type="switch"
            id="custom-switch-italic"
            label="Italic"
            onChange={handleStyleChange}
          />
        </Container>
        <h6>Color of redacted word</h6>
        <Container className='d-flex justify-content-around mb-3'>
          <Form.Check
            type="switch"
            id="custom-switch-default"
            label="Default (black)"
            checked={!redColor}
            onChange={handleStyleChange}
          />
          <Form.Check
            type="switch"
            id="custom-switch-red"
            label="Red"
            checked={redColor}
            onChange={handleStyleChange}
          />
        </Container>
        <Form.Control
          className='text-center fs-3 ps-5 pe-5 border-primary'
          defaultValue={redactFiller.filler}
          onChange={handleInputChange}
          />
      </Form>
    </div>
  )
};

export default RedactorFill;