import axios from "axios";

const directBase =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:3000/api`
    : "http://localhost:3000/api";

let apiBase =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL)
    : "/api";

if (
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1") &&
  apiBase === "/api"
) {
  apiBase = directBase;
}

if (apiBase !== "/api" && !apiBase.startsWith("http")) {
  apiBase = apiBase.replace(/\/+$/, "");
  if (!apiBase.endsWith("/api")) {
    apiBase = `${apiBase}/api`;
  }
}

export const instance = axios.create({
  baseURL: apiBase,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

instance.interceptors.request.use((config) => {
  console.log(
    `API Request -> ${config.method?.toUpperCase() || "GET"} ${
      config.url
    } (base: ${instance.defaults.baseURL}) (timeout: ${config.timeout}ms)`
  );
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("Network or CORS error when calling API:", error.message);
    } else {
      console.warn(
        "API response error:",
        error.response.status,
        error.response?.data
      );
    }
    return Promise.reject(error);
  }
);

const localInstance = axios.create({
  baseURL: "/api",
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

const directInstance = axios.create({
  baseURL: directBase,
  timeout: 60000,
  headers: { "Content-Type": "application/json" },
});

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
      const message = err.message || "";

      const proxyBadGateway =
        status === 502 &&
        (err.response?.data?.error === "Bad gateway (proxy error)" ||
          /bad gateway/i.test(message));

      const usingRemote = String(instance.defaults.baseURL || "").startsWith(
        "http"
      );
      if ((isNetworkError || isTimeout) && usingRemote) {
        console.warn(
          "Remote request failed due to network/CORS. Attempting local /api proxy fallback...",
          message
        );
        try {
          const fallbackResponse = await localInstance.request(config);
          console.log("Fallback to local /api succeeded");
          return fallbackResponse;
        } catch (fallbackErr) {
          console.warn("Local fallback also failed:", fallbackErr.message);
        }
      }

      if (
        status === 502 ||
        status === 503 ||
        status === 504 ||
        proxyBadGateway ||
        /ECONNREFUSED|connect ECONNREFUSED/i.test(message)
      ) {
        try {
          console.warn(
            `Proxy/target returned ${
              status || ""
            }. Attempting direct backend call to ${directBase}...`
          );
          const directResponse = await directInstance.request(config);
          console.log("Direct backend call succeeded");
          return directResponse;
        } catch (directErr) {
          console.warn("Direct backend call failed:", directErr.message);
        }
      }

      if (
        attempt === retries ||
        (!isNetworkError && !isTimeout && !proxyBadGateway)
      ) {
        throw err;
      }

      attempt++;
      const delayMs = backoff * attempt;
      console.warn(
        `Request failed (attempt ${attempt}). Retrying after ${delayMs}ms...`,
        message
      );
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

export default instance;
