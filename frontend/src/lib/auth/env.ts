/**
 * Environment configuration for authentication
 * Uses Vite environment variables
 */

export const authConfig = {
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    region: import.meta.env.VITE_COGNITO_REGION,
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    endpoint: import.meta.env.VITE_COGNITO_ENDPOINT,
} as const;

// Validation
if (!authConfig.clientId) {
    throw new Error(
        "Missing VITE_COGNITO_CLIENT_ID environment variable. Please check your .env file.",
    );
}

if (!authConfig.region) {
    throw new Error(
        "Missing VITE_COGNITO_REGION environment variable. Please check your .env file.",
    );
}
