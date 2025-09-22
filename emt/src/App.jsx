import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";

import Header from "./components/Header";
import Footer from "./components/Footer";
import LoginRegister from "./components/LoginRegister";
import Home from "./components/Home";
import Waiting from "./components/Waiting";
import Admin from "./components/Admin";
import Registerd from "./components/Registerd";
import NotFound from "./components/NotFound";
import AddVictima from "./components/AddVictima";
import EditVictima from "./components/EditVictima";

// positions
import PRV from "./positions/PRV";
import Focar from "./positions/Focar";
import DisplayVictime from "./positions/DisplayVictime";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // verifică sesiunea la mount
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/me`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setUser(res.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <div className="p-8 text-center">Se verifică sesiunea...</div>;

  return (
    <div>
      <Header name={user?.name} lvl={user?.lvl} setUser={setUser} />

      <Routes>
        {/* Login */}
        <Route
          path="/login"
          element={<LoginRegister user={user} setUser={setUser} />}
        />

        {/* Homepage */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <Home />
            )
          }
        />

        {/* AddVictim */}
        <Route
          path="/addvictima"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <AddVictima lvl={user?.lvl} />
            )
          }
        />

        {/* EditVictim */}
        <Route
          path="/editv/:id"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <EditVictima lvl={user?.lvl} />
            )
          }
        />

        {/* Focar */}
        <Route
          path="/focar"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <DisplayVictime name="Focar" lvl={user?.lvl} />
            )
          }
        />

        {/* PRV */}
        <Route
          path="/prv"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <DisplayVictime name="PRV" lvl={user?.lvl} />
            )
          }
        />
        {/* PMA */}
        <Route
          path="/pma"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <DisplayVictime name="PMA" lvl={user?.lvl} />
            )
          }
        />
        {/* Evacuare */}
        <Route
          path="/evacuare"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <DisplayVictime name="Evacuare" lvl={user?.lvl} />
            )
          }
        />

        {/* DSM */}
        <Route
          path="/dsm"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Navigate to="/waiting" />
            ) : (
              <DisplayVictime name="DSM" lvl={user?.lvl} />
            )
          }
        />

        {/* Waiting */}
        <Route
          path="/waiting"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 0 ? (
              <Waiting />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            !user ? (
              <Navigate to="/login" />
            ) : user.lvl === 99 ? (
              <Admin />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Registered */}
        <Route path="/registerd" element={<Registerd />} />

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
