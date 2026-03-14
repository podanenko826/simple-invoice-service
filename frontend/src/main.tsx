import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Passwordless } from "./lib/auth/index.js";
import { loadRuntimeConfig } from "./config/runtime-config";
import "./lib/debug-storage"; // Import debug utilities

// Load runtime config and configure auth before rendering
loadRuntimeConfig()
    .then((config) => {
        Passwordless.configure({
            clientId: config.userPoolClientId,
            cognitoIdpEndpoint: config.region,
            userPoolId: config.userPoolId,
        });

        createRoot(document.getElementById("root")!).render(<App />);
    })
    .catch((error) => {
        console.error("Failed to initialize app:", error);
        document.getElementById("root")!.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h1>Configuration Error</h1>
                <p>Failed to load application configuration. Please try again later.</p>
            </div>
        `;
    });
