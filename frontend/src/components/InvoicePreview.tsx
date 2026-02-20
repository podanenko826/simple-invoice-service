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

    // Calculate totals
    const lineItems = template.line_items && template.line_items.length > 0 
        ? template.line_items 
        : [{
            description: template.description || "Service",
            details: "",
            quantity: 1,
            rate: amount,
            amount: amount
        }];
    
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxRate = template.tax_rate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    return (
        <div className="invoice-preview-wrapper">
            {/* Header label */}
            <div className="preview-header">
                <p className="preview-label">LIVE PREVIEW</p>
            </div>

            {/* A4-like preview */}
            <div className="card invoice-preview-card">
                <div className="card-body p-5">
                    {/* Header: INVOICE centered */}
                    <div className="text-center mb-4">
                        <h1 className="fw-bold mb-2" style={{ color: "var(--text-dark)", fontSize: "38px", fontWeight: "700", letterSpacing: "4px" }}>
                            INVOICE
                        </h1>
                        <p className="mb-2" style={{ color: "var(--text-muted)", fontSize: "19px", fontWeight: "600" }}>
                            {invoiceNumber}
                        </p>
                        <p className="mb-0" style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "400" }}>
                            Issued: {formatDate(today)} &nbsp;•&nbsp; Due: {formatDate(dueDate)}
                        </p>
                    </div>

                    {/* From and Bill To */}
                    <div className="row mb-5 mt-5">
                        <div className="col-6">
                            <p className="text-uppercase fw-bold mb-2" style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                FROM
                            </p>
                            <p className="mb-1" style={{ color: "var(--text-dark)", fontSize: "18px", fontWeight: "600" }}>
                                {template.seller_name || "Your Company"}
                            </p>
                            {template.seller_address_line1 && (
                                <p className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>{template.seller_address_line1}</p>
                            )}
                            {template.seller_address_line2 && (
                                <p className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>{template.seller_address_line2}</p>
                            )}
                            {template.seller_email && (
                                <p className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>{template.seller_email}</p>
                            )}
                            {template.seller_extra_fields?.map((field, index) =>
                                field && (
                                    <p key={index} className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>
                                        {field}
                                    </p>
                                )
                            )}
                        </div>

                        <div className="col-6">
                            <p className="text-uppercase fw-bold mb-2" style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                BILL TO
                            </p>
                            <p className="mb-1" style={{ color: "var(--text-dark)", fontSize: "18px", fontWeight: "600" }}>
                                {template.client_name || "Client Name"}
                            </p>
                            {template.client_address?.split("\n").map((line, i) => (
                                <p key={i} className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>{line}</p>
                            ))}
                            {template.client_tax_id && (
                                <p className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>{template.client_tax_id}</p>
                            )}
                            {template.client_extra_fields?.map((field, index) =>
                                field && (
                                    <p key={index} className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>
                                        {field}
                                    </p>
                                )
                            )}
                        </div>
                    </div>

                    {/* Line items table */}
                    <div className="mb-4">
                        <div className="row g-0 py-2 mb-2" style={{ borderBottom: "1px solid var(--border-color)" }}>
                            <div className="col-5">
                                <span className="text-uppercase" style={{ fontSize: "13px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                    DESCRIPTION
                                </span>
                            </div>
                            <div className="col-2 text-center">
                                <span className="text-uppercase" style={{ fontSize: "13px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                    QTY
                                </span>
                            </div>
                            <div className="col-2 text-end">
                                <span className="text-uppercase" style={{ fontSize: "13px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                    RATE
                                </span>
                            </div>
                            <div className="col-3 text-end">
                                <span className="text-uppercase" style={{ fontSize: "13px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                    AMOUNT
                                </span>
                            </div>
                        </div>

                        {lineItems.map((item, index) => (
                            <div key={index} className="row g-0 py-3" style={{ borderBottom: index < lineItems.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                                <div className="col-5">
                                    <p className="mb-0" style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                        {item.description}
                                    </p>
                                    {item.details && (
                                        <p className="mb-0" style={{ color: "var(--text-muted)", fontSize: "15px", fontWeight: "400" }}>{item.details}</p>
                                    )}
                                </div>
                                <div className="col-2 text-center" style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "400" }}>
                                    {item.quantity}
                                </div>
                                <div className="col-2 text-end" style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "400" }}>
                                    {symbol}{item.rate.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </div>
                                <div className="col-3 text-end" style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "600" }}>
                                    {symbol}{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="row justify-content-end mb-5 mt-4">
                        <div className="col-5">
                            <div className="d-flex justify-content-between align-items-center py-2">
                                <span style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "400" }}>Subtotal</span>
                                <span style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                    {symbol}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            {taxRate > 0 && (
                                <div className="d-flex justify-content-between align-items-center py-2">
                                    <span style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: "400" }}>Tax ({taxRate}%)</span>
                                    <span style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                        {symbol}{taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between align-items-center py-3 mt-3" style={{ borderTop: "1px solid rgb(240, 240, 240)" }}>
                                <span style={{ fontSize: "18px", fontWeight: "600", color: "var(--text-dark)" }}>Total</span>
                                <span style={{ fontSize: "29px", fontWeight: "700", color: "var(--text-dark)", lineHeight: "1" }}>
                                    {symbol}{total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="p-4 mb-4" style={{ backgroundColor: "#fafafa", borderRadius: "4px" }}>
                        <p className="text-uppercase mb-3" style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                            PAYMENT INFORMATION
                        </p>
                        <div className="row">
                            <div className="col-6">
                                <p className="mb-1" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Bank Name</span>
                                </p>
                                <p className="mb-3" style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                    {template.bank_name || "Bank Name"}
                                </p>
                                <p className="mb-1" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    <span style={{ color: "var(--text-muted)" }}>IBAN</span>
                                </p>
                                <p className="mb-0" style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                    {template.iban || "IBAN Number"}
                                </p>
                            </div>
                            <div className="col-6">
                                <p className="mb-1" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    <span style={{ color: "var(--text-muted)" }}>Account Holder</span>
                                </p>
                                <p className="mb-3" style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                    {template.issuer_name || "Account Holder"}
                                </p>
                                <p className="mb-1" style={{ fontSize: "15px", fontWeight: "400" }}>
                                    <span style={{ color: "var(--text-muted)" }}>SWIFT / BIC</span>
                                </p>
                                <p className="mb-0" style={{ color: "var(--text-dark)", fontSize: "16px", fontWeight: "500" }}>
                                    {template.swift_bic || "SWIFT Code"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Notes */}
                    {template.payment_terms && (
                        <div>
                            <p className="text-uppercase mb-2" style={{ fontSize: "12px", color: "var(--text-muted)", letterSpacing: "1.5px", fontWeight: "600" }}>
                                TERMS & NOTES
                            </p>
                            <p className="mb-0" style={{ color: "var(--text-muted)", lineHeight: "1.6", fontSize: "15px", fontWeight: "400" }}>
                                {template.payment_terms}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;
