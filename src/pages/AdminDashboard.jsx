import React from "react";
import { Link } from "react-router-dom";
import {
  FiBox,
  FiLayers,
  FiGrid,
  FiHexagon,
  FiArrowRight,
  FiDollarSign,
  FiImage,
  FiUser,
  FiTag,
  FiStar,
  FiPackage,
  FiDroplet,
  FiUsers,
  FiScissors,
} from "react-icons/fi";
import { Ruler } from "lucide-react";

const AdminDashboard = () => {
  const entities = [
    {
      name: "Metal Types",
      route: "/admin/metal-types",
      icon: <FiLayers className="w-6 h-6 text-indigo-600" />,
      description: "Manage metal types and base rates",
    },
    {
      name: "Carats",
      route: "/admin/carats",
      icon: <FiStar className="w-6 h-6 text-purple-600" />,
      description: "Configure carat values and multipliers",
    },
    {
      name: "Categories",
      route: "/admin/categories",
      icon: <FiGrid className="w-6 h-6 text-green-600" />,
      description: "Handle product categories",
    },
    {
      name: "Subcategories",
      route: "/admin/subcategories",
      icon: <FiTag className="w-6 h-6 text-orange-600" />,
      description: "Manage subcategory details",
    },
    {
      name: "Sizes",
      route: "/admin/sizes",
      icon: <Ruler className="w-6 h-6 text-blue-600" />,
      description: "Configure product sizes",
    },
    {
      name: "Currencies",
      route: "/admin/currencies",
      icon: <FiDollarSign className="w-6 h-6 text-teal-600" />,
      description: "Manage currency and conversion rates",
    },
    {
      name: "Colors",
      route: "/admin/colors",
      icon: <FiDroplet className="w-6 h-6 text-pink-600" />,
      description: "Handle color options",
    },
    {
      name: "Gold Price",
      route: "/admin/gold-price",
      icon: <FiDollarSign className="w-6 h-6 text-teal-600" />,
      description: "Set and manage gold prices",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            Jewelry Admin Hub
            <span className="text-indigo-600 text-xl bg-indigo-50 px-3 py-1 rounded-full">
              {entities.length} Entities
            </span>
          </h1>
          <p className="text-gray-500 text-lg">
            Central management for jewelry products and configurations
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <Link
              key={entity.name}
              to={entity.route}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:border-indigo-100"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50 rounded-lg w-max">
                    {entity.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {entity.name}
                  </h3>
                  <p className="text-gray-500 text-sm">{entity.description}</p>
                </div>
                <FiArrowRight className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Helper Text */}
        <p className="text-center text-gray-400 mt-12 text-sm">
          Click any card to manage specific entity configurations
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
