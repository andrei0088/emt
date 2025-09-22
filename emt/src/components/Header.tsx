import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";

const Header = ({ name, lvl, setUser }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/logout`,
        {},
        { withCredentials: true }
      );
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Eroare la logout:", err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white flex justify-between items-center px-6 py-4 border-b border-gray-200">
      {/* Navigație */}
      <nav>
        <ul className="flex space-x-6 text-gray-600 font-medium">
          <li>
            <Link
              to="/"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Home
            </Link>
          </li>
          <li>
            {lvl > 9 && (
              <Link
                to="/addvictima/"
                state={{ from: location.pathname }}
                className="hover:text-gray-900 transition-colors duration-200"
              >
                Adaugă Victimă
              </Link>
            )}
          </li>
          <li>
            <Link
              to="/focar"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Focar
            </Link>
          </li>
          <li>
            <Link
              to="/prv"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              PRV
            </Link>
          </li>
          <li>
            <Link
              to="/pma"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              PMA
            </Link>
          </li>
          <li>
            <Link
              to="/evacuare"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              Evacuare
            </Link>
          </li>
          <li>
            <Link
              to="/dsm"
              className="hover:text-gray-900 transition-colors duration-200"
            >
              DSM
            </Link>
          </li>
          {lvl === 99 && (
            <li>
              <Link
                to="/admin"
                className="hover:text-gray-900 transition-colors duration-200"
              >
                Admin
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Nume user + dropdown */}
      {name && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 text-gray-700 font-semibold hover:text-gray-900 transition-colors duration-200"
          >
            <span>{name}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-md shadow-sm border border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 rounded-md font-medium transition-colors duration-150"
              >
                LogOut
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
