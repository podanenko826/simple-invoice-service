import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 flex items-center justify-center px-6">
                <div className="flex flex-col items-center text-center max-w-lg">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Invoices, made simple.
                    </h1>

                    <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                        Create and download invoices in seconds.
                        <br />
                        No passwords. No subscription.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all"
                        >
                            Get Started
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <Link
                            to="/how-it-works"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-7 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                            How it works
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;
