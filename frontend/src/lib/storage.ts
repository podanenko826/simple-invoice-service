import type { InvoiceTemplate } from "@/components/invoiceWorkspace/TemplateTab";
import type { GeneratedInvoice } from "@/components/invoiceWorkspace/GenerateTab";
import { templateApi, invoiceApi } from "./api-client";

// Template Storage
export const saveTemplate = async (
    template: InvoiceTemplate,
): Promise<void> => {
    try {
        await templateApi.save(template);
    } catch (error) {
        console.error("Error saving template:", error);
        throw new Error("Failed to save template");
    }
};

export const loadTemplate = async (): Promise<InvoiceTemplate | null> => {
    try {
        return await templateApi.get();
    } catch (error) {
        console.error("Error loading template:", error);
        return null;
    }
};

// Invoice History Storage
export const saveInvoice = async (invoice: GeneratedInvoice): Promise<void> => {
    try {
        await invoiceApi.save(invoice);
    } catch (error) {
        console.error("Error saving invoice:", error);
        throw new Error("Failed to save invoice");
    }
};

export const loadInvoices = async (): Promise<GeneratedInvoice[]> => {
    try {
        return await invoiceApi.list();
    } catch (error) {
        console.error("Error loading invoices:", error);
        return [];
    }
};

export const deleteInvoice = async (invoiceId: string): Promise<void> => {
    try {
        await invoiceApi.delete(invoiceId);
    } catch (error) {
        console.error("Error deleting invoice:", error);
        throw new Error("Failed to delete invoice");
    }
};

export const clearAllData = (): void => {
    // No longer needed - data is in DynamoDB
    console.log("clearAllData is deprecated - data is stored in DynamoDB");
};
