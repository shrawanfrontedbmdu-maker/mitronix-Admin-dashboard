import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import {
  MdAdd,
  MdSearch,
  MdEdit,
  MdDelete,
  MdAssignment,
  MdVisibility,
  MdPriorityHigh,
  MdAccessTime,
  MdCheckCircle,
} from "react-icons/md";
import serviceRequestService from '../api/serviceRequestService';

function ServiceRequestList() {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [stats, setStats] = useState({
    overview: {
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0
    },
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    },
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    category: "",
    type: "",
    priority: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    fetchServiceRequests();
  }, [filters]);

  const fetchServiceRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await serviceRequestService.getAll(filters);
      let requestsData = [];

      // Handle both direct array response and paginated response
      if (Array.isArray(response)) {
        requestsData = response;
        setServiceRequests(response);
        setPagination({ current: 1, total: 1, pages: 1 });
      } else {
        requestsData = response.data || response.serviceRequests || [];
        setServiceRequests(requestsData);
        setPagination(response.pagination || { current: 1, total: 1, pages: 1 });
      }

      const calculatedStats = calculateStats(requestsData);
      setStats(calculatedStats);
    } catch (error) {
      console.log('ServiceRequest API error:', error);
      setError(error.message || "Failed to fetch service requests");
      setServiceRequests([]);
      setStats({
        overview: { open: 0, inProgress: 0, resolved: 0, closed: 0 },
        byPriority: { high: 0, medium: 0, low: 0 },
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // const calculateStats = (requestsData) => {
  //   if (!requestsData || requestsData.length === 0) {
  //     return {
  //       overview: {
  //         open: 0,
  //         inProgress: 0,
  //         resolved: 0,
  //         closed: 0
  //       },
  //       byPriority: {
  //         high: 0,
  //         medium: 0,
  //         low: 0
  //       },
  //       total: 0
  //     };
  //   }

  //   const stats = {
  //     overview: {
  //       open: requestsData.filter(req => req.status === 'Open').length,
  //       inProgress: requestsData.filter(req => req.status === 'In Progress').length,
  //       resolved: requestsData.filter(req => req.status === 'Resolved').length,
  //       closed: requestsData.filter(req => req.status === 'Closed').length
  //     },
  //     byPriority: {
  //       high: requestsData.filter(req => req.priority === 'High').length,
  //       medium: requestsData.filter(req => req.priority === 'Medium').length,
  //       low: requestsData.filter(req => req.priority === 'Low').length
  //     },
  //     total: requestsData.length
  //   };

  //   return stats;
  // };

  const calculateStats = (requestsData) => {
    const stats = {
      overview: {
        open: requestsData.filter(req => req.status === 'open').length,
        inProgress: requestsData.filter(req => req.status === 'in progress').length,
        resolved: 0,
        closed: requestsData.filter(req => req.status === 'completed').length
      },
      byPriority: {
        high: requestsData.filter(req => req.priority === 'high').length,
        medium: requestsData.filter(req => req.priority === 'medium').length,
        low: requestsData.filter(req => req.priority === 'low').length
      },
      total: requestsData.length
    };

    return stats;
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== "page" ? 1 : value,
    }));
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this service request?")
    ) {
      try {
        await serviceRequestService.delete(id);
        fetchServiceRequests();
      } catch (error) {
        setError(error.message || "Failed to delete service request");
      }
    }
  };



  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "Open":
  //       return "status-open";
  //     case "In Progress":
  //       return "status-in-progress";
  //     case "Resolved":
  //       return "status-resolved";
  //     case "Closed":
  //       return "status-closed";
  //     default:
  //       return "status-default";
  //   }
  // };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "status-open";
      case "in progress":
        return "status-in-progress";
      case "completed":
        return "status-closed";
      default:
        return "status-default";
    }
  };

  // const getPriorityColor = (priority) => {
  //   switch (priority) {
  //     case "Critical":
  //       return "priority-critical";
  //     case "High":
  //       return "priority-high";
  //     case "Medium":
  //       return "priority-medium";
  //     case "Low":
  //       return "priority-low";
  //     default:
  //       return "priority-default";
  //   }
  // };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Service Requests</h1>
          <p className="page-subtitle">Service requests raised by users</p>
        </div>
        <div className="page-actions">
          <Link to="/service-requests/create" className="btn btn-primary">
            <MdAdd size={20} />
            New Request
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-icon open">
            <MdAccessTime size={24} />
          </div>
          <div className="stats-content">
            <h3>{stats.overview?.open || 0}</h3>
            <p>Open</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon in-progress">
            <MdAssignment size={24} />
          </div>
          <div className="stats-content">
            <h3>{stats.overview?.inProgress || 0}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon resolved">
            <MdCheckCircle size={24} />
          </div>
          <div className="stats-content">
            <h3>{stats.overview?.resolved || 0}</h3>
            <p>Resolved</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-icon critical">
            <MdPriorityHigh size={24} />
          </div>
          <div className="stats-content">
            <h3>{stats.byPriority?.high || 0}</h3>
            <p>High Priority</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="content-card">
        <div className="filters-section">
          <div className="search-box">
            <MdSearch size={20} />
            <input
              type="text"
              placeholder="Search by ticket ID, title, or user..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div className="filter-group">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="Demo">Demo</option>
              <option value="Repair">Repair</option>
              <option value="Delivery">Delivery</option>
              <option value="Relocation">Relocation</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="content-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p>Loading service requests...</p>
          </div>
        ) : (
          <>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Ticket ID</th>
                    <th>Product</th>
                    <th>User</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Order ID</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(serviceRequests || []).map((request) => (
                    <tr key={request._id || request.id}>
                      <td>
                        <span className="ticket-id">{request._id || request.id}</span>
                      </td>
                      <td>
                        <div className="product-cell">
                          <strong>{request.productname || 'N/A'}</strong>
                          {/* {request.description && (
                            <p className="description-preview">
                              {String(request.description).substring(0, 60)}...
                            </p>
                          )} */}
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <strong>{request.userInfo?.name || 'N/A'}</strong>
                          <br />
                          <small>{request.userInfo?.email || 'N/A'}</small>
                        </div>
                      </td>
                      <td>
                        <span className="type-badge">
                          {typeof request.type === 'object' ? request.type?.name || 'N/A' : (request.type || 'N/A')}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`priority-badge ${getPriorityColor(
                            typeof request.priority === 'object' ? request.priority?.name || request.priority?.level : request.priority
                          )}`}
                        >
                          {typeof request.priority === 'object' ? request.priority?.name || request.priority?.level || 'N/A' : (request.priority || 'N/A')}
                        </span>
                      </td>
                      <td>
                        {/* <span
                          className={`status-badge ${getStatusColor(
                            typeof request.status === 'object' ? request.status?.name || request.status?.value : request.status
                          )}`}
                        >
                          {typeof request.status === 'object' ? request.status?.name || request.status?.value || 'N/A' : (request.status || 'N/A')}
                        </span> */}
                        <span className={`status-badge ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td>
                        <span className="order-id">{typeof request.orderId === 'object' ? request.orderId?._id || request.orderId?.id || 'N/A' : (request.orderId || 'N/A')}</span>
                      </td>
                      <td>
                        <span className="date-text">
                          {formatDate(request.createdAt)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link
                            to={`/service-requests/${request._id || request.id}`}
                            className="action-btn view"
                            title="View Details"
                          >
                            <MdVisibility size={16} />
                          </Link>
                          <Link
                            to={`/service-requests/${request._id || request.id}/edit`}
                            className="action-btn edit"
                            title="Edit"
                          >
                            <MdEdit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(request._id || request.id)}
                            className="action-btn delete"
                            title="Delete"
                          >
                            <MdDelete size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-sm"
                  disabled={pagination.current === 1}
                  onClick={() =>
                    handleFilterChange("page", pagination.current - 1)
                  }
                >
                  Previous
                </button>

                <span className="pagination-info">
                  Page {pagination.current} of {pagination.total}
                </span>

                <button
                  className="btn btn-sm"
                  disabled={pagination.current === pagination.total}
                  onClick={() =>
                    handleFilterChange("page", pagination.current + 1)
                  }
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ServiceRequestList;
