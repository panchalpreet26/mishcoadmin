// src/components/Topbar.jsx
import React from "react";
import { Menu, Search } from "lucide-react";

const Topbar = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;