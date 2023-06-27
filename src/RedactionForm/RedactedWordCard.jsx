import React from 'react';
import {Card} from 'react-bootstrap';
import EditCloseModal from './EditCloseModal';

const RedactedWordCard = ({category, word, wordMap, setWordMap}) => {

  console.log('word', word);
  console.log('wordmap', wordMap);

  const deletePhrase = (phrase) => {
    const updatedWordMap = { ...wordMap };
    updatedWordMap[category] = updatedWordMap[category].filter(
      (item) => item !== phrase
    );
    setWordMap(updatedWordMap);
  };

  const editPhrase = (oldPhrase, newPhraseText) => {
    const updatedWordMap = { ...wordMap };
    const categoryArray = updatedWordMap[category];
    const index = categoryArray.findIndex((item) => item.text === oldPhrase.text);
  
    if (index !== -1) {
      const updatedPhrase = { ...categoryArray[index], text: newPhraseText };
      categoryArray[index] = updatedPhrase;
      setWordMap(updatedWordMap);
    }
  };
  

  return (
      <Card className="m-1">
        <Card.Body>
          <Card.Subtitle className='d-flex justify-content-between'>
            <EditCloseModal word={word} editPhrase={editPhrase} deletePhrase={deletePhrase}/>
          </Card.Subtitle>
          <Card.Text className="fs-5 mt-1">{word.text}</Card.Text>
        </Card.Body>
      </Card>
  )
};

export default RedactedWordCard;