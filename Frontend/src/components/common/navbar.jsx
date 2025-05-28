import React from "react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {

    const navigate = useNavigate()
  return (
    <div>
      <nav className="flex justify-center space-x-8 py-4 border-b bg-gray-50">
        <a
          href="/"
          className="text-base font-medium text-gray-700 hover:text-black hover:underline transition-colors"
        >
          HOME
        </a>
        <a
          onClick={() => navigate("/shop")}
          className="text-base font-medium text-gray-700 hover:text-black hover:underline transition-colors cursor-pointer"
        >
          SHOP
        </a>
      </nav>
    </div>
  );
};

export default Navbar;
