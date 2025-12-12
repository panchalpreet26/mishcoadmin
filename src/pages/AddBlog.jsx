import React, { useState } from "react";
import axios from "axios";
import { Api } from "../../api"; // Assuming this exports the base URL

export default function AddBlog() {
  const API_URL = Api; // Base URL for your backend // --- Component States ---

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null); // 1. Basic Form Data

  const [form, setForm] = useState({
    title: "",
    description: "", // Short preview/excerpt
    senderName: "",
    featured: false,
  }); // 2. Dynamic Content Array (Array of Objects)

  const [content, setContent] = useState([
    { title: "Introduction", description: "" },
  ]); // 3. File States for Image Uploads

  const [imageUrlFile, setImageUrlFile] = useState(null);
  const [senderPhotoFile, setSenderPhotoFile] = useState(null); // --- Handlers --- // Handle basic text/boolean fields

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }; // Handle file input changes

  const handleFileChange = (e, fileSetter) => {
    const file = e.target.files[0];
    if (file) {
      fileSetter(file);
    }
  }; // Handle content section changes

  const handleContentChange = (index, name, value) => {
    const newContent = [...content];
    newContent[index][name] = value;
    setContent(newContent);
  }; // Add new content section

  const addContentSection = () => {
    setContent([...content, { title: "", description: "" }]);
  }; // Remove content section

  const removeContentSection = (index) => {
    if (content.length > 1) {
      setContent(content.filter((_, i) => i !== index));
    } else {
      alert("A blog must have at least one content section.");
    }
  }; // Reset function

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      senderName: "",
      featured: false,
    });
    setContent([{ title: "Introduction", description: "" }]);
    setImageUrlFile(null);
    setSenderPhotoFile(null);
    setError(null);
    setSuccess("Blog post successfully.!");
  }; // --- Submit Handler ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null); // Basic Client-Side Validation

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.senderName.trim()
    ) {
      setError(
        "Please fill out the Title, Description (Preview), and Sender Name."
      );
      setLoading(false);
      return;
    } // Ensure content array is valid

    const isValidContent = content.every(
      (sec) => sec.title.trim() && sec.description.trim()
    );
    if (!isValidContent) {
      setError(
        "Every content section must have both a title and a description."
      );
      setLoading(false);
      return;
    }

    try {
      const fd = new FormData(); // 1. Append simple fields

      Object.keys(form).forEach((k) => fd.append(k, form[k])); // 2. Append stringified content array // NOTE: The controller expects 'content' to be parsed JSON from req.body

      fd.append("content", JSON.stringify(content)); // 3. Append files (if they exist)

      if (imageUrlFile) {
        // Key 'imageUrl' must match the Multer field name in blogRoutes.js
        fd.append("imageUrl", imageUrlFile);
      }
      if (senderPhotoFile) {
        // Key 'senderPhoto' must match the Multer field name in blogRoutes.js
        fd.append("senderPhoto", senderPhotoFile);
      } // POST to the backend route

      const res = await axios.post(`${API_URL}/api/blogs/create`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
      });

      setSuccess(res.data.message || "Blog created successfully!");
      alert("Blog created successfully!"); // Optional: Reset form after successful submission
      resetForm();
    } catch (err) {
      console.error("Error creating blog:", err);
      const msg =
        err?.response?.data?.message ||
        "Failed to create blog post. Check console for details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }; // --- JSX Render ---

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-2">
          📝 Create New Blog Post
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
            role="alert"
          >
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Info */}
          <section className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Post Title & Preview
            </h2>

            <div className="space-y-4">
              <input
                name="title"
                value={form.title}
                onChange={handleFormChange}
                placeholder="Blog Title *"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-300 outline-none"
                required
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Short Description (Preview Text) *"
                rows="3"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-indigo-300 outline-none"
                required
              />
            </div>
          </section>
          <hr className="my-6" />
          {/* 2. Content Sections (Dynamic Array) */}
          <section className="bg-white shadow-xl rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-indigo-700">
                Content Sections
              </h2>

              <button
                type="button"
                onClick={addContentSection}
                className="px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 text-sm font-medium"
              >
                + Add Section
              </button>
            </div>

            <div className="space-y-6">
              {content.map((section, index) => (
                <div
                  key={index}
                  className="border border-gray-200 p-4 rounded-lg bg-gray-50"
                >
                  <h3 className="text-md font-medium text-gray-700 mb-3">
                    Section {index + 1}
                  </h3>

                  <input
                    value={section.title}
                    onChange={(e) =>
                      handleContentChange(index, "title", e.target.value)
                    }
                    placeholder="Section Title *"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 mb-2"
                    required
                  />

                  <textarea
                    value={section.description}
                    onChange={(e) =>
                      handleContentChange(index, "description", e.target.value)
                    }
                    placeholder="Section Description *"
                    rows="4"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2"
                    required
                  />

                  <div className="text-right mt-2">
                    <button
                      type="button"
                      onClick={() => removeContentSection(index)}
                      className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                      disabled={content.length === 1}
                    >
                      Remove Section
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <hr className="my-6" /> {/* 3. Author & Images */}
          <section className="bg-white shadow-xl rounded-2xl p-6">
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Author & Media
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Name *
                </label>

                <input
                  name="senderName"
                  value={form.senderName}
                  onChange={handleFormChange}
                  placeholder="Author Name"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3"
                  required
                />
              </div>
              {/* Featured Checkbox */}
              <div className="flex items-center pt-6">
                <input
                  id="featured"
                  name="featured"
                  type="checkbox"
                  checked={form.featured}
                  onChange={handleFormChange}
                  className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />

                <label
                  htmlFor="featured"
                  className="ml-3 text-sm font-medium text-gray-700"
                >
                  Set as Featured Blog
                </label>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Main Blog Image (imageUrl)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setImageUrlFile)}
                  className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                />

                {imageUrlFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: **{imageUrlFile.name}**
                  </p>
                )}
              </div>
              {/* Sender Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author Photo (senderPhoto)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setSenderPhotoFile)}
                  className="w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 p-2"
                />

                {senderPhotoFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: **{senderPhotoFile.name}**
                  </p>
                )}
              </div>
            </div>
          </section>
          <hr className="my-6" /> {/* 4. Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-semibold ${
                loading
                  ? "bg-indigo-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? "Publishing..." : "Publish Blog Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
