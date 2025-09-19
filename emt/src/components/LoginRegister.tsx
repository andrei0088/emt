import React from "react";
import axios from "axios";

const LoginRegister = () => {
  const handleSubmit = async (e) => {
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
        { withCredentials: true } // important pentru cookie/session
      );
      console.log("Răspuns server:", res.data);
    } catch (err) {
      console.error(
        "Eroare la înregistrare:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div>
      <div>
        <p>Înregistrare</p>
        <form onSubmit={handleSubmit}>
          <input type="text" name="nume" placeholder="Nume Complet" />
          <input type="text" name="username" placeholder="Username" />
          <input type="submit" />
        </form>
      </div>
    </div>
  );
};

export default LoginRegister;
