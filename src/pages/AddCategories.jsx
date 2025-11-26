import React, { useState, useEffect } from "react";
import axios from "axios";
import { Api } from "../../api";

export default function CategoryManagement() {
  const API_URL = Api;

  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories/getall`, {
        headers: { "Cache-Control": "no-cache" },
      });

      const data = (res.data.data || res.data).map((cat) => ({
        id: cat._id,
        name: cat.name,
        icon: cat.icon || null,
        slug: cat.slug || "",
      }));

      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      alert("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) return alert("Category name is required");

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/categories/add`, { name: categoryName });
      alert("Category added successfully!");
      setCategoryName("");
      fetchCategories();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category? This cannot be undone.")) return;

    try {
      await axios.delete(`${API_URL}/api/categories/delete/${id}`);
      alert("Category deleted!");
      fetchCategories();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return alert("Name cannot be empty");

    try {
      await axios.put(`${API_URL}/api/categories/update/${id}`, {
        name: editingName,
      });
      alert("Category updated!");
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center sm:text-left mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800">
            Category Management
          </h1>
          <p className="mt-2 text-gray-600">Add, edit, or remove product categories</p>
        </div>

        {/* Add New Category Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Category</h2>
          <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g., Antibiotics, Pain Relief, Vitamins"
              className="flex-1 px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 rounded-xl font-bold text-white transition-all transform hover:scale-105 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              }`}
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>

        {/* Categories List - Responsive Table/Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">All Categories ({categories.length})</h2>
          </div>

          {categories.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="text-lg">No categories yet. Add your first one above!</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="border-b border-gray-100 p-5 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      {editingId === cat.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="text-lg font-medium px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-full max-w-xs"
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-lg font-semibold text-gray-800">{cat.name}</h3>
                      )}

                      {/* <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        ID: {cat.id.slice(-6)}
                      </span> */}
                    </div>

                    {editingId === cat.id ? (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => saveEdit(cat.id)}
                          className="flex-1 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex-1 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => startEdit(cat)}
                          className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Category Name
                      </th>
                      {/* <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Slug
                      </th> */}
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-5">
                          {editingId === cat.id ? (
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="px-3 py-2 border border-indigo-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-full max-w-sm"
                              autoFocus
                            />
                          ) : (
                            <span className="font-medium text-gray-900">{cat.name}</span>
                          )}
                        </td>
                        {/* <td className="px-6 py-5 text-sm text-gray-600 font-mono">
                          {cat.slug || "-"}
                        </td> */}
                        <td className="px-6 py-5 text-center">
                          {editingId === cat.id ? (
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => saveEdit(cat.id)}
                                className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="px-5 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => startEdit(cat)}
                                className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(cat.id)}
                                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}