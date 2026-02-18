import { useState, useEffect } from "react";
import { Form, Button, Card, Spinner } from "react-bootstrap";
import InvoicePreview from "./InvoicePreview";
import type { InvoiceTemplate } from "../types/invoice";
import { currencySymbols } from "../lib/currencySymbols";

const defaultTemplate: InvoiceTemplate = {
    issuer_name: "",
    issuer_address: "",
    issuer_tax_id: "",
    issuer_email: "",
    client_name: "",
    client_address: "",
    client_tax_id: "",
    currency: "EUR",
    salary_rate: 0,
    rate_unit: "monthly",
    description: "Software development services",
    payment_terms: "Payable within 14 days",
    bank_name: "",
    iban: "",
    swift_bic: "",
};

const TemplateForm = () => {
    const [template, setTemplate] = useState<InvoiceTemplate>(defaultTemplate);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadTemplate = async () => {
        // Mock loading - replace with actual API call
        setTimeout(() => {
            setLoading(false);
        }, 500);
    };

    useEffect(() => {
        loadTemplate();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        // Mock save - replace with actual API call
        setTimeout(() => {
            alert("Template saved successfully!");
            setSaving(false);
        }, 1000);
    };

    const update = (field: keyof InvoiceTemplate, value: string | number) => {
        setTemplate((prev) => ({ ...prev, [field]: value }));
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

    return (
        <div className="row g-4">
            {/* Form column */}
            <div className="col-lg-6">
                <div className="template-form">
                    {/* Salary Rate */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="h4">Salary Rate</Card.Title>
                            <Card.Subtitle className="text-muted">
                                Your primary billing rate
                            </Card.Subtitle>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Amount
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            size="lg"
                                            value={template.salary_rate || ""}
                                            onChange={(e) =>
                                                update(
                                                    "salary_rate",
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            placeholder="0.00"
                                            className="fw-bold"
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Currency
                                        </Form.Label>
                                        <Form.Select
                                            size="lg"
                                            value={template.currency}
                                            onChange={(e) =>
                                                update(
                                                    "currency",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {(
                                                Object.entries(
                                                    currencySymbols,
                                                ) as [string, string][]
                                            ).map(([code, symbol]) => (
                                                <option key={code} value={code}>
                                                    {symbol}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Per
                                        </Form.Label>
                                        <Form.Select
                                            size="lg"
                                            value={template.rate_unit}
                                            onChange={(e) =>
                                                update(
                                                    "rate_unit",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            <option value="monthly">
                                                Month
                                            </option>
                                            <option value="daily">Day</option>
                                            <option value="hourly">Hour</option>
                                        </Form.Select>
                                    </Form.Group>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Issuer */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title>Your Details (Issuer)</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Name / Company
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.issuer_name}
                                            onChange={(e) =>
                                                update(
                                                    "issuer_name",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Email
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={template.issuer_email}
                                            onChange={(e) =>
                                                update(
                                                    "issuer_email",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-12">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Address
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={template.issuer_address}
                                            onChange={(e) =>
                                                update(
                                                    "issuer_address",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Tax ID (optional)
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.issuer_tax_id}
                                            onChange={(e) =>
                                                update(
                                                    "issuer_tax_id",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Client */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title>Client Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Client Name / Company
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.client_name}
                                            onChange={(e) =>
                                                update(
                                                    "client_name",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-6">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Client Tax ID (optional)
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.client_tax_id}
                                            onChange={(e) =>
                                                update(
                                                    "client_tax_id",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-12">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Client Address
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={template.client_address}
                                            onChange={(e) =>
                                                update(
                                                    "client_address",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Service & Payment */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title>Service & Payment</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-12">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Description
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.description}
                                            onChange={(e) =>
                                                update(
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-12">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Payment Terms
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.payment_terms}
                                            onChange={(e) =>
                                                update(
                                                    "payment_terms",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            Bank Name
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.bank_name}
                                            onChange={(e) =>
                                                update(
                                                    "bank_name",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            IBAN
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.iban}
                                            onChange={(e) =>
                                                update("iban", e.target.value)
                                            }
                                        />
                                    </Form.Group>
                                </div>
                                <div className="col-md-4">
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            SWIFT / BIC
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={template.swift_bic}
                                            onChange={(e) =>
                                                update(
                                                    "swift_bic",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </Form.Group>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Button
                        variant="success"
                        size="lg"
                        className="w-100 fw-semibold"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    className="me-2"
                                />
                                Saving...
                            </>
                        ) : (
                            <>💾 Save Template</>
                        )}
                    </Button>
                </div>
            </div>

            {/* Preview column - sticky on desktop */}
            <div className="col-lg-6 d-none d-lg-block">
                <div className="sticky-top" style={{ top: "2rem" }}>
                    <InvoicePreview template={template} />
                </div>
            </div>
        </div>
    );
};

export default TemplateForm;
