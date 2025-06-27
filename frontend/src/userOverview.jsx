import { useEffect, useState } from 'react';
import { roleInfo } from './roleConfig';

function UserOverview() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/users', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="mt-5">
      <h4>👥 Benutzerübersicht</h4>
      {Object.keys(roleInfo).map(role => (
        <div key={role} className="mb-4">
          <h5>{roleInfo[role].icon} {roleInfo[role].label}</h5>
          <ul className="list-group">
            {users.filter(u => u.role === role).map(u => (
              <li key={u._id} className="list-group-item d-flex justify-content-between align-items-center">
                {u.username}
                <span className={`badge bg-${roleInfo[role].color}`}>
                  {roleInfo[role].icon} {roleInfo[role].label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default UserOverview;
