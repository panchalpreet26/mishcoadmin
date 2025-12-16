import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Edit, Trash2, Loader2 } from "lucide-react";
import { Api } from "../../api";

const API_URL = Api;

/* =========================
   EDIT BLOG (BASIC FIELDS ONLY)
========================= */
function EditBlog({ blog, onBack }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    senderName: "",
  });

  const [imageUrlFile, setImageUrlFile] = useState(null);
  const [senderPhotoFile, setSenderPhotoFile] = useState(null);

  /* PREFILL DATA */
  useEffect(() => {
    if (!blog) return;

    setForm({
      title: blog.title || "",
      description: blog.description || "",
      senderName: blog.senderName || "",
    });
  }, [blog]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* UPDATE BLOG */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("description", form.description);
      fd.append("senderName", form.senderName);

      if (imageUrlFile) fd.append("imageUrl", imageUrlFile);
      if (senderPhotoFile) fd.append("senderPhoto", senderPhotoFile);

      await axios.put(`${API_URL}/api/blogs/update/${blog._id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Blog updated successfully");
      onBack();
    } catch (err) {
      console.error(err);
      setError("Failed to update blog");
      toast.error("Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <button onClick={onBack} className="text-indigo-600 mb-6">
          ← Back to Blog List
        </button>

        <h1 className="text-2xl font-bold mb-6">✏️ Edit Blog</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="font-medium">Blog Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-medium">Preview Text</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded px-4 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-medium">Author Name</label>
            <input
              name="senderName"
              value={form.senderName}
              onChange={handleChange}
              className="w-full border rounded px-4 py-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-medium">Main Blog Image</label>
            {blog.imageUrl && (
              <img
                src={`${API_URL}/${blog.imageUrl}`}
                className="h-40 rounded mt-2 mb-2 object-cover"
                alt="Blog"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageUrlFile(e.target.files[0])}
            />
          </div>

          <div>
            <label className="font-medium">Author Image</label>
            {blog.senderPhoto && (
              <img
                src={`${API_URL}/${blog.senderPhoto}`}
                className="h-24 rounded-full mt-2 mb-2"
                alt="Author"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSenderPhotoFile(e.target.files[0])}
            />
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded"
            >
              {loading ? "Updating..." : "Update Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================
   BLOG LIST
========================= */
export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchBlogs = async () => {
    const res = await axios.get(`${API_URL}/api/blogs/getall`);
    setBlogs(res.data.posts || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/blogs/delete/${id}`);
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      toast.success("Blog deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete blog");
    } finally {
      setDeletingId(null);
    }
  };

  if (selectedBlog) {
    return (
      <EditBlog
        blog={selectedBlog}
        onBack={() => {
          setSelectedBlog(null);
          fetchBlogs();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading...</p>
        ) : (
          blogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              {/* IMAGE */}
              <div className="h-40 bg-gray-100">
                {blog.imageUrl ? (
                  <img
                    src={
                      blog.imageUrl.startsWith("http")
                        ? blog.imageUrl
                        : `${API_URL}/${blog.imageUrl}`
                    }
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {blog.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {blog.description}
                </p>

                <div className="mt-4 flex gap-4">
                  <button
                    onClick={() => setSelectedBlog(blog)}
                    className="inline-flex items-center gap-2 text-indigo-600"
                  >
                    <Edit size={16} /> Edit
                  </button>

                  <button
                    onClick={() => handleDelete(blog._id)}
                    disabled={deletingId === blog._id}
                    className="inline-flex items-center gap-2 text-red-600 disabled:opacity-50"
                  >
                    {deletingId === blog._id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
