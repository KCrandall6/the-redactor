import React, { useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import JSZip from 'jszip';
import nlp from 'compromise/three';
import datePlugin from 'compromise-dates';
import Redactor from './RedactionForm/Redactor';
import PreviewIteration from './Preview/PreviewIteration';

nlp.plugin(datePlugin);

const Home = () => {
  const [redactStep, setRedactStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFileInvalid, setIsFileInvalid] = useState(false);
  const [isRedacting, setIsRedacting] = useState(false);
  const [parsedFile, setParsedFile] = useState(null);
  const [wordMap, setWordMap] = useState({});
  const [redactFiller, setRedactFiller] = useState('[redacted]');

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
        const paragraphs = xmlDoc.getElementsByTagName('w:p');
        let textContentArr = [];
        let currentParagraph = '';
        for (let i = 0; i < paragraphs.length; i++) {
          const paragraphText = paragraphs[i].textContent.trim(); // Remove leading/trailing whitespace
          currentParagraph += paragraphText + ' '; // Concatenate the paragraph text with a space separator
          if (paragraphText.endsWith('\n') || i === paragraphs.length - 1) {
            textContentArr.push(currentParagraph.trim()); // Push the complete paragraph text to the array
            currentParagraph = ''; // Reset the current paragraph
          }
        }
        const textContent = textContentArr.join(' ');

        // parsedFile is so I have a copy of the original, to eventually reconstruct and replace redacted words
        setParsedFile(contentXml);
  
        // Evaluate text HERE with Compromise, passing the pronouns (names, places, dates) into the wordMap hook
        const doc2 = nlp(textContent);
        let pronouns = doc2
        .pronouns()
        .concat(doc2.match('(male|female)'))
        .json();
          const filteredPronouns = pronouns.filter((pronoun) => {
            const word = pronoun.text;
            const excludedPronouns = ['I', 'me', 'myself', 'it', 'you'];
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return !excludedPronouns.some((excluded) => regex.test(excluded));
          });      
        let names = doc2.people().json();
        let places = doc2.places().json();
        let orgs = doc2.organizations().json();
        let ages = doc2.match('(#Value|#TextValue) years old').numbers().lessThan(105).json();
        let ages1 = doc2.match('aged (#Value|#TextValue)').numbers().lessThan(105).json();
        let ages2 = doc2.match('age (#Value|#TextValue)').numbers().lessThan(105).json();
        let dates = doc2.dates().json();
        const filteredDates = dates.filter(date => {
          // Regular expressions for explicit and numeric date formats
          const explicitDateRegex = /^(?:\d{1,2}\s)?(?:January|February|March|April|May|June|July|August|September|October|November|December)(?:\s\d{1,2}(?:st|nd|rd|th)?)?(?:\s\d{4})?$/i;
          const numericDateRegex = /^(?:\d{1,2}[-./])?(?:\d{1,2}[-./])?\d{2}(?:\d{2})?$/;
          const yearRegex = /^\d{4}$/;
          const monthRegex = /^(?:January|February|March|April|May|June|July|August|September|October|November|December)$/i;
        
          // Split the text into individual words
          const words = date.text.split(/\s+/);
        
          // Remove punctuation from words
          const sanitizedWords = words.map(word => word.replace(/[.,:;]+$/, ''));
        
          // Check if any word matches the specified formats
          const hasExplicitDate = sanitizedWords.some(word => explicitDateRegex.test(word));
          const hasNumericDate = sanitizedWords.some(word => numericDateRegex.test(word));
          const hasYear = sanitizedWords.some(word => yearRegex.test(word));
          const hasMonth = sanitizedWords.some(word => monthRegex.test(word));
        
          // Filter out unwanted date formats
          return hasExplicitDate || hasNumericDate || hasYear || hasMonth;
        });
        
          function removeDuplicatesByProperty(array, property) {
            return array.filter((item, index, self) => {
              const editedText = item[property].replace(/[.,:;]+$/, ''); // Remove punctuation from the end
              item[property] = editedText; // Update the text property with edited text
              return self.findIndex((obj) => obj[property] === editedText) === index;
            });
          }
          
        setWordMap({
          Names: removeDuplicatesByProperty(names, 'text'),
          Places: removeDuplicatesByProperty(places, 'text'),
          Organizations: removeDuplicatesByProperty(orgs, 'text'),
          Dates: removeDuplicatesByProperty(filteredDates, 'text'),
          Ages: removeDuplicatesByProperty([ages, ages1, ages2].flat(2), 'text'),
          Pronouns: removeDuplicatesByProperty(filteredPronouns, 'text'),
          Additional: [],
        });

        setRedactStep(2);
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

  const reset = () => {
    setRedactStep(1);
    setSelectedFile(null);
    setParsedFile(null);
    setWordMap({});
    setRedactFiller('[redacted]')
  };

  return (
    <>
      <div className='d-flex flex-column align-items-center'>
        {redactStep === 1 ? (
          <>
            <Form className='mt-5 d-flex flex-column align-items-center text-center'>
              <Form.Group controlId="formFileLg" className="mb-5">
                <Form.Label>Choose a Word document to start redactions</Form.Label>
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
        ) : redactStep === 2 ? (
          <Redactor selectedFile={selectedFile} parsedFile={parsedFile} wordMap={wordMap} setWordMap={setWordMap} redactFiller={redactFiller} setRedactFiller={setRedactFiller} setRedactStep={setRedactStep}/>
        ) : redactStep === 3 ? (
          <PreviewIteration selectedFile={selectedFile} parsedFile={parsedFile} wordMap={wordMap} redactFiller={redactFiller} setRedactFiller={setRedactFiller} setWordMap={setWordMap} reset={reset}/>
        ) : null}
      </div>
    </>
  );
};

export default Home;
