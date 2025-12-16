// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import Dashboard from "./pages/Dashboard";
import AddProductPage from "./pages/AddProduct";
import CategoryManagement from "./pages/AddCategories";
import Products from "./pages/allproduct";
import AddBlog from "./pages/AddBlog";
import BlogList from "./pages/BlogList";
import ContactList from "./pages/ContactList";

import { Toaster } from "react-hot-toast";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Toaster position="top-right" />

      <Routes>
        {/* ===== ADMIN LAYOUT ===== */}
        <Route
          path="/admin/*"
          element={
            <div className="flex h-screen bg-gray-50">
              {/* Sidebar */}
              <div className="hidden lg:flex lg:flex-shrink-0">
                <div className="w-64 flex flex-col">
                  <Sidebar />
                </div>
              </div>

              {/* Mobile overlay */}
              {sidebarOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                  onClick={() => setSidebarOpen(false)}
                />
              )}

              {/* Mobile sidebar */}
              <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:hidden ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
              >
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </div>

              {/* Main content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Optional Topbar */}
                {/* <Topbar onMenuClick={() => setSidebarOpen(true)} /> */}

                <main className="flex-1 overflow-y-auto bg-gray-50">
                  <div className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="" element={<Dashboard />} />
                      <Route path="addproduct" element={<AddProductPage />} />
                      <Route
                        path="addcategories"
                        element={<CategoryManagement />}
                      />
                      <Route path="bloglist" element={<BlogList />} />
                      <Route path="contactlist" element={<ContactList />} />
                      <Route path="addblog" element={<AddBlog />} />
                      <Route path="products" element={<Products />} />

                      {/* 404 */}
                      <Route
                        path="*"
                        element={
                          <div className="text-center py-20">
                            <h1 className="text-6xl font-bold text-gray-400">
                              404
                            </h1>
                            <p className="mt-4">Page Not Found</p>
                          </div>
                        }
                      />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          }
        />

        {/* Redirect root */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
