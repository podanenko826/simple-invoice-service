import { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import type { InvoiceTemplate, Invoice } from "../types/invoice";
import { generateInvoicePdf } from "../lib/generatePdf";
import { loadTemplate, saveInvoice } from "../lib/storage";
import { currencySymbols } from "../lib/currencySymbols";

const GenerateInvoice = () => {
    const [template, setTemplate] = useState<InvoiceTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    const today = new Date().toISOString().split("T")[0];
    const [invoiceNumber, setInvoiceNumber] = useState("");
    const [invoiceDate, setInvoiceDate] = useState(today);
    const [dueDate, setDueDate] = useState("");
    const [amount, setAmount] = useState(0);
    const [notes, setNotes] = useState("");

    const loadTemplateData = async () => {
        const savedTemplate = loadTemplate();

        if (savedTemplate) {
            setTemplate(savedTemplate);
            setAmount(savedTemplate.salary_rate);

            const daysMatch =
                savedTemplate.payment_terms?.match(/(\d+)\s*days/i);
            const days = daysMatch ? parseInt(daysMatch[1]) : 14;
            const due = new Date();
            due.setDate(due.getDate() + days);
            setDueDate(due.toISOString().split("T")[0]);

            const month = new Date().toISOString().slice(0, 7).replace("-", "");
            setInvoiceNumber(`INV-${month}`);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadTemplateData();
    }, []);

    const handleGenerate = async () => {
        if (!template) return;
        setGenerating(true);

        try {
            const invoice: Invoice = {
                invoice_number: invoiceNumber,
                invoice_date: invoiceDate,
                due_date: dueDate,
                amount,
                currency: template.currency,
                notes,
            };

            // Save to history
            saveInvoice(invoice);

            // Generate and download PDF
            const doc = generateInvoicePdf(template, invoice);
            doc.save(`invoice-${invoiceNumber}.pdf`);
        } catch (error) {
            alert(`Error generating PDF: ${error}`);
        } finally {
            setGenerating(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    if (!template) {
        return (
            <Alert variant="warning">
                <Alert.Heading>No template found</Alert.Heading>
                <p>Please set up your invoice template first.</p>
            </Alert>
        );
    }

    const symbol = currencySymbols[template.currency] || template.currency;

    return (
        <div className="generate-invoice">
            <Card className="mb-4">
                <Card.Header>
                    <Card.Title className="h4">
                        Generate Monthly Invoice
                    </Card.Title>
                    <Card.Subtitle className="text-muted">
                        Review and adjust, then download your PDF
                    </Card.Subtitle>
                </Card.Header>
                <Card.Body>
                    <Form>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Invoice Number
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        size="lg"
                                        value={invoiceNumber}
                                        onChange={(e) =>
                                            setInvoiceNumber(e.target.value)
                                        }
                                        style={{ fontFamily: "monospace" }}
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Invoice Date
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        size="lg"
                                        value={invoiceDate}
                                        onChange={(e) =>
                                            setInvoiceDate(e.target.value)
                                        }
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Due Date
                                    </Form.Label>
                                    <Form.Control
                                        type="date"
                                        size="lg"
                                        value={dueDate}
                                        onChange={(e) =>
                                            setDueDate(e.target.value)
                                        }
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group>
                                    <Form.Label className="fw-semibold">
                                        Amount ({symbol})
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        size="lg"
                                        value={amount || ""}
                                        onChange={(e) =>
                                            setAmount(
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        className="fw-bold"
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-12">
                                <Form.Group>
                                    <Form.Label>Notes (optional)</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        placeholder="Additional notes for this invoice..."
                                    />
                                </Form.Group>
                            </div>
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <div className="row g-2 small">
                        <div className="col-md-6">
                            <span className="text-muted">From:</span>{" "}
                            {template.issuer_name}
                        </div>
                        <div className="col-md-6">
                            <span className="text-muted">To:</span>{" "}
                            {template.client_name}
                        </div>
                        <div className="col-md-6">
                            <span className="text-muted">Service:</span>{" "}
                            {template.description}
                        </div>
                        <div className="col-md-6">
                            <span className="text-muted">Payment:</span>{" "}
                            {template.payment_terms}
                        </div>
                    </div>
                </Card.Body>
            </Card>

            <Button
                variant="primary"
                size="lg"
                className="w-100 fw-semibold"
                onClick={handleGenerate}
                disabled={generating || !invoiceNumber}
            >
                {generating ? (
                    <>
                        <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                        />
                        Generating...
                    </>
                ) : (
                    <>📄 Generate & Download PDF</>
                )}
            </Button>
        </div>
    );
};

export default GenerateInvoice;
