import { Card } from "react-bootstrap";
import type { InvoiceTemplate } from "../types/invoice";
import "./InvoicePreview.css";
import { currencySymbols } from "../lib/currencySymbols";

interface InvoicePreviewProps {
    template: InvoiceTemplate;
}

const InvoicePreview = ({ template }: InvoicePreviewProps) => {
    const symbol = currencySymbols[template.currency] || template.currency;
    const today = new Date();
    const daysMatch = template.payment_terms?.match(/(\d+)\s*days/i);
    const days = daysMatch ? parseInt(daysMatch[1]) : 14;
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + days);

    const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    const amount = template.salary_rate || 0;
    const invoiceNumber = `INV-${today.toISOString().slice(0, 7).replace("-", "")}`;

    return (
        <div className="invoice-preview-wrapper">
            {/* Header label */}
            <div className="preview-header">
                <p className="preview-label">LIVE PREVIEW</p>
            </div>

            {/* A4-like preview */}
            <Card className="invoice-preview-card">
                <Card.Body className="p-4 p-md-5">
                    {/* Top row: Issuer + INVOICE title */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <p className="fs-5 fw-bold mb-1">
                                {template.issuer_name || "Your Company"}
                            </p>
                            {template.issuer_address
                                ?.split("\n")
                                .map((line, i) => (
                                    <p
                                        key={i}
                                        className="text-muted small mb-0"
                                    >
                                        {line}
                                    </p>
                                ))}
                            {template.issuer_email && (
                                <p className="text-muted small mb-0">
                                    {template.issuer_email}
                                </p>
                            )}
                        </div>
                        <div className="text-end">
                            <h2 className="invoice-title mb-1">INVOICE</h2>
                            <p className="text-muted small fw-medium">
                                Invoice# {invoiceNumber}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="my-4" />

                    {/* Bill To + Date */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <p className="preview-section-label">BILL TO</p>
                            <p className="fw-bold mb-1">
                                {template.client_name || "Client Name"}
                            </p>
                            {template.client_address
                                ?.split("\n")
                                .map((line, i) => (
                                    <p
                                        key={i}
                                        className="text-muted small mb-0"
                                    >
                                        {line}
                                    </p>
                                ))}
                            {template.client_tax_id && (
                                <p className="text-muted small mb-0">
                                    {template.client_tax_id}
                                </p>
                            )}
                        </div>
                        <div className="text-end">
                            <div className="d-flex align-items-center gap-3 justify-content-end mb-2">
                                <span className="text-muted small">
                                    Invoice Date:
                                </span>
                                <span className="small fw-bold text-primary">
                                    {formatDate(today)}
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-3 justify-content-end">
                                <span className="text-muted small">
                                    Due Date:
                                </span>
                                <span className="small fw-bold">
                                    {formatDate(dueDate)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Line items table */}
                    <div className="invoice-table mb-4">
                        <div className="invoice-table-header">
                            <div className="row g-0">
                                <div className="col-1">#</div>
                                <div className="col-7">Item & Description</div>
                                <div className="col-2 text-end">Rate</div>
                                <div className="col-2 text-end">Amount</div>
                            </div>
                        </div>
                        <div className="invoice-table-body">
                            <div className="row g-0 align-items-center">
                                <div className="col-1 text-muted">1</div>
                                <div className="col-7">
                                    <p className="fw-semibold mb-0">
                                        {template.description ||
                                            "Service description"}
                                    </p>
                                </div>
                                <div className="col-2 text-end">
                                    {amount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </div>
                                <div className="col-2 text-end fw-bold">
                                    {symbol}
                                    {amount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="d-flex justify-content-end border-top pt-3 mb-4">
                        <div className="d-flex align-items-center gap-4">
                            <span className="fw-bold">Total</span>
                            <span className="invoice-total">
                                {symbol}
                                {amount.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                    </div>

                    {/* Payment details */}
                    {(template.bank_name || template.iban) && (
                        <div className="pt-3 border-top">
                            <p className="preview-section-label">
                                PAYMENT DETAILS
                            </p>
                            {template.bank_name && (
                                <p className="small mb-1">
                                    Bank:{" "}
                                    <span className="fw-medium">
                                        {template.bank_name}
                                    </span>
                                </p>
                            )}
                            {template.iban && (
                                <p className="small mb-1">
                                    IBAN:{" "}
                                    <span className="fw-medium">
                                        {template.iban}
                                    </span>
                                </p>
                            )}
                            {template.swift_bic && (
                                <p className="small mb-1">
                                    SWIFT/BIC:{" "}
                                    <span className="fw-medium">
                                        {template.swift_bic}
                                    </span>
                                </p>
                            )}
                            {template.payment_terms && (
                                <p className="text-muted small mt-2 mb-0">
                                    {template.payment_terms}
                                </p>
                            )}
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default InvoicePreview;
