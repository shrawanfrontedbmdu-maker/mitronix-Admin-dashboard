// Central auth helpers (frontend)
// - read role/token from localStorage
// - simple JWT expiry check (no external dependency)

export const getStoredAuth = () => {
  const adminToken = localStorage.getItem("adminToken");
  const storeToken = localStorage.getItem("storeToken");
  const roleFromKey = localStorage.getItem("role");

  let role = roleFromKey || (adminToken ? "admin" : storeToken ? "storeManager" : null);
  let token = null;
  let data = null;

  if (role === "admin") {
    token = adminToken;
    try { data = JSON.parse(localStorage.getItem("adminData") || "null"); } catch(e) { data = null; }
  } else if (role === "storeManager") {
    token = storeToken;
    try { data = JSON.parse(localStorage.getItem("storeData") || "null"); } catch(e) { data = null; }
  }

  return { role, token, data };
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload || !payload.exp) return false; // can't determine -> treat as valid
    return Date.now() >= payload.exp * 1000;
  } catch (err) {
    // if token isn't a JWT or can't be parsed assume not expired (backend will still enforce)
    return false;
  }
};

export const isAuthenticated = (requiredRole = null) => {
  const { role, token } = getStoredAuth();
  if (!token) return false;
  if (requiredRole && requiredRole !== role) return false;
  if (isTokenExpired(token)) return false;
  return true;
};

export const clearAllAuth = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminData");
  localStorage.removeItem("storeToken");
  localStorage.removeItem("storeData");
  localStorage.removeItem("role");
};

export const logoutAndRedirect = (redirectPath = "/admin") => {
  clearAllAuth();
  window.location.href = redirectPath;
};
