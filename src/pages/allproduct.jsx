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

  const [form, setForm] = useState({
    productName: "",
    genericName: "",
    brandName: "",
    strength: "",
    dosageForm: "",
    administrationRoute: "",
    packSize: "",
    storage: "",
    prescriptionRequired: true,
    category: "",
    isFeatured: false,
    color: "#3B82F6",
  });

  const [composition, setComposition] = useState([{ name: "", strength: "" }]);
  const [uses, setUses] = useState([""]);
  const [mechanismOfAction, setMechanismOfAction] = useState([
    { drug: "", moa: "" },
  ]);
  const [indications, setIndications] = useState([""]);
  const [contraindications, setContraindications] = useState([""]);
  const [newProductImages, setNewProductImages] = useState([]);
  const [currentImagePaths, setCurrentImagePaths] = useState([]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/products/getall`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      const parsedList = list.map((product) => ({
        ...product,
        uses:
          typeof product.uses === "string"
            ? JSON.parse(product.uses)
            : product.uses || [],
        indications:
          typeof product.indications === "string"
            ? JSON.parse(product.indications)
            : product.indications || [],
        contraindications:
          typeof product.contraindications === "string"
            ? JSON.parse(product.contraindications)
            : product.contraindications || [],
        composition:
          typeof product.composition === "string"
            ? JSON.parse(product.composition)
            : product.composition || [],
        mechanismOfAction:
          typeof product.mechanismOfAction === "string"
            ? JSON.parse(product.mechanismOfAction)
            : product.mechanismOfAction || [],
        productImage: Array.isArray(product.productImage)
          ? product.productImage
          : product.productImage
          ? [product.productImage]
          : [],
      }));

      setProducts(parsedList);
    } catch (err) {
      toast.error("Failed to load products");
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
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

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
      storage: product.storage || "",
      prescriptionRequired: product.prescriptionRequired ?? true,
      category: product.category?._id || product.category || "",
      isFeatured: product.isFeatured ?? false,
      color: product.color || "#3B82F6",
    });
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
    setCurrentImagePaths(product.productImage || []);
    setNewProductImages([]);
    setEditModal(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) =>
    setNewProductImages(Array.from(e.target.files));
  const removeExistingImage = (path) =>
    setCurrentImagePaths((prev) => prev.filter((p) => p !== path));

  const addField = (setter, val) => setter((prev) => [...prev, val]);
  const removeArrayObj = (setter, arr, idx, def) => {
    if (arr.length === 1) setter([def]);
    else setter(arr.filter((_, i) => i !== idx));
  };
  const removeStringArray = (setter, arr, idx) => {
    if (arr.length === 1) setter([""]);
    else setter(arr.filter((_, i) => i !== idx));
  };
  const updateField = (setter, i, field, val) =>
    setter((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: val } : item))
    );
  const updateArray = (setter, i, val) =>
    setter((prev) => prev.map((item, idx) => (idx === i ? val : item)));

  const handleUpdate = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(form).forEach((k) => fd.append(k, form[k]));
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
    newProductImages.forEach((file) => fd.append("productImages", file));
    fd.append("existingImages", JSON.stringify(currentImagePaths));

    try {
      await axios.put(
        `${API_BASE}/api/products/update/${selectedProduct._id}`,
        fd,
        { withCredentials: true }
      );
      toast.success("Product updated!");
      setEditModal(false);
      fetchProducts();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API_BASE}/api/products/delete/${id}`);
      toast.success("Deleted!");
      fetchProducts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-800 mb-10">
            Manage Pharmaceutical Products
          </h1>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
              <p className="mt-4 text-xl text-gray-600">Loading Products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 text-xl text-gray-500">
              No products found
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 
                             flex flex-col h-full border border-gray-200 overflow-hidden"
                >
                  {/* Fixed Height Image */}
                  <div className="h-56 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 flex items-center justify-center">
                    <img
                      src={`${API_BASE}${
                        product.productImage?.[0] || "/placeholder.png"
                      }`}
                      alt={product.productName}
                      className="max-h-full max-w-full object-contain rounded-lg"
                      onError={(e) =>
                        (e.target.src =
                          "https://via.placeholder.com/400x400.png?text=No+Image")
                      }
                    />
                  </div>

                  {/* Content Area - Fixed layout */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Product Name - 2 lines max */}
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-2">
                      {product.productName}
                    </h3>

                    {/* Generic Name - 3 lines max + ... */}
                    <p className="text-sm text-gray-600 line-clamp-3 leading-snug mb-4 flex-grow">
                      {product.genericName || "—"}
                    </p>

                    {/* Strength & Form Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {product.strength && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                          {product.strength}
                        </span>
                      )}
                      {product.dosageForm && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full">
                          {product.dosageForm}
                        </span>
                      )}
                    </div>

                    {/* Buttons - Always at bottom */}
                    <div className="flex gap-3 mt-auto">
                      <button
                        onClick={() => openEditModal(product)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105 shadow-md"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition transform hover:scale-105 shadow-md"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal - Full & Responsive */}
        {editModal && selectedProduct && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
          >
            {/* outer container: full width on mobile, centered box on larger screens */}
            <div className="bg-white w-full sm:rounded-2xl shadow-2xl max-w-3xl sm:max-w-6xl h-screen sm:h-auto sm:max-h-[92vh] overflow-hidden">
              {/* Sticky header */}
              <div className="sticky top-0 z-30 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                <h2
                  id="edit-product-title"
                  className="text-base sm:text-xl font-bold text-indigo-800 truncate"
                >
                  ✏️ Edit Product: {selectedProduct.productName}
                </h2>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm "
                    aria-label="Close modal"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="25px"
                      height="25px"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z"
                        fill="red"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div
                className="overflow-y-auto px-4 sm:px-8 py-4 sm:py-6"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                <form onSubmit={handleUpdate} className="space-y-6">
                  {/* 1. Core Details */}
                  <section className="p-3 sm:p-4 bg-indigo-50 rounded-lg">
                    <h3 className="text-sm sm:text-lg font-semibold mb-3 text-indigo-700">
                      1. Core Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Product Name *
                        </label>
                        <input
                          name="productName"
                          value={form.productName}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Generic Name *
                        </label>
                        <input
                          name="genericName"
                          value={form.genericName}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Brand Name
                        </label>
                        <input
                          name="brandName"
                          value={form.brandName}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Strength *
                        </label>
                        <input
                          name="strength"
                          value={form.strength}
                          onChange={handleChange}
                          placeholder="e.g. 500 mg"
                          className="w-full border rounded-md px-3 py-2 text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Dosage Form
                        </label>
                        <select
                          name="dosageForm"
                          value={form.dosageForm}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
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

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Administration Route
                        </label>
                        <input
                          name="administrationRoute"
                          value={form.administrationRoute}
                          onChange={handleChange}
                          placeholder="e.g. Oral"
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Pack Size
                        </label>
                        <input
                          name="packSize"
                          value={form.packSize}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Storage Instructions
                        </label>
                        <input
                          name="storage"
                          value={form.storage}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  </section>

                  {/* 2. Metadata & Features */}
                  <section className="p-3 sm:p-4 bg-indigo-50 rounded-lg">
                    <h3 className="text-sm sm:text-lg font-semibold mb-3 text-indigo-700">
                      2. Metadata & Features
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs sm:text-sm mb-1">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={form.category}
                          onChange={handleChange}
                          className="w-full border rounded-md px-3 py-2 text-sm"
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

                      <div className="flex items-center gap-4 pt-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="prescriptionRequired"
                            checked={form.prescriptionRequired}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <span>Prescription Required</span>
                        </label>

                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            name="isFeatured"
                            checked={form.isFeatured}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <span>Is Featured</span>
                        </label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          id="color-picker"
                          name="color"
                          type="color"
                          value={form.color}
                          onChange={handleChange}
                          className="w-10 h-10 p-0 border-none cursor-pointer"
                        />
                        <input
                          type="text"
                          value={form.color}
                          onChange={handleChange}
                          name="color"
                          placeholder="#f0f0f0"
                          className="border-l border-gray-200 px-2 py-2 text-sm rounded-md w-full md:w-36"
                        />
                      </div>
                    </div>
                  </section>

                  {/* 3. Composition */}
                  <section className="p-3 sm:p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-800">
                        3. Composition / Ingredients
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          addField(setComposition, { name: "", strength: "" })
                        }
                        className="px-2 py-1 bg-green-500 text-white rounded-md text-xs sm:text-sm"
                      >
                        + Add Ingredient
                      </button>
                    </div>

                    {composition.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-3"
                      >
                        <span className="text-sm text-gray-600 md:w-6">
                          {i + 1}.
                        </span>
                        <input
                          value={item.name}
                          onChange={(e) =>
                            updateField(
                              setComposition,
                              i,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Ingredient Name"
                          className="flex-1 border rounded-md px-3 py-2 text-sm"
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
                          className="w-full md:w-40 border rounded-md px-3 py-2 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayObj(setComposition, composition, i, {
                              name: "",
                              strength: "",
                            })
                          }
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </section>

                  {/* 4. Mechanism of Action */}
                  <section className="p-3 sm:p-4 bg-white rounded-lg border">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm sm:text-lg font-semibold text-gray-800">
                        4. Mechanism of Action (MOA)
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          addField(setMechanismOfAction, { drug: "", moa: "" })
                        }
                        className="px-2 py-1 bg-green-500 text-white rounded-md text-xs sm:text-sm"
                      >
                        + Add MOA
                      </button>
                    </div>

                    {mechanismOfAction.map((item, i) => (
                      <div
                        key={i}
                        className="flex flex-col md:flex-row gap-2 items-start md:items-center mb-3"
                      >
                        <span className="text-sm text-gray-600 md:w-6">
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
                          className="w-full md:w-1/3 border rounded-md px-3 py-2 text-sm"
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
                          placeholder="Mechanism description"
                          className="flex-1 border rounded-md px-3 py-2 text-sm"
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
                          className="text-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </section>

                  {/* 5-7. Uses / Indications / Contraindications */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Uses */}
                    <div className="p-2 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">5. Uses</h4>
                        <button
                          type="button"
                          onClick={() => addField(setUses, "")}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {uses.map((u, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {i + 1}.
                            </span>
                            <input
                              value={u}
                              onChange={(e) =>
                                updateArray(setUses, i, e.target.value)
                              }
                              className="flex-1 border rounded-md px-2 py-1 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeStringArray(setUses, uses, i)
                              }
                              className="text-red-600 text-xs"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Indications */}
                    <div className="p-2 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">6. Indications</h4>
                        <button
                          type="button"
                          onClick={() => addField(setIndications, "")}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {indications.map((ind, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {i + 1}.
                            </span>
                            <input
                              value={ind}
                              onChange={(e) =>
                                updateArray(setIndications, i, e.target.value)
                              }
                              className="flex-1 border rounded-md px-2 py-1 text-sm"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                removeStringArray(
                                  setIndications,
                                  indications,
                                  i
                                )
                              }
                              className="text-red-600 text-xs"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contraindications */}
                    <div className="p-2 bg-white rounded-lg border">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">7. Contraindications</h4>
                        <button
                          type="button"
                          onClick={() => addField(setContraindications, "")}
                          className="text-xs px-2 py-1 bg-blue-500 text-white rounded-md"
                        >
                          + Add
                        </button>
                      </div>
                      <div className="space-y-2">
                        {contraindications.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                              {i + 1}.
                            </span>
                            <input
                              value={c}
                              onChange={(e) =>
                                updateArray(
                                  setContraindications,
                                  i,
                                  e.target.value
                                )
                              }
                              className="flex-1 border rounded-md px-2 py-1 text-sm"
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
                              className="text-red-600 text-xs"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Images */}
                  <section className="p-3 sm:p-4 bg-white rounded-lg border">
                    <h3 className="text-sm sm:text-lg font-semibold mb-2 text-gray-800">
                      8. Product Images
                    </h3>

                    {currentImagePaths.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-2">
                          {currentImagePaths.map((path, idx) => (
                            <div key={idx} className="relative">
                              <img
                                src={`${API_BASE}${path}`}
                                alt={`existing-${idx}`}
                                className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-md border p-1 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => removeExistingImage(path)}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          These images will be kept unless removed.
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm mb-1">
                        Upload New Images (multiple)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        name="productImages" 
                        onChange={handleImageChange}
                        multiple
                        className="block w-full text-sm text-gray-900 border rounded-md p-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        New images will be appended. Max 5 files suggested.
                      </p>
                    </div>

                    {newProductImages.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {newProductImages.map((f, i) => (
                          <img
                            key={i}
                            src={URL.createObjectURL(f)}
                            alt={`preview-${i}`}
                            className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-md border p-1 bg-white"
                          />
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Footer actions (duplicate kept inside form so actions remain when scrolling) */}
                  <div className="sticky  left-0 right-0 bg-transparent border-t pt-3 pb-4 mt-4 flex justify-end gap-3 z-20">
                    <button
                      type="button"
                      onClick={() => setEditModal(false)}
                      className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Update Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductsPage;
