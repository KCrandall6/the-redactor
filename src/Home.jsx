import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import JSZip from 'jszip';
import nlp from 'compromise/three';
import datePlugin from 'compromise-dates'
import Redactor from './Redactor';

nlp.plugin(datePlugin);

const Home = () => {
  const [startRedact, setStartRedact] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileInvalid, setIsFileInvalid] = useState(false);
  const [isRedacting, setIsRedacting] = useState(false);
  const [parsedFile, setParsedFile] = useState(null);
  const [wordMap, setWordMap] = useState({});

  const onDocSuccess = async () => {
    try {
      setIsRedacting(true);
      const fileReader = new FileReader();
      fileReader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        const zip = new JSZip();
        const doc = await zip.loadAsync(arrayBuffer);
        const contentXml = await doc.file('word/document.xml').async('string');
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(contentXml, 'text/xml');
        const paragraphs = xmlDoc.getElementsByTagName('w:t');
        let textContent = '';
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraphText = paragraphs[i].textContent;
          if (i > 0) {
            textContent += ' ';
          }
          textContent += paragraphText;
        }
        
        // parsedFile is so I have a copy of the original, to eventually reconstruct and replace redacted words
        setParsedFile(contentXml);
  
        // Evaluate text HERE with Compromise, passing the pronouns (names, places, dates) into the wordMap hook
        const doc2 = nlp(textContent);
        const names = doc2.people().json();
        const places = doc2.places().json();
        const orgs = doc2.organizations().json();
        const dates = doc2.dates().json();
        const filteredDates = dates.filter(date => {
          // Regular expressions for explicit and numeric date formats
          const explicitDateRegex = /^(?:\d{1,2}\s)?(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s\d{1,2}(?:st|nd|rd|th)?)?(?:\s\d{4})?$/i;
          const numericDateRegex = /^(?:\d{1,4}[-./])?\d{1,2}[-./]\d{1,4}$/;
          const yearRegex = /^\d{4}$/;
          const monthRegex = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)$/i;
        
          // Split the text into individual words
          const words = date.text.split(/\s+/);
        
          // Check if any word matches the specified formats
          const hasExplicitDate = words.some(word => explicitDateRegex.test(word));
          const hasNumericDate = words.some(word => numericDateRegex.test(word));
          const hasYear = words.some(word => yearRegex.test(word));
          const hasMonth = words.some(word => monthRegex.test(word));
        
          // Filter out unwanted date formats
          return (hasExplicitDate || hasNumericDate || hasYear || hasMonth);
        });
        
        setWordMap({
          Names: names,
          Places: places,
          Organizations: orgs,
          Dates: filteredDates,
        });
  
        setStartRedact(!startRedact);
        setIsRedacting(false);
      };
      fileReader.readAsArrayBuffer(selectedFile);
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
        // update later to include support for pdf redactions 
        // file.type === 'application/pdf' ||
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    ) {
      setIsFileInvalid(false);
      setSelectedFile(file);
    } else {
      // Display an error message or handle the invalid file type
      setIsFileInvalid(true);
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
          <Redactor selectedFile={selectedFile} parsedFile={parsedFile} wordMap={wordMap}/>
        )}
      </div>
    </>
  );
};

export default Home;
