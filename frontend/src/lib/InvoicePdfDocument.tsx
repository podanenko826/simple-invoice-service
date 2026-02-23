import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Using Helvetica (built-in font) - more reliable than web fonts

const C = {
    primary: "#1F2937",
    secondary: "#6B7280",
    strong: "#111827",
    divider: "#E5E7EB",
    white: "#FFFFFF",
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: C.white,
        fontFamily: "Helvetica",
        fontSize: 9,
        color: C.primary,
        padding: "6%",
    },
    header: {
        textAlign: "center",
        marginBottom: 20,
    },
    invoiceTitle: {
        fontSize: 18,
        fontFamily: "Helvetica-Bold",
        letterSpacing: 2,
        textTransform: "uppercase",
        color: C.primary,
        marginBottom: 4,
    },
    invoiceNumber: {
        fontSize: 12,
        fontFamily: "Helvetica-Bold",
        color: C.secondary,
        marginBottom: 3,
    },
    invoiceDates: {
        fontSize: 9.5,
        color: C.secondary,
    },
    fromBillToContainer: {
        flexDirection: "row",
        marginBottom: 30,
        gap: 20,
    },
    column: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: 8.5,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: C.secondary,
        marginBottom: 4,
    },
    companyName: {
        fontSize: 10.5,
        fontFamily: "Helvetica-Bold",
        color: C.primary,
        marginBottom: 2,
    },
    addressLine: {
        fontSize: 9,
        color: C.secondary,
        lineHeight: 1.4,
    },
    table: {
        marginBottom: 12,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: C.divider,
        paddingBottom: 5,
        marginBottom: 5,
    },
    tableHeaderCell: {
        fontSize: 8.5,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: C.secondary,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: C.divider,
        paddingVertical: 5,
    },
    tableCell: {
        fontSize: 9,
    },
    tableCellBold: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
    },
    descriptionCell: {
        flex: 1,
        paddingRight: 10,
    },
    qtyCell: {
        width: "10%",
        textAlign: "center",
    },
    rateCell: {
        width: "22%",
        textAlign: "right",
        paddingRight: 5,
    },
    amountCell: {
        width: "22%",
        textAlign: "right",
    },
    itemDescription: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: C.primary,
        marginBottom: 2,
    },
    itemDetail: {
        fontSize: 8,
        color: C.secondary,
        lineHeight: 1.3,
    },
    totalsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 15,
        marginBottom: 10,
    },
    totalsBox: {
        width: "55%",
        paddingTop: 10,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 3,
    },
    totalLabel: {
        fontSize: 9,
        color: C.secondary,
    },
    totalValue: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
        color: C.primary,
    },
    separator: {
        borderTopWidth: 1,
        borderTopColor: C.divider,
        marginVertical: 3,
    },
    grandTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingTop: 2,
    },
    grandTotalLabel: {
        fontSize: 10,
        fontFamily: "Helvetica-Bold",
        color: C.strong,
    },
    grandTotalValue: {
        fontSize: 14.5,
        fontFamily: "Helvetica-Bold",
        color: C.strong,
    },
    paymentInfoContainer: {
        marginTop: 20,
        marginBottom: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: C.divider,
    },
    paymentInfoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    paymentInfoItem: {
        width: "48%",
        marginBottom: 8,
    },
    paymentInfoLabel: {
        fontSize: 8.5,
        color: C.secondary,
        marginBottom: 2,
    },
    paymentInfoValue: {
        fontSize: 10,
        color: C.primary,
        fontFamily: "Helvetica-Bold",
    },
    notesContainer: {
        borderTopWidth: 1,
        borderTopColor: C.divider,
        paddingTop: 10,
        marginBottom: 20,
    },
    notesText: {
        fontSize: 9,
        color: C.secondary,
        lineHeight: 1.5,
    },
    footer: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 8,
        color: C.secondary,
    },
});

interface LineItem {
    id: string;
    description: string;
    detail?: string;
    quantity: number;
    unitPrice: number;
}

interface InvoiceTemplate {
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone?: string;
    taxId?: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    iban?: string;
    routingNumber?: string;
    swiftCode?: string;
    notes?: string;
    currency: string;
    taxRate?: number;
}

interface InvoicePdfDocumentProps {
    template: InvoiceTemplate;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    lineItems: LineItem[];
    notes: string;
    currency: string;
}

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

const InvoicePdfDocument = ({
    template,
    invoiceNumber,
    issueDate,
    dueDate,
    lineItems,
    notes,
    currency,
}: InvoicePdfDocumentProps) => {
    const cur = currency || template.currency || "USD";
    const subtotal = lineItems.reduce(
        (s, i) => s + i.quantity * i.unitPrice,
        0,
    );
    const taxRate = template.taxRate || 0;
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax;

    const validLineItems = lineItems.filter(
        (i) => i.description || i.unitPrice > 0,
    );

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.invoiceTitle}>INVOICE</Text>
                    <Text style={styles.invoiceNumber}>
                        {invoiceNumber || "INV-0001"}
                    </Text>
                    <Text style={styles.invoiceDates}>
                        Issued: {formatDate(issueDate)}
                        {dueDate && ` • Due: ${formatDate(dueDate)}`}
                    </Text>
                </View>

                {/* From / Bill To */}
                <View style={styles.fromBillToContainer}>
                    <View style={styles.column}>
                        <Text style={styles.sectionLabel}>FROM</Text>
                        <Text style={styles.companyName}>
                            {template.companyName || "Your Company"}
                        </Text>
                        {template.companyAddress && (
                            <Text style={styles.addressLine}>
                                {template.companyAddress}
                            </Text>
                        )}
                        {template.companyEmail && (
                            <Text style={styles.addressLine}>
                                {template.companyEmail}
                            </Text>
                        )}
                        {template.companyPhone && (
                            <Text style={styles.addressLine}>
                                {template.companyPhone}
                            </Text>
                        )}
                        {template.taxId && (
                            <Text style={styles.addressLine}>
                                Tax ID: {template.taxId}
                            </Text>
                        )}
                    </View>
                    <View style={styles.column}>
                        <Text style={styles.sectionLabel}>BILL TO</Text>
                        <Text style={styles.companyName}>
                            {template.clientName || "Client Name"}
                        </Text>
                        {template.clientAddress && (
                            <Text style={styles.addressLine}>
                                {template.clientAddress}
                            </Text>
                        )}
                        {template.clientEmail && (
                            <Text style={styles.addressLine}>
                                {template.clientEmail}
                            </Text>
                        )}
                    </View>
                </View>

                {/* Line Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={styles.descriptionCell}>
                            <Text style={styles.tableHeaderCell}>
                                DESCRIPTION
                            </Text>
                        </View>
                        <View style={styles.qtyCell}>
                            <Text style={styles.tableHeaderCell}>QTY</Text>
                        </View>
                        <View style={styles.rateCell}>
                            <Text style={styles.tableHeaderCell}>RATE</Text>
                        </View>
                        <View style={styles.amountCell}>
                            <Text style={styles.tableHeaderCell}>AMOUNT</Text>
                        </View>
                    </View>

                    {validLineItems.length === 0 ? (
                        <View
                            style={{ paddingVertical: 20, textAlign: "center" }}
                        >
                            <Text
                                style={{
                                    ...styles.tableCell,
                                    color: C.secondary,
                                    fontStyle: "italic",
                                }}
                            >
                                Add line items to see them here
                            </Text>
                        </View>
                    ) : (
                        validLineItems.map((item) => (
                            <View key={item.id} style={styles.tableRow}>
                                <View style={styles.descriptionCell}>
                                    <Text style={styles.itemDescription}>
                                        {item.description || "—"}
                                    </Text>
                                    {item.detail && (
                                        <Text style={styles.itemDetail}>
                                            {item.detail}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.qtyCell}>
                                    <Text style={styles.tableCell}>
                                        {item.quantity}
                                    </Text>
                                </View>
                                <View style={styles.rateCell}>
                                    <Text style={styles.tableCellBold}>
                                        {formatCurrency(item.unitPrice, cur)}
                                    </Text>
                                </View>
                                <View style={styles.amountCell}>
                                    <Text style={styles.tableCellBold}>
                                        {formatCurrency(
                                            item.quantity * item.unitPrice,
                                            cur,
                                        )}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* Totals */}
                <View style={styles.totalsContainer}>
                    <View style={styles.totalsBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>Subtotal</Text>
                            <Text style={styles.totalValue}>
                                {formatCurrency(subtotal, cur)}
                            </Text>
                        </View>
                        {taxRate > 0 && (
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>
                                    Tax ({taxRate}%)
                                </Text>
                                <Text style={styles.totalValue}>
                                    {formatCurrency(tax, cur)}
                                </Text>
                            </View>
                        )}
                        <View style={styles.separator} />
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>Total</Text>
                            <Text style={styles.grandTotalValue}>
                                {formatCurrency(total, cur)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Payment Information */}
                {(template.bankName || template.accountNumber) && (
                    <View style={styles.paymentInfoContainer}>
                        <Text style={styles.sectionLabel}>
                            PAYMENT INFORMATION
                        </Text>
                        <View style={styles.paymentInfoGrid}>
                            {template.bankName && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        Bank
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.bankName}
                                    </Text>
                                </View>
                            )}
                            {template.accountName && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        Account Holder
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.accountName}
                                    </Text>
                                </View>
                            )}
                            {template.accountNumber && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        Account No.
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.accountNumber}
                                    </Text>
                                </View>
                            )}
                            {template.iban && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        IBAN
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.iban}
                                    </Text>
                                </View>
                            )}
                            {template.swiftCode && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        SWIFT / BIC
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.swiftCode}
                                    </Text>
                                </View>
                            )}
                            {template.routingNumber && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        Routing / Sort Code
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.routingNumber}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Notes */}
                {(notes || template.notes) && (
                    <View style={styles.notesContainer}>
                        <Text style={styles.sectionLabel}>TERMS & NOTES</Text>
                        <Text style={styles.notesText}>
                            {notes || template.notes}
                        </Text>
                    </View>
                )}

                {/* Footer with page number */}
                <Text
                    style={styles.footer}
                    render={({ pageNumber, totalPages }) =>
                        `Page ${pageNumber} of ${totalPages}`
                    }
                    fixed
                />
            </Page>
        </Document>
    );
};

export default InvoicePdfDocument;
