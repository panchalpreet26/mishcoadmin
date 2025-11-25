import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Importing Lucide-React icons
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  User,
  FileText,
  Loader2,
  Eye,
  ArrowLeft,
  UploadCloud,
} from "lucide-react";

// Assuming this exports the base URL (e.g., 'http://localhost:5000')
import { Api } from "../../api";
const API_URL = Api;

// --- Helper Function ---
const createSlug = (title) => {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
};

// ==========================================================
// 1. EditBlog Component (Nested within the manager for simplicity)
// ==========================================================
function EditBlog({ blog, API_URL, onBack }) {
  
  const [formData, setFormData] = useState({
    title: blog.title || '',
    author: blog.senderName || '',
    content: blog.description || '',
    slug: blog.slug || (blog.title ? createSlug(blog.title) : ''), // Use existing slug or generate one
    imageUrl: blog.imageUrl || '',
    isPublished: blog.isPublished || true, // Default to published
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Effect to update slug when title changes (if the user hasn't manually edited it)
  useEffect(() => {
    // Only automatically update slug if it was initially generated from the title, not a custom one
    if (blog.title && formData.title === blog.title) {
      setFormData(prev => ({
        ...prev,
        slug: createSlug(prev.title)
      }));
    }
  }, [formData.title, blog.title]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      // Create a local URL for previewing the new image
      setFormData(prev => ({ ...prev, imageUrl: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('senderName', formData.author); 
    data.append('description', formData.content); 
    data.append('slug', formData.slug);
    data.append('isPublished', formData.isPublished);
    
    if (imageFile) {
      data.append('featuredImage', imageFile);
    }

    try {
      // PUT request to update the blog post
      const response = await axios.put(`${API_URL}/api/blogs/update/${blog._id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert("Blog post updated successfully!");
      toast.success(response.data.message || "Blog post updated successfully!");
      
      // Go back to the list and refresh the data
      onBack(); 

    } catch (err) {
      console.error("Update error:", err);
      const msg = err?.response?.data?.message || "Failed to update blog post.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-10 shadow-xl rounded-xl">
        
        {/* Header */}
        <button 
          onClick={onBack} 
          className="text-indigo-600 hover:text-indigo-800 flex items-center mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </button>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Edit Blog Post
        </h1>
        <p className="text-gray-600 mt-1 mb-8">
          Update blog article
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Content Form */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Edit className="h-5 w-5 mr-2 text-indigo-600" /> Blog Content
              </h2>
              
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
                <input 
                  type="text" 
                  id="title" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>

              {/* Author & Slug */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-gray-700">Author *</label>
                  <input 
                    type="text" 
                    id="author" 
                    name="author"
                    value={formData.author}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug *</label>
                  <input 
                    type="text" 
                    id="slug" 
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content *</label>
                <textarea 
                  id="content" 
                  name="content"
                  rows="8"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:ring-indigo-500 focus:border-indigo-500" 
                />
              </div>
            </div>

            {/* Right Column: Featured Image */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xl font-bold text-gray-800">Featured Image</h2>
              
              {/* Image Display */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden shadow-md border border-gray-200">
                {formData.imageUrl ? (
                  <img 
                    src={formData.imageUrl.startsWith('http') ? formData.imageUrl : `${API_URL}/${formData.imageUrl}`} 
                    alt="Featured" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                    <UploadCloud className="h-10 w-10" />
                  </div>
                )}
              </div>

              {/* File Upload Button (Hidden input with visible label) */}
              <label htmlFor="featured-image-upload" className="block text-center text-sm text-indigo-600 cursor-pointer hover:underline">
                Click to change image
              </label>
              <input 
                type="file" 
                id="featured-image-upload" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
              />
            </div>
          </div>

          <hr className="my-8" />
          
          {/* Publishing Options and Submit */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                id="publish-immediately"
                name="isPublished"
                type="checkbox"
                checked={formData.isPublished}
                onChange={handleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="publish-immediately" className="ml-2 block text-sm font-medium text-gray-700">
                Publish immediately
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700'
              } flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" /> Updating...
                </>
              ) : (
                "Update & Publish"
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}


// ==========================================================
// 2. BlogList/BlogManager Component (Main Export)
// ==========================================================
export default function BlogList() { // Renamed to BlogManager for clarity, but can be BlogList
  // --- View Management State ---
  const [view, setView] = useState('list'); // 'list' or 'edit'
  const [selectedBlog, setSelectedBlog] = useState(null); // Holds the blog object being edited

  // --- Existing States ---
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Data Fetching and Handlers ---

  const fetchBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/blogs/getall`);
      const allPosts = [
        ...(response.data.featured ? [response.data.featured] : []),
        ...response.data.posts,
      ];
      const sortedPosts = allPosts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBlogs(sortedPosts);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setError("Failed to fetch blog posts.");
      toast.error("Failed to load blog list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog post?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/blogs/delete/${id}`);
//       toast.success("Blog deleted successfully!");
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
    } catch (err) {
      console.error("Error deleting blog:", err);
      toast.error(err?.response?.data?.message || "Failed to delete blog post.");
    } finally {
      setDeletingId(null);
    }
  };

  // Handles switching to the Edit view
  const handleEdit = (blog) => {
    setSelectedBlog(blog);
    setView('edit');
  };

  // Handles returning from the Edit view (also refreshes the list)
  const handleBack = () => {
    setView('list');
    setSelectedBlog(null);
    fetchBlogs(); // Refresh data after update/cancellation
  };

  const handleAddBlog = () => {
    toast.info("Navigating to Add Blog page...");
    // Implement navigation logic for adding a new blog post here
  };

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.senderName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Render Card Function ---
  const renderBlogCard = (blog, index) => {
    const isPublished = blog.featured || true; 
    const publicationDate = new Date(blog.createdAt).toLocaleDateString(
      "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    );
    return (
      <div key={blog._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
        {/* Featured Image/Header */}
        <div className="aspect-video overflow-hidden bg-gray-100">
          {blog.imageUrl ? (
            <img
              src={blog.imageUrl.startsWith('http') ? blog.imageUrl : `${API_URL}/${blog.imageUrl}`}
              alt={blog.title || "Blog post"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><FileText className="h-12 w-12 text-gray-400" /></div>
          )}
        </div>
        {/* Content and Actions */}
        <div className="p-5 space-y-3 flex flex-col flex-grow">
          <div className="flex justify-between items-start">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isPublished ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-700"}`}>
              {isPublished ? "Published" : "Draft"}
            </span>
            <div className="flex gap-1">
              <button onClick={() => handleEdit(blog)} className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors duration-150" aria-label="Edit blog post">
                <Edit className="h-4 w-4" />
              </button>
              <button onClick={() => handleDelete(blog._id)} disabled={deletingId === blog._id} className={`p-1.5 rounded-full text-gray-500 hover:bg-red-100 hover:text-red-600 transition-colors duration-150 ${deletingId === blog._id ? "opacity-50 cursor-not-allowed" : ""}`} aria-label="Delete blog post">
                {deletingId === blog._id ? (<Loader2 className="h-4 w-4 animate-spin" />) : (<Trash2 className="h-4 w-4" />)}
              </button>
            </div>
          </div>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 hover:text-indigo-600 transition-colors cursor-pointer">{blog.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 flex-grow">{blog.description}</p>
          <div className="space-y-2 pt-3 border-t border-gray-100 mt-auto">
            <div className="flex items-center gap-2 text-sm text-gray-500"><User className="h-4 w-4 text-gray-400" /><span>{blog.senderName}</span></div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><Calendar className="h-4 w-4 text-gray-400" /><span>{publicationDate}</span></div>
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-hidden"><Eye className="h-4 w-4 text-gray-400" /><code className="truncate max-w-full bg-gray-50 px-2 py-1 rounded">{`/blog/${blog.slug || createSlug(blog.title)}`}</code></div>
          </div>
        </div>
      </div>
    );
  };

  // --- CONDITIONAL RENDER ---
  if (view === 'edit' && selectedBlog) {
    return <EditBlog 
      blog={selectedBlog} 
      API_URL={API_URL} 
      onBack={handleBack} 
    />;
  }

  // --- RENDER LIST VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">All Blog Posts</h1>
            <p className="text-gray-600 mt-1">Manage your blog content</p>
          </div>
          <button
            onClick={handleAddBlog}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 font-medium"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Blog Post
          </button>
        </div>
        {/* Search Bar */}
        <div className="bg-white shadow-md rounded-lg p-3 mb-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blog posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition duration-150"
            />
          </div>
        </div>
        {/* Blog Posts Grid */}
        {filteredBlogs.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg text-gray-500 border border-dashed border-gray-300">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Blog Posts Found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "No blog posts match your search criteria." : "Start by creating your first blog post."}
            </p>
            <button
              onClick={handleAddBlog}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 font-medium"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Blog Post
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBlogs.map((blog, index) => renderBlogCard(blog, index))}
          </div>
        )}
      </div>
    </div>
  );
}