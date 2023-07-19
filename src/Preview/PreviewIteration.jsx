import React, { useEffect, useState, useRef } from 'react';
import { Accordion, Button, Container, Form, Row, Col } from 'react-bootstrap';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import AddWordModal from './AddWordModal';
import RedactedWordCard from '../RedactionForm/RedactedWordCard';


const PreviewIteration = ({selectedFile, parsedFile, wordMap, redactFiller, setRedactFiller, setWordMap, reset }) => {
  const [redactedFile, setRedactedFile] = useState(null);
  const outputRef = useRef(null);

  useEffect(() => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(parsedFile, 'text/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const textNodes = paragraph.getElementsByTagName('w:t');
      for (let j = 0; j < textNodes.length; j++) {
        const textNode = textNodes[j];
        let text = textNode.textContent.trim();
        for (const key in wordMap) {
          const wordList = wordMap[key];
          for (let k = 0; k < wordList.length; k++) {
            const wordObj = wordList[k];
            const word = wordObj.text;
            // const redactFiller = redactFiller;
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            text = text.replace(regex, redactFiller);
          }
        }
        textNode.textContent = text;
      }
    }
    const serializer = new XMLSerializer();
    let updatedFile = serializer.serializeToString(xmlDoc);
    // Find the position of the complete XML declaration
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const index = updatedFile.indexOf(xmlDeclaration) + xmlDeclaration.length;
    // Insert new line character after the complete XML declaration
    updatedFile = updatedFile.slice(0, index) + '\n' + updatedFile.slice(index);
    setRedactedFile(updatedFile);
  }, [parsedFile, wordMap]);

  useEffect(() => {
    if (redactedFile) {
      // Convert redacted XML content to a Blob
      const content = new Blob([redactedFile], { type: 'application/zip' });
      // Read the binary content of selectedFile as ArrayBuffer
      const fileReader = new FileReader();
      fileReader.onload = async function (event) {
        const arrayBuffer = event.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        // Load the .docx template using PizZip with the selectedFile content as buffer
        const zip = new PizZip();
        zip.load(uint8Array);
        // Read the redacted XML content as text
        const redactedContent = await new Response(content).text();
        // Set the redacted XML content in the zip variable
        zip.file('word/document.xml', redactedContent);
        const doc = new Docxtemplater(zip, {
          paragraphLoop: true,
          linebreaks: true,
        });
        try {
          // Render the document (replace all occurrences of the data in the template)
          doc.render();
        } catch (error) {
          // Handle any errors that occurred during rendering
          console.error('Error rendering document:', error);
          return;
        }
        // Generate the final .docx file
        const output = doc.getZip().generate({
          type: 'blob',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });
        // Store the output in the ref
        outputRef.current = output;
      };
      fileReader.readAsArrayBuffer(selectedFile);
    }
  }, [redactedFile, selectedFile]);

  const saveAsWordDoc = () => {
    if (!outputRef.current) {
      console.error('Redacted file content is empty. Please redact the content first.');
      return;
    }
    // Save the .docx file with a custom name
    saveAs(outputRef.current, 'output.docx');
  };

  const handleInputChange = (event) => {
    setRedactFiller(event.target.value);
  };

  return (
    <>
      <Button className='mt-2' size='sm' variant="warning" onClick={reset}>reset</Button>
      <h1>A preview of the final</h1>
      {/* Preview of the document */}
      <div className='d-flex flex-wrap justify-content-center'>
        <Button className='mt-3 ms-3 me-3' size='lg' onClick={saveAsWordDoc}>Download as Word Doc</Button>
        <Button className='mt-3 ms-3 me-3' size='lg'>Download as PDF</Button>
      </div>
      <Container className="mt-5 d-flex flex-column justify-content-center align-items-center text-center" style={{ maxWidth: '900px' }}>
        <p>Edit the input below to change the word to be redacted</p>
        <Form style={{ maxWidth: '300px' }}>
          <Form.Control
            className='text-center fs-3 ps-5 pe-5 border-primary'
            defaultValue={redactFiller}
            onChange={handleInputChange}
            />
        </Form>
      </Container>
      <Container className="mt-5 mb-5 d-flex align-items-start text-center" style={{ maxWidth: '900px' }}>
        {/* <p>Add instructions?</p> */}
        <div className="w-100"> {/* Use a div with w-100 class to create a full-width row */}
          <Accordion className='text-start w-100' defaultActiveKey={['0']} alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header style={{}}>
                Additional Words/Phrases ({wordMap.Additional.length})
              </Accordion.Header>
              <Accordion.Body className="d-flex flex-wrap p-2" style={{ flexGrow: 1 }}> {/* Set flexGrow: 1 */}
                {wordMap.Additional.map((word, innerIndex) => (
                  <RedactedWordCard key={innerIndex + 1} category={'Additional'} word={word} wordMap={wordMap} setWordMap={setWordMap} />
                ))}
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </div>
        <AddWordModal wordMap={wordMap} setWordMap={setWordMap} />
      </Container>
    </>
  );
};

export default PreviewIteration;
