// src/components/Sidebar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  List,
  X,
  Plus,
  LogOut,
} from "lucide-react";
import logo from "../assets/miscologo.png";

const Sidebar = ({ onClose }) => {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { name: "Add Categories", path: "/admin/addcategories", icon: Plus },
    { name: "Add Product", path: "/admin/addproduct", icon: Plus },
    { name: "Products", path: "/admin/products", icon: Package },
    { name: "Add Blog", path: "/admin/addblog", icon: Plus },
    { name: "Blog List", path: "/admin/bloglist", icon: List },
    { name: "Contact List", path: "/admin/contactlist", icon: List },
  ];

  /* ======================
     LOGOUT HANDLER
  ====================== */
  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    navigate("/admin-login");
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* LOGO */}
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <img src={logo} alt="Logo" className="h-10" />
        <button onClick={onClose} className="lg:hidden">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* LOGOUT */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
