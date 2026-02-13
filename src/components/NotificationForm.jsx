import React from 'react'

function NotificationForm() {
  return (
    <div>
        <div className="modal-body">
      <form className = "notificationForm">
        {/* Person Type Selection */}
        <div className="mb-3">
          <label className="form-label">Select Person Type</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="partner"
              id="personTypePartner"
              name="personType"
            />

            <label className="form-check-label" htmlFor="personTypeUser">
              User
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value="rider"
              id="personTypeRider"
              name="personType"
            />
            <label className="form-check-label" htmlFor="personTypeRider">
              Rider
            </label>
          </div>
        </div>

        {/* Specific Persons Selection */}
        <div className="mb-3">
          <label className="form-label">Select Specific Persons</label>
          <div className="border rounded p-2" style={{ maxHeight: "250px", overflowY: "auto" }}>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Search..."
              id="searchInput"
            />
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="selectAll"
              />
              <label className="form-check-label" htmlFor="selectAll">
                Select All
              </label>
            </div>
            <div id="personListContainer" className="mt-2"></div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            required
            placeholder="Enter Notification Title"
          />
        </div>

        {/* Message */}
        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            className="form-control"
            rows="4"
            required
            placeholder="Enter your message"
          ></textarea>
        </div>
      </form>
    </div>
    </div>
  )
}

export default NotificationForm