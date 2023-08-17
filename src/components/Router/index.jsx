import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Query from '../Query';
import Home from '../Home';
import QueryFilterGeneClinVar from '../QueryFilterGeneClinVar';




const Routing = (
  <Router>
    <div>
      <Routes>  
      <Route path="/" element={<Home />}></Route>
      <Route path="/Home" element={<Home />} />
      <Route path="/Query" element={<Query />} />
      <Route path="/QueryFilterGeneClinVar" element={<QueryFilterGeneClinVar />} />
     
      </Routes>
    </div>
  </Router>
);

export default Routing;
