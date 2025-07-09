import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;
  return (
    <div>
      <nav className="flex justify-center space-x-8 py-4 border-b bg-gray-50">
        <a
          href="/"
          className={`text-base font-medium transition-colors ${
            isActive("/")
              ? "text-black underline font-bold underline-offset-4"
              : "text-gray-700 hover:text-black hover:underline underline-offset-4"
          }`}
        >
          HOME
        </a>
        <a
          onClick={() => navigate("/shop")}
          className={`text-base font-medium transition-colors cursor-pointer ${
            isActive("/shop")
              ? "text-black underline font-bold underline-offset-4"
              : "text-gray-700 hover:text-black hover:underline underline-offset-4"
          }`}
        >
          SHOP
        </a>
      </nav>
    </div>
  );
};

export default Navbar;
