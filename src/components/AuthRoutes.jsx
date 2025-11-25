import { Navigate } from "react-router-dom";
import { userToken } from "../components/Variable";
import toast from "react-hot-toast";

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  const token = user?.token;
  const role = user?.role;

  if (!token || role !== "admin") {
    toast.error("Please Login With Admin Credentials");
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
