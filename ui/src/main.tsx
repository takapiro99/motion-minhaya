import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "semantic-ui-css/semantic.min.css";
// import { StrictMode } from "react";

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App />
  // </StrictMode>
);
