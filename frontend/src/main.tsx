import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Passwordless } from "./lib/auth/index.js";

// Configure the Passwordless library before app renders
Passwordless.configure({
    clientId: "3frk8crgtpd1bcdiig76ggea87",
    cognitoIdpEndpoint: "eu-west-1",
});

createRoot(document.getElementById("root")!).render(<App />);
