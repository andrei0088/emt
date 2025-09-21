import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/users`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      console.error("Eroare la preluarea utilizatorilor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // approve user
  const approveUser = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/approve/${id}`,
        {},
        {
          withCredentials: true,
        }
      );
      // actualizează lista de utilizatori după aprobare
      setUsers(users.map((u) => (u.id === id ? { ...u, lvl: 1 } : u)));
    } catch (err) {
      console.error("Eroare la aprobarea utilizatorului:", err);
    }
  };

  // regenerate token

  const regenerate = async (id) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/regenerate/${id}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        navigate("/registerd", { state: res.data });
      }
    } catch (err) {
      console.error("Eroare la regenerarea token-ului:", err);
    }
  };

  // delete user
  const deteteUser = async (id) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/delete/${id}`,
        {},
        { withCredentials: true }
      );
      // actualizează lista de utilizatori după ștergere
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Eroare la ștergerea utilizatorului:", err);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Se încarcă utilizatorii...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Panou Admin</h1>
      {users.length === 0 ? (
        <p>Nu există utilizatori.</p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Nume</th>
              <th className="border p-2">Username</th>
              <th className="border p-2">Nivel</th>
              <th className="border p-2">Creat la</th>
              <th className="border p-2">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={user.lvl === 0 ? "bg-yellow-100" : ""}
              >
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.username}</td>
                <td className="border p-2">{user.lvl}</td>
                <td className="border p-2">{user.created_at}</td>
                <td className="border p-2">
                  {user.lvl === 0 && (
                    <button
                      onClick={() => approveUser(user.id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Approve
                    </button>
                  )}{" "}
                  <button
                    onClick={() => regenerate(user.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Regenereaza
                  </button>
                  {user.lvl != 99 && (
                    <button
                      onClick={() => deteteUser(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
