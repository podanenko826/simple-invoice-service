import { generateInvoicePdf } from "./generatePdf";
import type { GeneratedInvoice } from "@/components/invoiceWorkspace/GenerateTab";

export async function exportInvoicePdf(
    invoice: GeneratedInvoice,
): Promise<void> {
    const pdf = generateInvoicePdf(invoice.template, {
        invoice_number: invoice.invoiceNumber,
        invoice_date: invoice.date,
        amount: invoice.amount,
        currency: invoice.currency,
    });

    pdf.save(`${invoice.invoiceNumber}.pdf`);
}
