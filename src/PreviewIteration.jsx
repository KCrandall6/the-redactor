import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const PreviewIteration = ({ parsedFile, wordMap, redactFiller }) => {
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
    const updatedFile = serializer.serializeToString(xmlDoc);
    console.log('Updated File:', updatedFile);
    setRedactedFile(updatedFile);

  }, [parsedFile, wordMap]);

  const saveAsWordDoc = async () => {
    const zip = new JSZip();
    const content = new TextEncoder().encode(redactedFile); // Encode the file as UTF-8
    zip.file('word/document.xml', content);

    const zipContent = await zip.generateAsync({ type: 'blob' });
    saveAs(zipContent, 'document.docx');
  };

  return (
    <>
      <h1>A preview of the final</h1>
      {/* Preview of the document */}
      <Button onClick={saveAsWordDoc}>Download Word Doc</Button>
    </>
  );
};

export default PreviewIteration;
