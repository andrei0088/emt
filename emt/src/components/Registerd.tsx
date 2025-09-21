import React from "react";
import { useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const Registerd = () => {
  const location = useLocation();
  const data = location.state; // aici primești res.data

  const qrValue = data?.user + "|" + data?.token; // combinăm user + token

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      {/* Link Login sus */}

      {/* Card legitimație */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-80 flex flex-col items-center">
        <div className="self-start mb-4">
          <a
            href="/login"
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            &larr; Login
          </a>
        </div>
        <h1 className="text-2xl font-bold mb-2 text-center">{data?.name}</h1>

        <h3 className="text-sm text-gray-500 mb-4 text-center">
          Token: {data?.user} | <br />
          {data?.token}
        </h3>

        <div className="border-4 border-gray-200 rounded-lg p-2">
          <QRCodeSVG value={qrValue} size={200} level="H" />
        </div>

        <p className="mt-4 text-gray-600 text-sm text-center">
          Scan the QR code to login quickly
        </p>
      </div>
    </div>
  );
};

export default Registerd;
