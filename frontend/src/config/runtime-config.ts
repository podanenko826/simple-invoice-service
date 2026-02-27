// Runtime configuration loaded from ENV (dev) or /config.json (production)
export interface RuntimeConfig {
    userPoolId: string;
    userPoolClientId: string;
    apiUrl: string;
    region: string;
}

let cachedConfig: RuntimeConfig | null = null;

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
    if (cachedConfig) {
        return cachedConfig;
    }

    // In development, use environment variables
    if (import.meta.env.DEV) {
        console.log(
            "Loading config from environment variables (development mode)",
        );
        cachedConfig = {
            userPoolId: import.meta.env.VITE_USER_POOL_ID || "",
            userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || "",
            apiUrl: import.meta.env.VITE_API_URL || "",
            region: import.meta.env.VITE_REGION || "eu-west-1",
        };

        // Validate required env vars in development
        if (
            !cachedConfig.userPoolId ||
            !cachedConfig.userPoolClientId ||
            !cachedConfig.apiUrl
        ) {
            console.error("Missing required environment variables:", {
                userPoolId: !!cachedConfig.userPoolId,
                userPoolClientId: !!cachedConfig.userPoolClientId,
                apiUrl: !!cachedConfig.apiUrl,
            });
            throw new Error(
                "Missing required environment variables. Please check your .env file.",
            );
        }

        return cachedConfig;
    }

    // In production, fetch from config.json
    try {
        console.log("Loading config from /config.json (production mode)");
        const response = await fetch("/config.json");
        if (!response.ok) {
            throw new Error(`Failed to load config: ${response.statusText}`);
        }
        const config = await response.json();
        cachedConfig = config;
        return config;
    } catch (error) {
        console.error("Failed to load runtime config:", error);
        throw error;
    }
}

export function getRuntimeConfig(): RuntimeConfig {
    if (!cachedConfig) {
        throw new Error(
            "Runtime config not loaded. Call loadRuntimeConfig() first.",
        );
    }
    return cachedConfig;
}
