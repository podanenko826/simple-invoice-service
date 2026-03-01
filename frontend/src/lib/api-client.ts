import type { InvoiceTemplate } from "@/components/invoiceWorkspace/TemplateTab";
import type { GeneratedInvoice } from "@/components/invoiceWorkspace/GenerateTab";
import { retrieveTokens } from "./auth/storage";
import { getRuntimeConfig } from "@/config/runtime-config";

export class ApiError extends Error {
    public status: number;
    public data?: any;

    constructor(message: string, status: number, data?: any) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

async function fetchWithAuth(
    endpoint: string,
    options: RequestInit = {},
): Promise<Response> {
    const tokens = await retrieveTokens();

    if (!tokens?.idToken) {
        throw new ApiError("Not authenticated", 401);
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const now = new Date();
    const expireAt = tokens.expireAt ? new Date(tokens.expireAt) : null;
    const isExpired = expireAt && expireAt.valueOf() - now.valueOf() < 5 * 60 * 1000;

    // If token is expired and we have a refresh token, try to refresh
    if (isExpired && tokens.refreshToken) {
        try {
            const { refreshTokens } = await import("./auth/refresh");
            const refreshedTokens = await refreshTokens({
                tokens: {
                    refreshToken: tokens.refreshToken,
                    expireAt: tokens.expireAt,
                    username: tokens.username,
                },
            });
            // Use the refreshed token for this request
            tokens.idToken = refreshedTokens.idToken;
        } catch (error) {
            console.error("Failed to refresh token:", error);
            throw new ApiError("Session expired. Please log in again.", 401);
        }
    }

    const config = getRuntimeConfig();
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.idToken}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
            errorData.error || `HTTP ${response.status}`,
            response.status,
            errorData,
        );
    }

    return response;
}

// Template API
export const templateApi = {
    async get(): Promise<InvoiceTemplate | null> {
        try {
            const response = await fetchWithAuth("/templates");
            return await response.json();
        } catch (error) {
            if (error instanceof ApiError && error.status === 404) {
                return null;
            }
            throw error;
        }
    },

    async save(template: InvoiceTemplate): Promise<void> {
        await fetchWithAuth("/templates", {
            method: "POST",
            body: JSON.stringify(template),
        });
    },
};

// Invoice API
export const invoiceApi = {
    async list(): Promise<GeneratedInvoice[]> {
        const response = await fetchWithAuth("/invoices");
        return await response.json();
    },

    async get(invoiceId: string): Promise<GeneratedInvoice> {
        const response = await fetchWithAuth(`/invoices/${invoiceId}`);
        return await response.json();
    },

    async save(invoice: GeneratedInvoice): Promise<void> {
        await fetchWithAuth("/invoices", {
            method: "POST",
            body: JSON.stringify(invoice),
        });
    },

    async delete(invoiceId: string): Promise<void> {
        await fetchWithAuth(`/invoices/${invoiceId}`, {
            method: "DELETE",
        });
    },
};

// Usage API
export interface UsageStats {
    invoiceCount: number;
    lastInvoiceDate: string | null;
    updatedAt?: string | null;
}

export const usageApi = {
    async get(): Promise<UsageStats> {
        const response = await fetchWithAuth("/usage");
        return await response.json();
    },
};

// Feedback API
export interface FeedbackRequest {
    message: string;
    rating?: number;
    page?: string;
}

export const feedbackApi = {
    async submit(feedback: FeedbackRequest): Promise<void> {
        await fetchWithAuth("/feedback", {
            method: "POST",
            body: JSON.stringify(feedback),
        });
    },
};
