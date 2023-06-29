import React, {useState} from 'react';
import {Button, Modal, Form} from 'react-bootstrap';
import {AiOutlineEdit, AiOutlineClose} from 'react-icons/ai';

const EditCloseModal = ({word, editPhrase, deletePhrase}) => {

  const [show, setShow] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editedValue, setEditedValue] = useState('');

  const handleClose = () => setShow(false);

  const openModal = (type) => {
    setModalType(type);
    setShow(true);
  };

  const deleteTerm = (word) => {
    deletePhrase(word);
    setShow(false);
  };

  const editTerm = () => {
    editPhrase(word, editedValue);
    setShow(false);
  };

  const handleInputChange = (event) => {
    setEditedValue(event.target.value);
  };

  return (
    <>
      <Button className="me-1" size="sm" variant="outline-danger" onClick={() => openModal('delete')}><AiOutlineClose/></Button>
      <Button size="sm" variant="outline-primary" onClick={() => openModal('edit')}><AiOutlineEdit/></Button>

    {modalType === 'edit' ? (
      <Modal className='text-center' show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Term/Phrase</Modal.Title>
        </Modal.Header>
        <Modal.Body>Edit the following:</Modal.Body>
        <Modal.Body>
          <Form>
            <Form.Control
            className='text-center fs-4 border-primary'
            defaultValue={word.text}
            onChange={handleInputChange}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={() => editTerm(word)}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    ) : (
      <Modal className='text-center' show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Term/Phrase</Modal.Title>
      </Modal.Header>
      <Modal.Body>Are you sure you want to delete the following term/phrase?</Modal.Body>
      <Modal.Body className="fs-4"><em><b>{word.text}</b></em></Modal.Body>
      <Modal.Footer>
        <Button variant="danger" onClick={() => deleteTerm(word)}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
    )}
    </>
  )
};

export default EditCloseModal;