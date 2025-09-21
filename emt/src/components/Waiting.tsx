import React, { useEffect } from "react";

const Waiting = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 60000);

    return () => clearInterval(interval); // curățare la demontare componentă
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md text-center">
        <div className="flex justify-center mb-4">
          <svg
            className="w-16 h-16 text-indigo-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.948 3.377c-.866-1.5-3.03-1.5-3.896 0L2.697 16.126z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Cont creat cu succes!
        </h1>
        <p className="text-gray-600 mb-6">
          Contul tău a fost înregistrat în sistem. Pentru a începe să folosești
          aplicația, este necesară validarea accesului de către un
          administrator. Vei primi o notificare imediat ce procesul de aprobare
          este finalizat.
        </p>
        <div className="text-sm text-gray-500">
          Îți mulțumim pentru răbdare și înțelegere!
        </div>
      </div>
    </div>
  );
};

export default Waiting;
