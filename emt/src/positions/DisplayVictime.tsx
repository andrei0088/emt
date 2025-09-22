import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Victima {
  id: number;
  cod: string | null;
  codqr: string | null;
  nume: string | null;
  prenume: string | null;
  varsta: number | null;
  sex: string | null;
  created_at: string;
  loc?: string;
}

interface DisplayVictimeProps {
  name: string;
}

const DisplayVictime: React.FC<DisplayVictimeProps> = ({ name, lvl, p }) => {
  const navigate = useNavigate();
  const [victime, setVictime] = useState<Victima[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/getvictime/${name}`, {
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
  }, [name]);

  const handleEdit = (id: number) => {
    navigate(`/editv/${id}`);
    // alert(`Modifică victima cu ID: ${id}`);
  };

  const getRowColor = (cod: string | null) => {
    switch (cod) {
      case 5:
        return "bg-black text-white"; // Negru puternic
      case 1:
        return "bg-red-600 text-white"; // Roșu puternic
      case 2:
        return "bg-yellow-400 text-black"; // Galben puternic
      case 3:
        return "bg-green-600 text-white"; // Verde puternic
      case 4:
        return "bg-white text-black"; // Albastru puternic

      default:
        return "bg-gray-200 text-black"; // Gri pentru valori necunoscute
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{name}</h2>
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
              {lvl > 10 && <th className="py-2 px-4 border-b">Acțiuni</th>}
            </tr>
          </thead>
          <tbody>
            {victime.map((v) => (
              <tr
                key={v.id}
                className={`${getRowColor(
                  v.cod
                )} hover:opacity-70 transition-opacity duration-200`}
              >
                {Object.values(v).map((value, idx) => (
                  <td key={idx} className="py-2 px-4 border-b">
                    {value ?? "—"}
                  </td>
                ))}
                {lvl > 10 && (
                  <td className="py-2 px-4 border-b edit">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                      onClick={() => handleEdit(v.id)}
                    >
                      Modifică
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DisplayVictime;
