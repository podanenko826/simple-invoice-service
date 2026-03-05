import { Link } from "react-router-dom";
import SISLogoIcon from "@/components/SISLogoIcon";
import { Mail, ListFilter, Eye, Download } from "lucide-react";

const CheckEmail = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/60 bg-card/80 backdrop-blur-md">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <SISLogoIcon size={28} />
            <span className="text-lg font-bold tracking-[0.15em] text-foreground">SIS</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-20">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-light/20 mb-8">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground text-center">
          Check your email
        </h1>

        <p className="mt-5 max-w-md text-center text-muted-foreground text-lg leading-relaxed">
          We sent a magic link to your email address.<br />
          Click the link to log in instantly.
        </p>

        <button className="mt-8 text-sm font-semibold text-primary hover:underline underline-offset-4 transition-colors">
          Didn't receive it? Resend link
        </button>
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

export default CheckEmail;
