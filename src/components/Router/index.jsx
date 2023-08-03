import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Query from '../Query';
import Home from '../Home';




const Routing = (
  <Router>
    <div>
      <Routes>  
      <Route path="/" element={<Home />}></Route>
      <Route path="/Home" element={<Home />} />
      <Route path="/Query" element={<Query />} />
     
      </Routes>
    </div>
  </Router>
);

export default Routing;
