import { useEffect, useState } from "react";
import { roleInfo } from "./roleConfig";

function ProjectList({ loggedInUser }) {
  const [projects, setProjects] = useState([]);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newComments, setNewComments] = useState({});
  const [userMap, setUserMap] = useState({});

  // Benutzer laden für Rollen-Badges
  useEffect(() => {
    fetch("http://localhost:5000/api/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const map = {};
        data.forEach((u) => (map[u.username] = u.role));
        setUserMap(map);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/projects", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .catch((err) => console.error("Fehler beim Laden:", err));
  }, []);

  const handleCommentSubmit = async (projectId) => {
    const text = newComments[projectId];
    const res = await fetch(
      `http://localhost:5000/api/projects/${projectId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      setProjects(
        projects.map((p) =>
          p._id === projectId
            ? { ...p, comments: [...(p.comments || []), data.comment] }
            : p
        )
      );
      setNewComments({ ...newComments, [projectId]: "" });
    } else {
      alert("❌ Kommentar konnte nicht gespeichert werden");
    }
  };

  const handleCommentDelete = async (projectId, index) => {
    const res = await fetch(
      `http://localhost:5000/api/projects/${projectId}/comments/${index}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (res.ok) {
      setProjects(
        projects.map((p) =>
          p._id === projectId
            ? { ...p, comments: p.comments.filter((_, i) => i !== index) }
            : p
        )
      );
    } else {
      alert("❌ Kommentar konnte nicht gelöscht werden");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Projekt wirklich löschen?")) return;

    const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (res.ok) {
      setProjects(projects.filter((p) => p._id !== id));
    } else {
      alert("❌ Löschen fehlgeschlagen");
    }
  };

  const handleFieldChange = (id, field, value) => {
    setProjects(
      projects.map((p) => (p._id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleSave = async (id) => {
    const project = projects.find((p) => p._id === id);

    const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: project.name,
        status: project.status,
      }),
    });

    if (res.ok) {
      setEditId(null);
    } else {
      alert("❌ Speichern fehlgeschlagen");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Bearbeitung":
        return "warning";
      case "In Planung":
        return "secondary";
      case "Abgeschlossen":
        return "danger";
      default:
        return "secondary";
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mt-5">
      <h4>📂 Deine Projekte</h4>

      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Projekt suchen…"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredProjects.length === 0 && <p>🕳️ Keine Projekte gefunden</p>}

      <ul className="list-group">
        {filteredProjects.map((p) => (
          <li
            key={p._id}
            className="list-group-item d-flex align-items-center justify-content-between flex-wrap"
          >
            {editId === p._id ? (
              <div className="d-flex flex-wrap w-100 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm me-2 mb-2"
                  value={p.name}
                  onChange={(e) =>
                    handleFieldChange(p._id, "name", e.target.value)
                  }
                />
                <select
                  className="form-select form-select-sm me-2 mb-2"
                  value={p.status}
                  onChange={(e) =>
                    handleFieldChange(p._id, "status", e.target.value)
                  }
                >
                  <option>In Planung</option>
                  <option>In Bearbeitung</option>
                  <option>Abgeschlossen</option>
                </select>
                <button
                  className="btn btn-success btn-sm me-1 mb-2"
                  onClick={() => handleSave(p._id)}
                >
                  Speichern
                </button>
                <button
                  className="btn btn-secondary btn-sm mb-2"
                  onClick={() => setEditId(null)}
                >
                  Abbrechen
                </button>
              </div>
            ) : (
              <>
                <div>
                  <strong>{p.name}</strong>{" "}
                  <span className={`badge bg-${getStatusBadge(p.status)} ms-2`}>
                    {p.status}
                  </span>
                </div>
                <div className="d-flex mt-2 mt-sm-0">
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => setEditId(p._id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(p._id)}
                  >
                    Löschen
                  </button>
                </div>
                {/* Kommentare */}
                <div className="mt-3 ms-3 border-start ps-3 w-100">
                  <h6>Kommentare</h6>
                  {p.comments?.length > 0 ? (
                    <ul className="list-unstyled">
                      {p.comments.map((comment, idx) => (
                        <li key={idx} className="mb-2">
                          <strong>{comment.author}</strong>{" "}
                          {userMap[comment.author] && (
                            <span
                              className={`badge bg-${roleInfo[userMap[comment.author]]?.color} ms-2`}
                            >
                              {roleInfo[userMap[comment.author]]?.icon}{" "}
                              {roleInfo[userMap[comment.author]]?.label}
                            </span>
                          )}{" "}
                          <small className="text-muted">
                            ({new Date(comment.createdAt).toLocaleString()})
                          </small>
                          {comment.author === loggedInUser && (
                            <button
                              className="btn btn-sm btn-link text-decoration-none ms-2"
                              onClick={() => handleCommentDelete(p._id, idx)}
                            >
                              🗑
                            </button>
                          )}
                          <br />
                          {comment.text}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Noch keine Kommentare</p>
                  )}

                  <div className="d-flex mt-2">
                    <input
                      type="text"
                      className="form-control form-control-sm me-2"
                      placeholder="Neuer Kommentar"
                      value={newComments[p._id] || ""}
                      onChange={(e) =>
                        setNewComments({
                          ...newComments,
                          [p._id]: e.target.value,
                        })
                      }
                    />
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleCommentSubmit(p._id)}
                      disabled={!newComments[p._id]}
                    >
                      💬
                    </button>
                  </div>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProjectList;
