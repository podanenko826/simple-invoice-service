import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Loader2, Eye } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { GeneratedInvoice } from "./GenerateTab";
import { exportInvoicePdf, previewInvoicePdf } from "@/lib/exportPdf";
import { toast } from "sonner";

interface HistoryTabProps {
    invoices: GeneratedInvoice[];
}

const HistoryTab = ({ invoices }: HistoryTabProps) => {
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [previewingId, setPreviewingId] = useState<string | null>(null);

    const handleExport = async (invoice: GeneratedInvoice) => {
        setExportingId(invoice.id);
        try {
            await exportInvoicePdf(invoice);
            toast.success(`${invoice.invoiceNumber}.pdf downloaded`);
        } catch {
            toast.error("Failed to export PDF");
        } finally {
            setExportingId(null);
        }
    };

    const handlePreview = async (invoice: GeneratedInvoice) => {
        setPreviewingId(invoice.id);
        try {
            await previewInvoicePdf(invoice);
        } catch {
            toast.error("Failed to preview PDF");
        } finally {
            setPreviewingId(null);
        }
    };

    if (invoices.length === 0) {
        return (
            <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
                    <p className="text-lg font-medium text-foreground">
                        No invoices yet
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground max-w-md">
                        Generated invoices will appear here. Go to the Generate
                        tab to create your first invoice.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice #</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[120px]" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                    {invoice.invoiceNumber}
                                </TableCell>
                                <TableCell>
                                    {invoice.clientName || "—"}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                    {new Date(
                                        invoice.createdAt,
                                    ).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {invoice.total.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={
                                                previewingId === invoice.id
                                            }
                                            onClick={() =>
                                                handlePreview(invoice)
                                            }
                                            title="Preview PDF"
                                        >
                                            {previewingId === invoice.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            disabled={
                                                exportingId === invoice.id
                                            }
                                            onClick={() =>
                                                handleExport(invoice)
                                            }
                                            title="Download PDF"
                                        >
                                            {exportingId === invoice.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Download className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default HistoryTab;
