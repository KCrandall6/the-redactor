import React, {useState} from 'react';
import { Button } from 'react-bootstrap';
import Redactor from './Redactor';

const Home = () => {

const [startRedact, setStartRedact] = useState(false);

const onDocSuccess = () => {
  setStartRedact(!startRedact);
}

  return (
    <>
    <div className='d-flex flex-column align-items-center'>
      {startRedact === false ? (
        <>
          <h1>This is the home page</h1>
          <Button size="lg" onClick={() => onDocSuccess()}>Upload a Document</Button>
        </>
      ) : (
        <Redactor />
      )}
    </div>
    </>
  )
};

export default Home;