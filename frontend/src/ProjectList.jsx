import { useEffect, useState } from 'react';

function ProjectList() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/projects', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(err => console.error('Fehler beim Laden:', err));
  }, []);

  return (
    <div className="mt-5">
      <h4>📂 Deine Projekte</h4>
      {projects.length === 0 && <p>🕳️ Noch keine Projekte vorhanden</p>}
      <ul className="list-group">
        {projects.map(p => (
          <li key={p._id} className="list-group-item d-flex justify-content-between">
            <strong>{p.name}</strong>
            <span className="badge bg-secondary">{p.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectList;