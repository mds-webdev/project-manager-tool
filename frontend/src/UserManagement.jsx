import { useEffect, useState } from "react";
import { roleInfo } from "./roleConfig";
import Navigation from "./Navigation";

function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/users", { credentials: "include" })
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role: newRole }),
    });

    if (res.ok) {
      setUsers(
        users.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } else {
      alert("❌ Konnte Rolle nicht ändern");
    }
  };

  return (
    <>
      <Navigation />

      <div className="mt-5 container">
        <h4 className="mb-4">Benutzerrollen verwalten</h4>
        {users.length === 0 ? (
          <p>Keine Benutzer gefunden</p>
        ) : (
          <ul className="list-group">
            {users.map((u) => (
              <li
                key={u._id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <strong>{u.username}</strong>{" "}
                  <span
                    className={`badge bg-${
                      roleInfo[u.role]?.color || "secondary"
                    } ms-2`}
                  >
                    {roleInfo[u.role]?.icon || "👤"}{" "}
                    {roleInfo[u.role]?.label || "Unbekannt"}
                  </span>
                </div>
                <div>
                  <select
                    className="form-select form-select-sm"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  >
                    {Object.keys(roleInfo).map((roleKey) => (
                      <option key={roleKey} value={roleKey}>
                        {roleInfo[roleKey].icon} {roleInfo[roleKey].label}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default UserManagement;
