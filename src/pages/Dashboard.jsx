import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ArrowPathIcon,
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { Package, MessageCircle, FileText } from "lucide-react";
import axios from "axios";
import { userToken } from "../components/Variable";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

/* =========================
   BACKEND BASE URL
========================= */
const API_BASE = "https://mishcolife.com";

/* =========================
   ADMIN CREDENTIALS
========================= */
const ADMIN_ID = "mishcolifescience@gmail.com";
const ADMIN_PASS = "Mishco@12345";

const Dashboard = () => {
  /* =========================
     AUTH STATE
  ========================= */
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  /* =========================
     DASHBOARD STATE
  ========================= */
  const [stats, setStats] = useState({
    products: 0,
    blogs: 0,
    contacts: 0,
  });

  const [recentInquiries, setRecentInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const userData = useMemo(() => userToken(), []);
  const navigate = useNavigate();

  /* =========================
     CHECK LOGIN STATUS
  ========================= */
  useEffect(() => {
    const auth = localStorage.getItem("adminAuth") === "true";
    setIsAuthenticated(auth);
  }, []);

  /* =========================
     FETCH DASHBOARD DATA
  ========================= */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [productRes, blogRes, contactRes] = await Promise.all([
        axios.get(`${API_BASE}/api/products/getall`),
        axios.get(`${API_BASE}/api/blogs/getall`),
        axios.get(`${API_BASE}/api/contact/getallcontacts`),
      ]);

      setStats({
        products: productRes.data?.count ?? 0,
        blogs: blogRes.data?.total ?? 0,
        contacts: contactRes.data?.count ?? 0,
      });

      const contacts = contactRes.data?.data || [];
      setRecentInquiries(
        contacts
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
      );

      setLastUpdated(new Date());
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
      const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchDashboardData, isAuthenticated]);

  /* =========================
     ADMIN ROLE PROTECTION
  ========================= */
  useEffect(() => {
    if (userData && userData.role && userData.role !== "admin") {
      navigate("/");
    }
  }, [userData, navigate]);

  /* =========================
     LOGIN HANDLER
  ========================= */
  const handleLogin = (e) => {
    e.preventDefault();

    if (
      loginForm.username === ADMIN_ID &&
      loginForm.password === ADMIN_PASS
    ) {
      localStorage.setItem("adminAuth", "true");
      toast.success("Login successful");
      setIsAuthenticated(true);
    } else {
      toast.error("Invalid admin credentials");
    }
  };

  const refreshData = debounce(fetchDashboardData, 500);

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "--";

  const statsConfig = [
    {
      name: "Products",
      value: stats.products,
      color: "bg-indigo-100 text-indigo-600",
      link: "/admin/products",
      icon: Package,
    },
    {
      name: "Blogs",
      value: stats.blogs,
      color: "bg-purple-100 text-purple-600",
      link: "/admin/bloglist",
      icon: FileText,
    },
    {
      name: "Contacts",
      value: stats.contacts,
      color: "bg-yellow-100 text-yellow-600",
      link: "/admin/contactlist",
      icon: MessageCircle,
    },
  ];

  return (
    <div className="relative min-h-screen">
      {/* ================= LOGIN MODAL ================= */}
      {!isAuthenticated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <form
            onSubmit={handleLogin}
            className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm z-10"
          >
            <h2 className="text-2xl font-bold mb-6 text-center">
              Admin Login
            </h2>

            <input
              type="email"
              placeholder="Admin ID"
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm((p) => ({
                  ...p,
                  username: e.target.value,
                }))
              }
              className="w-full border rounded-lg px-4 py-2 mb-4"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((p) => ({
                  ...p,
                  password: e.target.value,
                }))
              }
              className="w-full border rounded-lg px-4 py-2 mb-6"
              required
            />

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Login
            </button>
          </form>
        </div>
      )}

      {/* ================= DASHBOARD CONTENT ================= */}
      <div
        className={`transition-all ${
          !isAuthenticated
            ? "blur-sm pointer-events-none select-none"
            : ""
        }`}
      >
        <div className="p-6 lg:p-8">
          {/* HEADER */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
            </h1>
            <button
              onClick={refreshData}
              className="p-2 rounded-lg bg-white border shadow"
            >
              <ArrowPathIcon
                className={`w-5 h-5 ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {statsConfig.map((stat) => (
              <Link
                key={stat.name}
                to={stat.link}
                className="bg-white rounded-xl shadow p-6 hover:shadow-xl transition"
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-3xl font-bold">
                      {loading ? "..." : stat.value}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* RECENT INQUIRIES */}
          <div className="bg-white rounded-xl shadow border">
            <div className="px-6 py-4 border-b flex justify-between">
              <h2 className="font-semibold text-lg">
                Recent Inquiries
              </h2>
              <span className="text-sm text-gray-500">
                Last 5
              </span>
            </div>

            <ul className="divide-y">
              {recentInquiries.map((inq) => (
                <li
                  key={inq._id}
                  onClick={() =>
                    navigate("/admin/contactlist")
                  }
                  className="px-6 py-4 hover:bg-indigo-50 cursor-pointer"
                >
                  <p className="font-medium text-indigo-600">
                    {inq.fullName}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      {inq.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      {formatDate(inq.createdAt)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
