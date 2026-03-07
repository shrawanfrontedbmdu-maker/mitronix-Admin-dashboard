import axios from "axios";

// ─── Base URL ─────────────────────────────────────────────────────────────────
const LOCAL_BASE  = "http://localhost:3000/api";
const REMOTE_BASE = "http://localhost:3000/api"; // change to render URL in production

const apiBase =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, "")
    : LOCAL_BASE;

// ─── Main Instance ────────────────────────────────────────────────────────────
export const instance = axios.create({
  baseURL: apiBase,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request Interceptor — token automatically har request mein lagega ────────
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log(
    `API Request -> ${config.method?.toUpperCase() || "GET"} ${config.baseURL}${config.url}`
  );
  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network or CORS error:", error.message);
    } else {
      console.warn("API error:", error.response.status, error.response?.data);

      // Token expire — logout
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // window.location.href = "/login"; // uncomment if needed
      }
    }
    return Promise.reject(error);
  }
);

// ─── Retry helper (optional use) ─────────────────────────────────────────────
export async function requestWithRetry(config, retries = 2, backoff = 300) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await instance.request(config);
    } catch (err) {
      const status = err.response?.status;
      const isNetworkError = !err.response;
      const isTimeout =
        err.code === "ECONNABORTED" ||
        err.message?.toLowerCase().includes("timeout");

      // 401 — don't retry, token issue hai
      if (status === 401) throw err;

      if (attempt === retries || (!isNetworkError && !isTimeout)) {
        throw err;
      }

      attempt++;
      const delayMs = backoff * attempt;
      console.warn(`Retrying after ${delayMs}ms... (attempt ${attempt})`);
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

export default instance;