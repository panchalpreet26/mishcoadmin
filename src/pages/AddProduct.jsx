import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
// Assuming this is the path to your API base URL export
// Example: export const Api = "http://localhost:5000";
import { Api } from "../../api"; 

export default function AddProduct() {
  const API_URL = Api; 

  // --- Component States ---
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]); 

  // Basic Form State
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
    color: "#f0f0f0", // Default color
  }); 

  // Array/Complex Field States
  const [composition, setComposition] = useState([{ name: "", strength: "" }]);
  const [uses, setUses] = useState([""]);
  const [mechanismOfAction, setMechanismOfAction] = useState([
    { drug: "", moa: "" },
  ]);
  const [indications, setIndications] = useState([""]);
  const [contraindications, setContraindications] = useState([""]); 
  
  // 🛑 MULTI-IMAGE STATE: Array to hold File objects
  const [productImages, setProductImages] = useState([]); 

  // Memoized array of image URLs for preview (handles cleanup)
  const previewUrls = useMemo(() => {
    // Note: URL.createObjectURL is a browser API for local file previews
    return productImages.map((file) => URL.createObjectURL(file));
  }, [productImages]); 

  // --- Effects --- 

  // Fetch categories on mount and clean up object URLs on unmount
  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories/getall`);
        if (mounted) {
          // Assuming categories response is an array under .data or .data.data
          const cats = (res.data.data || res.data).map((c) => ({
            id: c._id,
            name: c.name,
          }));
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    
    fetchCategories();

    return () => {
      mounted = false; 
      // Cleanup: Revoke object URLs to free up memory when component unmounts
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    }; 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]); // dependency array includes API_URL, but exclude previewUrls to prevent infinite loop

  // --- Handlers and Helpers --- 

  // Basic change handler for simple form fields
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ 
      ...p, 
      [name]: type === "checkbox" ? checked : value 
    }));
  }; 

  // 🛑 MULTI-FILE CHANGE HANDLER
  const handleImageChange = (e) => {
    // Convert FileList to Array
    const files = Array.from(e.target.files); 
    setProductImages(files);
  }; 

  // Helper to remove a single image from the list of files to upload
  const removeImage = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  }; 

  // Generic helpers for array-of-objects fields
  const updateArrayObj = (setter, arr, index, key, value) => {
    const copy = [...arr];
    copy[index] = { ...copy[index], [key]: value };
    setter(copy);
  }; 

  // Helper to add new object to an array state (e.g., composition)
  const addArrayObj = (setter, arr, newObj) => setter([...arr, newObj]); 
  
  // Helper to remove object from an array state
  const removeArrayObj = (setter, arr, idx) => {
    // Optional: keep at least one entry
    if (arr.length === 1 && idx === 0) return; 
    setter(arr.filter((_, i) => i !== idx));
  }; 

  // Generic helpers for simple string arrays (uses, indications, contraindications)
  const updateStringArray = (setter, arr, idx, value) => {
    const copy = [...arr];
    copy[idx] = value;
    setter(copy);
  }; 

  // Helper to add new string to an array state (e.g., uses)
  const addStringArray = (setter, arr) => setter([...arr, ""]); 
  
  // Helper to remove string from an array state
  const removeStringArray = (setter, arr, idx) => {
    // Optional: keep at least one entry
    if (arr.length === 1 && idx === 0) return; 
    setter(arr.filter((_, i) => i !== idx));
  }; 

  // Reset function for cleanup after successful submission
  const resetForm = () => {
    setForm({
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
      color: "#f0f0f0", 
    });
    setComposition([{ name: "", strength: "" }]);
    setUses([""]);
    setMechanismOfAction([{ drug: "", moa: "" }]);
    setIndications([""]);
    setContraindications([""]); 
    setProductImages([]);
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    // Basic validation
    if (
      !form.productName.trim() ||
      !form.genericName.trim() ||
      !form.strength.trim() ||
      !form.category
    ) {
      alert(
        "Please fill required fields (Product Name, Generic Name, Strength, Category)."
      );
      return;
    }
    if (!uses.length || uses.every((u) => !u.trim())) {
      alert("Please add at least one use.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData(); 

      // 1. Append primitive fields
      Object.keys(form).forEach((k) => fd.append(k, form[k])); 

      // 2. Append stringified arrays for complex data (backend must parse this using JSON.parse)
      fd.append("composition", JSON.stringify(composition));
      fd.append("uses", JSON.stringify(uses.filter(u => u.trim()))); // Filter out empty uses
      fd.append("mechanismOfAction", JSON.stringify(mechanismOfAction));
      fd.append("indications", JSON.stringify(indications.filter(i => i.trim())));
      fd.append("contraindications", JSON.stringify(contraindications.filter(c => c.trim()))); 

      // 3. 🛑 Append multiple files individually
      productImages.forEach((file) => {
        // The key 'productImages' **MUST** match the Multer field name on the backend
        fd.append("productImages", file);
      }); 

      // POST to backend route
      const res = await axios.post(`${API_URL}/api/products/add`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Add product response:", res.data);
      alert("Product added successfully!");
      resetForm();
    } catch (err) {
      console.error("Error adding product:", err);
      const msg = err?.response?.data?.message || "Failed to add product";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- JSX Render ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-6">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic Info Card */}
          <section className="bg-white shadow-md rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-700">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <input
                name="productName"
                value={form.productName}
                onChange={handleFormChange}
                placeholder="Product Name *"
                className="rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
                required
              />

              <input
                name="genericName"
                value={form.genericName}
                onChange={handleFormChange}
                placeholder="Generic Name *"
                className="rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
                required
              />

              <input
                name="brandName"
                value={form.brandName}
                onChange={handleFormChange}
                placeholder="Brand Name"
                className="rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
              />

              <input
                name="strength"
                value={form.strength}
                onChange={handleFormChange}
                placeholder="Strength (e.g. 500 mg) *"
                className="rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
                required
              />

              <select
                name="dosageForm"
                value={form.dosageForm}
                onChange={handleFormChange}
                className="rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
              >
                <option value="">Dosage Form</option>
                <option>Tablet </option>
                <option>Capsule</option>
                <option>Injection</option>
                <option>Syrup</option>
                <option>Cream</option>
                <option>Ointment</option>
                <option>Powder</option>
              </select>

              <input
                name="administrationRoute"
                value={form.administrationRoute}
                onChange={handleFormChange}
                placeholder="Administration Route (e.g. Oral)"
                className="rounded-lg border border-gray-200 px-4 py-3 focus:ring-2 focus:ring-indigo-200 outline-none"
              />
            </div>
          </section>

          <hr className="my-6" />
          
          {/* 2. Composition Card (Array of Objects) */}
          <section className="bg-white shadow-md rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                Composition
              </h2>

              <button
                type="button"
                onClick={() =>
                  addArrayObj(setComposition, composition, {
                    name: "",
                    strength: "",
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {composition.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                >
                  <input
                    value={c.name}
                    onChange={(e) =>
                      updateArrayObj(
                        setComposition,
                        composition,
                        i,
                        "name",
                        e.target.value
                      )
                    }
                    placeholder="Ingredient name *"
                    className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2"
                  />

                  <input
                    value={c.strength}
                    onChange={(e) =>
                      updateArrayObj(
                        setComposition,
                        composition,
                        i,
                        "strength",
                        e.target.value
                      )
                    }
                    placeholder="Strength (e.g. 500 mg) *"
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />

                  <div className="flex gap-2 md:col-span-2 justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayObj(setComposition, composition, i)
                      }
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="my-6" />
          
          {/* 3. Uses Card (Simple String Array) */}
          <section className="bg-white shadow-md rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">Uses</h2>

              <button
                type="button"
                onClick={() => addStringArray(setUses, uses)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Add
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {uses.map((u, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input
                    value={u}
                    onChange={(e) =>
                      updateStringArray(setUses, uses, i, e.target.value)
                    }
                    placeholder="Use"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
                  />

                  <button
                    type="button"
                    onClick={() => removeStringArray(setUses, uses, i)}
                    className="px-3 py-2 rounded-lg bg-red-100 text-red-700"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </section>

          <hr className="my-6" />
          
          {/* 4. MOA Card (Array of Objects) */}
          <section className="bg-white shadow-md rounded-2xl p-6 md:p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-700">
                Mechanism of Action
              </h2>

              <button
                type="button"
                onClick={() =>
                  addArrayObj(setMechanismOfAction, mechanismOfAction, {
                    drug: "",
                    moa: "",
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
              >
                + Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {mechanismOfAction.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center"
                >
                  <input
                    value={m.drug}
                    onChange={(e) =>
                      updateArrayObj(
                        setMechanismOfAction,
                        mechanismOfAction,
                        i,
                        "drug",
                        e.target.value
                      )
                    }
                    placeholder="Drug name"
                    className="md:col-span-2 rounded-lg border border-gray-200 px-3 py-2"
                  />

                  <input
                    value={m.moa}
                    onChange={(e) =>
                      updateArrayObj(
                        setMechanismOfAction,
                        mechanismOfAction,
                        i,
                        "moa",
                        e.target.value
                      )
                    }
                    placeholder="Mechanism of action"
                    className="rounded-lg border border-gray-200 px-3 py-2"
                  />

                  <div className="flex gap-2 md:col-span-2 justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayObj(
                          setMechanismOfAction,
                          mechanismOfAction,
                          i
                        )
                      }
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <hr className="my-6" />
          
          {/* 5. Indications & Contraindications (Simple String Arrays) */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Indications */}
            <div className="bg-white shadow-md rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">
                  Indications
                </h3>

                <button
                  type="button"
                  onClick={() => addStringArray(setIndications, indications)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-600 text-white"
                >
                  + Add
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {indications.map((it, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      value={it}
                      onChange={(e) =>
                        updateStringArray(
                          setIndications,
                          indications,
                          i,
                          e.target.value
                        )
                      }
                      placeholder="Indication"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        removeStringArray(setIndications, indications, i)
                      }
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Contraindications */}
            <div className="bg-white shadow-md rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">
                  Contraindications
                </h3>

                <button
                  type="button"
                  onClick={() =>
                    addStringArray(setContraindications, contraindications)
                  }
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-indigo-600 text-white"
                >
                  + Add
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {contraindications.map((it, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <input
                      value={it}
                      onChange={(e) =>
                        updateStringArray(
                          setContraindications,
                          contraindications,
                          i,
                          e.target.value
                        )
                      }
                      placeholder="Contraindication"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2"
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
                      className="px-3 py-2 rounded-lg bg-red-100 text-red-700"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="my-6" />
          
          {/* 6. Pack / MRP / Storage / Category / Color Picker */}
          <section className="bg-white shadow-md rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Product Details & Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                name="packSize"
                value={form.packSize}
                onChange={handleFormChange}
                placeholder="Pack Size (e.g. 10 tablets)"
                className="rounded-lg border border-gray-200 px-4 py-3"
              />

              <input
                name="mrp"
                type="number"
                value={form.mrp}
                onChange={handleFormChange}
                placeholder="MRP"
                className="rounded-lg border border-gray-200 px-4 py-3"
                min="0"
              />

              <input
                name="storage"
                value={form.storage}
                onChange={handleFormChange}
                placeholder="Storage instructions"
                className="rounded-lg border border-gray-200 px-4 py-3"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="rounded-lg border border-gray-200 px-4 py-3"
                required
              >
                <option value="">Select Category *</option>

                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-3">
                <input
                  id="presc"
                  name="prescriptionRequired"
                  type="checkbox"
                  checked={form.prescriptionRequired}
                  onChange={handleFormChange}
                  className="h-5 w-5"
                />

                <label htmlFor="presc" className="text-sm text-gray-600">
                  Prescription Required
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="featured"
                  name="isFeatured"
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={handleFormChange}
                  className="h-5 w-5"
                />

                <label htmlFor="featured" className="text-sm text-gray-600">
                  Featured Product
                </label>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <label
                htmlFor="color-picker"
                className="text-sm font-medium text-gray-700"
              >
                Product Color:
              </label>
              <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                {/* Color Picker Input */}
                <input
                  id="color-picker"
                  name="color"
                  type="color" // Key for color picker
                  value={form.color}
                  onChange={handleFormChange}
                  title="Choose Product Color"
                  className="w-10 h-10 p-0 border-none cursor-pointer"
                />
                {/* Display the Hex value next to the picker */}
                <input
                  type="text"
                  value={form.color}
                  onChange={handleFormChange} // Allows manual hex entry as well
                  placeholder="#f0f0f0"
                  className="w-24 px-2 py-2 text-sm text-gray-700 border-l border-gray-200 outline-none focus:ring-0"
                />
              </div>
            </div>
          </section>

          <hr className="my-6" />
          
          {/* 7. 🛑 Image Upload Card (Multiple Files) */}
          <section className="bg-white shadow-md rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-semibold text-gray-700">
              Product Images
            </h2>

            <p className="text-sm text-gray-400 mb-4">
              Upload multiple product images (Select all files at once).
            </p>
            {/* File Input */}
            <div className="mb-6">
              <input
                type="file"
                accept="image/*"
                name="productImages"
                onChange={handleImageChange}
                multiple // Key: Allows selecting multiple files
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white p-2"
              />
            </div>
            
            {/* Image Previews */}
            {productImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold mb-2">Image Previews:</p>

                <div className="flex flex-wrap gap-4 p-3 border rounded-lg bg-gray-50">
                  {productImages.map((file, index) => (
                    <div key={index} className="relative w-24 h-24 shadow-md">
                      <img
                        src={previewUrls[index]}
                        alt={`Product ${index}`}
                        className="w-full h-full object-contain rounded-lg border p-1 bg-white"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-[-8px] right-[-8px] w-6 h-6 bg-red-600 text-white rounded-full text-xs font-bold leading-none flex items-center justify-center border-2 border-white"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Current selection: {productImages.length}
                  file(s) pending upload
                </p>
              </div>
            )}
          </section>

          <hr className="my-6" />
          
          {/* 8. Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl text-white font-semibold ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}