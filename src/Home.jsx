import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import Redactor from './Redactor';

const Home = () => {
  const [startRedact, setStartRedact] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileInvalid, setIsFileInvalid] = useState(false);
  const [isRedacting, setIsRedacting] = useState(false);

  const onDocSuccess = async () => {
    try {
      setIsRedacting(true);
      setStartRedact(!startRedact);
      setIsRedacting(false);
    } catch {
      setIsRedacting(false);
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFile(null);
    const file = event.target.files[0];
    // Check if the selected file is a Word document (doc or docx) or PDF
    if (
      file &&
      (file.type === 'application/msword' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/pdf')
    ) {
      setIsFileInvalid(false);
      setSelectedFile(file);
    } else {
      // Display an error message or handle the invalid file type
      setIsFileInvalid(true);
      console.log('Invalid file type. Please select a Word document (doc or docx) or PDF.');
    }
  };
  

  return (
    <>
      <div className='d-flex flex-column align-items-center'>
        {!startRedact ? (
          <>
            <Form className='mt-5 d-flex flex-column align-items-center text-center'>
              <Form.Group controlId="formFileLg" className="mb-5">
                <Form.Label>Choose a document or PDF to start redactions</Form.Label>
                <Form.Control
                  type="file"
                  size="lg"
                  isInvalid={isFileInvalid}
                  onChange={handleFileSelect}
                />
              {isFileInvalid && (
                <Form.Text className="text-danger">
                  invalid file, try another one
                </Form.Text>
              )}
              </Form.Group>
              <Button disabled={selectedFile === null} size="lg" onClick={onDocSuccess}>
                {isRedacting ? (
                  <Spinner animation="border" size="sm" role="status" className="me-2">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : (
                  'Start Redacting'
                )}
              </Button>
            </Form>
          </>
        ) : (
          <Redactor selectedFile={selectedFile} />
        )}
      </div>
    </>
  );
};

export default Home;
