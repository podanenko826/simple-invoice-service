import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    FileText,
    Plus,
    Trash2,
    AlertCircle,
    Eye,
    MessageSquare,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { InvoiceTemplate } from "./TemplateTab";
import InvoicePreview from "./InvoicePreview";
import { previewInvoicePdf } from "@/lib/exportPdf";
import { feedbackApi } from "@/lib/api-client";
import { toast } from "sonner";

interface LineItem {
    id: string;
    description: string;
    detail: string;
    quantity: number;
    unit: string;
    unitPrice: number;
}

export interface GeneratedInvoice {
    id: string;
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    lineItems: LineItem[];
    notes: string;
    total: number;
    createdAt: string;
    template: InvoiceTemplate;
    clientName: string;
    clientEmail: string;
    clientAddress: string;
    currency: string;
}

interface GenerateTabProps {
    template: InvoiceTemplate;
    templateReady: boolean;
    onGenerate: (invoice: GeneratedInvoice) => void;
    nextInvoiceNumber: string;
}

const GenerateTab = ({
    template,
    templateReady,
    onGenerate,
    nextInvoiceNumber,
}: GenerateTabProps) => {
    const [invoiceNumber, setInvoiceNumber] = useState(nextInvoiceNumber);
    const [issueDate, setIssueDate] = useState(
        new Date().toISOString().split("T")[0],
    );
    const [dueDate, setDueDate] = useState("");
    const [notes, setNotes] = useState("");
    const [lineItems, setLineItems] = useState<LineItem[]>([
        {
            id: crypto.randomUUID(),
            description: "",
            detail: "",
            quantity: 1,
            unit: "hours",
            unitPrice: 0,
        },
    ]);
    const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [submittingFeedback, setSubmittingFeedback] = useState(false);

    const addLineItem = () => {
        setLineItems((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                description: "",
                detail: "",
                quantity: 1,
                unit: "hours",
                unitPrice: 0,
            },
        ]);
    };

    const removeLineItem = (id: string) => {
        if (lineItems.length <= 1) return;
        setLineItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateLineItem = (
        id: string,
        field: keyof LineItem,
        value: string | number,
    ) => {
        setLineItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, [field]: value } : item,
            ),
        );
    };

    const subtotal = lineItems.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
    );
    const tax = subtotal * ((template.taxRate || 0) / 100);
    const total = subtotal + tax;

    const canGenerate =
        templateReady &&
        invoiceNumber &&
        lineItems.some((i) => i.description && i.unitPrice > 0);

    const handleGenerate = () => {
        if (!canGenerate) return;
        const invoice: GeneratedInvoice = {
            id: crypto.randomUUID(),
            invoiceNumber,
            issueDate,
            dueDate,
            lineItems,
            notes,
            total,
            createdAt: new Date().toISOString(),
            template: { ...template },
            clientName: template.clientName,
            clientEmail: template.clientEmail,
            clientAddress: template.clientAddress,
            currency: template.currency,
        };
        onGenerate(invoice);
        setNotes("");
        setLineItems([
            {
                id: crypto.randomUUID(),
                description: "",
                detail: "",
                quantity: 1,
                unit: "hours",
                unitPrice: 0,
            },
        ]);
        const num = parseInt(invoiceNumber.replace(/\D/g, "")) || 0;
        setInvoiceNumber(`INV-${String(num + 1).padStart(4, "0")}`);
    };

    const handlePreviewPdf = async () => {
        if (!canGenerate) return;
        try {
            const invoice: GeneratedInvoice = {
                id: crypto.randomUUID(),
                invoiceNumber,
                issueDate,
                dueDate,
                lineItems,
                notes,
                total,
                createdAt: new Date().toISOString(),
                template: { ...template },
                clientName: template.clientName,
                clientEmail: template.clientEmail,
                clientAddress: template.clientAddress,
                currency: template.currency,
            };
            await previewInvoicePdf(invoice);
        } catch (error) {
            toast.error("Failed to preview PDF");
            console.error(error);
        }
    };

    const handleSubmitFeedback = async () => {
        if (!feedbackMessage.trim()) {
            toast.error("Please enter your feedback");
            return;
        }

        setSubmittingFeedback(true);
        try {
            await feedbackApi.submit({
                message: feedbackMessage,
                page: "generate-invoice",
            });
            toast.success("Thank you! Your feedback has been received.");
            setFeedbackDialogOpen(false);
            setFeedbackMessage("");
        } catch (error) {
            toast.error("Failed to submit feedback. Please try again.");
            console.error(error);
        } finally {
            setSubmittingFeedback(false);
        }
    };

    if (!templateReady) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-foreground">
                        Template Required
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md">
                        Set up your company and banking details in the Template
                        tab first. Once saved, you can generate invoices here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_550px]">
            {/* Left: Form */}
            <div className="flex flex-col justify-between space-y-6 min-w-0">
                {/* Invoice Details */}
                <div className="space-y-6 min-w-0">
                    <Card>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg">
                                Invoice Details (Updated)
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="invoiceNumber">
                                        Invoice #
                                    </Label>
                                    <Input
                                        id="invoiceNumber"
                                        value={invoiceNumber}
                                        onChange={(e) =>
                                            setInvoiceNumber(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="issueDate">
                                        Issue Date
                                    </Label>
                                    <Input
                                        id="issueDate"
                                        type="date"
                                        value={issueDate}
                                        onChange={(e) =>
                                            setIssueDate(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dueDate">Due Date</Label>
                                    <Input
                                        id="dueDate"
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) =>
                                            setDueDate(e.target.value)
                                        }
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items */}
                    <Card>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">
                                    Line Items
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={addLineItem}
                                    className="gap-1"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Add Item
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="overflow-hidden">
                            <div className="space-y-3 min-w-0">
                                {/* Desktop Table Header */}
                                <div className="hidden lg:grid lg:grid-cols-[2fr_50px_70px_80px_60px_30px] gap-2 text-xs font-medium text-muted-foreground px-1">
                                    <span>Description</span>
                                    <span>Qty</span>
                                    <span>Unit</span>
                                    <span>Rate</span>
                                    <span>Total</span>
                                    <span />
                                </div>
                                <Separator className="hidden lg:block" />

                                {/* Line Items */}
                                {lineItems.map((item) => (
                                    <div key={item.id}>
                                        {/* Desktop Layout - Large screens only */}
                                        <div className="hidden lg:grid lg:grid-cols-[2fr_50px_70px_80px_60px_30px] gap-2 items-start overflow-hidden">
                                            <div className="space-y-1.5 min-w-0">
                                                <Input
                                                    placeholder="Item name (e.g. AWS Infrastructure DevOps)"
                                                    value={item.description}
                                                    className="min-w-0"
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <Textarea
                                                    placeholder="Description (optional)"
                                                    rows={1}
                                                    className="min-h-[32px] text-xs resize-none min-w-0"
                                                    value={item.detail}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "detail",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>
                                            <Input
                                                type="number"
                                                min={1}
                                                className="min-w-0"
                                                value={item.quantity}
                                                onChange={(e) =>
                                                    updateLineItem(
                                                        item.id,
                                                        "quantity",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <Select
                                                value={item.unit}
                                                onValueChange={(value) =>
                                                    updateLineItem(
                                                        item.id,
                                                        "unit",
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="min-w-0">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="hours">
                                                        Hours
                                                    </SelectItem>
                                                    <SelectItem value="days">
                                                        Days
                                                    </SelectItem>
                                                    <SelectItem value="months">
                                                        Months
                                                    </SelectItem>
                                                    <SelectItem value="items">
                                                        Items
                                                    </SelectItem>
                                                    <SelectItem value="fixed">
                                                        Fixed
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                placeholder="0.00"
                                                className="min-w-0"
                                                value={item.unitPrice || ""}
                                                onChange={(e) =>
                                                    updateLineItem(
                                                        item.id,
                                                        "unitPrice",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                            <div className="flex items-center h-10 text-sm font-medium px-1 min-w-0 truncate">
                                                {(
                                                    item.quantity *
                                                    item.unitPrice
                                                ).toFixed(2)}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    removeLineItem(item.id)
                                                }
                                                disabled={lineItems.length <= 1}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Tablet Layout - Medium screens */}
                                        <div className="hidden sm:block lg:hidden border border-border rounded-lg p-4 space-y-3">
                                            {/* Description Section */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Item Description
                                                </Label>
                                                <Input
                                                    placeholder="Item name (e.g. AWS Infrastructure DevOps)"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <Textarea
                                                    placeholder="Additional details (optional)"
                                                    rows={1}
                                                    className="min-h-[32px] text-xs resize-none"
                                                    value={item.detail}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "detail",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            {/* Quantity, Unit, Rate, Total in 2x2 grid */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Quantity
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateLineItem(
                                                                item.id,
                                                                "quantity",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Unit
                                                    </Label>
                                                    <Select
                                                        value={item.unit}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateLineItem(
                                                                item.id,
                                                                "unit",
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="hours">
                                                                Hours
                                                            </SelectItem>
                                                            <SelectItem value="days">
                                                                Days
                                                            </SelectItem>
                                                            <SelectItem value="months">
                                                                Months
                                                            </SelectItem>
                                                            <SelectItem value="items">
                                                                Items
                                                            </SelectItem>
                                                            <SelectItem value="fixed">
                                                                Fixed
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Rate
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={
                                                            item.unitPrice || ""
                                                        }
                                                        onChange={(e) =>
                                                            updateLineItem(
                                                                item.id,
                                                                "unitPrice",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Total
                                                    </Label>
                                                    <div className="flex items-center h-10 px-3 py-2 bg-muted rounded-md text-sm font-medium">
                                                        {(
                                                            item.quantity *
                                                            item.unitPrice
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <div className="flex justify-end pt-2 border-t border-border">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                                                    onClick={() =>
                                                        removeLineItem(item.id)
                                                    }
                                                    disabled={
                                                        lineItems.length <= 1
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove Item
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mobile Layout - Small screens only */}
                                        <div className="block sm:hidden border border-border rounded-lg p-4 space-y-4">
                                            {/* Description Section */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Item Description
                                                </Label>
                                                <Input
                                                    placeholder="Item name (e.g. AWS Infrastructure DevOps)"
                                                    value={item.description}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "description",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <Textarea
                                                    placeholder="Additional details (optional)"
                                                    rows={2}
                                                    className="text-xs resize-none"
                                                    value={item.detail}
                                                    onChange={(e) =>
                                                        updateLineItem(
                                                            item.id,
                                                            "detail",
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                            </div>

                                            {/* Quantity & Unit Section */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Quantity
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateLineItem(
                                                                item.id,
                                                                "quantity",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Unit
                                                    </Label>
                                                    <Select
                                                        value={item.unit}
                                                        onValueChange={(
                                                            value,
                                                        ) =>
                                                            updateLineItem(
                                                                item.id,
                                                                "unit",
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="hours">
                                                                Hours
                                                            </SelectItem>
                                                            <SelectItem value="days">
                                                                Days
                                                            </SelectItem>
                                                            <SelectItem value="months">
                                                                Months
                                                            </SelectItem>
                                                            <SelectItem value="items">
                                                                Items
                                                            </SelectItem>
                                                            <SelectItem value="fixed">
                                                                Fixed
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {/* Rate & Total Section */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Rate
                                                    </Label>
                                                    <Input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={
                                                            item.unitPrice || ""
                                                        }
                                                        onChange={(e) =>
                                                            updateLineItem(
                                                                item.id,
                                                                "unitPrice",
                                                                Number(
                                                                    e.target
                                                                        .value,
                                                                ),
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">
                                                        Total
                                                    </Label>
                                                    <div className="flex items-center h-10 px-3 py-2 bg-muted rounded-md text-sm font-medium">
                                                        {(
                                                            item.quantity *
                                                            item.unitPrice
                                                        ).toFixed(2)}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <div className="flex justify-end pt-2 border-t border-border">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
                                                    onClick={() =>
                                                        removeLineItem(item.id)
                                                    }
                                                    disabled={
                                                        lineItems.length <= 1
                                                    }
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove Item
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Separator />

                                {/* Totals Section */}
                                <div className="flex justify-end lg:pr-14">
                                    <div className="text-right space-y-1 w-full sm:w-auto">
                                        <div className="flex justify-between gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                Subtotal
                                            </span>
                                            <span>{subtotal.toFixed(2)}</span>
                                        </div>
                                        {(template.taxRate || 0) > 0 && (
                                            <div className="flex justify-between gap-4 text-sm">
                                                <span className="text-muted-foreground">
                                                    Tax ({template.taxRate}%)
                                                </span>
                                                <span>{tax.toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between gap-4 text-base font-semibold border-t border-border pt-1">
                                            <span>Total</span>
                                            <span>{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-2">
                                <Label htmlFor="invoiceNotes">
                                    Additional Notes
                                </Label>
                                <Textarea
                                    id="invoiceNotes"
                                    placeholder="Any additional notes for this invoice..."
                                    rows={2}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col xl:flex-row justify-end gap-2 xl:gap-3">
                    <Button
                        onClick={() => setFeedbackDialogOpen(true)}
                        size="lg"
                        variant="ghost"
                        className="gap-2 text-muted-foreground w-full xl:w-auto"
                    >
                        <MessageSquare className="h-4 w-4" />
                        <span className="xl:inline">Send Feedback</span>
                    </Button>
                    <Button
                        onClick={handlePreviewPdf}
                        size="lg"
                        variant="outline"
                        disabled={!canGenerate}
                        className="gap-2 w-full xl:w-auto text-muted-foreground"
                    >
                        <Eye className="h-4 w-4" />
                        <span className="xl:inline">Preview PDF</span>
                    </Button>
                    <Button
                        onClick={handleGenerate}
                        size="lg"
                        disabled={!canGenerate}
                        className="gap-2 w-full xl:w-auto"
                    >
                        <FileText className="h-4 w-4" />
                        <span className="xl:inline">Generate Invoice</span>
                    </Button>
                </div>
            </div>

            {/* Right: Live Preview */}
            <div className="hidden lg:block">
                <div className="sticky top-24 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Live Preview
                    </p>
                    <InvoicePreview
                        template={template}
                        invoiceNumber={invoiceNumber}
                        issueDate={issueDate}
                        dueDate={dueDate}
                        clientName={template.clientName}
                        clientEmail={template.clientEmail}
                        clientAddress={template.clientAddress}
                        lineItems={lineItems}
                        notes={notes}
                        currency={template.currency}
                    />
                </div>
            </div>

            {/* Feedback Dialog */}
            <Dialog
                open={feedbackDialogOpen}
                onOpenChange={setFeedbackDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Send Feedback</DialogTitle>
                        <DialogDescription>
                            Have a suggestion or need something? Let us know how
                            we can improve your invoicing experience.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="feedback">Your feedback</Label>
                            <Textarea
                                id="feedback"
                                placeholder="e.g., I need a field for purchase order numbers, or it would be great to add discounts..."
                                rows={5}
                                value={feedbackMessage}
                                onChange={(e) =>
                                    setFeedbackMessage(e.target.value)
                                }
                                disabled={submittingFeedback}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setFeedbackDialogOpen(false)}
                            disabled={submittingFeedback}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitFeedback}
                            disabled={
                                submittingFeedback || !feedbackMessage.trim()
                            }
                        >
                            {submittingFeedback
                                ? "Sending..."
                                : "Send Feedback"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default GenerateTab;
