import { Link } from "react-router-dom";
import {
    ShieldCheck,
    ListFilter,
    Eye,
    Download,
    ChevronDown,
    Shield,
    EyeOff,
    Database,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";

const faqData = [
    {
        q: "Is it really free?",
        a: "Yes, 100% free. No hidden fees, no premium tiers, no credit card required. Create unlimited invoices forever.",
    },
    {
        q: "Do I need to create an account?",
        a: "Yes, a simple email-based account helps us save your templates and invoice history securely. No password needed - we use magic link authentication.",
    },
    {
        q: "Is my data secure?",
        a: "Absolutely. Your data is encrypted and stored securely in AWS. We follow industry best practices and never share your information with third parties.",
    },
    {
        q: "Can I customize my invoices?",
        a: "Yes! You can customize your company details, client information, payment terms, and add your own notes to each invoice.",
    },
];

const Index = () => {
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        // Add FAQ structured data for SEO
        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqData.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: faq.a,
                },
            })),
        };

        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.text = JSON.stringify(faqSchema);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        // Hide scroll indicator when user scrolls
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setShowScrollIndicator(false);
            } else {
                setShowScrollIndicator(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Hero Section */}
            <main className="relative flex-1 flex flex-col min-h-screen items-center justify-center px-6 pt-16 pb-20">
                {/* Tagline */}
                <p className="text-sm text-muted-foreground/60 mb-8 tracking-wide">
                    Do one thing. Do it well.
                </p>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground text-center leading-tight mb-5">
                    Make invoices.
                    <br />
                    Nothing else.
                </h1>

                {/* Subtext */}
                <p className="text-lg text-muted-foreground text-center leading-relaxed max-w-md mb-12">
                    A OneThing tool to build, preview and
                    <br />
                    download invoices as PDFs.
                </p>

                {/* CTA Button */}
                {isAuthenticated ? (
                    <Link
                        to="/workspace"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-16 py-5 text-base font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all mb-5"
                    >
                        Go to Workspace
                    </Link>
                ) : (
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-16 py-5 text-base font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all mb-5"
                    >
                        Create Invoice Now
                    </Link>
                )}

                {/* Trust badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-5 py-2.5 mb-3">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                        No credit card, no account, no strings attached
                    </span>
                </div>

                {/* Scroll Indicator */}
                {showScrollIndicator && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-opacity duration-500 opacity-70 hover:opacity-100">
                        <span className="text-sm font-medium text-muted-foreground tracking-wide">
                            Scroll to learn more
                        </span>
                        <div className="relative flex flex-col items-center">
                            <ChevronDown className="h-6 w-6 text-primary animate-bounce" />
                            <ChevronDown
                                className="h-6 w-6 text-primary/40 absolute top-2 animate-bounce"
                                style={{ animationDelay: "150ms" }}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Three Steps */}
            <section className="pb-24 pt-8 px-6">
                <div className="container max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-12">
                        Three steps. That's it.
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
                        {[
                            {
                                icon: ListFilter,
                                title: "Enter Details",
                                desc: "Fill in your items. We handle all formatting and math.",
                            },
                            {
                                icon: Eye,
                                title: "Preview",
                                desc: "See your professional PDF live as you type.",
                            },
                            {
                                icon: Download,
                                title: "Download",
                                desc: "Get your PDF instantly. No email gates, no waits.",
                            },
                        ].map((step, i) => (
                            <div
                                key={i}
                                className="flex flex-col items-center gap-3"
                            >
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-1">
                                    <step.icon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground">
                                    {i + 1}. {step.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust & Security Section */}
            <section className="pb-24 px-6 bg-muted/30">
                <div className="container max-w-4xl mx-auto py-16">
                    <h2 className="text-3xl font-bold text-center text-foreground mb-4">
                        Your Security & Privacy Guaranteed
                    </h2>
                    <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                        We take your data seriously. Here's exactly how we
                        protect your information and respect your privacy.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex flex-col p-6 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500/10 mb-4">
                                <Shield className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-3">
                                Bank-Level Encryption
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                All data is encrypted in transit (TLS 1.3) and
                                at rest (AES-256). Same security standards used
                                by financial institutions.
                            </p>
                        </div>
                        <div className="flex flex-col p-6 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/10 mb-4">
                                <EyeOff className="h-6 w-6 text-purple-600" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-3">
                                Zero Tracking
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                No analytics, no cookies, no tracking pixels. We
                                don't monitor your behavior or sell your data to
                                third parties.
                            </p>
                        </div>
                        <div className="flex flex-col p-6 bg-background rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 mb-4">
                                <Database className="h-6 w-6 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-foreground mb-3">
                                Your Data, Your Control
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You own your data. Export or delete your
                                invoices anytime. No lock-in, no hidden
                                retention policies.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="pb-24 pt-16 px-6">
                <div className="container max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-foreground mb-12">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {faqData.map((faq, i) => (
                            <div
                                key={i}
                                className="border-b border-border pb-6 last:border-0"
                            >
                                <h3 className="font-semibold text-foreground mb-2">
                                    {faq.q}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-10 text-center">
                        <Link
                            to="/about"
                            className="text-sm text-primary hover:underline"
                        >
                            Have more questions? Learn more about OneThing
                            Invoice →
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
