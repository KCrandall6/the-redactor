import React from 'react';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import NavBar from './NavBar';

import Home from './Home';
import About from './About';

const Main = () => {

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/about" element={<About/>}/>
      </Routes>
    </BrowserRouter>
  )
};

export default Main;