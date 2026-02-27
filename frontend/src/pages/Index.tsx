import { Link } from "react-router-dom";
import { ShieldCheck, ListFilter, Eye, Download } from "lucide-react";
import SISLogoIcon from "@/components/SISLogoIcon";

const Index = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Hero Section */}
            <main className="flex-1 flex flex-col min-h-screen items-center justify-center px-6 pt-16 pb-20">
                {/* Logo icon large */}
                <SISLogoIcon size={96} className="mb-4" />

                {/* SIS wordmark */}
                <h2 className="text-3xl font-bold tracking-[0.25em] text-foreground mb-10">
                    SIS
                </h2>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground text-center leading-tight mb-5">
                    Make invoices.
                    <br />
                    Free to use.
                </h1>

                {/* Subtext */}
                <p className="text-lg text-muted-foreground text-center leading-relaxed max-w-md mb-12">
                    A simple tool to build, preview, and
                    <br />
                    download your invoices as PDFs.
                </p>

                {/* CTA Button */}
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl bg-primary px-16 py-5 text-base font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all mb-5"
                >
                    Create Invoice Now
                </Link>

                {/* Trust badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-5 py-2.5">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                        No credit card, no account, 100% free forever
                    </span>
                </div>
            </main>

            {/* Three Steps */}
            <section className="pb-24 pt-8 px-6">
                <div className="container max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
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
            </section>
        </div>
    );
};

export default Index;
