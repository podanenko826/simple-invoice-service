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
    const isExpired =
        expireAt && expireAt.valueOf() - now.valueOf() < 5 * 60 * 1000;

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
            // Fallback to localStorage for local development
            console.warn("API not available, using localStorage fallback");
            try {
                const stored = localStorage.getItem("invoice-template");
                return stored ? JSON.parse(stored) : null;
            } catch (localError) {
                console.error("Failed to load from localStorage:", localError);
                return null;
            }
        }
    },

    async save(template: InvoiceTemplate): Promise<void> {
        try {
            await fetchWithAuth("/templates", {
                method: "POST",
                body: JSON.stringify(template),
            });
        } catch (error) {
            // Fallback to localStorage for local development
            console.warn("API not available, using localStorage fallback");
            try {
                localStorage.setItem(
                    "invoice-template",
                    JSON.stringify(template),
                );
                console.log("Template saved to localStorage:", template);
            } catch (localError) {
                console.error("Failed to save to localStorage:", localError);
                throw new Error("Failed to save template");
            }
        }
    },
};

// Invoice API
export const invoiceApi = {
    async list(): Promise<GeneratedInvoice[]> {
        try {
            const response = await fetchWithAuth("/invoices");
            return await response.json();
        } catch (error) {
            // Fallback to localStorage for local development
            console.warn("API not available, using localStorage fallback");
            try {
                const stored = localStorage.getItem("invoice-history");
                return stored ? JSON.parse(stored) : [];
            } catch (localError) {
                console.error("Failed to load from localStorage:", localError);
                return [];
            }
        }
    },

    async get(invoiceId: string): Promise<GeneratedInvoice> {
        try {
            const response = await fetchWithAuth(`/invoices/${invoiceId}`);
            return await response.json();
        } catch (error) {
            // Fallback to localStorage for local development
            console.warn("API not available, using localStorage fallback");
            try {
                const stored = localStorage.getItem("invoice-history");
                const invoices: GeneratedInvoice[] = stored
                    ? JSON.parse(stored)
                    : [];
                const invoice = invoices.find((inv) => inv.id === invoiceId);
                if (!invoice) {
                    throw new Error("Invoice not found");
                }
                return invoice;
            } catch (localError) {
                console.error("Failed to load from localStorage:", localError);
                throw new Error("Failed to get invoice");
            }
        }
    },

    async save(invoice: GeneratedInvoice): Promise<void> {
        try {
            await fetchWithAuth("/invoices", {
                method: "POST",
                body: JSON.stringify(invoice),
            });
        } catch (error) {
            // Fallback to localStorage for local development
            console.warn("API not available, using localStorage fallback");
            try {
                const stored = localStorage.getItem("invoice-history");
                const invoices: GeneratedInvoice[] = stored
                    ? JSON.parse(stored)
                    : [];

                // Remove existing invoice with same ID if it exists
                const filteredInvoices = invoices.filter(
                    (inv) => inv.id !== invoice.id,
                );

                // Add new invoice
                filteredInvoices.unshift(invoice);

                localStorage.setItem(
                    "invoice-history",
                    JSON.stringify(filteredInvoices),
                );
                console.log("Invoice saved to localStorage:", invoice);
            } catch (localError) {
                console.error("Failed to save to localStorage:", localError);
                throw new Error("Failed to save invoice");
            }
        }
    },

    async delete(invoiceId: string): Promise<void> {
        try {
            await fetchWithAuth(`/invoices/${invoiceId}`, {
                method: "DELETE",
            });
        } catch (error) {
            // Fallback to localStorage for local development
            console.warn("API not available, using localStorage fallback");
            try {
                const stored = localStorage.getItem("invoice-history");
                const invoices: GeneratedInvoice[] = stored
                    ? JSON.parse(stored)
                    : [];
                const filteredInvoices = invoices.filter(
                    (inv) => inv.id !== invoiceId,
                );
                localStorage.setItem(
                    "invoice-history",
                    JSON.stringify(filteredInvoices),
                );
                console.log("Invoice deleted from localStorage:", invoiceId);
            } catch (localError) {
                console.error(
                    "Failed to delete from localStorage:",
                    localError,
                );
                throw new Error("Failed to delete invoice");
            }
        }
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

// Global Stats API (public - no auth required)
export interface GlobalStats {
    totalInvoices: number;
    lastUpdated: string | null;
}

// Cache management utilities
const STATS_CACHE_KEY = "global-stats-cache";
const CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes in milliseconds

export const statsCacheUtils = {
    clear(): void {
        try {
            localStorage.removeItem(STATS_CACHE_KEY);
        } catch (error) {
            console.warn("Failed to clear stats cache:", error);
        }
    },

    get(): GlobalStats | null {
        try {
            const cached = localStorage.getItem(STATS_CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const now = Date.now();

                // Return cached data if it's still valid
                if (now - timestamp < CACHE_EXPIRY) {
                    return data;
                }
            }
        } catch (error) {
            console.warn("Failed to parse cached stats:", error);
        }
        return null;
    },

    set(data: GlobalStats): void {
        try {
            localStorage.setItem(
                STATS_CACHE_KEY,
                JSON.stringify({
                    data,
                    timestamp: Date.now(),
                }),
            );
        } catch (error) {
            console.warn("Failed to cache stats:", error);
        }
    },
};

export const statsApi = {
    async getGlobal(): Promise<GlobalStats> {
        const config = getRuntimeConfig();

        // Check cache first
        const cached = statsCacheUtils.get();
        if (cached) {
            return cached;
        }

        // Fetch fresh data
        const response = await fetch(`${config.apiUrl}/stats`);

        if (!response.ok) {
            throw new ApiError(`HTTP ${response.status}`, response.status);
        }

        const data = await response.json();

        // Cache the fresh data
        statsCacheUtils.set(data);

        return data;
    },
};
