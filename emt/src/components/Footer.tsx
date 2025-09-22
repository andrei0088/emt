import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-4 mt-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          &copy; {currentYear} MTdSoft. Toate drepturile rezervate.
        </p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/terms" className="text-gray-400 hover:text-white text-sm">
            Termeni și condiții
          </a>
          <a href="/privacy" className="text-gray-400 hover:text-white text-sm">
            Politica de confidențialitate
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
