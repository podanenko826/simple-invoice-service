import { Separator } from "@/components/ui/separator";
import type { InvoiceTemplate } from "./TemplateTab";

interface LineItem {
    id: string;
    description: string;
    detail?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

interface InvoicePreviewProps {
    template: InvoiceTemplate;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    lineItems: LineItem[];
    notes: string;
    currency: string;
}

/* Neutral palette — no blue tint */
const C = {
    primary: "#1F2937" /* deep charcoal */,
    secondary: "#6B7280" /* muted gray */,
    strong: "#111827" /* near-black for Total */,
    divider: "#E5E7EB",
};

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency || "USD",
        minimumFractionDigits: 2,
    }).format(amount);
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

const InvoicePreview = ({
    template,
    invoiceNumber,
    issueDate,
    dueDate,
    clientName,
    clientEmail,
    clientAddress,
    lineItems,
    notes,
    currency,
}: InvoicePreviewProps) => {
    const cur = currency || template.currency || "USD";
    const subtotal = lineItems.reduce(
        (s, i) => s + i.quantity * i.unitPrice,
        0,
    );
    const taxRate = template.taxRate || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    return (
        <div className="relative w-full" style={{ aspectRatio: "210 / 297" }}>
            {/* A4 page */}
            <div
                className="absolute inset-0 bg-white rounded-lg shadow-lg border border-border/40 overflow-hidden flex flex-col"
                style={{
                    fontSize: "clamp(3.5px, 1cqi, 7.5px)",
                    color: C.primary,
                    fontVariantNumeric: "tabular-nums",
                }}
            >
                {/* Company Logo */}
                {template.companyLogo && (
                    <div className="absolute top-[4%] left-[6%] w-[15%] h-[8%] flex items-center justify-center">
                        <img
                            src={template.companyLogo}
                            alt="Company logo"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                )}

                {/* Header */}
                <div
                    className={`px-[6%] pb-[2%] text-center ${template.companyLogo ? "pt-[13%]" : "pt-[4%]"}`}
                >
                    <h2
                        className="font-semibold uppercase tracking-[0.2em]"
                        style={{ fontSize: "1.6em", color: C.primary }}
                    >
                        Invoice
                    </h2>
                    <p
                        className="font-medium mt-[0.3em]"
                        style={{ fontSize: "1.3em", color: C.secondary }}
                    >
                        {invoiceNumber || "INV-0001"}
                    </p>
                    <div
                        className="flex items-center justify-center gap-[1em] mt-[0.3em]"
                        style={{
                            fontSize: "1.05em",
                            color: C.secondary,
                            fontWeight: 400,
                        }}
                    >
                        <span>Issued: {formatDate(issueDate)}</span>
                        {dueDate && (
                            <>
                                <span style={{ color: C.divider }}>•</span>
                                <span>Due: {formatDate(dueDate)}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* From / Bill To */}
                <div className="px-[6%] pt-[1.5%] pb-[9%] grid grid-cols-2 gap-[5%]">
                    <div>
                        <p
                            className="font-medium uppercase tracking-[0.12em] mb-[0.4em]"
                            style={{ fontSize: "0.95em", color: C.secondary }}
                        >
                            From
                        </p>
                        <p
                            className="font-medium"
                            style={{ fontSize: "1.15em", color: C.primary }}
                        >
                            {template.companyName || "Your Company"}
                        </p>
                        {template.companyAddress && (
                            <p
                                className="whitespace-pre-line mt-[0.2em] leading-snug"
                                style={{
                                    fontSize: "1em",
                                    color: C.secondary,
                                    fontWeight: 400,
                                }}
                            >
                                {template.companyAddress}
                            </p>
                        )}
                        {template.companyEmail && (
                            <p
                                className="mt-[0.15em]"
                                style={{
                                    fontSize: "1em",
                                    color: C.secondary,
                                    fontWeight: 400,
                                }}
                            >
                                {template.companyEmail}
                            </p>
                        )}
                        {template.companyPhone && (
                            <p
                                className="mt-[0.15em]"
                                style={{
                                    fontSize: "1em",
                                    color: C.secondary,
                                    fontWeight: 400,
                                }}
                            >
                                {template.companyPhone}
                            </p>
                        )}
                        {template.taxId && (
                            <p
                                className="mt-[0.15em]"
                                style={{
                                    fontSize: "1em",
                                    color: C.secondary,
                                    fontWeight: 400,
                                }}
                            >
                                Tax ID: {template.taxId}
                            </p>
                        )}
                    </div>
                    <div>
                        <p
                            className="font-medium uppercase tracking-[0.12em] mb-[0.4em]"
                            style={{ fontSize: "0.95em", color: C.secondary }}
                        >
                            Bill To
                        </p>
                        <p
                            className="font-medium"
                            style={{ fontSize: "1.15em", color: C.primary }}
                        >
                            {clientName || "Client Name"}
                        </p>
                        {clientAddress && (
                            <p
                                className="whitespace-pre-line mt-[0.2em] leading-snug"
                                style={{
                                    fontSize: "1em",
                                    color: C.secondary,
                                    fontWeight: 400,
                                }}
                            >
                                {clientAddress}
                            </p>
                        )}
                        {clientEmail && (
                            <p
                                className="mt-[0.15em]"
                                style={{
                                    fontSize: "1em",
                                    color: C.secondary,
                                    fontWeight: 400,
                                }}
                            >
                                {clientEmail}
                            </p>
                        )}
                    </div>
                </div>

                {/* Line items table */}
                <div className="px-[6%] flex-1">
                    <table className="w-full">
                        <thead>
                            <tr
                                style={{
                                    borderBottom: `1px solid ${C.divider}`,
                                }}
                            >
                                <th
                                    className="text-left py-[0.5em] font-medium uppercase tracking-[0.12em]"
                                    style={{
                                        fontSize: "0.95em",
                                        color: C.secondary,
                                    }}
                                >
                                    Description
                                </th>
                                <th
                                    className="text-center py-[0.5em] font-medium uppercase tracking-[0.12em] w-[10%]"
                                    style={{
                                        fontSize: "0.95em",
                                        color: C.secondary,
                                    }}
                                >
                                    Qty
                                </th>
                                <th
                                    className="text-right py-[0.5em] font-medium uppercase tracking-[0.12em] w-[20%]"
                                    style={{
                                        fontSize: "0.95em",
                                        color: C.secondary,
                                    }}
                                >
                                    Rate
                                </th>
                                <th
                                    className="text-right py-[0.5em] font-medium uppercase tracking-[0.12em] w-[20%]"
                                    style={{
                                        fontSize: "0.95em",
                                        color: C.secondary,
                                    }}
                                >
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {lineItems.filter(
                                (i) => i.description || i.unitPrice > 0,
                            ).length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="py-[2em] text-center italic"
                                        style={{ color: C.secondary }}
                                    >
                                        Add line items to see them here
                                    </td>
                                </tr>
                            ) : (
                                lineItems
                                    .filter(
                                        (i) => i.description || i.unitPrice > 0,
                                    )
                                    .map((item) => (
                                        <tr
                                            key={item.id}
                                            style={{
                                                borderBottom: `1px solid ${C.divider}20`,
                                            }}
                                        >
                                            <td className="py-[0.5em]">
                                                <span
                                                    style={{ fontWeight: 500 }}
                                                >
                                                    {item.description || "—"}
                                                </span>
                                                {item.detail && (
                                                    <p
                                                        className="mt-[0.2em] leading-snug"
                                                        style={{
                                                            fontSize: "0.9em",
                                                            fontWeight: 400,
                                                            color: C.secondary,
                                                        }}
                                                    >
                                                        {item.detail}
                                                    </p>
                                                )}
                                            </td>
                                            <td
                                                className="text-center py-[0.5em]"
                                                style={{ fontWeight: 400 }}
                                            >
                                                {item.quantity} {item.unit}
                                            </td>
                                            <td
                                                className="text-right py-[0.5em]"
                                                style={{ fontWeight: 500 }}
                                            >
                                                {formatCurrency(
                                                    item.unitPrice,
                                                    cur,
                                                )}
                                            </td>
                                            <td
                                                className="text-right py-[0.5em]"
                                                style={{ fontWeight: 500 }}
                                            >
                                                {formatCurrency(
                                                    item.quantity *
                                                        item.unitPrice,
                                                    cur,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mt-[1em]">
                        <div className="w-[55%] space-y-[0.25em]">
                            <div className="flex justify-between">
                                <span
                                    style={{
                                        color: C.secondary,
                                        fontWeight: 400,
                                    }}
                                >
                                    Subtotal
                                </span>
                                <span style={{ fontWeight: 500 }}>
                                    {formatCurrency(subtotal, cur)}
                                </span>
                            </div>
                            {taxRate > 0 && (
                                <div className="flex justify-between">
                                    <span
                                        style={{
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Tax ({taxRate}%)
                                    </span>
                                    <span style={{ fontWeight: 500 }}>
                                        {formatCurrency(tax, cur)}
                                    </span>
                                </div>
                            )}
                            <Separator style={{ backgroundColor: C.divider }} />
                            <div className="flex justify-between items-baseline pt-[0.2em]">
                                <span
                                    style={{
                                        fontSize: "1.1em",
                                        fontWeight: 600,
                                        color: C.strong,
                                    }}
                                >
                                    Total
                                </span>
                                <span
                                    style={{
                                        fontSize: "1.6em",
                                        fontWeight: 700,
                                        color: C.strong,
                                    }}
                                >
                                    {formatCurrency(total, cur)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment info */}
                {(template.bankName || template.accountNumber) && (
                    <div className="mx-[6%] mb-[3%] mt-auto pt-[2%]">
                        <p
                            className="uppercase tracking-[0.12em] mb-[0.5em]"
                            style={{
                                fontSize: "0.95em",
                                color: C.secondary,
                                fontWeight: 500,
                            }}
                        >
                            Payment Information
                        </p>
                        <div className="grid grid-cols-2 gap-x-[6%] gap-y-[0.4em]">
                            {template.bankName && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Bank
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.bankName}
                                    </p>
                                </div>
                            )}
                            {template.accountName && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Account Holder
                                    </p>
                                    <p
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.accountName}
                                    </p>
                                </div>
                            )}
                            {template.accountNumber && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Account No.
                                    </p>
                                    <p
                                        className="font-mono tracking-wide"
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.accountNumber}
                                    </p>
                                </div>
                            )}
                            {template.iban && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        IBAN
                                    </p>
                                    <p
                                        className="font-mono tracking-wide"
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.iban}
                                    </p>
                                </div>
                            )}
                            {template.swiftCode && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        SWIFT / BIC
                                    </p>
                                    <p
                                        className="font-mono tracking-wide"
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.swiftCode}
                                    </p>
                                </div>
                            )}
                            {template.routingNumber && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Routing / Sort Code
                                    </p>
                                    <p
                                        className="font-mono tracking-wide"
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.routingNumber}
                                    </p>
                                </div>
                            )}
                            {template.registrationNumber && (
                                <div>
                                    <p
                                        style={{
                                            fontSize: "0.95em",
                                            color: C.secondary,
                                            fontWeight: 400,
                                        }}
                                    >
                                        Registration Number
                                    </p>
                                    <p
                                        className="font-mono tracking-wide"
                                        style={{
                                            fontSize: "1.1em",
                                            color: C.primary,
                                            fontWeight: 500,
                                        }}
                                    >
                                        {template.registrationNumber}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Notes */}
                {(notes || template.notes) && (
                    <div
                        className="px-[6%] py-[2%]"
                        style={{ borderTop: `1px solid ${C.divider}` }}
                    >
                        <p
                            className="uppercase tracking-[0.12em] mb-[0.4em]"
                            style={{
                                fontSize: "0.95em",
                                color: C.secondary,
                                fontWeight: 500,
                            }}
                        >
                            Terms & Notes
                        </p>
                        <p
                            className="whitespace-pre-line leading-relaxed"
                            style={{
                                fontSize: "1em",
                                color: C.secondary,
                                fontWeight: 400,
                            }}
                        >
                            {notes || template.notes}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InvoicePreview;
