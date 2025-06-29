import { useNavigate, Link } from "react-router-dom";

function Navigation() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch("http://localhost:5000/logout", {
      method: "POST",
      credentials: "include",
    });

    navigate("/");
  };

  return (
    <nav className="navbar navbar-light bg-light px-3">
      <span className="navbar-brand">🛠️ Gildner Projekt Manager</span>
      <ul className="navbar-nav">
        <li className="nav-item">
          <Link className="nav-link" to="/">
            📂 Projekte
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/rollen">
            👑 Rollen
          </Link>
        </li>
      </ul>
      <button className="btn btn-outline-danger" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}

export default Navigation;
