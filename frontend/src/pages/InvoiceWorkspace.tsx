import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Settings, Clock } from "lucide-react";
import TemplateTab, {
    type InvoiceTemplate,
} from "@/components/invoiceWorkspace/TemplateTab";
import { defaultTemplate } from "@/components/invoiceWorkspace/templateDefaults";
import GenerateTab, {
    type GeneratedInvoice,
} from "@/components/invoiceWorkspace/GenerateTab";
import HistoryTab from "@/components/invoiceWorkspace/HistoryTab";
import {
    loadTemplate,
    saveTemplate,
    loadInvoices,
    saveInvoice,
} from "@/lib/storage";
import { toast } from "sonner";
import { exportInvoicePdf } from "@/lib/exportPdf";

const InvoiceWorkSpace = () => {
    const [template, setTemplate] = useState<InvoiceTemplate>(defaultTemplate);
    const [templateSaved, setTemplateSaved] = useState(false);
    const [invoices, setInvoices] = useState<GeneratedInvoice[]>([]);
    const [activeTab, setActiveTab] = useState("generate");
    const [loading, setLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                const [loadedTemplate, loadedInvoices] = await Promise.all([
                    loadTemplate(),
                    loadInvoices(),
                ]);

                if (loadedTemplate) {
                    setTemplate(loadedTemplate);
                    setTemplateSaved(true);
                }

                if (loadedInvoices) {
                    setInvoices(loadedInvoices);
                }
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleSaveTemplate = async (t: InvoiceTemplate) => {
        try {
            await saveTemplate(t);
            setTemplate(t);
            setTemplateSaved(true);
            toast.success("Template saved successfully");
        } catch (error) {
            console.error("Error saving template:", error);
            toast.error("Failed to save template");
        }
    };

    const handleGenerate = async (invoice: GeneratedInvoice) => {
        try {
            await saveInvoice(invoice);
            setInvoices((prev) => [invoice, ...prev]);
            await exportInvoicePdf(invoice);
            toast.success("Invoice generated successfully");
            
            // Trigger usage refresh by dispatching a custom event
            window.dispatchEvent(new CustomEvent('invoice-generated'));
        } catch (error) {
            console.error("Error generating invoice:", error);
            toast.error("Failed to generate invoice");
        }
    };

    const nextInvoiceNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <main className="container py-10">
                    <div className="flex items-center justify-center py-16">
                        <p className="text-muted-foreground">Loading...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <main className="container py-10">
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="w-full h-14 rounded-xl bg-muted/60 p-1.5 gap-1">
                        <TabsTrigger
                            value="generate"
                            className="flex-1 h-full rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                        >
                            <FileText className="h-4 w-4" />
                            Generate
                        </TabsTrigger>
                        <TabsTrigger
                            value="template"
                            className="flex-1 h-full rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                        >
                            <Settings className="h-4 w-4" />
                            Template
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="flex-1 h-full rounded-lg text-sm font-medium gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm"
                        >
                            <Clock className="h-4 w-4" />
                            History
                            {invoices.length > 0 && (
                                <span className="ml-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                                    {invoices.length}
                                </span>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generate" className="mt-6">
                        <GenerateTab
                            template={template}
                            templateReady={templateSaved}
                            onGenerate={handleGenerate}
                            nextInvoiceNumber={nextInvoiceNumber}
                        />
                    </TabsContent>

                    <TabsContent value="template" className="mt-6">
                        <TemplateTab
                            template={template}
                            onSave={handleSaveTemplate}
                        />
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <HistoryTab invoices={invoices} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default InvoiceWorkSpace;
