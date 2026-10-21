import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const Breadcrumbs = ({ items = [] }) => {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-sans tracking-wide">
        <button
          onClick={() => navigate("/")}
          className="text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Home</span>
        </button>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
              {item.link && !isLast ? (
                <button
                  onClick={() => navigate(item.link)}
                  className="text-slate-500 dark:text-slate-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors truncate max-w-[150px] sm:max-w-xs cursor-pointer"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-amber-700 dark:text-amber-300 font-semibold truncate max-w-[180px] sm:max-w-sm">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
};

export default Breadcrumbs;
