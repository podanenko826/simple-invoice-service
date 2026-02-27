import { Link } from "react-router-dom";
import SISLogoIcon from "@/components/SISLogoIcon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, ListFilter, Eye, Download } from "lucide-react";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero / Login */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-20">
        <SISLogoIcon size={96} className="mb-4" />

        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl">
          SIS
        </h1>
        <p className="mt-2 text-sm uppercase tracking-[0.22em] text-muted-foreground font-medium">
          Simple Invoice Service
        </p>

        <p className="mt-8 max-w-md text-center text-muted-foreground text-lg leading-relaxed">
          Fill your invoice template once.<br />
          Generate monthly invoices in seconds.
        </p>

        {/* Form */}
        <div className="mt-10 w-full max-w-sm space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 rounded-lg border-border bg-card text-sm"
          />
          <Button className="w-full h-12 rounded-lg text-sm font-semibold gap-2">
            Log in with Email
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex items-center gap-2 text-muted-foreground text-xs">
          <Mail className="h-3.5 w-3.5" />
          <span>We'll send you a magic link — no password needed</span>
        </div>
      </main>

      {/* Three Steps */}
      <section className="pb-24 pt-8 px-6">
        <div className="container max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-12 text-center">
          {[
            { icon: ListFilter, title: "Enter Details", desc: "Fill in your items. We handle all formatting and math automatically." },
            { icon: Eye, title: "Preview", desc: "See your professional PDF live as you type. Real-time accuracy." },
            { icon: Download, title: "Download", desc: "Get your PDF instantly. No email gates, no waits, no accounts." },
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted mb-1">
                <step.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-sm font-bold text-primary">
                {i + 1}. {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Login;
