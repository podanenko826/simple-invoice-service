import { Link } from "react-router-dom";
import { Mail, MessageCircle, HelpCircle, ArrowLeft } from "lucide-react";

const Support = () => {
    return (
        <div className="min-h-screen container bg-background flex flex-col">
            {/* Header with back button */}
            <div className="px-6 pt-8 pb-4">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                </Link>
            </div>

            {/* Main Content */}
            <main className="flex-1 px-6 pb-24">
                <div className="container max-w-2xl mx-auto text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        Need Help?
                    </h1>
                    <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
                        We're here to help. Reach out if you have questions,
                        encounter issues, or need assistance with your invoices.
                    </p>

                    {/* Contact Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-1 gap-6 mb-16">
                        <div className="flex flex-col items-center p-6 bg-card rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                                <Mail className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">
                                Email Support
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Get help via email
                            </p>
                            <a
                                href="mailto:contact@makeinvoices.app"
                                className="text-sm text-primary hover:underline font-medium"
                            >
                                contact@makeinvoices.app
                            </a>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div className="bg-muted/30 rounded-xl p-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">
                            Common Questions
                        </h2>
                        <div className="text-left space-y-4">
                            <div>
                                <h3 className="font-medium text-foreground mb-1">
                                    How quickly do you respond?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    We typically respond to emails within 24
                                    hours during business days.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">
                                    What information should I include?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Please describe your issue in detail,
                                    including any error messages and steps to
                                    reproduce the problem.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">
                                    Is support really free?
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Yes! Support is completely free, just like
                                    our invoice tool.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Support;
