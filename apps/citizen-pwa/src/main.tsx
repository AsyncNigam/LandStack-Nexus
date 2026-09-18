import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App";

if (import.meta.env.PROD) {
  axios.defaults.baseURL = "https://landstack-nexus.onrender.com";
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
