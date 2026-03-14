import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";
import {
    colors,
    baseFontSize,
    spacing,
    fontSizes,
    tableColumns,
    totalsBoxWidthPercent,
} from "./invoice-design-system";

// Using Helvetica (built-in font) - more reliable than web fonts

const styles = StyleSheet.create({
    page: {
        backgroundColor: colors.white,
        fontFamily: "Helvetica",
        fontSize: baseFontSize,
        color: colors.primary,
        padding: spacing.pagePaddingPt,
        display: "flex",
        flexDirection: "column",
    },
    header: {
        textAlign: "center",
        paddingTop:
            spacing.pagePaddingPt * (spacing.headerPaddingTopPercent / 6),
        paddingBottom:
            spacing.pagePaddingPt * (spacing.headerPaddingBottomPercent / 6),
    },
    invoiceTitle: {
        fontSize: baseFontSize * fontSizes.invoiceTitleEm,
        fontFamily: "Helvetica-Bold",
        letterSpacing: 3,
        textTransform: "uppercase",
        color: colors.primary,
        marginBottom: baseFontSize * 0.3,
    },
    invoiceNumber: {
        fontSize: baseFontSize * fontSizes.invoiceNumberEm,
        fontFamily: "Helvetica-Bold",
        color: colors.secondary,
        marginTop: baseFontSize * 0.3,
    },
    invoiceDates: {
        fontSize: baseFontSize * fontSizes.invoiceDatesEm,
        color: colors.secondary,
        marginTop: baseFontSize * 0.3,
    },
    fromBillToContainer: {
        flexDirection: "row",
        paddingTop:
            spacing.pagePaddingPt * (spacing.fromBillToPaddingTopPercent / 6),
        paddingBottom:
            spacing.pagePaddingPt *
            (spacing.fromBillToPaddingBottomPercent / 6),
        gap: spacing.pagePaddingPt * (spacing.fromBillToGapPercent / 6),
    },
    column: {
        flex: 1,
    },
    sectionLabel: {
        fontSize: baseFontSize * fontSizes.sectionLabelEm,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.5,
        color: colors.secondary,
        marginBottom: baseFontSize * 0.4,
    },
    companyName: {
        fontSize: baseFontSize * fontSizes.companyNameEm,
        fontFamily: "Helvetica-Bold",
        color: colors.primary,
        marginBottom: baseFontSize * 0.2,
    },
    addressLine: {
        fontSize: baseFontSize * fontSizes.addressLineEm,
        color: colors.secondary,
        lineHeight: 1.5,
        marginBottom: baseFontSize * 0.15,
    },
    table: {
        marginBottom: baseFontSize,
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
        paddingBottom: baseFontSize * spacing.tableHeaderPaddingEm,
    },
    tableHeaderCell: {
        fontSize: baseFontSize * fontSizes.tableHeaderEm,
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        color: colors.secondary,
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: baseFontSize * spacing.tableRowPaddingEm,
    },
    tableCell: {
        fontSize: baseFontSize * fontSizes.tableCellEm,
        color: colors.primary,
    },
    tableCellBold: {
        fontSize: baseFontSize * fontSizes.tableCellEm,
        fontFamily: "Helvetica-Bold",
        color: colors.primary,
    },
    descriptionCell: {
        flex: 1,
        paddingRight: 15,
    },
    qtyCell: {
        width: `${tableColumns.qtyPercent}%`,
        textAlign: "center",
    },
    rateCell: {
        width: `${tableColumns.ratePercent}%`,
        textAlign: "right",
        paddingRight: 10,
    },
    amountCell: {
        width: `${tableColumns.amountPercent}%`,
        textAlign: "right",
    },
    itemDescription: {
        fontSize: baseFontSize * fontSizes.itemDescriptionEm,
        fontFamily: "Helvetica-Bold",
        color: colors.primary,
        marginBottom: baseFontSize * 0.2,
    },
    itemDetail: {
        fontSize: baseFontSize * fontSizes.itemDetailEm,
        color: colors.secondary,
        lineHeight: 1.4,
    },
    totalsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: baseFontSize * spacing.totalsMarginTopEm,
    },
    totalsBox: {
        width: `${totalsBoxWidthPercent}%`,
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: baseFontSize * spacing.totalRowMarginBottomEm,
    },
    totalLabel: {
        fontSize: baseFontSize * fontSizes.totalLabelEm,
        color: colors.secondary,
    },
    totalValue: {
        fontSize: baseFontSize * fontSizes.totalValueEm,
        fontFamily: "Helvetica-Bold",
        color: colors.primary,
    },
    separator: {
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    grandTotalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "baseline",
        paddingTop: baseFontSize * spacing.grandTotalPaddingTopEm,
    },
    grandTotalLabel: {
        fontSize: baseFontSize * fontSizes.grandTotalLabelEm,
        fontFamily: "Helvetica-Bold",
        color: colors.strong,
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    grandTotalValue: {
        fontSize: baseFontSize * fontSizes.grandTotalValueEm,
        fontFamily: "Helvetica-Bold",
        color: colors.strong,
    },
    paymentInfoContainer: {
        marginBottom:
            spacing.pagePaddingPt *
            (spacing.paymentInfoMarginBottomPercent / 6),
        paddingTop:
            spacing.pagePaddingPt * (spacing.paymentInfoPaddingTopPercent / 6),
    },
    paymentInfoGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: baseFontSize * spacing.paymentInfoGridGapEm,
        marginTop: baseFontSize * spacing.paymentInfoGridGapEm,
    },
    paymentInfoItem: {
        width: "48%",
        marginBottom: baseFontSize * spacing.paymentInfoItemMarginBottomEm,
    },
    paymentInfoLabel: {
        fontSize: baseFontSize * fontSizes.paymentInfoLabelEm,
        color: colors.secondary,
        marginBottom: baseFontSize * spacing.paymentInfoLabelMarginBottomEm,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    paymentInfoValue: {
        fontSize: baseFontSize * fontSizes.paymentInfoValueEm,
        color: colors.strong,
        fontFamily: "Helvetica-Bold",
    },
    notesContainer: {
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        paddingTop:
            spacing.pagePaddingPt * (spacing.notesPaddingTopPercent / 6),
    },
    notesText: {
        fontSize: baseFontSize * fontSizes.notesTextEm,
        color: colors.secondary,
        lineHeight: 1.6,
        marginTop: baseFontSize * spacing.notesTextMarginTopEm,
    },
    footer: {
        position: "absolute",
        bottom: 30,
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 8,
        color: colors.secondary,
    },
    logoContainer: {
        position: "absolute",
        top: spacing.pagePaddingPt,
        left: spacing.pagePaddingPt,
        width: 80,
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    logo: {
        maxWidth: 80,
        maxHeight: 60,
        objectFit: "contain",
    },
});

interface LineItem {
    id: string;
    description: string;
    detail?: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

interface InvoiceTemplate {
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone?: string;
    taxId?: string;
    companyLogo?: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    iban?: string;
    routingNumber?: string;
    swiftCode?: string;
    registrationNumber?: string;
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
                {/* Company Logo */}
                {template.companyLogo && (
                    <View style={styles.logoContainer}>
                        <Image src={template.companyLogo} style={styles.logo} />
                    </View>
                )}

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
                <View style={{ flex: 1 }}>
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
                                <Text style={styles.tableHeaderCell}>
                                    AMOUNT
                                </Text>
                            </View>
                        </View>

                        {validLineItems.length === 0 ? (
                            <View
                                style={{
                                    paddingVertical: 20,
                                    textAlign: "center",
                                }}
                            >
                                <Text
                                    style={{
                                        ...styles.tableCell,
                                        color: colors.secondary,
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
                                            {item.quantity} {item.unit}
                                        </Text>
                                    </View>
                                    <View style={styles.rateCell}>
                                        <Text style={styles.tableCellBold}>
                                            {formatCurrency(
                                                item.unitPrice,
                                                cur,
                                            )}
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
                                <Text style={styles.grandTotalLabel}>
                                    Total
                                </Text>
                                <Text style={styles.grandTotalValue}>
                                    {formatCurrency(total, cur)}
                                </Text>
                            </View>
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
                            {template.registrationNumber && (
                                <View style={styles.paymentInfoItem}>
                                    <Text style={styles.paymentInfoLabel}>
                                        Registration Number
                                    </Text>
                                    <Text style={styles.paymentInfoValue}>
                                        {template.registrationNumber}
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
