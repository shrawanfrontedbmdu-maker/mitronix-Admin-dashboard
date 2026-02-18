import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  Plus,
  Book,
  Zap,
  Copy,
} from "lucide-react";
import NotificationFormModal from "./NotificationFormModal.jsx";
import instance from "../../api/axios.config.js";

const NotificationDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const res = await instance.get("/notifications");
      setNotifications(res.data?.campaigns || []); // adjust key if API returns differently
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Handle new campaign addition
  const handleAddCampaign = async (newCampaignData) => {
    try {
      const formData = new FormData();
      formData.append("title", newCampaignData.title);
      formData.append("message", newCampaignData.body);
      formData.append("platform", newCampaignData.platform);
      formData.append("scheduleType", newCampaignData.scheduleType);
      if (newCampaignData.imageFile) {
        formData.append("imageFile", newCampaignData.imageFile);
      }

      const res = await instance.post("/notifications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setNotifications((prev) => [res.data.campaign, ...prev]);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating notification campaign:", error);
    }
  };

  // ✅ Handle action buttons
  const handleAction = async (id, actionType) => {
    try {
      if (actionType === "delete") {
        await instance.delete(`/notifications/${id}`);
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      } else if (actionType === "edit") {
        // TODO: open modal prefilled for editing
        console.log("Edit action triggered");
      } else if (actionType === "pause" || actionType === "play") {
        const newStatus = actionType === "pause" ? "Paused" : "Active";
        await instance.put(`/notifications/${id}`, { status: newStatus });
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, status: newStatus } : n))
        );
      }
    } catch (error) {
      console.error(`Error handling ${actionType}:`, error);
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Finished":
        return "bg-gray-200 text-gray-800";
      case "Active":
        return "bg-green-100 text-green-700";
      case "Scheduled":
        return "bg-yellow-100 text-yellow-700";
      case "Paused":
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-500">
        Loading campaigns...
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex-1 overflow-y-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Notification Campaign History
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg shadow-md transition-colors flex items-center"
        >
          <Plus size={18} className="mr-2" />
          Create Notification
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                S.No
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-40">
                Icon / Notification Title
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-80">
                Notification Message
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                Link
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Notification Type
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Customers
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                Status
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {notifications.map((n, index) => (
              <tr key={n._id || n.id}>
                <td className="px-3 py-3 text-sm text-gray-500 font-medium">
                  {index + 1}
                </td>

                <td className="px-3 py-3 text-sm font-medium text-gray-900 flex items-start space-x-2">
                  <div className="text-gray-600 mt-1">
                    <Book size={16} />
                  </div>
                  <div>
                    {n.title}
                    <p className="text-xs text-gray-500 mt-1 font-normal">
                      {new Date(n.createdAt).toLocaleString("en-GB")}
                    </p>
                  </div>
                </td>

                <td className="px-3 py-3 text-sm text-gray-700 max-w-lg">
                  {n.body}
                </td>

                <td className="px-3 py-3 text-center text-sm">
                  <button className="text-blue-600 hover:text-blue-900 font-medium text-xs border border-blue-200 rounded-full px-2 py-1" onClick={() => window.open(n.link || "#", "_blank")}>
                    view
                  </button>
                </td>
                <td className="px-3 py-3 text-sm text-gray-500">
                  {n.scheduleType || "Scheduled"}
                </td>

                <td className="px-3 py-3 text-right text-sm font-medium text-gray-900">
                  {n.customers?.toLocaleString() || 0}
                </td>

                <td className="px-3 py-3 text-center">
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-semibold ${getStatusClasses(
                      n.status
                    )}`}
                  >
                    {n.status}
                  </span>
                </td>

                <td className="px-3 py-3 text-center text-sm font-medium">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() =>
                        handleAction(
                          n._id,
                          n.status === "Active" ? "pause" : "play"
                        )
                      }
                      className={`p-2 rounded-full transition-colors ${
                        n.status === "Active"
                          ? "bg-orange-100 hover:bg-orange-200 text-orange-600"
                          : "bg-green-100 hover:bg-green-200 text-green-600"
                      }`}
                    >
                      {n.status === "Active" ? (
                        <Pause size={16} />
                      ) : (
                        <Play size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => handleAction(n._id, "edit")}
                      className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(n.title || "")
                      }
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Copy Title"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      onClick={() => handleAction(n._id, "delete")}
                      className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NotificationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCampaign={handleAddCampaign}
      />
    </div>
  );
};

export default NotificationDashboard;
