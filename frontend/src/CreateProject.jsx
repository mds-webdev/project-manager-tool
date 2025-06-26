import { useState } from 'react';

function CreateProject() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name })
    });

    const data = await res.json();

    if (res.ok) {
      setMessage('✅ Projekt angelegt!');
      setName('');
    } else {
      setMessage(`❌ Fehler: ${data.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <h4>📋 Neues Projekt anlegen</h4>
      <input
        className="form-control my-2"
        placeholder="Projektname"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button className="btn btn-success">Projekt speichern</button>
      {message && <div className="mt-2">{message}</div>}
    </form>
  );
}

export default CreateProject;
