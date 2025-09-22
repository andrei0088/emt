import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const codOptions = [
  { value: 5, label: "Negru", color: "bg-black text-white" },
  { value: 1, label: "Roșu", color: "bg-red-500 text-white" },
  { value: 2, label: "Galben", color: "bg-yellow-400 text-black" },
  { value: 3, label: "Verde", color: "bg-green-500 text-white" },
  {
    value: 4,
    label: "Alb",
    color: "bg-white text-black border border-gray-300",
  },
];

const locOptions = ["Focar", "PRV", "PMA", "Evacuat"];

// Funcție care calculează locul default în funcție de lvl
const getDefaultLoc = (lvl: number) => {
  switch (true) {
    case lvl < 10:
      return "Focar";
    case lvl < 20:
      return "PRV";
    case lvl < 30:
      return "PMA";
    case lvl < 40:
      return "Evacuat";
    default:
      return "Focar";
  }
};

const AddVictima = ({ lvl }: { lvl: number }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/";

  const [formData, setFormData] = useState({
    loc: getDefaultLoc(lvl),
    codqr: "",
    cod: null,
    nume: "",
    prenume: "",
    varsta: "",
    sex: "",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/addvictima`,
        {
          ...formData,
          cod: Number(formData.cod),
          loc: formData.loc.toLowerCase(),
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        setFormData({
          loc: getDefaultLoc(lvl),
          codqr: "",
          cod: null,
          nume: "",
          prenume: "",
          varsta: "",
          sex: "",
        });
        navigate(from);
      }
    } catch (err: any) {
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Adaugă Victimă</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input cod QR primul și autofocus */}
        <input
          type="text"
          name="codqr"
          placeholder="Cod QR"
          value={formData.codqr}
          onChange={(e) => setFormData({ ...formData, codqr: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
          autoFocus
        />

        {/* Radio loc */}
        <div className="space-y-2">
          <p className="font-semibold">Loc</p>
          <div className="flex gap-4">
            {locOptions.map((loc) => (
              <label key={loc} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="loc"
                  value={loc}
                  checked={formData.loc === loc}
                  onChange={(e) =>
                    setFormData({ ...formData, loc: e.target.value })
                  }
                  className="accent-blue-500"
                />
                {loc}
              </label>
            ))}
          </div>
        </div>

        {/* Dropdown cod triaj */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full p-2 border border-gray-300 rounded-md text-left flex justify-between items-center ${
              formData.cod !== null
                ? codOptions.find((opt) => opt.value === formData.cod)?.color
                : "bg-white text-black"
            }`}
          >
            <span>
              {formData.cod !== null
                ? codOptions.find((opt) => opt.value === formData.cod)?.label
                : "Selectează cod triaj"}
            </span>
            <span className="ml-2">&#9662;</span>
          </button>

          {dropdownOpen && (
            <div className="absolute mt-1 w-full border border-gray-300 rounded-md shadow bg-white z-50">
              {codOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    setFormData({ ...formData, cod: opt.value });
                    setDropdownOpen(false);
                  }}
                  className={`cursor-pointer px-4 py-2 ${opt.color} hover:opacity-80`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Restul câmpurilor */}
        <input
          type="text"
          name="nume"
          placeholder="Nume"
          value={formData.nume}
          onChange={(e) => setFormData({ ...formData, nume: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="text"
          name="prenume"
          placeholder="Prenume"
          value={formData.prenume}
          onChange={(e) =>
            setFormData({ ...formData, prenume: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <input
          type="number"
          name="varsta"
          placeholder="Vârstă"
          value={formData.varsta}
          onChange={(e) => setFormData({ ...formData, varsta: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
        <select
          name="sex"
          value={formData.sex}
          onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Selectează sexul</option>
          <option value="m">Masculin</option>
          <option value="f">Feminin</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          Adaugă Victimă
        </button>
      </form>
    </div>
  );
};

export default AddVictima;
