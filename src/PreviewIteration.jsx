import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import JSZip from 'jszip';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import PizZipUtils from 'pizzip/utils/index.js';
import { saveAs } from 'file-saver';


const PreviewIteration = ({selectedFile, parsedFile, wordMap, redactFiller }) => {
  const [redactedFile, setRedactedFile] = useState(null);

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
            const redactFiller = '[redacted]';
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
  
    // console.log('Updated File:', updatedFile);
    setRedactedFile(updatedFile);
  }, [parsedFile, wordMap]);



  
  function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
  }

  const saveAsWordDoc = () => {
    if (!redactedFile) {
      console.error('Redacted file content is empty. Please redact the content first.');
      return;
    }
  
    // Convert redacted XML content to a Blob
    const content = new Blob([redactedFile], { type: 'text/xml' });
  
    // Read the binary content of selectedFile as Uint8Array
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
      const arrayBuffer = event.target.result;
      const uint8Array = new Uint8Array(arrayBuffer);
  
      // Load the .docx template using PizZip with the selectedFile content as buffer
      const zip = new PizZip(uint8Array);
      const doc = new Docxtemplater(zip);
  
      // Set the data to replace in the template
      doc.setData({
        Kurt: 'John',
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
  
      // Save the .docx file with a custom name
      saveAs(output, 'output.docx');
    };
    fileReader.readAsArrayBuffer(selectedFile);
  };
  

  

  console.log('selectedFile', selectedFile)


  return (
    <>
      <h1>A preview of the final</h1>
      {/* Preview of the document */}
      <Button onClick={() => saveAsWordDoc()}>Download Word Doc</Button>
    </>
  );
};

export default PreviewIteration;
