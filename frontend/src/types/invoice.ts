export interface InvoiceTemplate {
    id?: string;
    seller_name: string;
    seller_address_line1: string;
    seller_address_line2: string;
    seller_country: string;
    seller_phone: string;
    seller_email: string;
    seller_extra_fields?: string[]; // Additional dynamic fields
    issuer_name: string;
    issuer_address: string;
    issuer_tax_id: string;
    issuer_email: string;
    client_name: string;
    client_address: string;
    client_tax_id: string;
    client_extra_fields?: string[]; // Additional dynamic fields
    currency: string;
    salary_rate: number;
    rate_unit: "monthly" | "daily" | "hourly";
    description: string;
    payment_terms: string;
    bank_name: string;
    iban: string;
    swift_bic: string;
    line_items?: LineItem[]; // Line items array
    tax_rate?: number; // Optional tax rate (percentage)
    created_at?: string;
    updated_at?: string;
}

export interface LineItem {
    description: string;
    details: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
}

export interface Invoice {
    id?: string;
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    amount: number;
    currency: string;
    notes: string;
    pdf_url?: string;
    created_at?: string;
}
