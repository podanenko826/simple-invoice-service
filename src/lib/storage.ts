import type { InvoiceTemplate, Invoice } from "../types/invoice";

const TEMPLATE_KEY = "invoice_template";
const INVOICES_KEY = "invoices_history";

// Template Storage
export const saveTemplate = (template: InvoiceTemplate): void => {
    try {
        localStorage.setItem(TEMPLATE_KEY, JSON.stringify(template));
    } catch (error) {
        console.error("Error saving template:", error);
        throw new Error("Failed to save template");
    }
};

export const loadTemplate = (): InvoiceTemplate | null => {
    try {
        const data = localStorage.getItem(TEMPLATE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error("Error loading template:", error);
        return null;
    }
};

// Invoice History Storage
export const saveInvoice = (invoice: Invoice): void => {
    try {
        const invoices = loadInvoices();
        const newInvoice = {
            ...invoice,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
        };
        invoices.unshift(newInvoice);
        localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    } catch (error) {
        console.error("Error saving invoice:", error);
        throw new Error("Failed to save invoice");
    }
};

export const loadInvoices = (): Invoice[] => {
    try {
        const data = localStorage.getItem(INVOICES_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error loading invoices:", error);
        return [];
    }
};

export const clearAllData = (): void => {
    try {
        localStorage.removeItem(TEMPLATE_KEY);
        localStorage.removeItem(INVOICES_KEY);
    } catch (error) {
        console.error("Error clearing data:", error);
    }
};
