// Shared types for Lambda functions

export interface InvoiceTemplate {
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

export interface LineItem {
    id: string;
    description: string;
    detail?: string;
    quantity: number;
    unitPrice: number;
}

export interface Invoice {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    lineItems: LineItem[];
    notes: string;
    total: number;
    currency: string;
    template: InvoiceTemplate;
}

export interface DynamoDBItem {
    userId: string;
    itemId: string;
    itemType: "TEMPLATE" | "INVOICE";
    data: InvoiceTemplate | Invoice;
    createdAt: string;
    updatedAt: string;
    GSI1PK: string;
    GSI1SK: string;
    pdfUrl?: string;
}

export interface APIResponse {
    statusCode: number;
    headers: {
        "Content-Type": string;
        "Access-Control-Allow-Origin": string;
        "Access-Control-Allow-Headers": string;
        "Access-Control-Allow-Methods": string;
    };
    body: string;
}
