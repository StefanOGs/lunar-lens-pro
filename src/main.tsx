import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Performance: Mark navigation start
if (typeof performance !== 'undefined' && performance.mark) {
  performance.mark('app-init');
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<App />);
