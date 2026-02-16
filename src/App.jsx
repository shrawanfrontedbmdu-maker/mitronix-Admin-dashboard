import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './Admin';
import Stores from './Stores';

const App = () => {
  useEffect(() => {
    const admintoken = localStorage.getItem('adminToken');
    const storetoken = localStorage.getItem('storeToken');
    console.log("store token:", storetoken);
    console.log("Admin token:", admintoken);
  }, []);

  return (
      <Routes>
        {/* Default -> admin landing (keeps URLs explicit) */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="admin/*" element={<Admin/>} />
        <Route path="store/*" element={<Stores/>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
  );
};

export default App;