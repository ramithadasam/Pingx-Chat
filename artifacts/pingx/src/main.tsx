import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initApiBaseUrl } from "./lib/api";
import { initAuthTokenGetter } from "./lib/auth";

initApiBaseUrl();
initAuthTokenGetter();

createRoot(document.getElementById("root")!).render(<App />);
