import { Link } from "react-router-dom";
import {
    ArrowRight,
    FileText,
    ClipboardList,
    Download,
    Check,
} from "lucide-react";
import Header from "@/components/Header";

const steps = [
    {
        num: "01",
        icon: FileText,
        title: "Create your template",
        desc: "Add your company and client details once.",
    },
    {
        num: "02",
        icon: ClipboardList,
        title: "Add items",
        desc: "Enter services, quantities, taxes, or discounts.",
    },
    {
        num: "03",
        icon: Download,
        title: "Generate PDF",
        desc: "Download instantly and send anywhere.",
    },
];

const bullets = [
    "No passwords",
    "No subscription",
    "No complex setup",
    "Secure magic link login",
];

const HowItWorks = () => {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            {/* Hero */}
            <section className="flex flex-col items-center text-center px-6 pt-24 pb-16">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                    How SIS works
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Create invoices in three simple steps.
                </p>
            </section>

            {/* Steps */}
            <section className="max-w-xl mx-auto w-full px-6 py-16 flex flex-col gap-14">
                {steps.map((step) => (
                    <div key={step.num} className="flex gap-5">
                        <div className="flex flex-col items-center">
                            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                <step.icon className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                        <div>
                            <span className="text-xs font-medium text-muted-foreground tracking-wider uppercase">
                                Step {step.num}
                            </span>
                            <h3 className="mt-1 text-lg font-semibold text-foreground">
                                {step.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                                {step.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </section>

            {/* Why it's simple */}
            <section className="max-w-xl mx-auto w-full px-6 py-16">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Why it's simple
                </h2>
                <ul className="mt-6 flex flex-col gap-3">
                    {bullets.map((item) => (
                        <li
                            key={item}
                            className="flex items-center gap-3 text-sm text-muted-foreground"
                        >
                            <Check className="h-4 w-4 text-primary shrink-0" />
                            {item}
                        </li>
                    ))}
                </ul>
            </section>

            {/* Final CTA */}
            <section className="flex flex-col items-center text-center px-6 pt-16 pb-24">
                <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Invoices, made simple.
                </h2>
                <Link
                    to="/dashboard"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 transition-all"
                >
                    Start Creating
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </section>
        </div>
    );
};

export default HowItWorks;
