import StatsCardsComponent from "./StatsCards";
import PerformanceChart from "./PerformanceChart";
import ConversionsChart from "./ConversionsChart";
import TopProducts from "./TopProducts";
import RecentActivities from "./RecentActivities";
import QuickActions from "./QuickActions";
import { IoMdNotifications } from "react-icons/io";
import { MdPerson, MdCheckCircle, MdError, MdLogout } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { getStoredAuth } from "../utils/auth";
import { useState, useEffect } from "react";
import { healthService } from "../api/healthService.js";
import axios from "axios";

function Dashboard({ onLogin }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [adminData, setAdminData] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const { role: storedRole } = getStoredAuth();
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("adminData");
    if (adminData) {
      setAdminData(JSON.parse(adminData));
    }
    setIsLoggedIn(!!token);
    setRole(storedRole);
  }, []);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        await healthService.checkConnection();
        setApiStatus("connected");
      } catch (error) {
        setApiStatus("disconnected");
      }
    };

    checkApiConnection();
  }, []);

  if (error) {
    alert(error);
  }

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="text-2xl font-bold text-red-800">
            {adminData ? `Welcome, ${adminData.fullName || adminData.name || adminData.email}` : 'Welcome'}
          </h1>
          {role && (
            <p className="text-sm text-gray-600">{role === 'storeManager' ? 'Store Manager Dashboard' : 'Admin Dashboard'}</p>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <StatsCardsComponent />
        <QuickActions />

        <div className="chart-section">
          <PerformanceChart />
          {role !== 'storeManager' && <ConversionsChart />}
        </div>
        <div className="bottom-section">
          <TopProducts />
          {role !== 'storeManager' && <RecentActivities />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
