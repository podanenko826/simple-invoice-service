import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Save,
    Building2,
    Landmark,
    FileText,
    User,
    ArrowRight,
    ArrowLeft,
    Check,
} from "lucide-react";
import InvoicePreview from "./InvoicePreview";

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

    notes: string;
    currency: string;
    taxRate: number;
}

const defaultTemplate: InvoiceTemplate = {
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

    notes: "",
    currency: "USD",
    taxRate: 0,
};

const steps = [
    { id: "company", label: "Company Info", icon: Building2 },
    { id: "client", label: "Bill To", icon: User },
    { id: "banking", label: "Banking", icon: Landmark },
    { id: "defaults", label: "Defaults", icon: FileText },
];

interface TemplateTabProps {
    template: InvoiceTemplate;
    onSave: (template: InvoiceTemplate) => void;
}

const TemplateTab = ({ template, onSave }: TemplateTabProps) => {
    const [form, setForm] = useState<InvoiceTemplate>(template);
    const [step, setStep] = useState(0);
    const [saved, setSaved] = useState(false);

    const update = (field: keyof InvoiceTemplate, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        onSave(form);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const progress = ((step + 1) / steps.length) * 100;
    const isLastStep = step === steps.length - 1;
    const StepIcon = steps[step].icon;

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: Wizard */}
            <div className="space-y-6 min-w-0">
                {/* Step indicator */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Step {step + 1} of {steps.length}
                        </span>
                        <span className="font-medium text-primary flex items-center gap-1.5">
                            <StepIcon className="h-4 w-4" />
                            {steps[step].label}
                        </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between">
                        {steps.map((s, i) => {
                            const Icon = s.icon;
                            const isDone = i < step;
                            const isCurrent = i === step;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setStep(i)}
                                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                        isCurrent
                                            ? "text-primary"
                                            : isDone
                                              ? "text-primary/60"
                                              : "text-muted-foreground"
                                    }`}
                                >
                                    {isDone ? (
                                        <Check className="h-3.5 w-3.5" />
                                    ) : (
                                        <Icon className="h-3.5 w-3.5" />
                                    )}
                                    <span className="hidden sm:inline">
                                        {s.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Step content */}
                {step === 0 && (
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                    Company Information
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Your business details that appear on every
                                invoice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">
                                        Company Name *
                                    </Label>
                                    <Input
                                        id="companyName"
                                        placeholder="Acme Corp"
                                        value={form.companyName}
                                        onChange={(e) =>
                                            update(
                                                "companyName",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taxId">
                                        Tax ID / VAT Number
                                    </Label>
                                    <Input
                                        id="taxId"
                                        placeholder="XX-XXXXXXX"
                                        value={form.taxId}
                                        onChange={(e) =>
                                            update("taxId", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="companyAddress">Address</Label>
                                <Textarea
                                    id="companyAddress"
                                    placeholder={
                                        "123 Business St, Suite 100\nCity, State 12345"
                                    }
                                    rows={2}
                                    value={form.companyAddress}
                                    onChange={(e) =>
                                        update("companyAddress", e.target.value)
                                    }
                                />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyEmail">Email</Label>
                                    <Input
                                        id="companyEmail"
                                        type="email"
                                        placeholder="billing@company.com"
                                        value={form.companyEmail}
                                        onChange={(e) =>
                                            update(
                                                "companyEmail",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="companyPhone">Phone</Label>
                                    <Input
                                        id="companyPhone"
                                        placeholder="+1 (555) 000-0000"
                                        value={form.companyPhone}
                                        onChange={(e) =>
                                            update(
                                                "companyPhone",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 1 && (
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                    Bill To
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Default client details for your invoices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="clientName">
                                        Client Name *
                                    </Label>
                                    <Input
                                        id="clientName"
                                        placeholder="Client or company name"
                                        value={form.clientName}
                                        onChange={(e) =>
                                            update("clientName", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="clientEmail">
                                        Client Email
                                    </Label>
                                    <Input
                                        id="clientEmail"
                                        type="email"
                                        placeholder="client@example.com"
                                        value={form.clientEmail}
                                        onChange={(e) =>
                                            update(
                                                "clientEmail",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="clientAddress">
                                    Client Address
                                </Label>
                                <Textarea
                                    id="clientAddress"
                                    placeholder="Client address"
                                    rows={3}
                                    value={form.clientAddress}
                                    onChange={(e) =>
                                        update("clientAddress", e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                    Banking Details
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Payment information shown on your invoices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName">
                                        Bank Name *
                                    </Label>
                                    <Input
                                        id="bankName"
                                        placeholder="First National Bank"
                                        value={form.bankName}
                                        onChange={(e) =>
                                            update("bankName", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="accountName">
                                        Account Name
                                    </Label>
                                    <Input
                                        id="accountName"
                                        placeholder="Acme Corp"
                                        value={form.accountName}
                                        onChange={(e) =>
                                            update(
                                                "accountName",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="accountNumber">
                                        Account Number *
                                    </Label>
                                    <Input
                                        id="accountNumber"
                                        placeholder="XXXX-XXXX-XXXX"
                                        value={form.accountNumber}
                                        onChange={(e) =>
                                            update(
                                                "accountNumber",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="routingNumber">
                                        Routing / Sort Code
                                    </Label>
                                    <Input
                                        id="routingNumber"
                                        placeholder="XXXXXX"
                                        value={form.routingNumber}
                                        onChange={(e) =>
                                            update(
                                                "routingNumber",
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="iban">IBAN</Label>
                                    <Input
                                        id="iban"
                                        placeholder="XX00 0000 0000 0000 0000 00"
                                        value={form.iban}
                                        onChange={(e) =>
                                            update("iban", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="swiftCode">
                                        SWIFT / BIC Code
                                    </Label>
                                    <Input
                                        id="swiftCode"
                                        placeholder="XXXXXXXX"
                                        value={form.swiftCode}
                                        onChange={(e) =>
                                            update("swiftCode", e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step === 3 && (
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <CardTitle className="text-lg">
                                    Invoice Defaults
                                </CardTitle>
                            </div>
                            <CardDescription>
                                Default values applied to every new invoice.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="currency">Currency</Label>
                                    <Input
                                        id="currency"
                                        placeholder="USD"
                                        value={form.currency}
                                        onChange={(e) =>
                                            update("currency", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="taxRate">
                                        Tax Rate (%)
                                    </Label>
                                    <Input
                                        id="taxRate"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.1"
                                        placeholder="0"
                                        value={form.taxRate || ""}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                taxRate: Number(e.target.value),
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">
                                    Default Notes / Footer
                                </Label>
                                <Textarea
                                    id="notes"
                                    placeholder="Thank you for your business!"
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) =>
                                        update("notes", e.target.value)
                                    }
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={() => setStep((s) => s - 1)}
                        disabled={step === 0}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    {isLastStep ? (
                        <Button
                            onClick={handleSave}
                            size="lg"
                            className="gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {saved ? "Saved!" : "Save Template"}
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setStep((s) => s + 1)}
                            className="gap-2"
                        >
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Right: Live Preview */}
            <div className="hidden lg:block">
                <div className="sticky top-24 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Live Preview
                    </p>
                    <InvoicePreview
                        template={form}
                        invoiceNumber="INV-0001"
                        issueDate={new Date().toISOString().split("T")[0]}
                        dueDate=""
                        clientName={form.clientName}
                        clientEmail={form.clientEmail}
                        clientAddress={form.clientAddress}
                        lineItems={[
                            {
                                id: "sample-1",
                                description: "Sample Service",
                                quantity: 1,
                                unitPrice: 1000,
                            },
                            {
                                id: "sample-2",
                                description: "Another Item",
                                quantity: 2,
                                unitPrice: 500,
                            },
                        ]}
                        notes={form.notes}
                        currency={form.currency}
                    />
                </div>
            </div>
        </div>
    );
};

export { defaultTemplate };
export default TemplateTab;
