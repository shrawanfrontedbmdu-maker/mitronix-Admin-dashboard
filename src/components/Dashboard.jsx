import StatsCardsComponent from "./StatsCards";
import PerformanceChart from "./PerformanceChart";
import ConversionsChart from "./ConversionsChart";
import TopProducts from "./TopProducts";
import RecentActivities from "./RecentActivities";
import QuickActions from "./QuickActions";
import { IoMdNotifications } from "react-icons/io";
import { MdPerson, MdCheckCircle, MdError } from "react-icons/md";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { healthService } from "../api/healthService.js";

function Dashboard() {
  const [apiStatus, setApiStatus] = useState('checking')

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

  return (
    <div>
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>WELCOME!</h1>
          <div className="api-status-row">
            {apiStatus === 'connected' && (
              <>
                <MdCheckCircle size={16} className="api-status-icon connected" />
                <span className="api-status-text connected">API Connected</span>
              </>
            )}
            {apiStatus === 'disconnected' && (
              <>
                <MdError size={16} className="api-status-icon disconnected" />
                <span className="api-status-text disconnected">API Disconnected</span>
              </>
            )}
            {apiStatus === 'checking' && (
              <span className="api-status-text checking">Checking connection...</span>
            )}
          </div>
        </div>

        <div className="header-actions">
          <div className="notification-icon">
            <IoMdNotifications className="icons" size={24} color="grey" />
          </div>

          <Link to="/login" className="user-avatar-link">
              <div className="user-avatar-icon">
                <MdPerson size={28} />
              </div>
          </Link>
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
