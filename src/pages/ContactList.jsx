import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Lucide icons
import {
  MessageSquare,
  Mail,
  User,
  Calendar,
  Trash2,
  Loader2,
  Tag,
  XCircle,
} from "lucide-react";

import { Api } from "../../api";
const API_URL = Api;

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/api/contact/getallcontacts`
      );
      const data = response.data.data;

      if (!Array.isArray(data)) {
        throw new Error("Invalid API response");
      }

      const sorted = data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setContacts(sorted);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch contact messages.");
      toast.error("Failed to load contact list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    setDeletingId(id);
    try {
      const res = await axios.delete(
        `${API_URL}/api/contact/delete/${id}`
      );
      toast.success(res.data.message || "Message deleted");
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast.error("Failed to delete message");
    } finally {
      setDeletingId(null);
    }
  };

  const getQueryBadgeStyle = (type) => {
    switch (type) {
      case "Technical Support":
        return "bg-red-100 text-red-700";
      case "Partnership":
        return "bg-green-100 text-green-700";
      case "Feedback":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-indigo-100 text-indigo-700";
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl text-center shadow">
          <XCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer position="top-right" />

      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-indigo-600" />
            Contact Messages
          </h1>
          <p className="text-gray-600 mt-1">
            Viewing {contacts.length} message
            {contacts.length !== 1 && "s"}
          </p>
        </header>

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  <User className="inline h-4 w-4 mr-1" /> Sender Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  <Tag className="inline h-4 w-4 mr-1" /> Query Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Message Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  <Calendar className="inline h-4 w-4 mr-1" /> Date
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {contacts.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  {/* Sender */}
                  <td className="px-6 py-4 align-top">
                    <div className="font-medium text-gray-900">
                      {c.fullName}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {c.email}
                    </div>
                  </td>

                  {/* Query */}
                  <td className="px-6 py-4 align-top">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getQueryBadgeStyle(
                        c.queryType
                      )}`}
                    >
                      {c.queryType}
                    </span>
                  </td>

                  {/* MESSAGE COLUMN — FIXED */}
                  <td className="px-6 py-4 align-top">
                    <div
                      className="text-sm text-gray-600 break-all"
                      style={{ maxWidth: 480 }}
                    >
                      {c.message}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 align-top text-sm text-gray-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>

                  {/* Delete */}
                  <td className="px-6 py-4 align-top text-right">
                    <button
                      onClick={() => handleDelete(c._id)}
                      disabled={deletingId === c._id}
                      className="p-2 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-600"
                    >
                      {deletingId === c._id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE VIEW ================= */}
        <div className="block md:hidden space-y-4">
          {contacts.map((c) => (
            <div key={c._id} className="bg-white p-4 rounded-xl shadow">
              <h3 className="font-semibold text-gray-900">{c.fullName}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                <Mail className="h-4 w-4" /> {c.email}
              </p>

              <span
                className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getQueryBadgeStyle(
                  c.queryType
                )}`}
              >
                {c.queryType}
              </span>

              <p className="text-sm text-gray-700 mt-3 break-all">
                {c.message}
              </p>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleDelete(c._id)}
                  className="text-red-600 text-sm flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
