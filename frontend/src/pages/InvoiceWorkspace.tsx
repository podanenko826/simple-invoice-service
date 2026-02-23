import { useState } from "react";
import Header from "@/components/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Settings, Clock } from "lucide-react";
import TemplateTab, {
    defaultTemplate,
    type InvoiceTemplate,
} from "@/components/invoiceWorkspace/TemplateTab";
import GenerateTab, {
    type GeneratedInvoice,
} from "@/components/invoiceWorkspace/GenerateTab";
import HistoryTab from "@/components/invoiceWorkspace/HistoryTab";

const InvoiceWorkSpace = () => {
    const [template, setTemplate] = useState<InvoiceTemplate>(defaultTemplate);
    const [templateSaved, setTemplateSaved] = useState(false);
    const [invoices, setInvoices] = useState<GeneratedInvoice[]>([]);
    const [activeTab, setActiveTab] = useState("generate");

    const handleSaveTemplate = (t: InvoiceTemplate) => {
        setTemplate(t);
        setTemplateSaved(true);
    };

    const handleGenerate = (invoice: GeneratedInvoice) => {
        setInvoices((prev) => [invoice, ...prev]);
        setActiveTab("history");
    };

    const nextInvoiceNumber = `INV-${String(invoices.length + 1).padStart(4, "0")}`;

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container py-10 max-w-6xl">
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
