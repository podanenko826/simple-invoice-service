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

    // Format date helper
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Seller Details at top (left side)
    if (template.seller_name) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(template.seller_name, margin, y);
        y += 6;

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);

        if (template.seller_address_line1) {
            doc.text(template.seller_address_line1, margin, y);
            y += 4;
        }
        if (template.seller_address_line2) {
            doc.text(template.seller_address_line2, margin, y);
            y += 4;
        }
        if (template.seller_country) {
            doc.text(template.seller_country, margin, y);
            y += 4;
        }
        if (template.seller_phone) {
            doc.text(template.seller_phone, margin, y);
            y += 4;
        }
        if (template.seller_email) {
            doc.text(template.seller_email, margin, y);
            y += 4;
        }
        // Add extra seller fields
        if (template.seller_extra_fields) {
            template.seller_extra_fields.forEach((field) => {
                if (field) {
                    doc.text(field, margin, y);
                    y += 4;
                }
            });
        }

        doc.setTextColor(0);
    }

    // INVOICE title (right side, same level as seller name)
    const invoiceY = margin;
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 46, 77); // Primary Navy
    doc.text("INVOICE", pageWidth - margin, invoiceY, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Invoice# ${invoice.invoice_number}`, pageWidth - margin, invoiceY + 10, { align: "right" });
    doc.setTextColor(0);

    y = Math.max(y, invoiceY + 20);
    y += 10;

    // Bill To section (left) and Invoice Date (right)
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont("helvetica", "bold");
    doc.text("Bill To", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(template.client_name || "Client Name", margin, y);
    
    // Invoice Date on the right
    const dateY = y - 6;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.setFont("helvetica", "normal");
    doc.text("Invoice Date :", pageWidth - margin - 35, dateY, { align: "right" });
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text(formatDate(invoice.invoice_date), pageWidth - margin, dateY, { align: "right" });
    
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100);

    const clientLines = template.client_address?.split("\n") || [];
    clientLines.forEach((line) => {
        doc.text(line, margin, y);
        y += 4;
    });

    if (template.client_tax_id) {
        doc.text(template.client_tax_id, margin, y);
        y += 4;
    }

    // Add extra client fields
    if (template.client_extra_fields) {
        template.client_extra_fields.forEach((field) => {
            if (field) {
                doc.text(field, margin, y);
                y += 4;
            }
        });
    }

    doc.setTextColor(0);
    y += 10;

    // Line items table
    doc.setDrawColor(31, 41, 55); // Dark border
    doc.setLineWidth(1.5);
    doc.rect(margin, y, contentWidth, 0); // Top border
    
    // Header background - white with dark text
    doc.setFillColor(255, 255, 255);
    doc.rect(margin, y, contentWidth, 8, "F");
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(31, 41, 55); // Dark text
    
    const col1 = margin + 2;
    const col2 = margin + 10;
    const col3 = margin + 100;
    const col4 = margin + 125;
    
    doc.text("#", col1, y + 5);
    doc.text("Item & Description", col2, y + 5);
    doc.text("Qty", col3, y + 5);
    doc.text("Rate", col4, y + 5);
    doc.text("Amount", pageWidth - margin - 2, y + 5, { align: "right" });
    
    // Bottom border of header
    doc.setLineWidth(1.5);
    doc.line(margin, y + 8, pageWidth - margin, y + 8);
    
    y += 10;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.setFontSize(9);

    // Draw line items
    const lineItems = template.line_items && template.line_items.length > 0 
        ? template.line_items 
        : [{
            description: template.description || "Service",
            details: "Service provided according to contract",
            quantity: 1,
            rate: invoice.amount,
            amount: invoice.amount
        }];

    let totalAmount = 0;
    lineItems.forEach((item, index) => {
        // Item number
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}`, col1, y + 3);
        
        // Description
        doc.setFont("helvetica", "bold");
        doc.text(item.description || "", col2, y + 3);
        
        // Details (if exists)
        if (item.details) {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            const detailLines = doc.splitTextToSize(item.details, 85);
            doc.text(detailLines[0], col2, y + 7);
            doc.setTextColor(0);
        }
        
        // Qty, Rate, Amount
        doc.setFont("helvetica", "normal");
        doc.text(item.quantity.toFixed(2), col3, y + 3);
        doc.text(`${symbol}${item.rate.toFixed(2)}`, col4, y + 3);
        doc.setFont("helvetica", "bold");
        doc.text(`${symbol}${item.amount.toFixed(2)}`, pageWidth - margin - 2, y + 3, { align: "right" });
        
        totalAmount += item.amount;
        const rowHeight = item.details ? 12 : 8;
        y += rowHeight;
        
        // Row separator (lighter)
        if (index < lineItems.length - 1) {
            doc.setDrawColor(227, 232, 239);
            doc.setLineWidth(0.5);
            doc.line(margin, y - 2, pageWidth - margin, y - 2);
        }
    });

    // Bottom border of table
    doc.setDrawColor(31, 41, 55);
    doc.setLineWidth(1.5);
    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    
    // Left and right borders
    doc.setLineWidth(1.5);
    const tableStartY = y - (lineItems.reduce((sum, item) => sum + (item.details ? 12 : 8), 0)) - 10;
    doc.line(margin, tableStartY, margin, y - 2); // Left border
    doc.line(pageWidth - margin, tableStartY, pageWidth - margin, y - 2); // Right border
    
    y += 5;

    // Total
    doc.setDrawColor(220);
    doc.line(pageWidth - margin - 50, y, pageWidth - margin, y);
    y += 6;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Total", pageWidth - margin - 50, y);
    doc.setFontSize(14);
    doc.text(`${symbol}${totalAmount.toFixed(2)}`, pageWidth - margin - 2, y, { align: "right" });
    
    y += 15;

    // Notes section
    doc.setDrawColor(227, 232, 239);
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(margin, y, contentWidth, 35, 2, 2, "FD");
    
    y += 5;
    doc.setFontSize(9);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Notes", margin + 3, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);

    const notesLines = [
        template.issuer_name ? `Receiver: ${template.issuer_name}` : "",
        template.iban ? `IBAN: ${template.iban}` : "",
        template.swift_bic ? `Bank SWIFT Code: ${template.swift_bic}` : "",
        template.issuer_tax_id ? `Registration Number: ${template.issuer_tax_id}` : "",
        template.bank_name ? `Bank Name: ${template.bank_name}` : "",
    ].filter(line => line);

    notesLines.forEach((line) => {
        doc.text(line, margin + 3, y);
        y += 4;
    });

    return doc;
}
