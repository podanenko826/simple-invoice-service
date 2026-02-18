export interface InvoiceTemplate {
    id?: string;
    issuer_name: string;
    issuer_address: string;
    issuer_tax_id: string;
    issuer_email: string;
    client_name: string;
    client_address: string;
    client_tax_id: string;
    currency: string;
    salary_rate: number;
    rate_unit: "monthly" | "daily" | "hourly";
    description: string;
    payment_terms: string;
    bank_name: string;
    iban: string;
    swift_bic: string;
    created_at?: string;
    updated_at?: string;
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
