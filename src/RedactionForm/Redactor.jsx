import React, {useState} from 'react';
import { Container, Button, Accordion} from 'react-bootstrap';
import RedactedWordCard from './RedactedWordCard';
import RedactorFill from './RedactorFill';

const Redactor = ({ selectedFile, parsedFile, wordMap, setWordMap }) => {
  const [step, setStep] = useState(1);

  const nextStep = () => {
    setStep(1);
  };

  const prevStep = () => {
    setStep(2);
  };

  return (
      <Container className="mt-5 mb-5 d-flex flex-column text-center" style={{ maxWidth: '900px' }}>
        <h1 className='mb-3'>Redacted Terms</h1>
        <div className='d-flex justify-content-between m-2'>
          <Button disabled={step === 1} onClick={() => nextStep()}>Prev Step</Button>
          <Button disabled={step === 2} onClick={() => prevStep()}>Next Step</Button>
        </div>
        {/* <p className='p-2'><em><b>Instructions:</b> Double check the terms you would like to be redacted from your document. To keep the term in your document, click the X button. To edit the text that will be redacted, click the _ button. To add additional terms that you would like redacted and that you do not currently see, add them in the Additional section at the bottom. When you are satisfied, click the Next Step button.</em></p> */}
        {step === 1 ? (
          <>
            {Object.keys(wordMap).map((category, index) => (
              <Accordion className='text-start' key={index+1} defaultActiveKey={['0']} alwaysOpen>
                <Accordion.Item eventKey="0">
                  <Accordion.Header style={{}}>{category} ({wordMap[category].length})</Accordion.Header>
                  <Accordion.Body className="d-flex flex-wrap p-2">
                    {wordMap[category].map((word, innerIndex) => (
                      <RedactedWordCard key={innerIndex+1} category={category} word={word} wordMap={wordMap} setWordMap={setWordMap}/>
                    ))}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            ))}
          </>
        ) : (
            <RedactorFill />
        )}
        <div>
          <Button hidden={step === 1} >Complete Redaction and Preview</Button>
        </div>
      </Container>
  );
};

export default Redactor;
