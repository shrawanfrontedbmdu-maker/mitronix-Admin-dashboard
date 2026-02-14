import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import "./index.css";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import ProductList from "./pages/ProductList";
import ProductGrid from "./pages/ProductGrid";
import ProductDetails from "./pages/ProductDetails";
import ProductEdit from "./pages/ProductEdit";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Editprofile from "./pages/Editprofile";
import { useState } from "react";
import { useEffect } from "react";
import Inventory from "./pages/Inventory/Inventroy";
import StoreInventory from "./pages/Inventory/StoreInventory";

function Stores() {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storeToken = localStorage.getItem("storeToken");
    const storeData = localStorage.getItem("storeData");

    if (storeToken && storeData) {
      try {
        const parsedStoreData = JSON.parse(storeData);
        localStorage.setItem(
          "storeData",
          JSON.stringify({ ...parsedStoreData, name: parsedStoreData.name }),
        );
      } catch (error) {
        localStorage.removeItem("storeToken");
        localStorage.removeItem("storeData");
      }
    }

    setIsLoading(false);
  }, []);

  const clearAuth = () => {
    localStorage.removeItem("storeToken");
    localStorage.removeItem("storeData");
  };

  const handleLogout = () => {
    clearAuth();
    navigate("/store");
  };

  const isAuthenticated = !!(
    localStorage.getItem("storeToken") && localStorage.getItem("storeData")
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {isAuthenticated && <Sidebar onLogout={handleLogout} />}
      <div className={`main-content ${isAuthenticated ? '' : 'auth-page'}`}>
      <Routes>
        {/* Auth Routes */}
        <Route index element={isAuthenticated ? <Dashboard /> : <Login role={"storeManager"}/>} />

        {isAuthenticated ? (
          <Route element={<ProtectedRoute allowedRoles={["storeManager"]} />}>
            <Route path="dashboard" element={<Dashboard/>} />
            <Route path="manage-inventory/create" element={<Inventory />} />
            <Route path="manage-inventory/list" element={<StoreInventory />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profle/edit" element={<Editprofile />} />
          </Route>
        ) : (
          <Route path="*" element={<Login role={"storeManager"} />} />
        )}
      </Routes>
      </div>
    </div>
  );
}


export default Stores;
