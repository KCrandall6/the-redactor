import React, {useState} from 'react';
import {Button, Modal, Form} from 'react-bootstrap';
import {AiOutlinePlus} from 'react-icons/ai';

const AddWordModal = ({wordMap, setWordMap}) => {

  const [show, setShow] = useState(false);
  const [newWord, setNewWord] = useState('');

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleInputChange = (event) => {
    setNewWord(event.target.value);
  };

  const addWord = () => {
    const additionalNewPhrase = { text: newWord };
    setWordMap((prevWordMap) => ({
      ...prevWordMap,
      Additional: [...prevWordMap.Additional, additionalNewPhrase],
    }));
    handleClose();
  };

  return (
    <>
      <Button className="ms-2" size="sm" variant="outline-dark" onClick={handleShow} style={{ maxWidth: '30px', maxHeight: '30px' }}><AiOutlinePlus/></Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Word/Phrase</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center'>
          To include an additional word or phrase to be redacted, type it out and save it.
          <Form>
            <Form.Control
            className='text-center fs-4 border-primary'
            onChange={handleInputChange}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={addWord}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
};

export default AddWordModal;