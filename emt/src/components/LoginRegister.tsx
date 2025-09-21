import React, { useEffect, useRef } from "react"; // <-- adaugă useRef
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginRegister = ({ user, setUser }) => {
  const navigate = useNavigate();
  const inputRef = useRef(null); // referința pentru input

  useEffect(() => {
    // focus automat după render
    inputRef.current?.focus();
  }, []);

  // redirect dacă user există deja
  useEffect(() => {
    if (user) {
      navigate(user.lvl === 0 ? "/waiting" : "/");
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get("nume"),
      user: formData.get("username"),
    };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/registration`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        setUser(res.data.user);
        navigate(res.data.user.lvl === 0 ? "/waiting" : "/", { replace: true });
      }
    } catch (err) {
      console.error(
        "Eroare la înregistrare:",
        err.response?.data || err.message
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = { token: formData.get("token") };

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        payload,
        { withCredentials: true }
      );

      if (res.data.success) {
        setUser(res.data.user);
        navigate(res.data.user.lvl === 0 ? "/waiting" : "/", { replace: true });
      }
    } catch (err) {
      console.error("Eroare la logare:", err.response?.data || err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Cont nou / Autentificare
        </h2>

        {/* Login */}
        <div className="space-y-4 p-6 border-2 border-green-300 rounded-xl bg-green-50">
          <p className="text-lg font-semibold text-gray-700">Login</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              ref={inputRef} // <-- focus automat
              type="text"
              name="token"
              placeholder="Token de autentificare"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="submit"
              value="Loghează-te"
              className="w-full bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 cursor-pointer"
            />
          </form>
        </div>

        <hr className="my-4 border-gray-300" />

        {/* Registration */}
        <div className="space-y-4 p-6 border-2 border-blue-300 rounded-xl bg-blue-50">
          <p className="text-lg font-semibold text-gray-700">Înregistrare</p>
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="nume"
              placeholder="Nume Complet"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="submit"
              value="Înregistrează-te"
              className="w-full bg-blue-500 text-white font-semibold py-2 rounded-md hover:bg-blue-600 cursor-pointer"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
