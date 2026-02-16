import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Use Vite's BASE_URL at build time so the router basename matches the deployed path.
const rawBase = import.meta.env.BASE_URL || '/';
const basename = rawBase === '/' ? '/' : rawBase.replace(/\/$/, '');

createRoot(document.getElementById("root")).render(
  <BrowserRouter basename={basename}>
    <StrictMode>
      <App />
    </StrictMode>
  </BrowserRouter>
);
