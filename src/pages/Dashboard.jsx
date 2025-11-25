// src/pages/Dashboard.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowPathIcon,
  EnvelopeIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import { Users, Package, ClipboardList, MessageCircle } from "lucide-react";
import axios from "axios";
import { API_URL, userToken } from "../components/Variable";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

const Dashboard = () => {
  const [stats, setStats] = useState({ frames: 0, orders: 0, contacts: 0, users: 0 });
  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const userData = useMemo(() => userToken(), []);
  const token = userData?.token;
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [frameRes, orderRes, contactRes, userRes] = await Promise.allSettled([
        axios.get(`${API_URL}/frame/getallframes`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/order/getallorders`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/contact/getall`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/user/getall`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setStats({
        frames: frameRes.status === "fulfilled" ? frameRes.value.data?.data?.length || 0 : 0,
        orders: orderRes.status === "fulfilled" ? orderRes.value.data?.data?.length || 0 : 0,
        contacts: contactRes.status === "fulfilled" ? contactRes.value.data?.length || 0 : 0,
        users: userRes.status === "fulfilled" ? userRes.value.data?.length || 0 : 0,
      });

      const contacts = contactRes.status === "fulfilled" ? contactRes.value.data || [] : [];
      const sorted = [...contacts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentInquiries(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token && userData?.role === "admin") {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    } else if (token && userData?.role !== "admin") {
      navigate("/");
    }
  }, [fetchDashboardData, token, userData, navigate]);

  const refreshData = debounce(fetchDashboardData, 500);

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statsConfig = [
    { name: "Users", value: stats.users, color: "bg-pink-100 text-pink-600", link: "/admin/users", icon: Users },
    { name: "Frames", value: stats.frames, color: "bg-indigo-100 text-indigo-600", link: "/admin/frame", icon: Package },
    { name: "Orders", value: stats.orders, color: "bg-red-100 text-red-600", link: "/admin/orders", icon: ClipboardList },
    { name: "Contacts", value: stats.contacts, color: "bg-yellow-100 text-yellow-600", link: "/admin/contact", icon: MessageCircle },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Last updated: {formatDate(lastUpdated)}
          </span>
          <button
            onClick={refreshData}
            disabled={loading}
            className="p-2.5 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition shadow-sm"
            title="Refresh data"
          >
            <ArrowPathIcon className={`w-5 h-5 text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="group bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 p-6 border border-gray-100 hover:border-gray-200"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {loading ? "..." : stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Inquiries */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Inquiries</h2>
            <span className="text-sm text-gray-500">Last 5 inquiries</span>
          </div>
          <ul className="divide-y divide-gray-200">
            {loading ? (
              Array(5)
                .fill()
                .map((_, i) => (
                  <li key={i} className="px-6 py-5 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </li>
                ))
            ) : recentInquiries.length === 0 ? (
              <li className="px-6 py-16 text-center text-gray-500">No recent inquiries</li>
            ) : (
              recentInquiries.map((inq) => (
                <li key={inq._id || inq.inquiryId} className="px-6 py-5 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-indigo-600 truncate">{inq.name || "Anonymous"}</p>
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        inq.status === "new"
                          ? "bg-green-100 text-green-800"
                          : inq.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {inq.status || "new"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${inq.email}`} className="hover:text-indigo-600 hover:underline truncate">
                        {inq.email || "N/A"}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(inq.createdAt)}</span>
                    </div>
                    <div className="flex items-start gap-2 mt-3">
                      <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 line-clamp-2">{inq.message || "No message provided"}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <Link
              to="/admin/users"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <Users className="w-6 h-6 text-pink-600" />
              <span className="font-medium text-gray-700">Manage Users</span>
            </Link>
            <Link
              to="/admin/frame"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <Package className="w-6 h-6 text-indigo-600" />
              <span className="font-medium text-gray-700">Manage Frames</span>
            </Link>
            <Link
              to="/admin/orders"
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition"
            >
              <ClipboardList className="w-6 h-6 text-red-600" />
              <span className="font-medium text-gray-700">Manage Orders</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;