import { DEFAULT_CURRENCY } from "@/config/currencies";

export interface InvoiceTemplate {
    companyName: string;
    companyAddress: string;
    companyEmail: string;
    companyPhone: string;
    taxId: string;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban: string;
    routingNumber: string;
    swiftCode: string;
    registrationNumber: string;
    companyLogo?: string; // Base64 encoded image data

    notes: string;
    currency: string;
    taxRate: number;
}

export const defaultTemplate: InvoiceTemplate = {
    companyName: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
    taxId: "",
    clientName: "",
    clientEmail: "",
    clientAddress: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    routingNumber: "",
    swiftCode: "",
    registrationNumber: "",
    companyLogo: undefined,

    notes: "",
    currency: DEFAULT_CURRENCY,
    taxRate: 0,
};
