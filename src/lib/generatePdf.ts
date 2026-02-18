import jsPDF from "jspdf";
import type { InvoiceTemplate, Invoice } from "../types/invoice";

import { currencySymbols } from "./currencySymbols";

export function generateInvoicePdf(
    template: InvoiceTemplate,
    invoice: Invoice,
): jsPDF {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const symbol = currencySymbols[invoice.currency] || invoice.currency;

    // Header
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", margin, y + 8);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`#${invoice.invoice_number}`, margin, y + 16);
    doc.setTextColor(0);

    y += 30;

    // Divider
    doc.setDrawColor(220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Issuer and Client blocks side by side
    const colWidth = contentWidth / 2;

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("FROM", margin, y);
    doc.text("TO", margin + colWidth, y);
    y += 6;

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(template.issuer_name, margin, y);
    doc.text(template.client_name, margin + colWidth, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const issuerLines = template.issuer_address.split("\n");
    const clientLines = template.client_address.split("\n");
    const maxLines = Math.max(issuerLines.length, clientLines.length);

    for (let i = 0; i < maxLines; i++) {
        if (issuerLines[i]) doc.text(issuerLines[i], margin, y);
        if (clientLines[i]) doc.text(clientLines[i], margin + colWidth, y);
        y += 5;
    }

    if (template.issuer_email) {
        doc.text(template.issuer_email, margin, y);
        y += 5;
    }
    if (template.issuer_tax_id) {
        doc.text(`Tax ID: ${template.issuer_tax_id}`, margin, y);
    }
    if (template.client_tax_id) {
        doc.text(`Tax ID: ${template.client_tax_id}`, margin + colWidth, y);
    }
    y += 12;

    // Invoice details
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(10);
    doc.setTextColor(120);
    const detailsCol1 = margin;
    const detailsCol2 = margin + 55;
    const detailsCol3 = margin + 110;

    doc.text("Invoice Date", detailsCol1, y);
    doc.text("Due Date", detailsCol2, y);
    doc.text("Amount Due", detailsCol3, y);
    y += 6;

    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(invoice.invoice_date, detailsCol1, y);
    doc.text(invoice.due_date, detailsCol2, y);
    doc.text(
        `${symbol} ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        detailsCol3,
        y,
    );
    y += 14;

    // Line items table
    doc.setDrawColor(220);
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 10, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(80);
    doc.text("Description", margin + 4, y + 7);
    doc.text("Amount", pageWidth - margin - 4, y + 7, { align: "right" });
    y += 14;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(template.description, margin + 4, y);
    doc.text(
        `${symbol} ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        pageWidth - margin - 4,
        y,
        { align: "right" },
    );
    y += 10;

    // Total
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("TOTAL", pageWidth - margin - 4, y, { align: "right" });
    y += 7;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0);
    doc.text(
        `${symbol} ${invoice.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        pageWidth - margin - 4,
        y,
        { align: "right" },
    );
    y += 16;

    // Payment details
    doc.setDrawColor(220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("PAYMENT DETAILS", margin, y);
    y += 7;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");

    const paymentLines = [
        `Bank: ${template.bank_name}`,
        `IBAN: ${template.iban}`,
        `SWIFT/BIC: ${template.swift_bic}`,
        "",
        template.payment_terms,
    ];

    paymentLines.forEach((line) => {
        if (line) doc.text(line, margin, y);
        y += 5;
    });

    // Notes
    if (invoice.notes) {
        y += 5;
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text("NOTES", margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(0);
        doc.text(invoice.notes, margin, y);
    }

    return doc;
}
