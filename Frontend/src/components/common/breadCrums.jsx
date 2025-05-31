import React from "react";
import { useNavigate } from "react-router-dom";

const Breadcrumbs = ({ items }) => {
  const navigate = useNavigate();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-gray-500">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.link ? (
            <a
              onClick={() => navigate(item.link)}
              className="hover:text-gray-700 cursor-pointer"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-gray-900 font-semibold">{item.label}</span>
          )}
          {index < items.length - 1 && <span className="mx-2">/</span>}
        </React.Fragment>
      ))}
    </div>
    </div>
  );
};

export default Breadcrumbs;
