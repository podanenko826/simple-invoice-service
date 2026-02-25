// Runtime configuration loaded from /config.json
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

    try {
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
