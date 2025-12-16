import React, { useState } from "react";
import { toast } from "react-toastify";

const ADMIN_ID = "mishcolifescience@gmail.com";
const ADMIN_PASS = "Mishco@12345";

export default function AdminLoginModal({ onSuccess }) {
  const [form, setForm] = useState({
    username: "mishcolifescience@gmail.com",
    password: "Mishco@12345",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.username === ADMIN_ID && form.password === ADMIN_PASS) {
      localStorage.setItem("adminAuth", "true");
      toast.success("Login successful");
      onSuccess();
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BLUR OVERLAY */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      {/* MODAL */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm z-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Admin Login
        </h2>

        <input
          name="username"
          placeholder="Admin ID"
          value={form.username}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-indigo-500"
          required
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 mb-6 focus:ring-2 focus:ring-indigo-500"
          required
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
