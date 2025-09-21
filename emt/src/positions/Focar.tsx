import axios from "axios";
import React, { useEffect, useState } from "react";

interface Victima {
  id: number;
  cod: string | null;
  codqr: string | null;
  nume: string | null;
  prenume: string | null;
  varsta: number | null;
  sex: string | null;
  created_at: string;
  loc?: string; // opțional, dacă vrei să colorezi în funcție de loc
}

const Focar = () => {
  const [victime, setVictime] = useState<Victima[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/gedvictime/focar`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success && res.data.victime) {
          setVictime(res.data.victime);
        } else {
          setVictime([]);
        }
      })
      .catch(() => setVictime([]));
  }, []);

  const handleEdit = (id: number) => {
    alert(`Modifică victima cu ID: ${id}`);
  };

  const getRowColor = (cod: string | null) => {
    switch (cod) {
      case "focar":
        return "bg-red-100";
      case "prv":
        return "bg-yellow-100";
      case "pma":
        return "bg-green-100";
      case "evacuat":
        return "bg-blue-100";
      default:
        return "bg-white";
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Focar</h2>
      {victime.length === 0 ? (
        <p>Nu există victime înregistrate.</p>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(victime[0]).map((key) => (
                <th key={key} className="py-2 px-4 border-b text-left">
                  {key}
                </th>
              ))}
              <th className="py-2 px-4 border-b">Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {victime.map((v) => (
              <tr
                key={v.id}
                className={`${getRowColor(v.cod)} hover:bg-gray-200`}
              >
                {Object.values(v).map((value, idx) => (
                  <td key={idx} className="py-2 px-4 border-b">
                    {value ?? "—"}
                  </td>
                ))}
                <td className="py-2 px-4 border-b">
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    onClick={() => handleEdit(v.id)}
                  >
                    Modifică
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Focar;
