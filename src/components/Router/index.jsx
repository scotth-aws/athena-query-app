import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import EC2 from '../EC2';
import Home from '../Home';




const Routing = (
  <Router>
    <div>
      <Routes>  
      <Route path="/" element={<Home />}></Route>
      <Route path="/Home" element={<Home />} />
      <Route path="/EC2" element={<EC2 />} />
     
      </Routes>
    </div>
  </Router>
);

export default Routing;
