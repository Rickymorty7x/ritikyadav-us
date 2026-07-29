import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SocialApp } from "./SocialApp.jsx";
import "./social.css";

createRoot(document.getElementById("social-root")).render(
  <StrictMode>
    <SocialApp />
  </StrictMode>
);
