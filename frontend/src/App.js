import {React, useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import UserManagement from "./UserManagement";



function App() {
 



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/rollen" element={<UserManagement />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
