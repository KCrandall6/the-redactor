import React, { useEffect, useState, useRef } from 'react';
import { Accordion, Button, Container, Form} from 'react-bootstrap';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import docxToPdfAxios from 'docx-to-pdf-axios';

import AddWordModal from './AddWordModal';
import RedactedWordCard from '../RedactionForm/RedactedWordCard';
import DocViewerComponent from './DocViewerComponent';


const PreviewIteration = ({selectedFile, parsedFile, wordMap, redactFiller, setRedactFiller, setWordMap, reset }) => {
  const [redactedFile, setRedactedFile] = useState(null);
  const outputDocRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [fileName, setFileName] = useState('');


  useEffect(() => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(parsedFile, 'text/xml');
    const paragraphs = xmlDoc.getElementsByTagName('w:p');
  
    // Create an array of wordMap entries sorted by length in descending order
    const sortedWordMap = Object.entries(wordMap).sort(
      ([aKey], [bKey]) => bKey.length - aKey.length
    );
  
    for (let i = 0; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i];
      const textNodes = paragraph.getElementsByTagName('w:t');
      let combinedText = '';
  
      for (let j = 0; j < textNodes.length; j++) {
        const textNode = textNodes[j];
        const text = textNode.textContent;
        combinedText += text; // Concatenate the text content of all text nodes
      }

      // Replace words/phrases in the combined text based on sortedWordMap
      for (const [, wordList] of sortedWordMap) {
        for (let k = 0; k < wordList.length; k++) {
          const wordObj = wordList[k];
          const word = wordObj.text;
          const regex = new RegExp(`\\b${word}\\b`, 'g');
          combinedText = combinedText.replace(regex, redactFiller.filler);
        }
      }

      // for (let j = 0; j < textNodes.length; j++) {
      //   const textNode = textNodes[j];
      //   let text = textNode.textContent;
      //   // Replace words/phrases in the text based on sortedWordMap
      //   for (const [, wordList] of sortedWordMap) {
      //     for (let k = 0; k < wordList.length; k++) {
      //       const wordObj = wordList[k];
      //       const word = wordObj.text;
      //       const regex = new RegExp(`\\b${word}\\b`, 'g');
      //       text = text.replace(regex, redactFiller.filler);
      //     }
      //   }
      // }
  
      // Clear existing text nodes
      while (textNodes.length > 0) {
        textNodes[0].parentNode.removeChild(textNodes[0]);
      }
  
      // Split the combined text and create new run elements
      const newTextNodes = combinedText.split(/(<\/?w:t>)/); // Split at opening and closing <w:t> tags
      for (let j = 0; j < newTextNodes.length; j++) {
        const newText = newTextNodes[j];
  
        if (newText === '<w:t>') {
          continue; // Skip opening <w:t> tags
        }
  
        if (newText === '</w:t>') {
          continue; // Skip closing </w:t> tags
        }
  
        // Create a new run element
        const newRun = xmlDoc.createElement('w:r');
  
        // Create a new text element and set its content
        const newTextElement = xmlDoc.createElement('w:t');
        newTextElement.setAttribute('xml:space', 'preserve'); // Add xml:space attribute
        newTextElement.textContent = newText || '';
  
        newRun.appendChild(newTextElement);
  
        // Append the new run element to the paragraph
        paragraph.appendChild(newRun);
      }
    }
  
    const serializer = new XMLSerializer();
    let updatedFile = serializer.serializeToString(xmlDoc);
    const xmlDeclaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
    const index = updatedFile.indexOf(xmlDeclaration) + xmlDeclaration.length;
    updatedFile = updatedFile.slice(0, index) + '\n' + updatedFile.slice(index);
    setRedactedFile(updatedFile);
  }, [parsedFile, wordMap, redactFiller]);
  
  
  
  console.log('redact123', redactFiller)
  console.log('file', redactedFile)
  console.log('parsed', parsedFile)

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
        outputDocRef.current = output;

        // Convert .docx document into a .pdf document
        try {
          const pdfArrayBuffer = await docxToPdfAxios(outputDocRef.current);
          setPdf(pdfArrayBuffer);
        } catch (error) {
          console.error('Error converting .docx to .pdf:', error);
          // Handle the error here
        }
    };
      fileReader.readAsArrayBuffer(selectedFile);
    }
    if (selectedFile) {
      setFileName(selectedFile.name.substring(0, selectedFile.name.length-5) + '_redacted')
    }
  }, [redactedFile, selectedFile]);


  const saveAsWordDoc = () => {
    if (!outputDocRef.current) {
      console.error('Redacted file content is empty. Please redact the content first.');
      return;
    }
    // Save the .docx file with a custom name using saveAs method
    saveAs(outputDocRef.current, fileName);
  };
  

  const saveAsPDF = () => {
    if (!pdf) {
      console.error('PDF is not available. Please wait for it to load.');
      return;
    }
    // Convert the ArrayBuffer to a Blob
    const pdfBlob = new Blob([pdf], { type: 'application/pdf' });
    // Save the PDF Blob with a custom name using saveAs method
    saveAs(pdfBlob, fileName);
  };
  
  const handleInputChange = (event) => {
    setRedactFiller(prevRedactFiller => ({
      ...prevRedactFiller,
      filler: event.target.value,
    }));
  };

  return (
    <>
      <Container className='text-center' style={{ maxWidth: '900px' }}>
        <div className='d-flex justify-content-end mt-2 mb-3'>
          <Button className='mt-2' size='sm' variant="warning" onClick={reset}>reset</Button>
        </div>
        <div>
          <h4>Preview</h4>
        </div>
        {/* preview of the pdf */}
        <DocViewerComponent pdf={pdf}/>
        <div className='d-flex flex-wrap justify-content-center'>
          <Button className='mt-3 ms-3 me-3' size='lg' onClick={saveAsWordDoc}>Download as Word Doc</Button>
          <Button className='mt-3 ms-3 me-3' size='lg' onClick={saveAsPDF}>Download as PDF</Button>
          <p className="mt-3">*Note: The styling in the current PDF and PDF preview above may slightly differ from the formatting in the Word document. For an exact replica of the Word document styling, we recommend downloading the document as a Word file and then converting it using Microsoft Word.</p>
        </div>
        <Container className="mt-5 d-flex flex-column justify-content-center align-items-center text-center" style={{ maxWidth: '900px' }}>
          <p>Need more changes? add more words or phrases to be redacted or changed the redaction word to another of your choice below. When you are ready to create a new iteration, click the 'Generate' button below.</p>
          <Form style={{ maxWidth: '300px' }}>
            <Form.Control
              className='text-center fs-3 ps-5 pe-5 border-primary'
              defaultValue={redactFiller.filler}
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
      </Container>
    </>
  );
};

export default PreviewIteration;
