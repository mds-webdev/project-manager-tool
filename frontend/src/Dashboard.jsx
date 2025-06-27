import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "./Navigation";
import CreateProject from "./CreateProject";
import ProjectList from "./ProjectList";

function Dashboard() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/auth/status", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setUsername(data.username);
      })
      .catch(() => {
        // Wenn nicht eingeloggt → zurück zum Login
        navigate("/");
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/me", { credentials: "include" })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Nicht eingeloggt");
      })
      .then((data) => setUser(data))
      .catch((err) => console.warn("⚠️", err));
  }, []);

  return (
    <>
      <Navigation />
      <div className="container mt-5">
        <h2>Willkommen, {username}</h2>
        <CreateProject />
        {user && user.username && <ProjectList loggedInUser={user.username} />}
      </div>
    </>
  );
}

export default Dashboard;
