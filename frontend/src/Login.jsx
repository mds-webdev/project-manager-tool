import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

useEffect(() => {
  fetch('http://localhost:5000/auth/status', {
    credentials: 'include'
  })
    .then(res => {
      if (res.ok) return res.json();
      throw new Error();
    })
    .then(data => {
      if (data.loggedIn) {
        navigate('/dashboard');
      }
    })
    .catch(() => {
      // Nicht eingeloggt → Login bleibt sichtbar
    });
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok) {
  alert(`Willkommen, ${data.username}`);
  // Leite den Benutzer weiter:
  window.location.href = '/dashboard';
} else {
      alert('Login fehlgeschlagen');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Login mit Windows-Domain</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Benutzername" onChange={(e) => setUsername(e.target.value)} />
        <input className="form-control mb-2" type="password" placeholder="Passwort" onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary">Einloggen</button>
      </form>
    </div>
  );
}

export default Login;