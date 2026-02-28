import { Mail, Linkedin } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          About SIS
        </h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Who We Are</h2>
            <p className="leading-relaxed">
              SIS (Simple Invoice Service) is a passion project built to solve a real problem: 
              creating professional invoices shouldn't require expensive software or complicated tools. 
              We believe great software should be accessible to everyone, which is why SIS is completely 
              free to use - no hidden fees, no premium tiers, no credit card required.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why We Built SIS</h2>
            <p className="leading-relaxed mb-4">
              As freelancers and consultants ourselves, we found ourselves spending too much time 
              formatting invoices every month. Most invoice tools were either too complex, required 
              expensive subscriptions, or locked essential features behind paywalls.
            </p>
            <p className="leading-relaxed">
              We wanted something simple: save your details once, generate professional PDFs 
              instantly, with secure cloud storage. So we built SIS - a tool that does one thing 
              really well, and does it for free, forever.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
            <p className="leading-relaxed mb-6">
              We'd love to hear from you! Whether you have feedback, found a bug, or just want to 
              say hi, feel free to reach out.
            </p>
            
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:support@makeinvoices.app" 
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>support@makeinvoices.app</span>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/ivan-yalovets-524280217/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>Connect on LinkedIn</span>
              </a>
            </div>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">
              SIS is built with React, TypeScript, and AWS. It's designed with security and privacy 
              in mind, using industry-standard encryption and authentication. Your data is yours, 
              and will always remain free to use.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
