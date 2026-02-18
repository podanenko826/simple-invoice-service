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
        d.toLocaleDateString("en-CA", {
            month: "numeric",
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
            <div className="card invoice-preview-card">
                <div className="card-body p-4 p-md-5">
                    {/* Top row: Issuer + INVOICE title */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <h2 className="invoice-title mb-1">INVOICE</h2>
                            <p className="text-muted small fw-medium">
                                #{invoiceNumber}
                            </p>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="my-4" />

                    {/* Bill To + Date */}
                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <p className="preview-section-label text-muted">
                                FROM
                            </p>
                            <p className="fw-bold mb-1">
                                {template.issuer_name || "Issuer Name"}
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
                            <p className="text-muted small mb-0">
                                {template.issuer_email || "Issuer Email"}
                            </p>
                            {template.issuer_tax_id && (
                                <p className="text-muted small mb-0">
                                    Tax ID: {template.issuer_tax_id}
                                </p>
                            )}
                        </div>
                        <div className="flex-end">
                            <p className="preview-section-label text-muted">
                                TO
                            </p>
                            <p className="fw-bold mb-1">
                                {template.client_name || "Client Name"}
                            </p>
                            {template.client_address
                                ?.split("\n")
                                .map((line, i) => (
                                    <p
                                        key={i}
                                        className="text-muted small mb-4"
                                    >
                                        {line}
                                    </p>
                                ))}
                            {template.client_tax_id && (
                                <p className="text-muted small mb-0">
                                    Tax ID: {template.client_tax_id}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className="my-4" />

                    <div className="d-flex justify-content-between align-items-start mb-4">
                        <div>
                            <p className="small text-muted mb-0">
                                Invoice Date
                            </p>
                            <p className="fw-bold mb-1">{formatDate(today)}</p>
                        </div>
                        <div>
                            <p className="small text-muted mb-0">Due Date</p>
                            <p className="fw-bold mb-1">
                                {formatDate(dueDate)}
                            </p>
                        </div>
                        <div>
                            <p className="small text-muted mb-0">Amount Due</p>
                            <p className="fw-bold mb-1">
                                {symbol}
                                {amount.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                })}
                            </p>
                        </div>
                    </div>

                    {/* Line items table */}
                    <div className="invoice-table mb-4">
                        <div className="invoice-table-header">
                            <div className="row g-0 align-items-bottom">
                                <div className="col-7">Description</div>
                                <div className="col-5 text-end">Amount</div>
                            </div>
                        </div>
                        <div className="invoice-table-body">
                            <div className="row g-0 align-items-center">
                                <div className="col-7">
                                    <p className="fw-semibold mb-0">
                                        {template.description ||
                                            "Service description"}
                                    </p>
                                </div>
                                <div className="col-5 text-end fw-bold">
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
                        <div className="d-flex flex-column align-items-end">
                            <span className="preview-section-label text-muted fw-bold">
                                Total
                            </span>
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
                            <p className="preview-section-label text-muted">
                                PAYMENT DETAILS
                            </p>
                            {template.bank_name && (
                                <p className="small mb-0">
                                    Bank:{" "}
                                    <span className="fw-medium">
                                        {template.bank_name}
                                    </span>
                                </p>
                            )}
                            {template.iban && (
                                <p className="small mb-0">
                                    IBAN:{" "}
                                    <span className="fw-medium">
                                        {template.iban}
                                    </span>
                                </p>
                            )}
                            {template.swift_bic && (
                                <p className="small mb-0">
                                    SWIFT/BIC:{" "}
                                    <span className="fw-medium">
                                        {template.swift_bic}
                                    </span>
                                </p>
                            )}
                            {template.payment_terms && (
                                <p className="small mt-2 mb-0">
                                    {template.payment_terms}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
