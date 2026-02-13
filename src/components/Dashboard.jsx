import StatsCardsComponent from "./StatsCards";
import PerformanceChart from "./PerformanceChart";
import ConversionsChart from "./ConversionsChart";
import TopProducts from "./TopProducts";
import RecentActivities from "./RecentActivities";
import QuickActions from "./QuickActions";
import { IoMdNotifications } from "react-icons/io";
import { MdPerson, MdCheckCircle, MdError, MdLogout } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { healthService } from "../api/healthService.js";
import axios from "axios";

function Dashboard() {
  const [apiStatus, setApiStatus] = useState('checking')
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate()

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You are not logged in");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await axios.post(
        "http://localhost:3000/api/auth/admin/logout",
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Logout failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const checkApiConnection = async () => {
      try {
        await healthService.checkConnection()
        setApiStatus('connected')
      } catch (error) {
        setApiStatus('disconnected')
      }
    }

    checkApiConnection()
  }, [])

  if(error){
    alert(error);
  }
  
  return (
    <div>
      <div className="dashboard-header">
       <div className="welcome-section">
  <h1 className="text-red-500">WELCOME!</h1>
</div>

        <div className="header-actions">
          <div className="notification-icon">
            <IoMdNotifications className="icons" size={24} color="grey" />
          </div>        
          {isLoggedIn ? (
            <div
              className="user-avatar-icon"
              style={{ cursor: "pointer" }}
              onClick={handleLogout}
            >
              <MdLogout size={28} color="red" />
            </div>
          ) : (
            <Link to="/login" className="user-avatar-link">
              <div className="user-avatar-icon">
                <MdPerson size={28} />
              </div>
            </Link>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <StatsCardsComponent />
        <QuickActions />

        <div className="chart-section">
          <PerformanceChart />
          <ConversionsChart />
        </div>
        <div className="bottom-section">
          <TopProducts />
          <RecentActivities />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
