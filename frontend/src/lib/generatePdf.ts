import jsPDF from "jspdf";
import type { InvoiceTemplate, Invoice } from "../types/invoice";
import { currencySymbols } from "./currencySymbols";

export function generateInvoicePdf(
    template: InvoiceTemplate,
    invoice: Invoice,
): jsPDF {
    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 12;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const symbol = currencySymbols[invoice.currency] || invoice.currency;

    const grayBoxHeight = 42;

    function checkForPageOverflow() {
        if (y >= pageHeight) {
            doc.addPage();

            y = margin;
        }
    }

    // Helper function to format date
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // Calculate line items and totals
    const lineItems =
        template.line_items && template.line_items.length > 0
            ? template.line_items
            : [
                  {
                      description: template.description || "Service",
                      details: "",
                      quantity: 1,
                      rate: invoice.amount,
                      amount: invoice.amount,
                  },
              ];

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = template.tax_rate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // HEADER: INVOICE (centered)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.setLineHeightFactor(1.5);
    doc.setCharSpace(1.5);
    doc.text("INVOICE", pageWidth / 2 - 4, y + 12, { align: "center" });

    y += 20;

    // Invoice Number (centered)
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.setLineHeightFactor(1.15);
    doc.setCharSpace(0);
    doc.text(invoice.invoice_number, pageWidth / 2, y, { align: "center" });

    y += 8;

    // Dates (centered)
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
        `Issued: ${formatDate(invoice.invoice_date)}  •  Due: ${formatDate(invoice.due_date)}`,
        pageWidth / 2,
        y,
        { align: "center" },
    );

    y += 16;

    // FROM and BILL TO sections (side by side)
    const colWidth = contentWidth / 2;
    const col1X = margin;
    const col2X = margin + colWidth;

    // FROM label
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("FROM", col1X, y);

    // BILL TO label
    doc.text("BILL TO", col2X, y);

    y += 8;

    // FROM - Seller name
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text(
        template.seller_name || template.issuer_name || "Your Company",
        col1X,
        y,
    );

    // BILL TO - Client name
    doc.text(template.client_name || "Client Name", col2X, y);

    y += 8;

    // FROM - Seller details
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);

    let yFrom = y;

    if (template.seller_address_line1) {
        doc.text(template.seller_address_line1, col1X, yFrom);
        yFrom += 6;
    }
    if (template.seller_address_line2) {
        doc.text(template.seller_address_line2, col1X, yFrom);
        yFrom += 6;
    }

    if (template.seller_email) {
        doc.text(template.seller_email, col1X, yFrom);
        yFrom += 6;
    }

    if (template.seller_extra_fields) {
        template.seller_extra_fields.forEach((field) => {
            if (field) {
                doc.text(field, col1X, yFrom);
                yFrom += 6;
            }
        });
    }

    // BILL TO - Client details
    let yTo = y;
    if (template.client_address) {
        const clientLines = template.client_address.split("\n");
        clientLines.forEach((line) => {
            doc.text(line, col2X, yTo);
            yTo += 6;
        });
    }

    if (template.client_tax_id) {
        doc.text(template.client_tax_id, col2X, yTo);
        yTo += 6;
    }

    if (template.client_extra_fields) {
        template.client_extra_fields.forEach((field) => {
            if (field) {
                doc.text(field, col2X, yTo);
                yTo += 6;
            }
        });
    }

    y = Math.max(yFrom, yTo) + 16;

    // LINE ITEMS TABLE
    // Table header

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("DESCRIPTION", margin, y);
    doc.text("QTY", margin + 85, y, { align: "center" });
    doc.text("RATE", margin + 115, y, { align: "right" });
    doc.text("AMOUNT", pageWidth - margin, y, { align: "right" });

    y += 2;

    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y, pageWidth - margin, y);

    y += 8;

    // Line items
    doc.setFont("helvetica", "normal");
    lineItems.forEach((item, index) => {
        const startY = y;

        // Description (with text wrapping)
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        const descriptionMaxWidth = 75; // Max width before QTY column
        const descriptionLines = doc.splitTextToSize(
            item.description,
            descriptionMaxWidth,
        );
        doc.text(descriptionLines, margin, y);
        y += descriptionLines.length * 6;

        // Details (if any, with text wrapping)
        if (item.details) {
            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(120, 120, 120);
            const detailsLines = doc.splitTextToSize(
                item.details,
                descriptionMaxWidth,
            );
            doc.text(detailsLines, margin, y);
            y += detailsLines.length * 6;
        }

        // Quantity, Rate, Amount on same line as first line of description
        const itemY = startY;
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(120, 120, 120);
        doc.text(item.quantity.toString(), margin + 85, itemY, {
            align: "center",
        });
        doc.text(
            `${symbol}${item.rate.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            margin + 115,
            itemY,
            { align: "right" },
        );

        doc.setFont("helvetica", "bold");
        doc.setTextColor(40, 40, 40);
        doc.text(
            `${symbol}${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            pageWidth - margin,
            itemY,
            { align: "right" },
        );

        // Fixed gap from last line of content to separator
        y -= 2;

        // Separator line (except for last item)
        if (index < lineItems.length) {
            doc.setDrawColor(240, 240, 240);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;
        }
    });

    // y += 2;

    // TOTALS (right-aligned)
    const totalsX = pageWidth - margin - 60;
    const totalsValueX = pageWidth - margin;

    checkForPageOverflow();

    // Subtotal
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("Subtotal", totalsX, y);
    doc.setFont("helvetica", "normal");
    doc.text(
        `${symbol}${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        totalsValueX,
        y,
        { align: "right" },
    );
    y += 6;

    checkForPageOverflow();

    // Tax (if applicable)
    if (taxRate > 0) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 120, 120);
        doc.text(`Tax (${taxRate}%)`, totalsX, y);
        doc.setFont("helvetica", "normal");
        doc.text(
            `${symbol}${taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            totalsValueX,
            y,
            { align: "right" },
        );
        y += 2;
    }

    y += 2;

    checkForPageOverflow();

    // Total line
    doc.setDrawColor(240, 240, 240);
    doc.line(totalsX, y, totalsValueX, y);
    y += 6;

    checkForPageOverflow();

    // Total
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(40, 40, 40);
    doc.text("Total", totalsX, y);
    doc.text(
        `${symbol}${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        totalsValueX,
        y,
        { align: "right" },
    );

    y += 6;

    checkForPageOverflow();

    // PAYMENT INFORMATION (gray box)
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, y, contentWidth, grayBoxHeight, "F");

    let yBank = y;

    yBank += 8;

    checkForPageOverflow();

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("PAYMENT INFORMATION", margin + 5, yBank);

    yBank += 8;

    checkForPageOverflow();

    // Payment details in two columns
    const payCol1X = margin + 5;
    const payCol2X = margin + colWidth;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);

    // Column 1
    doc.text("Bank Name", payCol1X, yBank);
    yBank += 6;

    checkForPageOverflow();

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.text(template.bank_name || "Bank Name", payCol1X, yBank);

    yBank += 8;

    checkForPageOverflow();

    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text("IBAN", payCol1X, yBank);
    yBank += 6;

    checkForPageOverflow();

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(template.iban || "IBAN Number", payCol1X, yBank);

    // Column 2
    let yPay = y + 16;

    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text("Account Holder", payCol2X, yPay);
    yPay += 5;

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(template.issuer_name || "Account Holder", payCol2X, yPay);

    yPay += 8;

    doc.setFontSize(12);
    doc.setTextColor(120, 120, 120);
    doc.text("SWIFT / BIC", payCol2X, yPay);
    yPay += 6;
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(template.swift_bic || "SWIFT Code", payCol2X, yPay);

    y = Math.max(yBank, yPay) + 16;

    checkForPageOverflow();

    // TERMS & NOTES
    if (template.payment_terms) {
        checkForPageOverflow();

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 120, 120);
        doc.text("TERMS & NOTES", pageWidth / 2, y, { align: "center" });
        y += 8;

        checkForPageOverflow();

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        const termsLines = doc.splitTextToSize(
            template.payment_terms,
            contentWidth,
        );
        doc.text(termsLines, pageWidth / 2, y, { align: "center" });
    }

    // Additional notes from invoice
    if (invoice.notes) {
        y += 16;

        checkForPageOverflow();

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(120, 120, 120);
        doc.text("ADDITIONAL NOTES", pageWidth / 2, y, { align: "center" });
        y += 8;

        checkForPageOverflow();

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
        doc.text(notesLines, pageWidth / 2, y, { align: "center" });
    }

    return doc;
}
