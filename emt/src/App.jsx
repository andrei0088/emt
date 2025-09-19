import React from "react";
import Header from "./components/Header";
import LoginRegister from "./components/LoginRegister";
import Footer from "./components/Footer";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/me`)
      .then((res) => setUser(res.data.user))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <Header name={user || null} />
      <LoginRegister />
      <Footer />
    </div>
  );
}

export default App;
