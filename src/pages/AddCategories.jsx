import React, { useState, useEffect } from "react";
import axios from "axios";
import { Api } from "../../api";

export default function CategoryManagement() {
  const API_URL = Api;

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // track which category is being edited
  const [editingName, setEditingName] = useState("");

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories/getall`, {
        headers: { "Cache-Control": "no-cache" },
      });

      const data = res.data.data.map((cat) => ({
        id: cat._id,
        name: cat.name,
        icon: cat.icon,
        slug: cat.slug,
      }));

      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      alert("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Add new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      alert("Please enter category name");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/categories/add`, {
        name: categoryName,
      });

      if (res.data.success) {
        alert("Category added successfully!");
        setCategoryName("");
        fetchCategories();
      } else {
        alert(res.data.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert(err?.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const res = await axios.delete(`${API_URL}/api/categories/delete/${id}`);
      if (res.data.success) {
        alert("Category deleted successfully!");
        fetchCategories();
      } else {
        alert(res.data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      alert(err?.response?.data?.message || "Failed to delete category");
    }
  };

  // Start editing a category
  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Save edited category
  const handleSaveEdit = async (id) => {
    if (!editingName.trim()) {
      alert("Category name cannot be empty");
      return;
    }

    try {
      const res = await axios.put(`${API_URL}/api/categories/update/${id}`, {
        name: editingName,
      });

      if (res.data.success) {
        alert("Category updated successfully!");
        setEditingId(null);
        setEditingName("");
        fetchCategories();
      } else {
        alert(res.data.message || "Failed to update category");
      }
    } catch (err) {
      console.error("Error updating category:", err);
      alert(err?.response?.data?.message || "Failed to update category");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
          Category Management
        </h1>

        {/* Add Category Form */}
        <form
          onSubmit={handleAddCategory}
          className="flex flex-col md:flex-row items-center gap-4 mb-8"
        >
          <input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-semibold ${
              loading ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Adding..." : "Add Category"}
          </button>
        </form>

        {/* List of Categories */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            All Categories
          </h2>
          {categories.length === 0 ? (
            <p className="text-gray-500">No categories found.</p>
          ) : (
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className="flex justify-between items-center border-b border-gray-200 px-2 py-2"
                >
                  <div className="flex items-center gap-3">
                    
                    {editingId === cat.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                      />
                    ) : (
                      <span>{cat.name}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => handleSaveEdit(cat.id)}
                          className="px-3 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(cat)}
                          className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="px-3 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
