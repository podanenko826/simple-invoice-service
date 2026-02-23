import { pdf } from "@react-pdf/renderer";
import InvoicePdfDocument from "./InvoicePdfDocument";
import type { GeneratedInvoice } from "@/components/invoiceWorkspace/GenerateTab";

export async function exportInvoicePdf(
    invoice: GeneratedInvoice,
): Promise<void> {
    // Create the PDF document
    const doc = InvoicePdfDocument({
        template: invoice.template,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        lineItems: invoice.lineItems,
        notes: invoice.notes,
        currency: invoice.currency,
    });

    // Generate blob and download
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${invoice.invoiceNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
}

export async function previewInvoicePdf(
    invoice: GeneratedInvoice,
): Promise<void> {
    // Create the PDF document
    const doc = InvoicePdfDocument({
        template: invoice.template,
        invoiceNumber: invoice.invoiceNumber,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        lineItems: invoice.lineItems,
        notes: invoice.notes,
        currency: invoice.currency,
    });

    // Generate blob and open in new tab
    const blob = await pdf(doc).toBlob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
    // Note: URL will be revoked when the tab is closed
}
