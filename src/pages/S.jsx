import React from 'react'
import { MdAdd } from 'react-icons/md'
import { Link } from 'react-router-dom'

export default function DelayBanners() {
  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">
            Delay Banner Management
          </h1>
          <p className="page-subtitle">Manage promotional banners and advertisements</p>
        </div>
        <div className="page-actions">
          <Link to="/admin/delay-banners/create" className="btn btn-primary">
            <MdAdd size={20} />
            Create Banner
          </Link>
        </div>
      </div>

      <div className="admin-container" style={{ padding: '20px', background: '#f5f5f5' }}>
  
  <div className="content-card">
    <div className="card-header">
      <span className="card-title">Login Banner</span>
      <button className="edit-btn">✎ Edit Banner</button>
    </div>
    
    <div className="card-body">
      <div className="preview-box">
         Login Banner Preview
      </div>
      
      <div className="inputs-container">
        <div className="input-group">
          <label>Open Delay (in seconds)</label>
          <input type="number" placeholder="0" disabled/>
        </div>
        <div className="input-group">
          <label>Close Delay (in seconds)</label>
          <input type="number" placeholder="0" disabled/>
        </div>
      </div>
    </div>
  </div>

  <div className="content-card">
    <div className="card-header">
      <span className="card-title">Logout Banner</span>
      <button className="edit-btn">✎ Edit Banner</button>
    </div>
    
    <div className="card-body">
      <div className="preview-box">
         Logout Banner Preview
      </div>
      
      <div className="inputs-container">
        <div className="input-group">
          <label>Open Delay (in seconds)</label>
          <input type="number" placeholder="0" disabled/>
        </div>
        <div className="input-group">
          <label>Close Delay (in seconds)</label>
          <input type="number" placeholder="0" disabled/>
        </div>
      </div>
    </div>
  </div>

</div>


<style>
  {`.content-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.edit-btn {
  background: #fff8e1;
  color: #fbc02d;
  border: 1px solid #fbc02d;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.card-body {
  display: flex;
  gap: 40px; 
}

.preview-box {
  width: 300px;
  height: 180px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  color: #888;
}


.input-group input {
  width: 100%;
  padding: 14px 12px; 
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8f9fa; 
  color: #6c757d; 
  font-size: 15px;
  cursor: not-allowed; 
  outline: none;
  transition: all 0.3s ease;
}

.input-group input:focus {
  border-color: #fbc02d;
  background-color: #fff;
  color: #333;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #444;
  margin-bottom: 8px;
}`}
</style>
    </>
  )
}
