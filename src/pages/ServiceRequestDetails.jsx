import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdEdit,
  MdAssignment,
  MdPerson,
  MdAccessTime,
  MdPriorityHigh,
  MdCreate,
  MdLoop,
  MdCheckCircle,
  MdLock,
  MdSchedule,
} from "react-icons/md";
import serviceRequestService from "../api/serviceRequestService";

function ServiceRequestDetails() {
  const { id } = useParams();
  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadServiceRequestData();
    }
  }, [id]);

  const loadServiceRequestData = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await serviceRequestService.getById(id);
      setServiceRequest(data);
    } catch (error) {
      console.error("Error loading service request:", error);
      setError("Failed to load service request data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "status-warning";
      case "In Progress":
        return "status-info";
      case "Resolved":
        return "status-success";
      case "Closed":
        return "status-secondary";
      default:
        return "status-secondary";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "priority-medium";
    }
  };

  const generateTimelineEvents = () => {
    if (!serviceRequest) return [];

    const events = [];
    const status =
      typeof serviceRequest.status === "object"
        ? serviceRequest.status?.name || serviceRequest.status?.value
        : serviceRequest.status;
    const assignedTo =
      typeof serviceRequest.assignedTo === "object"
        ? serviceRequest.assignedTo?.name || serviceRequest.assignedTo?.email
        : serviceRequest.assignedTo;

    // Always add request creation
    events.push({
      id: "created",
      title: "Request Created",
      description: `${typeof serviceRequest.type === "object"
          ? serviceRequest.type?.name || serviceRequest.type?.value
          : serviceRequest.type
        } request was submitted`,
      timestamp: serviceRequest.createdAt,
      status: "completed",
      icon: MdCreate,
    });

    // Add assignment event if assigned
    if (assignedTo && assignedTo !== "Unassigned" && assignedTo !== "N/A") {
      events.push({
        id: "assigned",
        title: "Request Assigned",
        description: `Assigned to ${assignedTo}`,
        timestamp: serviceRequest.createdAt, // Using creation time as we don't have assignment time
        status: "completed",
        icon: MdPerson,
      });
    }

    // Add status progression events
    if (
      status === "In Progress" ||
      status === "Resolved" ||
      status === "Closed"
    ) {
      events.push({
        id: "in-progress",
        title: "Work Started",
        description: "Request moved to In Progress",
        timestamp: serviceRequest.updatedAt || serviceRequest.createdAt,
        status: "completed",
        icon: MdLoop,
      });
    }

    // Add resolution event if resolved
    if (status === "Resolved" || status === "Closed") {
      events.push({
        id: "resolved",
        title: "Request Resolved",
        description:
          serviceRequest.resolution ||
          "Resolution provided by assigned team member",
        timestamp: serviceRequest.updatedAt || serviceRequest.createdAt,
        status: "completed",
        icon: MdCheckCircle,
      });
    }

    // Add closed event if closed
    if (status === "Closed") {
      events.push({
        id: "closed",
        title: "Request Closed",
        description: "Request has been closed and marked as complete",
        timestamp: serviceRequest.updatedAt || serviceRequest.createdAt,
        status: "completed",
        icon: MdLock,
      });
    }

    // Add current status if still open
    if (status === "Open") {
      events.push({
        id: "pending",
        title: "Awaiting Action",
        description: "Request is open and waiting to be processed",
        timestamp: new Date().toISOString(),
        status: "pending",
        icon: MdSchedule,
      });
    }

    // Sort events by timestamp
    return events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  };

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Service Request Details</h1>
            <p className="page-subtitle">Loading service request...</p>
          </div>
        </div>
        <div
          className="content-card"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <div
            style={{
              width: "24px",
              height: "24px",
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p>Loading service request details...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceRequest) {
    return (
      <div>
        <div className="page-header">
          <div className="page-title-section">
            <h1 className="page-title">Service Request Details</h1>
            <p className="page-subtitle">Error loading service request</p>
          </div>
          <div className="page-actions">
            <Link to="/service-requests" className="btn btn-secondary">
              <MdArrowBack size={16} />
              Back to Service Requests
            </Link>
          </div>
        </div>
        <div
          className="content-card"
          style={{ textAlign: "center", padding: "40px" }}
        >
          <p style={{ color: "#dc2626", marginBottom: "20px" }}>
            ❌ {error || "Service request not found"}
          </p>
          <Link to="/service-requests" className="btn btn-primary">
            Back to Service Requests List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Service Request Details</h1>
          <p className="page-subtitle">
            Request ID: {serviceRequest._id || serviceRequest.id}
          </p>
        </div>
        <div className="page-actions">
          <Link to="/service-requests" className="btn btn-secondary">
            <MdArrowBack size={16} />
            Back to Service Requests
          </Link>
          <Link to={`/service-requests/${id}/edit`} className="btn btn-primary">
            <MdEdit size={16} />
            Edit
          </Link>
        </div>
      </div>

      <div className="service-request-details-container">
        {/* Summary Card */}
        <div className="content-card">
          <div className="service-request-summary">
            <div className="summary-header">
              <div className="request-info">
                <h3>
                  {typeof serviceRequest.type === "object"
                    ? serviceRequest.type?.name ||
                    serviceRequest.type?.value ||
                    "N/A"
                    : serviceRequest.type || "N/A"}{" "}
                  Request
                </h3>
                <p className="request-date">
                  Created on{" "}
                  {new Date(serviceRequest.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="request-badges">
                <span
                  className={`status-badge ${getStatusColor(
                    typeof serviceRequest.status === "object"
                      ? serviceRequest.status?.name ||
                      serviceRequest.status?.value
                      : serviceRequest.status
                  )}`}
                >
                  {typeof serviceRequest.status === "object"
                    ? serviceRequest.status?.name ||
                    serviceRequest.status?.value ||
                    "N/A"
                    : serviceRequest.status || "N/A"}
                </span>
                <span
                  className={`priority-badge ${getPriorityColor(
                    typeof serviceRequest.priority === "object"
                      ? serviceRequest.priority?.name ||
                      serviceRequest.priority?.level
                      : serviceRequest.priority
                  )}`}
                >
                  <MdPriorityHigh size={16} />
                  {typeof serviceRequest.priority === "object"
                    ? serviceRequest.priority?.name ||
                    serviceRequest.priority?.level ||
                    "N/A"
                    : serviceRequest.priority || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="details-content-grid">
          {/* Request Information */}
          <div className="content-card">
            <h3>
              <MdAssignment size={20} /> Request Information
            </h3>
            <div className="request-info-grid">
              <div className="info-group">
                <h4>Order Details</h4>
                <p>
                  <strong>Order ID:</strong>{" "}
                  {typeof serviceRequest.orderId === "object"
                    ? serviceRequest.orderId?._id ||
                    serviceRequest.orderId?.id ||
                    "N/A"
                    : serviceRequest.orderId || "N/A"}
                </p>
                <p>
                  <strong>Product:</strong>{" "}
                  {typeof serviceRequest.productname === "object"
                    ? serviceRequest.productname?.name ||
                    serviceRequest.productname?.title ||
                    "N/A"
                    : serviceRequest.productname || "N/A"}
                </p>
                <p>
                  <strong>Category:</strong>{" "}
                  {typeof serviceRequest.category === "object"
                    ? serviceRequest.category?.name ||
                    serviceRequest.category?.title ||
                    "N/A"
                    : serviceRequest.category || "N/A"}
                </p>
              </div>
              <div className="info-group">
                <h4>Description</h4>
                <p>{serviceRequest.description || "N/A"}</p>
              </div>
              {serviceRequest.resolution && (
                <div className="info-group">
                  <h4>Resolution</h4>
                  <p>{serviceRequest.resolution}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Information */}
          <div className="content-card">
            <h3>
              <MdPerson size={20} /> Customer Information
            </h3>
            <div className="customer-info">
              <div className="info-group">
                <h4>Contact Details</h4>
                <p>
                  <strong>Name:</strong>{" "}
                  {serviceRequest.userInfo?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  {serviceRequest.userInfo?.email || "N/A"}
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  {serviceRequest.userInfo?.phone || "N/A"}
                </p>
              </div>
              <div className="info-group">
                <h4>Assignment</h4>
                <p>
                  <strong>Assigned To:</strong>{" "}
                  {typeof serviceRequest.assignedTo === "object"
                    ? serviceRequest.assignedTo?.name ||
                    serviceRequest.assignedTo?.email ||
                    "N/A"
                    : serviceRequest.assignedTo || "Unassigned"}
                </p>
                {serviceRequest.estimatedResolution && (
                  <p>
                    <strong>Expected Resolution:</strong>{" "}
                    {new Date(
                      serviceRequest.estimatedResolution
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="content-card">
          <h3>
            <MdAccessTime size={20} /> Timeline
          </h3>
          <div className="timeline">
            {generateTimelineEvents().map((event, index) => {
              const IconComponent = event.icon;
              return (
                <div key={event.id} className="timeline-item">
                  <div className={`timeline-marker ${event.status}`}>
                    <IconComponent className="timeline-icon" size={12} />
                  </div>
                  <div className="timeline-content">
                    <h4>{event.title}</h4>
                    <p className="timeline-description">{event.description}</p>
                    <small className="timeline-timestamp">
                      {new Date(event.timestamp).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ServiceRequestDetails;
