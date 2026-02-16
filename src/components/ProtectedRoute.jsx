import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getStoredAuth, isAuthenticated, logoutAndRedirect } from "../utils/auth";

// Usage: <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
// put nested <Route .../> children inside the guarded Route.
const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { role, token } = getStoredAuth();

  // not logged in -> redirect to appropriate login area
  if (!token) {
    const fallback = allowedRoles.includes("storeManager") ? "/store" : "/admin";
    return <Navigate to={fallback} replace />;
  }

  // token expired or invalid -> clear and redirect to admin landing
  if (!isAuthenticated()) {
    logoutAndRedirect("/admin");
    return null;
  }

  // role mismatch -> send user to their area
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to={role === "storeManager" ? "/store" : "/admin"} replace />;
  }

  // allow access to nested routes
  return <Outlet />;
};

export default ProtectedRoute;
