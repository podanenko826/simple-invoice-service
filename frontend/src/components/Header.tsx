import { useState, useEffect } from "react";
import { MessageSquare, TrendingUp, LogOut, Menu, X } from "lucide-react";
import SISLogo from "./SISLogo";
import FeedbackDialog from "./FeedbackDialog";
import { ThemeToggle } from "./ThemeToggle";
import { useLocation, useNavigate } from "react-router-dom";
import { usageApi, type UsageStats } from "@/lib/api-client";
import { Badge } from "./ui/badge";
import { useAuth } from "@/lib/auth/AuthContext";
import { Button } from "./ui/button";

const Header = () => {
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [usage, setUsage] = useState<UsageStats | null>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { signOut, isAuthenticated } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        navigate("/");
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        if (location.pathname === "/workspace") {
            const loadUsage = () => {
                usageApi
                    .get()
                    .then(setUsage)
                    .catch((err) =>
                        console.error("Failed to load usage:", err),
                    );
            };

            // Load initially
            loadUsage();

            // Reload when invoice is generated
            const handleInvoiceGenerated = () => loadUsage();
            window.addEventListener(
                "invoice-generated",
                handleInvoiceGenerated,
            );

            return () => {
                window.removeEventListener(
                    "invoice-generated",
                    handleInvoiceGenerated,
                );
            };
        }
    }, [location.pathname]);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-card backdrop-blur-sm">
                <div className="container flex h-16 items-center justify-between">
                    <SISLogo showSubtitle />

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        {location.pathname === "/workspace" && (
                            <>
                                {usage && usage.invoiceCount > 0 && (
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        <Badge
                                            variant="secondary"
                                            className="font-mono"
                                        >
                                            {usage.invoiceCount} invoice
                                            {usage.invoiceCount !== 1
                                                ? "s"
                                                : ""}{" "}
                                            generated
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
                        <ThemeToggle />
                        {isAuthenticated && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="gap-1.5 text-muted-foreground"
                            >
                                <LogOut className="h-4 w-4" />
                                Sign out
                            </Button>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-border bg-card">
                        <nav className="container py-4 space-y-3">
                            {location.pathname === "/workspace" && (
                                <>
                                    {usage && usage.invoiceCount > 0 && (
                                        <div className="flex items-center gap-2 px-3 py-2">
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                            <Badge
                                                variant="secondary"
                                                className="font-mono"
                                            >
                                                {usage.invoiceCount} invoice
                                                {usage.invoiceCount !== 1
                                                    ? "s"
                                                    : ""}{" "}
                                                generated
                                            </Badge>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => {
                                            setFeedbackOpen(true);
                                            setMobileMenuOpen(false);
                                        }}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Send Feedback
                                    </button>
                                </>
                            )}
                            {isAuthenticated && (
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </button>
                            )}
                        </nav>
                    </div>
                )}
            </header>
            <FeedbackDialog
                open={feedbackOpen}
                onOpenChange={setFeedbackOpen}
            />
        </>
    );
};

export default Header;
