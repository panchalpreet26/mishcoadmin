import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Importing Lucide-React icons
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

// Assuming this exports the base URL (e.g., 'http://localhost:5000')
import { Api } from "../../api";
const API_URL = Api;

export default function ContactList() {
  // --- States ---
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // --- Data Fetching --- // --- Data Fetching (CORRECTED) ---

  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming your contactRouter is mounted under /api/contact
      const response = await axios.get(`${API_URL}/api/contact/getallcontacts`); // CORRECTED: Get the array from the 'data' key, not 'contacts'
      const contactData = response.data.data;
      if (!Array.isArray(contactData)) {
        throw new Error("API response does not contain a valid contact array.");
      } // Sort by creation date, newest first

      const sortedContacts = contactData.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setContacts(sortedContacts);
    } catch (err) {
      // Only display the error message if it wasn't a structure error we handled above
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contact messages.");
      toast.error("Failed to load contact list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []); // --- Handlers ---

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this contact message?")
    ) {
      return;
    }

    setDeletingId(id);
    try {
      // Assuming your delete endpoint is /api/contact/delete/:id
      const response = await axios.delete(
        `${API_URL}/api/contact/delete/${id}`
      );

      toast.success(response.data.message || "Message deleted successfully!"); // Remove the deleted item from the local state
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      const msg = err?.response?.data?.message || "Failed to delete message.";
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  }; // --- Loading and Error Display ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />

        <span className="ml-3 text-xl text-indigo-600">
          Loading Contact Messages...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10 text-xl text-red-600 bg-white shadow-md m-10 rounded-lg flex items-center justify-center">
        <XCircle className="h-6 w-6 mr-2" /> Error: {error}
      </div>
    );
  } // --- Status Badge Styling ---

  const getQueryBadgeStyle = (queryType) => {
    switch (queryType) {
      case "Technical Support":
        return "bg-red-100 text-red-700";
      case "Partnership":
        return "bg-green-100 text-green-700";
      case "Feedback":
        return "bg-yellow-100 text-yellow-700";
      default: // General Inquiry, Other
        return "bg-indigo-100 text-indigo-700";
    }
  }; // --- Render Component ---

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 flex items-center">
            <MessageSquare className="h-8 w-8 mr-3 text-indigo-600" /> Contact
            Messages
          </h1>

          {/* <p className="text-gray-600 mt-1">
            Viewing {contacts.length} total messages submitted through the
            contact form.
          </p> */}
        </header>

        {contacts.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-xl shadow-lg text-gray-500 border border-dashed border-gray-300">
            <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Messages Found
            </h3>

            <p className="text-gray-600">
              There are currently no contact submissions to display.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <User className="h-4 w-4 inline mr-1" />
                    Sender Info
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    <Tag className="h-4 w-4 inline mr-1" />
                    Query Type
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message Preview
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    <Calendar className="h-4 w-4 inline mr-1" /> Date
                  </th>

                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr
                    key={contact._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Sender Info */}

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.fullName}
                      </div>

                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {contact.email}
                      </div>
                    </td>
                    {/* Query Type */}

                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQueryBadgeStyle(
                          contact.queryType
                        )}`}
                      >
                        {contact.queryType}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-lg">
                        {contact.message}
                      </p>
                    </td>
                    {/* Date */}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDelete(contact._id)}
                        disabled={deletingId === contact._id}
                        className={`p-2 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-100 transition-colors ${
                          deletingId === contact._id
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                        aria-label="Delete message"
                      >
                        {deletingId === contact._id ? (
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
        )}
      </div>
    </div>
  );
}
