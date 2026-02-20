import { useState, useEffect } from "react";
import { Card, Spinner, Alert } from "react-bootstrap";
import type { Invoice } from "../types/invoice";
import { loadInvoices } from "../lib/storage";
import { currencySymbols } from "../lib/currencySymbols";

const InvoiceHistory = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    const loadInvoicesData = async () => {
        const savedInvoices = loadInvoices();
        setInvoices(savedInvoices);
        setLoading(false);
    };

    useEffect(() => {
        loadInvoicesData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <Alert variant="info">
                <Alert.Heading>📄 No invoices yet</Alert.Heading>
                <p>Generate your first invoice to see it here!</p>
            </Alert>
        );
    }

    return (
        <div className="invoice-history">
            {invoices.map((inv) => {
                const symbol = currencySymbols[inv.currency] || inv.currency;
                return (
                    <Card key={inv.id} className="mb-3 invoice-card">
                        <Card.Body className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="invoice-icon bg-secondary text-white rounded d-flex align-items-center justify-content-center"
                                    style={{ width: "40px", height: "40px" }}
                                >
                                    📄
                                </div>
                                <div>
                                    <div className="fw-semibold">
                                        {inv.invoice_number}
                                    </div>
                                    <div className="text-muted small">
                                        {inv.invoice_date}
                                    </div>
                                </div>
                            </div>
                            <div className="fs-5 fw-bold">
                                {symbol}{" "}
                                {inv.amount?.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                })}
                            </div>
                        </Card.Body>
                    </Card>
                );
            })}
        </div>
    );
};

export default InvoiceHistory;
