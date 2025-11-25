import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { Api } from "../../api";

const API_BASE = Api;

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  // Form state for editing
  const [form, setForm] = useState({
    productName: "",
    genericName: "",
    brandName: "",
    strength: "",
    dosageForm: "",
    administrationRoute: "",
    packSize: "",
    mrp: "",
    storage: "",
    prescriptionRequired: true,
    category: "",
    isFeatured: false,
    color: "",
  });

  const [composition, setComposition] = useState([{ name: "", strength: "" }]);
  const [uses, setUses] = useState([""]);
  const [mechanismOfAction, setMechanismOfAction] = useState([
    { drug: "", moa: "" },
  ]);
  const [indications, setIndications] = useState([""]);
  const [contraindications, setContraindications] = useState([""]);

  // NEW STATE: To hold new files being uploaded and current image paths
  const [newProductImages, setNewProductImages] = useState([]);
  const [currentImagePaths, setCurrentImagePaths] = useState([]); // Array of existing image paths

  // Fetch products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/products/getall`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Attempt to parse JSON strings from the database if necessary
      const parsedList = list.map((product) => ({
        ...product,
        // Assuming the backend stores multi-string fields as arrays/JSON strings
        uses:
          product.uses && typeof product.uses === "string"
            ? JSON.parse(product.uses)
            : product.uses || [],
        indications:
          product.indications && typeof product.indications === "string"
            ? JSON.parse(product.indications)
            : product.indications || [],
        contraindications:
          product.contraindications &&
          typeof product.contraindications === "string"
            ? JSON.parse(product.contraindications)
            : product.contraindications || [],
        composition:
          product.composition && typeof product.composition === "string"
            ? JSON.parse(product.composition)
            : product.composition || [],
        mechanismOfAction:
          product.mechanismOfAction &&
          typeof product.mechanismOfAction === "string"
            ? JSON.parse(product.mechanismOfAction)
            : product.mechanismOfAction || [],

        // Handle images: Assuming 'productImage' is now an array of paths, or single path needs conversion
        productImage: Array.isArray(product.productImage)
          ? product.productImage
          : product.productImage
          ? [product.productImage]
          : [],
      }));

      setProducts(parsedList);
    } catch (err) {
      toast.error("Failed to load products");
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/categories/getall`);
      const cats = res.data.data.map((c) => ({ id: c._id, name: c.name }));
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Open Edit Modal with Full Data
  const openEditModal = (product) => {
    setSelectedProduct(product);
    setForm({
      productName: product.productName || "",
      genericName: product.genericName || "",
      brandName: product.brandName || "",
      strength: product.strength || "",
      dosageForm: product.dosageForm || "",
      administrationRoute: product.administrationRoute || "",
      packSize: product.packSize || "",
      mrp: product.mrp || "",
      storage: product.storage || "",
      prescriptionRequired: product.prescriptionRequired ?? false,
      category: product.category?._id || product.category || "",
      isFeatured: product.isFeatured ?? false,
      color: product.color || "",
    });

    // Initialize array states, ensuring at least one empty field if empty
    setComposition(
      product.composition?.length
        ? product.composition
        : [{ name: "", strength: "" }]
    );
    setUses(product.uses?.length ? product.uses : [""]);
    setIndications(product.indications?.length ? product.indications : [""]);
    setContraindications(
      product.contraindications?.length ? product.contraindications : [""]
    );
    setMechanismOfAction(
      product.mechanismOfAction?.length
        ? product.mechanismOfAction
        : [{ drug: "", moa: "" }]
    );

    // IMAGE LOGIC: Set current image paths and clear new file queue
    setCurrentImagePaths(product.productImage || []);
    setNewProductImages([]);

    setEditModal(true);
  };

  // Handle input change for basic form fields
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // NEW: Handle multiple image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewProductImages(files);
  };

  // NEW: Remove an existing image path
  const removeExistingImage = (path) => {
    setCurrentImagePaths((prev) => prev.filter((p) => p !== path));
  };

  // Array helpers (addField, removeArrayObj, removeStringArray, updateField, updateArray remain the same)
  // --- (Array helpers are kept here for completeness but are unchanged from previous working version) ---
  const addField = (setter, defaultValue) =>
    setter((prev) => [...prev, defaultValue]);

  const removeArrayObj = (setter, arr, idx, defaultVal) => {
    if (arr.length === 1) {
      setter([defaultVal]);
      return;
    }
    setter(arr.filter((_, i) => i !== idx));
  };

  const removeStringArray = (setter, arr, idx) => {
    if (arr.length === 1) {
      setter([""]);
      return;
    }
    setter(arr.filter((_, i) => i !== idx));
  };

  const updateField = (setter, index, field, value) => {
    setter((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const updateArray = (setter, index, value) => {
    setter((prev) => prev.map((item, i) => (i === index ? value : item)));
  };
  // -----------------------------------------------------------------------------------------------------

  // Update Product
  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.keys(form).forEach((key) => fd.append(key, form[key]));

    // Filter and JSON stringify array fields (Ensures they are not sent as simple strings)
    fd.append(
      "composition",
      JSON.stringify(composition.filter((c) => c.name || c.strength))
    );
    fd.append("uses", JSON.stringify(uses.filter((u) => u.trim())));
    fd.append(
      "mechanismOfAction",
      JSON.stringify(mechanismOfAction.filter((m) => m.drug || m.moa))
    );
    fd.append(
      "indications",
      JSON.stringify(indications.filter((i) => i.trim()))
    );
    fd.append(
      "contraindications",
      JSON.stringify(contraindications.filter((c) => c.trim()))
    );

    // NEW: Handle multiple images
    // 1. Append new files
    newProductImages.forEach((file) => {
      // NOTE: The backend must be configured to handle multiple files using the same field name 'productImages'
      fd.append("productImages", file);
    });

    // 2. Append existing image paths (so the server knows which ones to keep)
    fd.append("existingImages", JSON.stringify(currentImagePaths));

    try {
      await axios.put(
        `${API_BASE}/api/products/update/${selectedProduct._id}`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      toast.success("Product updated successfully!");
      setEditModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      console.error("Update error:", err.response?.data || err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      await axios.delete(`${API_BASE}/api/products/delete/${id}`);
      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
      console.error("Delete error:", err.response?.data || err);
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="container mx-auto p-6 min-h-screen">
        <h1 className="text-4xl font-bold text-center mb-10 text-indigo-700">
          Manage Pharmaceutical Products
        </h1>

        {loading ? (
          <div className="text-center py-20 text-2xl text-indigo-500">
            <svg
              className="animate-spin h-8 w-8 mr-3 inline-block"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                className="opacity-25"
              ></circle>
              <path
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
                fill="currentColor"
              ></path>
            </svg>
            Loading Products...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-xl text-gray-500">
            No products found
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition border"
              >
                {/* Display the first image if available */}
                <div className="h-64 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 flex items-center justify-center">
                  <img
                    src={`${API_BASE}${
                      product.productImage?.[0] ||
                      "https://via.placeholder.com/600x600.png?text=No+Image"
                    }`}
                    alt={product.productName}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={(e) =>
                      (e.target.src =
                        "https://via.placeholder.com/600x600.png?text=No+Image")
                    }
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold truncate">
                    {product.productName}
                  </h3>
                  <p className="text-sm text-gray-600">{product.genericName}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-2xl font-bold text-green-600">
                      ₹{product.mrp}
                    </p>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Edit Modal */}
        {editModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full my-8 max-h-[90vh] overflow-y-auto p-8">
              <h2 className="text-3xl font-extrabold mb-8 text-indigo-800 border-b pb-2">
                ✏️ Edit Product: {selectedProduct.productName}
              </h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Basic Info */}
                <div className="p-6 bg-indigo-50 rounded-xl shadow-inner">
                  <h3 className="text-xl font-bold mb-4 text-indigo-700">
                    1. Core Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Product Name *
                      </label>
                      <input
                        name="productName"
                        value={form.productName}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Generic Name *
                      </label>
                      <input
                        name="genericName"
                        value={form.genericName}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Brand Name
                      </label>
                      <input
                        name="brandName"
                        value={form.brandName}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Strength *
                      </label>
                      <input
                        name="strength"
                        value={form.strength}
                        onChange={handleChange}
                        placeholder="e.g. 500 mg"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Dosage Form
                      </label>
                      <select
                        name="dosageForm"
                        value={form.dosageForm}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Dosage Form</option>
                        <option>Tablet</option>
                        <option>Capsule</option>
                        <option>Injection</option>
                        <option>Syrup</option>
                        <option>Cream</option>
                        <option>Ointment</option>
                        <option>Powder</option>
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Administration Route
                      </label>
                      <input
                        name="administrationRoute"
                        value={form.administrationRoute}
                        onChange={handleChange}
                        placeholder="e.g. Oral, Intravenous"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Pack Size
                      </label>
                      <input
                        name="packSize"
                        value={form.packSize}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        MRP (₹) *
                      </label>
                      <input
                        name="mrp"
                        type="number"
                        value={form.mrp}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium mb-1">
                        Storage Instructions
                      </label>
                      <input
                        name="storage"
                        value={form.storage}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata & Features */}
                <div className="p-6 bg-indigo-50 rounded-xl shadow-inner">
                  <h3 className="text-xl font-bold mb-4 text-indigo-700">
                    2. Metadata & Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Category *
                      </label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleChange}
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-7 flex items-center space-x-6">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="prescriptionRequired"
                          checked={form.prescriptionRequired}
                          onChange={handleChange}
                          className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                        />
                        <span>Prescription Required</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isFeatured"
                          checked={form.isFeatured}
                          onChange={handleChange}
                          className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                        />
                        <span>Is Featured</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Color (Optional)
                      </label>
                      <input
                        name="color"
                        value={form.color}
                        onChange={handleChange}
                        placeholder="e.g. #f0f0f0"
                        className="w-full border rounded-lg px-4 py-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Composition */}
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      3. Composition / Ingredients
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        addField(setComposition, { name: "", strength: "" })
                      }
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      + Add Ingredient
                    </button>
                  </div>
                  {composition.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 mb-3 items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="w-6 text-sm font-semibold text-gray-600">
                        {i + 1}.
                      </span>
                      <input
                        value={item.name}
                        onChange={(e) =>
                          updateField(setComposition, i, "name", e.target.value)
                        }
                        placeholder="Ingredient Name"
                        className="flex-1 border rounded-lg px-3 py-2"
                      />
                      <input
                        value={item.strength}
                        onChange={(e) =>
                          updateField(
                            setComposition,
                            i,
                            "strength",
                            e.target.value
                          )
                        }
                        placeholder="Strength"
                        className="w-40 border rounded-lg px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayObj(setComposition, composition, i, {
                            name: "",
                            strength: "",
                          })
                        }
                        className="text-red-600 hover:text-red-800 p-2 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Mechanism of Action */}
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                  <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="text-xl font-bold text-gray-800">
                      4. Mechanism of Action (MOA)
                    </h3>
                    <button
                      type="button"
                      onClick={() =>
                        addField(setMechanismOfAction, { drug: "", moa: "" })
                      }
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                    >
                      + Add MOA
                    </button>
                  </div>
                  {mechanismOfAction.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-3 mb-3 items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="w-6 text-sm font-semibold text-gray-600">
                        {i + 1}.
                      </span>
                      <input
                        value={item.drug}
                        onChange={(e) =>
                          updateField(
                            setMechanismOfAction,
                            i,
                            "drug",
                            e.target.value
                          )
                        }
                        placeholder="Drug Name (Optional)"
                        className="w-1/3 border rounded-lg px-3 py-2"
                      />
                      <input
                        value={item.moa}
                        onChange={(e) =>
                          updateField(
                            setMechanismOfAction,
                            i,
                            "moa",
                            e.target.value
                          )
                        }
                        placeholder="Mechanism of action description"
                        className="flex-1 border rounded-lg px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeArrayObj(
                            setMechanismOfAction,
                            mechanismOfAction,
                            i,
                            { drug: "", moa: "" }
                          )
                        }
                        className="text-red-600 hover:text-red-800 p-2 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Uses, Indications & Contraindications */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Uses */}
                  <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between mb-4 border-b pb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        5. Uses
                      </h3>
                      <button
                        type="button"
                        onClick={() => addField(setUses, "")}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs"
                      >
                        + Add Use
                      </button>
                    </div>
                    <div className="space-y-2">
                      {uses.map((use, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-sm text-gray-600">
                            {i + 1}.
                          </span>
                          <input
                            value={use}
                            onChange={(e) =>
                              updateArray(setUses, i, e.target.value)
                            }
                            placeholder="Description of use"
                            className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => removeStringArray(setUses, uses, i)}
                            className="text-red-600 hover:text-red-800 p-1 text-xs"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indications */}
                  <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between mb-4 border-b pb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        6. Indications
                      </h3>
                      <button
                        type="button"
                        onClick={() => addField(setIndications, "")}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs"
                      >
                        + Add Indication
                      </button>
                    </div>
                    <div className="space-y-2">
                      {indications.map((ind, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-sm text-gray-600">
                            {i + 1}.
                          </span>
                          <input
                            value={ind}
                            onChange={(e) =>
                              updateArray(setIndications, i, e.target.value)
                            }
                            placeholder="Indication condition"
                            className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeStringArray(setIndications, indications, i)
                            }
                            className="text-red-600 hover:text-red-800 p-1 text-xs"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contraindications */}
                  <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <div className="flex justify-between mb-4 border-b pb-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        7. Contraindications
                      </h3>
                      <button
                        type="button"
                        onClick={() => addField(setContraindications, "")}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs"
                      >
                        + Add Contraindication
                      </button>
                    </div>
                    <div className="space-y-2">
                      {contraindications.map((contra, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <span className="text-sm text-gray-600">
                            {i + 1}.
                          </span>
                          <input
                            value={contra}
                            onChange={(e) =>
                              updateArray(
                                setContraindications,
                                i,
                                e.target.value
                              )
                            }
                            placeholder="Contraindication condition"
                            className="flex-1 border rounded-lg px-3 py-1.5 text-sm"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              removeStringArray(
                                setContraindications,
                                contraindications,
                                i
                              )
                            }
                            className="text-red-600 hover:text-red-800 p-1 text-xs"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image Section - MULTIPLE IMAGE SUPPORT */}
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
                  <h3 className="text-xl font-bold mb-4 text-gray-800">
                    8. Product Images
                  </h3>

                  {/* Current Images */}
                  {currentImagePaths.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold mb-2">
                        Existing Images:
                      </p>
                      <div className="flex flex-wrap gap-4 border p-3 rounded-lg bg-gray-50">
                        {currentImagePaths.map((path, index) => (
                          <div
                            key={index}
                            className="relative w-24 h-24 border rounded-lg shadow-sm group"
                          >
                            <img
                              src={`${API_BASE}${path}`}
                              alt={`Existing ${index}`}
                              className="w-full h-full object-contain p-1 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(path)}
                              className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                              title="Remove this existing image"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-gray-600">
                        These images will be kept unless you click 'X' to remove
                        them.
                      </p>
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-1">
                      Upload New Images (Select multiple files)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      multiple
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white p-2"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      New images will be added to the existing ones. Max 5
                      files, 5MB each.
                    </p>
                  </div>

                  {/* Preview New Images */}
                  {newProductImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">
                        New Image Previews:
                      </p>
                      <div className="flex flex-wrap gap-4 p-3 border rounded-lg bg-gray-50">
                        {newProductImages.map((file, index) => (
                          <img
                            key={index}
                            src={URL.createObjectURL(file)}
                            alt={`New ${index}`}
                            className="w-24 h-24 object-contain rounded-lg border p-1"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="px-8 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-lg"
                  >
                    Update Product
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
