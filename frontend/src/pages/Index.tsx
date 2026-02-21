import { Link } from "react-router-dom";
import Header from "@/components/Header";
import SISLogo from "@/components/SISLogo";
import SISLogoIcon from "@/components/SISLogoIcon";

const Index = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            {/* Hero */}
            <section className="container flex flex-col items-center justify-center py-28 text-center">
                <div className="mb-8 animate-float">
                    <SISLogoIcon size={80} />
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-navy sm:text-6xl">
                    SIS
                </h1>
                <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground font-medium">
                    Simple Invoice Service
                </p>
                <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
                    Modern invoicing for modern teams. Create, send, and track
                    invoices in seconds — beautifully.
                </p>
                <div className="mt-10 flex gap-4">
                    <Link
                        to="/login"
                        className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        Start Free
                    </Link>
                    <button className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                        Learn More
                    </button>
                </div>
            </section>

            {/* Feature cards */}
            <section className="container pb-24">
                <div className="grid gap-6 sm:grid-cols-3">
                    {[
                        {
                            title: "Lightning Fast",
                            desc: "Generate professional invoices in under 30 seconds.",
                        },
                        {
                            title: "Bank-Grade Security",
                            desc: "Your financial data is encrypted end-to-end.",
                        },
                        {
                            title: "Smart Tracking",
                            desc: "Real-time status updates and payment reminders.",
                        },
                    ].map((f) => (
                        <div
                            key={f.title}
                            className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-shadow"
                        >
                            <h3 className="text-lg font-semibold text-foreground">
                                {f.title}
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="container flex items-center justify-between">
                    <SISLogo size="small" />
                    <p className="text-xs text-muted-foreground">
                        © 2026 SIS. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default Index;
