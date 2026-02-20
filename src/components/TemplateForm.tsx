import { useState, useEffect } from "react";
import { Form, Button, Card, Spinner } from "react-bootstrap";
import InvoicePreview from "./InvoicePreview";
import type { InvoiceTemplate, LineItem } from "../types/invoice";
import { saveTemplate, loadTemplate } from "../lib/storage";
import { currencySymbols, currencyNames } from "../lib/currencySymbols";

const defaultTemplate: InvoiceTemplate = {
    seller_name: "Acme Studio",
    seller_address_line1: "123 Design Ave",
    seller_address_line2: "San Francisco, CA 94102",
    seller_country: "",
    seller_phone: "",
    seller_email: "hello@acmestudio.com",
    issuer_name: "Acme Studio LLC",
    issuer_address: "",
    issuer_tax_id: "3417907479",
    issuer_email: "",
    client_name: "Globex Corporation",
    client_address: "456 Market St\nNew York, NY 10001",
    client_tax_id: "",
    currency: "USD",
    salary_rate: 4500,
    rate_unit: "monthly",
    description: "Brand Identity Design",
    payment_terms: "Payment is due within 30 days of the invoice date.\nLate payments may incur a 1.5% monthly fee.",
    bank_name: "First National Bank",
    iban: "US12 3456 7890 1234 5678 90",
    swift_bic: "FNBKUS33",
    tax_rate: 9,
};

const TemplateForm = () => {
    const [template, setTemplate] = useState<InvoiceTemplate>(defaultTemplate);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [sellerExtraFields, setSellerExtraFields] = useState<string[]>([]);
    const [clientExtraFields, setClientExtraFields] = useState<string[]>([]);
    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            description: "Brand Identity Design",
            details: "",
            quantity: 1,
            rate: 4500,
            amount: 4500,
        },
        {
            description: "Website Development",
            details: "",
            quantity: 1,
            rate: 8000,
            amount: 8000,
        },
        {
            description: "Content Strategy",
            details: "",
            quantity: 10,
            rate: 150,
            amount: 1500,
        },
    ]);

    const loadTemplateData = async () => {
        const savedTemplate = loadTemplate();
        if (savedTemplate) {
            setTemplate(savedTemplate);
            if (savedTemplate.seller_extra_fields) {
                setSellerExtraFields(savedTemplate.seller_extra_fields);
            }
            if (savedTemplate.client_extra_fields) {
                setClientExtraFields(savedTemplate.client_extra_fields);
            }
            if (savedTemplate.line_items && savedTemplate.line_items.length > 0) {
                setLineItems(savedTemplate.line_items);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        loadTemplateData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaveSuccess(false);
        setSaveError(null);

        try {
            const templateToSave = {
                ...template,
                seller_extra_fields: sellerExtraFields,
                client_extra_fields: clientExtraFields,
                line_items: lineItems,
            };
            saveTemplate(templateToSave);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setSaveError(
                error instanceof Error
                    ? error.message
                    : "Failed to save template",
            );
        } finally {
            setSaving(false);
        }
    };

    const addLineItem = () => {
        setLineItems([
            ...lineItems,
            {
                description: "",
                details: "",
                quantity: 0,
                rate: 0,
                amount: 0,
            },
        ]);
    };

    const removeLineItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (
        index: number,
        field: keyof LineItem,
        value: string | number,
    ) => {
        const updated = [...lineItems];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-calculate amount if quantity or rate changes
        if (field === "quantity" || field === "rate") {
            updated[index].amount = updated[index].quantity * updated[index].rate;
        }

        setLineItems(updated);
    };

    const addSellerField = () => {
        setSellerExtraFields([...sellerExtraFields, ""]);
    };

    const removeSellerField = (index: number) => {
        setSellerExtraFields(sellerExtraFields.filter((_, i) => i !== index));
    };

    const updateSellerExtraField = (index: number, value: string) => {
        const updated = [...sellerExtraFields];
        updated[index] = value;
        setSellerExtraFields(updated);
    };

    const addClientField = () => {
        setClientExtraFields([...clientExtraFields, ""]);
    };

    const removeClientField = (index: number) => {
        setClientExtraFields(clientExtraFields.filter((_, i) => i !== index));
    };

    const updateClientExtraField = (index: number, value: string) => {
        const updated = [...clientExtraFields];
        updated[index] = value;
        setClientExtraFields(updated);
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
                    {/* Seller Details */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="h5">Seller Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.seller_name}
                                        onChange={(e) =>
                                            update(
                                                "seller_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Yalovets Ivan"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.seller_address_line1}
                                        onChange={(e) =>
                                            update(
                                                "seller_address_line1",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ukraine, 79000, 230a Kulparkivska, apt.5"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.seller_address_line2}
                                        onChange={(e) =>
                                            update(
                                                "seller_address_line2",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Lviv L'vivs'ka Oblast' 79000"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.seller_country}
                                        onChange={(e) =>
                                            update(
                                                "seller_country",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Ukraine"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.seller_phone}
                                        onChange={(e) =>
                                            update(
                                                "seller_phone",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="+380664333516"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="email"
                                        value={template.seller_email}
                                        onChange={(e) =>
                                            update(
                                                "seller_email",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="ivan.yalovets@thelearning-lab.com"
                                    />
                                </div>
                                {sellerExtraFields.map((field, index) => (
                                    <div key={index} className="col-12">
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                type="text"
                                                value={field}
                                                onChange={(e) =>
                                                    updateSellerExtraField(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Additional field"
                                            />
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    removeSellerField(index)
                                                }
                                                style={{ minWidth: "40px" }}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="col-12">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={addSellerField}
                                        className="w-100"
                                    >
                                        + Add Field
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Client Details */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="h5">Client Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.client_name}
                                        onChange={(e) =>
                                            update(
                                                "client_name",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="TheLearning LAB Hungary Kft."
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.client_address}
                                        onChange={(e) =>
                                            update(
                                                "client_address",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Oreg utca 19"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Control
                                        type="text"
                                        value={template.client_tax_id}
                                        onChange={(e) =>
                                            update(
                                                "client_tax_id",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="HU 27475078"
                                    />
                                </div>
                                {clientExtraFields.map((field, index) => (
                                    <div key={index} className="col-12">
                                        <div className="d-flex gap-2">
                                            <Form.Control
                                                type="text"
                                                value={field}
                                                onChange={(e) =>
                                                    updateClientExtraField(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Additional field"
                                            />
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() =>
                                                    removeClientField(index)
                                                }
                                                style={{ minWidth: "40px" }}
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                                <div className="col-12">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={addClientField}
                                        className="w-100"
                                    >
                                        + Add Field
                                    </Button>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Invoice Details */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="h5">Invoice Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-12">
                                    <Form.Label>Invoice Number:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="INV-0000011"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>Currency:</Form.Label>
                                    <Form.Select
                                        value={template.currency}
                                        onChange={(e) =>
                                            update("currency", e.target.value)
                                        }
                                    >
                                        {(
                                            Object.entries(
                                                currencySymbols,
                                            ) as [string, string][]
                                        ).map(([code, symbol]) => (
                                            <option key={code} value={code}>
                                                {symbol} {code} - {currencyNames[code] || code}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </div>
                                <div className="col-12">
                                    <Form.Label>Invoice Date:</Form.Label>
                                    <Form.Control
                                        type="date"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>Tax Rate (%) - Optional:</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={template.tax_rate || ""}
                                        onChange={(e) =>
                                            update(
                                                "tax_rate",
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                        placeholder="0"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                    />
                                    <Form.Text className="text-muted">
                                        Leave empty or 0 for no tax
                                    </Form.Text>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    {/* Line Items */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="h5">Line Items</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            {lineItems.map((item, index) => (
                                <Card
                                    key={index}
                                    className="mb-3"
                                    style={{
                                        border: "1px solid var(--border-color)",
                                        backgroundColor: "white",
                                    }}
                                >
                                    <Card.Body>
                                        <div className="row g-3">
                                            <div className="col-12">
                                                <Form.Control
                                                    type="text"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            index,
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="AWS Infrastructure DevOps"
                                                />
                                            </div>
                                            <div className="col-12">
                                                <Form.Control
                                                    as="textarea"
                                                    rows={2}
                                                    value={item.details}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            index,
                                                            "details",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Service provided according to contract for the period..."
                                                />
                                            </div>
                                            <div className="col-4">
                                                <Form.Control
                                                    type="number"
                                                    value={item.quantity || ""}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            index,
                                                            "quantity",
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    placeholder="176"
                                                />
                                            </div>
                                            <div className="col-4">
                                                <Form.Control
                                                    type="number"
                                                    value={item.rate || ""}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            index,
                                                            "rate",
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    placeholder="22"
                                                />
                                            </div>
                                            <div className="col-4">
                                                <Form.Control
                                                    type="number"
                                                    value={item.amount || ""}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            index,
                                                            "amount",
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                        )
                                                    }
                                                    placeholder="Amount (direct)"
                                                />
                                            </div>
                                            {lineItems.length > 1 && (
                                                <div className="col-12">
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() =>
                                                            removeLineItem(index)
                                                        }
                                                        className="w-100"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={addLineItem}
                                className="w-100"
                            >
                                + Add Line Item
                            </Button>
                        </Card.Body>
                    </Card>

                    {/* Bank & Payment Details */}
                    <Card className="mb-4">
                        <Card.Header>
                            <Card.Title className="h5">Bank & Payment Details</Card.Title>
                        </Card.Header>
                        <Card.Body>
                            <div className="row g-3">
                                <div className="col-12">
                                    <Form.Label>Receiver Name:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={template.issuer_name}
                                        onChange={(e) =>
                                            update("issuer_name", e.target.value)
                                        }
                                        placeholder="PE YALOVETS IVAN"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>IBAN:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={template.iban}
                                        onChange={(e) =>
                                            update("iban", e.target.value)
                                        }
                                        placeholder="UA023220010000026003340102518"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>Bank SWIFT Code:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={template.swift_bic}
                                        onChange={(e) =>
                                            update("swift_bic", e.target.value)
                                        }
                                        placeholder="UNJSUAUXXX"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>Registration Number:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={template.issuer_tax_id}
                                        onChange={(e) =>
                                            update("issuer_tax_id", e.target.value)
                                        }
                                        placeholder="3417907479"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>Bank Name:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={template.bank_name}
                                        onChange={(e) =>
                                            update("bank_name", e.target.value)
                                        }
                                        placeholder="JSC UNIVERSAL BANK, Kyiv, Ukraine"
                                    />
                                </div>
                                <div className="col-12">
                                    <Form.Label>Terms & Notes (Optional):</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={template.payment_terms}
                                        onChange={(e) =>
                                            update("payment_terms", e.target.value)
                                        }
                                        placeholder="Payment is due within 30 days of the invoice date."
                                    />
                                    <Form.Text className="text-muted">
                                        Leave empty to hide this section from the invoice
                                    </Form.Text>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Button
                        variant={saveError ? "danger" : "success"}
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
                            <>
                                {saveSuccess
                                    ? "✓ Template saved successfully!"
                                    : saveError
                                      ? `✖${saveError}`
                                      : "💾 Save Template"}
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Preview column - sticky on desktop */}
            <div className="col-lg-6 d-none d-lg-block">
                <div className="sticky-top" style={{ top: "2rem" }}>
                    <InvoicePreview 
                        template={{
                            ...template,
                            line_items: lineItems,
                            seller_extra_fields: sellerExtraFields,
                            client_extra_fields: clientExtraFields,
                        }} 
                    />
                </div>
            </div>
        </div>
    );
};

export default TemplateForm;
