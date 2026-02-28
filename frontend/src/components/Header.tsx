import { useState, useEffect } from "react";
import { MessageSquare, TrendingUp } from "lucide-react";
import SISLogo from "./SISLogo";
import FeedbackDialog from "./FeedbackDialog";
import { useLocation } from "react-router-dom";
import { usageApi, type UsageStats } from "@/lib/api-client";
import { Badge } from "./ui/badge";

const Header = () => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === "/workspace") {
            const loadUsage = () => {
                usageApi
                    .get()
                    .then(setUsage)
                    .catch((err) => console.error("Failed to load usage:", err));
            };

            // Load initially
            loadUsage();

            // Reload when invoice is generated
            const handleInvoiceGenerated = () => loadUsage();
            window.addEventListener('invoice-generated', handleInvoiceGenerated);

            return () => {
                window.removeEventListener('invoice-generated', handleInvoiceGenerated);
            };
        }
    }, [location.pathname]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
                <div className="container flex h-16 items-center justify-between">
                    <SISLogo showSubtitle />
                    <nav className="flex items-center gap-6">
                        {location.pathname === "/workspace" && (
                            <>
                                {usage && usage.invoiceCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="secondary" className="font-mono">
                                            {usage.invoiceCount} invoice{usage.invoiceCount !== 1 ? 's' : ''} generated
                                        </Badge>
                                    </div>
                                )}
                                <button
                                    onClick={() => setFeedbackOpen(true)}
                                    className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    Feedback
                                </button>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <FeedbackDialog
                open={feedbackOpen}
                onOpenChange={setFeedbackOpen}
            />
        </>
    );
};

export default Header;
