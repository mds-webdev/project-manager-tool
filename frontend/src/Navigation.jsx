import { useNavigate } from 'react-router-dom';

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('http://localhost:5000/logout', {
      method: 'POST',
      credentials: 'include'
    });

    navigate('/');
  };

  return (
    <nav className="navbar navbar-light bg-light px-3">
      <span className="navbar-brand">🛠️ Gildner Projekt Manager</span>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navigation