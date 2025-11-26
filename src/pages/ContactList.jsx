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
      const response = await axios.get(`${API_URL}/api/contact/getallcontacts`);
      const contactData = response.data.data;
      if (!Array.isArray(contactData)) {
        throw new Error("API response does not contain a valid contact array.");
      }
      const sortedContacts = contactData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setContacts(sortedContacts);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contact messages.");
      toast.error("Failed to load contact list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact message?"))
      return;

    setDeletingId(id);
    try {
      const response = await axios.delete(`${API_URL}/api/contact/delete/${id}`);
      toast.success(response.data.message || "Message deleted successfully!");
      setContacts((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      const msg = err?.response?.data?.message || "Failed to delete message.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const getQueryBadgeStyle = (queryType) => {
    switch (queryType) {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
          <div className="mt-3 text-lg text-indigo-600">Loading Contact Messages...</div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6 text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">

        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-indigo-600" />
            Contact Messages
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Viewing {contacts.length} message{contacts.length !== 1 ? "s" : ""}.
          </p>
        </header>

        {contacts.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg text-gray-500 border border-dashed border-gray-300">
            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Messages Found</h3>
            <p className="text-gray-600">There are currently no contact submissions to display.</p>
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table (md and up) */}
            <div className="hidden md:block bg-white shadow-xl rounded-xl overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <User className="h-4 w-4 inline mr-1" /> Sender Info
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Tag className="h-4 w-4 inline mr-1" /> Query Type
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message Preview
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <Calendar className="h-4 w-4 inline mr-1" /> Date
                    </th>

                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <div className="text-sm font-medium text-gray-900">{contact.fullName}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" /> <span>{contact.email}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQueryBadgeStyle(contact.queryType)}`}>
                          {contact.queryType}
                        </span>
                      </td>

                      <td className="px-6 py-4 align-top">
                        <p className="text-sm text-gray-600 clamp-2" style={{ maxWidth: 480 }}>
                          {contact.message}
                        </p>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium align-top">
                        <button
                          onClick={() => handleDelete(contact._id)}
                          disabled={deletingId === contact._id}
                          className={`p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors ${deletingId === contact._id ? "opacity-60 cursor-not-allowed" : ""}`}
                          aria-label="Delete message"
                        >
                          {deletingId === contact._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (shown on small screens) */}
            <div className="block md:hidden space-y-4">
              {contacts.map((contact) => (
                <article key={contact._id} className="bg-white rounded-xl shadow-md p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                        {contact.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">{contact.fullName}</h3>
                          <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                            <Mail className="h-3 w-3 text-gray-400" /> {contact.email}
                          </div>
                        </div>

                        <div className="text-right">
                          <div>
                            <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getQueryBadgeStyle(contact.queryType)}`}>
                              {contact.queryType}
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-2">{new Date(contact.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mt-3 clamp-2">{contact.message}</p>

                      <div className="mt-3 flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDelete(contact._id)}
                          disabled={deletingId === contact._id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border ${deletingId === contact._id ? "opacity-60 cursor-not-allowed" : "hover:bg-red-50"}`}
                          aria-label="Delete message"
                        >
                          {deletingId === contact._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          <span className="text-sm text-red-600">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Small component-scoped CSS for line-clamp and responsive tweaks */}
      <style>{`
        /* 2-line clamp for message preview (works in modern browsers) */
        .clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Ensure table rows have consistent vertical spacing */
        table tbody tr td {
          vertical-align: top;
        }

        /* Improve clickable area on small screens */
        @media (max-width: 767px) {
          .contact-card { min-height: 110px; }
        }
      `}</style>
    </div>
  );
}
