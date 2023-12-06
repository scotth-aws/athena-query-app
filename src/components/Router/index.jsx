import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Query from '../Query';
import Home from '../Home';
import QueryFilterGeneClinVar from '../QueryFilterGeneClinVar';
import QueryFilterGeneName from '../QueryFilterGeneName';
import QueryFilterVariantName from '../QueryFilterVariantName';
import QueryFilterVariantFrequency from '../QueryFilterVariantFrequency';



const Routing = (
  <Router>
    <div>
      <Routes>  
      <Route path="/" element={<Home />}></Route>
      <Route path="/Home" element={<Home />} />
      <Route path="/Query" element={<Query />} />
      <Route path="/QueryFilterGeneClinVar" element={<QueryFilterGeneClinVar />} />
      <Route path="/QueryFilterGeneName" element={<QueryFilterGeneName />} /> 
      <Route path="/QueryFilterVariantName" element={<QueryFilterVariantName />} />
      <Route path="/QueryFilterVariantFrequency" element={<QueryFilterVariantFrequency />} />
     
      </Routes>
    </div>
  </Router>
);

export default Routing;
