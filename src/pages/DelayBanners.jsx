import React, { useState } from 'react';

const BannerManager = () => {
  // यह स्टेट बताएगा कि कौन सा कार्ड एडिट हो रहा है: 'login', 'logout' या null
  const [editingType, setEditingType] = useState(null);

  // फॉर्म डेटा के लिए स्टेट
  const [loginData, setLoginData] = useState({ openDelay: 5, closeDelay: 10 });
  const [logoutData, setLogoutData] = useState({ openDelay: 2, closeDelay: 8 });

  const handleEdit = (type) => {
    setEditingType(type); // जिस पर क्लिक किया, उसे एक्टिव कर दो
  };

  const handleSave = () => {
    // यहाँ आप अपनी API कॉल (Axios/Fetch) लगा सकते हैं
    console.log("Saving data...", editingType === 'login' ? loginData : logoutData);
    setEditingType(null); // सेव करने के बाद वापस लॉक कर दो
  };

  return (
    <div className="admin-container">
      
      {/* --- Login Banner Card --- */}
      <div className={`content-card ${editingType === 'login' ? 'active-card' : ''}`}>
        <div className="card-header">
          <span className="card-title">Login Banner</span>
          {editingType === 'login' ? (
            <button className="save-btn" onClick={handleSave}> Save Changes</button>
          ) : (
            <button className="edit-btn" onClick={() => handleEdit('login')}>✎ Edit Banner</button>
          )}
        </div>
        
        <div className="card-body">
          <div className="preview-box">Login Banner Preview</div>
          <div className="inputs-container">
            <div className="input-group">
              <label>Open Delay (in seconds)</label>
              <input 
                type="number" 
                value={loginData.openDelay}
                onChange={(e) => setLoginData({...loginData, openDelay: e.target.value})}
                disabled={editingType !== 'login'} // सिर्फ लॉगिन मोड में इनेबल होगा
              />
            </div>
            <div className="input-group">
              <label>Close Delay (in seconds)</label>
              <input 
                type="number" 
                value={loginData.closeDelay}
                onChange={(e) => setLoginData({...loginData, closeDelay: e.target.value})}
                disabled={editingType !== 'login'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- Logout Banner Card --- */}
      <div className={`content-card ${editingType === 'logout' ? 'active-card' : ''}`}>
        <div className="card-header">
          <span className="card-title">Logout Banner</span>
          {editingType === 'logout' ? (
            <button className="save-btn" onClick={handleSave}>✔ Save Changes</button>
          ) : (
            <button className="edit-btn" onClick={() => handleEdit('logout')}>✎ Edit Banner</button>
          )}
        </div>
        
        <div className="card-body">
          <div className="preview-box">Logout Banner Preview</div>
          <div className="inputs-container">
            <div className="input-group">
              <label>Open Delay (in seconds)</label>
              <input 
                type="number" 
                value={logoutData.openDelay}
                onChange={(e) => setLogoutData({...logoutData, openDelay: e.target.value})}
                disabled={editingType !== 'logout'}
              />
            </div>
            <div className="input-group">
              <label>Close Delay (in seconds)</label>
              <input 
                type="number" 
                value={logoutData.closeDelay}
                onChange={(e) => setLogoutData({...logoutData, closeDelay: e.target.value})}
                disabled={editingType !== 'logout'}
              />
            </div>
          </div>
        </div>
      </div>
<style>{
`.content-card {
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
}
input:disabled {
  background-color: #f2f2f2 !important;
  color: #999 !important;
  cursor: not-allowed;
  border: 1px dashed #ccc !important; /* डैश वाली बॉर्डर ताकि अलग दिखे */
}

/* एक्टिव इनपुट (जब एडिट मोड ऑन हो) */
input:not(:disabled) {
  background-color: #ffffff !important;
  border: 2px solid #fbc02d !important; /* आपकी थीम वाला पीला रंग */
  color: #333;
  cursor: text;
  box-shadow: 0 0 8px rgba(251, 192, 45, 0.2);
}

/* सेव बटन का स्टाइल */
.save-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

/* एक्टिव कार्ड को थोड़ा उभारने के लिए */
.active-card {
  border-left: 5px solid #fbc02d;
  transform: scale(1.01);
  transition: all 0.2s ease-in-out;
}`}</style>
    </div>
  );
};

export default BannerManager;