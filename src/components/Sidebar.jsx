// src/components/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Users,
  MessageCircle,
  List,
  Instagram,
  Star,
  X,
  Plus,
} from "lucide-react";
import logo from "../../../Frontend/src/assets/image/miscologo.png";

const Sidebar = ({ onClose }) => {
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, end: true },
    { name: "Add Categories", path: "/admin/addcategories", icon: Plus },
    { name: "Add Product", path: "/admin/addproduct", icon: Plus },
    {name: "Products", path: "/admin/products", icon: Package },
    {name: "Add Blog", path: "/admin/AddBlog", icon: Plus },
    { name: "Blog List", path: "/admin/bloglist", icon: List },
    { name: "Contact List", path: "/admin/contactlist", icon: List },
    
  ];

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="flex items-center justify-between p-5 border-b border-gray-200">
        <img src={logo} alt="Logo" className="h-10" />
        <button onClick={onClose} className="lg:hidden">
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>

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
            {({ isActive }) =>
              isActive && (
                <div className="ml-auto w-1 h-8 bg-blue-600 rounded-l-full" />
              )
            }
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
