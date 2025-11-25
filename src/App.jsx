// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Layout & Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
// import AdminRoute from "./components/AuthRoutes";

// Admin Pages
import Dashboard from "./pages/Dashboard";
// import Users from "./pages/Users";
// import Orders from "./pages/Orders";
// import ProductAdmin from "./pages/ProductAdmin";
// import AdminContactMessages from "./pages/AdminMessageShow";
// Add more pages here...

import { Toaster } from "react-hot-toast";
import AddProductPage from "./pages/AddProduct";
import CategoryManagement from "./pages/AddCategories";
import Products from "./pages/allproduct";
import AddBlog from "./pages/AddBlog";
import BlogList from "./pages/BlogList";
import ContactList from "./pages/ContactList";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <Toaster position="top-right" />

      <div className="flex h-screen bg-gray-50">
        {/* ===== LEFT SIDEBAR - Fixed & Beautiful ===== */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="w-64 flex flex-col">
            <Sidebar />
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform lg:hidden ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* ===== RIGHT SIDE - Main Content Area ===== */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Topbar */}
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          {/* Page Content - Scrollable */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Routes>
                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    // <AdminRoute>
                    <Dashboard />
                    // </AdminRoute>
                  }
                />
                
                <Route
                  path="/admin/addproduct"
                  element={
                    // <AdminRoute>
                    <AddProductPage />
                    // </AdminRoute>
                  }
                />
                <Route
                  path="/admin/addcategories"
                  element={
                    // <AdminRoute>
                    <CategoryManagement />
                    // </AdminRoute>
                  }
                />
                <Route
                  path="/admin/bloglist"
                  element={
                    // <AdminRoute>
                    <BlogList />
                    // </AdminRoute>
                  }
                />
                <Route
                  path="/admin/contactlist"
                  element={
                    // <AdminRoute>
                    <ContactList />
                    // </AdminRoute>
                  }
                />

                <Route
                  path="/admin/AddBlog"
                  element={
                    // <AdminRoute>
                    <AddBlog />
                    // </AdminRoute>
                  }
                />

                <Route
                  path="/admin/products"
                  element={
                    // <AdminRoute>
                    <Products />
                    // </AdminRoute>
                  }
                />
                

                {/* Add more admin routes */}
                {/* <Route path="/admin/slider" element={<AdminRoute><Slider /></AdminRoute>} /> */}

                {/* Redirect root to /admin */}
                <Route path="/" element={<Navigate to="/admin" replace />} />

                {/* 404 */}
                <Route
                  path="*"
                  element={
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h1 className="text-6xl font-bold text-gray-400">
                          404
                        </h1>
                        <p className="text-xl text-gray-600 mt-4">
                          Page Not Found
                        </p>
                        <a
                          href="/admin"
                          className="text-blue-600 hover:underline"
                        >
                          ← Go to Dashboard
                        </a>
                      </div>
                    </div>
                  }
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
