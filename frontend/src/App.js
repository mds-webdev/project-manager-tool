import {React, useState, useEffect} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';



function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  fetch('http://localhost:5000/api/me', { credentials: 'include' })
    .then(res => res.json())
    .then(data => setUser(data));
}, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
