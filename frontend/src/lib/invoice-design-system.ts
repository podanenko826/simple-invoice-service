// Shared design system for invoice preview and PDF generation
// This ensures both the live preview and generated PDF look identical

export const colors = {
    primary: "#1F2937", // deep charcoal
    secondary: "#6B7280", // muted gray
    strong: "#111827", // near-black for Total
    divider: "#E5E7EB",
    white: "#FFFFFF",
};

// Base font size for preview (relative units, base = 1em)
// For PDF, these will be converted to points
export const baseFontSize = 10; // 10pt for PDF

// Spacing values (for preview in em, for PDF in pt)
export const spacing = {
    // Page padding (6% for preview)
    pagePaddingPercent: 6,
    pagePaddingPt: 40,

    // Header (4% top, 2% bottom for preview)
    headerPaddingTopPercent: 4,
    headerPaddingBottomPercent: 2,

    // From/Bill To section (1.5% top, 9% bottom, 5% gap for preview)
    fromBillToPaddingTopPercent: 1.5,
    fromBillToPaddingBottomPercent: 9,
    fromBillToGapPercent: 5,

    // Table
    tableHeaderPaddingEm: 0.5,
    tableRowPaddingEm: 0.5,

    // Totals
    totalsMarginTopEm: 1,
    totalRowMarginBottomEm: 0.25,
    separatorMarginVerticalEm: 0,
    grandTotalPaddingTopEm: 0.2,

    // Payment info (3% bottom, 2% top padding for preview)
    paymentInfoMarginBottomPercent: 3,
    paymentInfoPaddingTopPercent: 2,
    paymentInfoGridGapEm: 0.4,
    paymentInfoItemMarginBottomEm: 0.4,
    paymentInfoLabelMarginBottomEm: 0.3,

    // Notes (2% padding for preview)
    notesPaddingTopPercent: 2,
    notesTextMarginTopEm: 0.4,
};

// Font sizes (in em for preview, will be converted to pt for PDF)
export const fontSizes = {
    // Header
    invoiceTitleEm: 1.6,
    invoiceNumberEm: 1.3,
    invoiceDatesEm: 1.05,

    // Section labels (FROM, BILL TO, etc.)
    sectionLabelEm: 0.95,

    // Company/Client info
    companyNameEm: 1.15,
    addressLineEm: 1,

    // Table
    tableHeaderEm: 0.95,
    tableCellEm: 1,
    itemDescriptionEm: 1,
    itemDetailEm: 0.9,

    // Totals
    totalLabelEm: 1,
    totalValueEm: 1,
    grandTotalLabelEm: 1.1,
    grandTotalValueEm: 1.6,

    // Payment info
    paymentInfoLabelEm: 0.95,
    paymentInfoValueEm: 1.1,

    // Notes
    notesTextEm: 1,
};

export const fontWeights = {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
};

export const letterSpacing = {
    tight: "0.12em",
    wide: "0.2em",
};

export const lineHeights = {
    snug: "snug",
    relaxed: "relaxed",
};

// Column widths for table
export const tableColumns = {
    qtyPercent: 10,
    ratePercent: 20,
    amountPercent: 20,
};

// Totals box width
export const totalsBoxWidthPercent = 55;
