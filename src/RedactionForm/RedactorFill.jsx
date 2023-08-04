import React from 'react';
import {Form} from 'react-bootstrap';

const RedactorFill = ({redactFiller, setRedactFiller}) => {

  const handleInputChange = (event) => {
    setRedactFiller(prevRedactFiller => ({
      ...prevRedactFiller,
      filler: event.target.value,
    }));
  };

  return (
    <div className="d-flex flex-column text-center align-items-center mb-5">
        <p className='p-2'><em><b>Step 2 Instructions:</b> Here you can change what word will be replace the redacted one. As a default, the word [redacted] will replace it. But, you may customize the redaction part if desired.</em></p>
      <Form >
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