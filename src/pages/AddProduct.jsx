import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Api } from "../../api";

export default function AddProduct() {
  const API_URL = Api;

  const [loading, setLoading] = useState(false);
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
    color: "#f0f0f0",
  });

  const [composition, setComposition] = useState([{ name: "", strength: "" }]);
  const [uses, setUses] = useState([""]);
  const [mechanismOfAction, setMechanismOfAction] = useState([
    { drug: "", moa: "" },
  ]);
  const [indications, setIndications] = useState([""]);
  const [contraindications, setContraindications] = useState([""]);
  const [productImages, setProductImages] = useState([]);

  const previewUrls = useMemo(() => {
    return productImages.map((file) => URL.createObjectURL(file));
  }, [productImages]);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories/getall`);
        if (mounted) {
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
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [API_URL, previewUrls]);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setProductImages(files);
  };

  const removeImage = (index) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateArrayObj = (setter, arr, index, key, value) => {
    const copy = [...arr];
    copy[index] = { ...copy[index], [key]: value };
    setter(copy);
  };

  const addArrayObj = (setter, arr, newObj) => setter([...arr, newObj]);

  const removeArrayObj = (setter, arr, idx) => {
    if (arr.length === 1) return;
    setter(arr.filter((_, i) => i !== idx));
  };

  const updateStringArray = (setter, arr, idx, value) => {
    const copy = [...arr];
    copy[idx] = value;
    setter(copy);
  };

  const addStringArray = (setter, arr) => setter([...arr, ""]);

  const removeStringArray = (setter, arr, idx) => {
    if (arr.length === 1) return;
    setter(arr.filter((_, i) => i !== idx));
  };

  const resetForm = () => {
    setForm({
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
      color: "#f0f0f0",
    });
    setComposition([{ name: "", strength: "" }]);
    setUses([""]);
    setMechanismOfAction([{ drug: "", moa: "" }]);
    setIndications([""]);
    setContraindications([""]);
    setProductImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.productName.trim() ||
      !form.genericName.trim() ||
      !form.strength.trim() ||
      !form.category
    ) {
      alert(
        "Please fill required fields: Product Name, Generic Name, Strength, Category."
      );
      return;
    }
    if (!uses.some((u) => u.trim())) {
      alert("Please add at least one use.");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      Object.keys(form).forEach((k) => fd.append(k, form[k]));
      fd.append("composition", JSON.stringify(composition));
      fd.append("uses", JSON.stringify(uses.filter((u) => u.trim())));
      fd.append("mechanismOfAction", JSON.stringify(mechanismOfAction));
      fd.append(
        "indications",
        JSON.stringify(indications.filter((i) => i.trim()))
      );
      fd.append(
        "contraindications",
        JSON.stringify(contraindications.filter((c) => c.trim()))
      );

      productImages.forEach((file) => fd.append("productImages", file));

      await axios.post(`${API_URL}/api/products/add`, fd, {
  headers: {
    "Content-Type": "multipart/form-data",
  },
  withCredentials: true,
});


      alert("Product added successfully!");
      resetForm();
    } catch (err) {
      console.log(err,"errrer");
      
      const msg = err?.response?.data?.message || "Failed to add product";
      console.log(msg,"Preert ");
      
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-800 text-center sm:text-left mb-8">
          Add New Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Basic Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                name="productName"
                value={form.productName}
                onChange={handleFormChange}
                placeholder="Product Name *"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                required
              />
              <input
                name="genericName"
                value={form.genericName}
                onChange={handleFormChange}
                placeholder="Generic Name *"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <input
                name="brandName"
                value={form.brandName}
                onChange={handleFormChange}
                placeholder="Brand Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                name="strength"
                value={form.strength}
                onChange={handleFormChange}
                placeholder="Strength (e.g. 500 mg) *"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              />
              <select
                name="dosageForm"
                value={form.dosageForm}
                onChange={handleFormChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Dosage Form</option>
                <option>Tablet</option>
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
                placeholder="Route (e.g. Oral)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </section>

          {/* Composition */}
          <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Composition</h2>
              <button
                type="button"
                onClick={() =>
                  addArrayObj(setComposition, composition, {
                    name: "",
                    strength: "",
                  })
                }
                className="mt-3 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm font-medium transition"
              >
                + Add Ingredient
              </button>
            </div>

            <div className="space-y-4">
              {composition.map((c, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
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
                    placeholder="Ingredient Name *"
                    className="sm:col-span-5 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    placeholder="Strength *"
                    className="sm:col-span-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayObj(setComposition, composition, i)
                    }
                    className="sm:col-span-3 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Uses */}
          <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Uses</h2>
              <button
                type="button"
                onClick={() => addStringArray(setUses, uses)}
                className="mt-3 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm font-medium"
              >
                + Add Use
              </button>
            </div>
            <div className="space-y-3">
              {uses.map((u, i) => (
                <div key={i} className="flex gap-3">
                  <input
                    value={u}
                    onChange={(e) =>
                      updateStringArray(setUses, uses, i, e.target.value)
                    }
                    placeholder="Enter use"
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeStringArray(setUses, uses, i)}
                    className="px-5 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Mechanism of Action */}
          <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
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
                className="mt-3 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm"
              >
                + Add
              </button>
            </div>
            <div className="space-y-4">
              {mechanismOfAction.map((m, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
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
                    placeholder="Drug Name"
                    className="sm:col-span-5 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                    placeholder="Mechanism"
                    className="sm:col-span-4 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeArrayObj(setMechanismOfAction, mechanismOfAction, i)
                    }
                    className="sm:col-span-3 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Indications & Contraindications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Indications */}
            <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Indications</h3>
                <button
                  type="button"
                  onClick={() => addStringArray(setIndications, indications)}
                  className="mt-3 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {indications.map((it, i) => (
                  <div key={i} className="flex gap-3">
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
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeStringArray(setIndications, indications, i)
                      }
                      className="px-5 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Contraindications */}
            <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Contraindications
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    addStringArray(setContraindications, contraindications)
                  }
                  className="mt-3 sm:mt-0 px-5 py-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 text-sm"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-3">
                {contraindications.map((it, i) => (
                  <div key={i} className="flex gap-3">
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
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
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
                      className="px-5 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Product Details */}
          <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Product Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <input
                name="packSize"
                value={form.packSize}
                onChange={handleFormChange}
                placeholder="Pack Size (e.g. 10 tablets)"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input
                name="storage"
                value={form.storage}
                onChange={handleFormChange}
                placeholder="Storage Instructions"
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                required
              >
                <option value="">Select Category *</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="prescriptionRequired"
                  checked={form.prescriptionRequired}
                  onChange={handleFormChange}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700 font-medium">
                  Prescription Required
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleFormChange}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-gray-700 font-medium">
                  Featured Product
                </span>
              </label>

              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Color:</span>
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden rounded-lg">
                  <input
                    type="color"
                    name="color"
                    value={form.color}
                    onChange={handleFormChange}
                    className="w-12 h-12 cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={handleFormChange}
                    className="w-28 px-3 py-2 text-sm border-l border-gray-300 outline-none"
                    placeholder="#f0f0f0"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Image Upload */}
          <section className="bg-white rounded-2xl shadow-lg p-5 sm:p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Product Images
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              You can select multiple images at once.
            </p>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-3 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />

            {productImages.length > 0 && (
              <div className="mt-6">
                <p className="font-medium text-gray-700 mb-3">
                  Preview ({productImages.length} images)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {productImages.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={previewUrls[index]}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Submit */}
          <div className="flex justify-center sm:justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-10 py-4 rounded-xl text-white font-bold text-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-lg"
              }`}
            >
              {loading ? "Saving Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
