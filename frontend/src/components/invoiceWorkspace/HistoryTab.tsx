import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Download, Loader2, Eye, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { GeneratedInvoice } from "./GenerateTab";
import { exportInvoicePdf, previewInvoicePdf } from "@/lib/exportPdf";
import { toast } from "sonner";

interface HistoryTabProps {
    invoices: GeneratedInvoice[];
    onDelete?: (invoiceId: string) => void;
    onBatchDelete?: (invoiceIds: string[]) => void;
}

const ITEMS_PER_PAGE = 10;

const HistoryTab = ({ invoices, onDelete, onBatchDelete }: HistoryTabProps) => {
    const [exportingId, setExportingId] = useState<string | null>(null);
    const [previewingId, setPreviewingId] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState<GeneratedInvoice | null>(null);
    const [selectedInvoices, setSelectedInvoices] = useState<Set<string>>(new Set());
    const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = Math.ceil(invoices.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentInvoices = invoices.slice(startIndex, endIndex);

    // Reset to page 1 when invoices change (e.g., after deletion)
    const handleInvoicesChange = () => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    };

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

    const handleDeleteClick = (invoice: GeneratedInvoice) => {
        setInvoiceToDelete(invoice);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (invoiceToDelete && onDelete) {
            onDelete(invoiceToDelete.id);
            setDeleteDialogOpen(false);
            setInvoiceToDelete(null);
            handleInvoicesChange();
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            // Only select invoices on current page
            setSelectedInvoices(new Set(currentInvoices.map((inv) => inv.id)));
        } else {
            setSelectedInvoices(new Set());
        }
    };

    const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
        const newSelected = new Set(selectedInvoices);
        if (checked) {
            newSelected.add(invoiceId);
        } else {
            newSelected.delete(invoiceId);
        }
        setSelectedInvoices(newSelected);
    };

    const handleBatchDeleteClick = () => {
        if (selectedInvoices.size > 0) {
            setBatchDeleteDialogOpen(true);
        }
    };

    const handleBatchDeleteConfirm = () => {
        if (onBatchDelete && selectedInvoices.size > 0) {
            onBatchDelete(Array.from(selectedInvoices));
            setSelectedInvoices(new Set());
            setBatchDeleteDialogOpen(false);
            handleInvoicesChange();
        }
    };

    const allCurrentPageSelected = currentInvoices.length > 0 && 
        currentInvoices.every((inv) => selectedInvoices.has(inv.id));
    const someCurrentPageSelected = currentInvoices.some((inv) => selectedInvoices.has(inv.id)) && 
        !allCurrentPageSelected;

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
        <>
            <Card>
                {selectedInvoices.size > 0 && (
                    <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/30">
                        <span className="text-sm font-medium">
                            {selectedInvoices.size} invoice{selectedInvoices.size !== 1 ? 's' : ''} selected
                        </span>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleBatchDeleteClick}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </Button>
                    </div>
                )}
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">
                                    <Checkbox
                                        checked={allCurrentPageSelected}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all on this page"
                                        className={someCurrentPageSelected ? "data-[state=checked]:bg-primary/50" : ""}
                                    />
                                </TableHead>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead className="w-[160px]" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentInvoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedInvoices.has(invoice.id)}
                                            onCheckedChange={(checked) =>
                                                handleSelectInvoice(invoice.id, checked as boolean)
                                            }
                                            aria-label={`Select ${invoice.invoiceNumber}`}
                                        />
                                    </TableCell>
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
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() =>
                                                    handleDeleteClick(invoice)
                                                }
                                                title="Delete invoice"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t">
                        <div className="text-sm text-muted-foreground">
                            Showing {startIndex + 1}-{Math.min(endIndex, invoices.length)} of {invoices.length} invoices
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="gap-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    const showPage = 
                                        page === 1 || 
                                        page === totalPages || 
                                        Math.abs(page - currentPage) <= 1;
                                    
                                    const showEllipsis = 
                                        (page === 2 && currentPage > 3) ||
                                        (page === totalPages - 1 && currentPage < totalPages - 2);

                                    if (showEllipsis) {
                                        return <span key={page} className="px-2 text-muted-foreground">...</span>;
                                    }

                                    if (!showPage) {
                                        return null;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(page)}
                                            className="w-9 h-9 p-0"
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="gap-1"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Single Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete invoice{" "}
                            <span className="font-semibold">{invoiceToDelete?.invoiceNumber}</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Batch Delete Dialog */}
            <AlertDialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Multiple Invoices</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{selectedInvoices.size} invoice{selectedInvoices.size !== 1 ? 's' : ''}</span>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBatchDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete All
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};

export default HistoryTab;
