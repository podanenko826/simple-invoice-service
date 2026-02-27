import { Mail, Github, Linkedin, Twitter } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          About SIS
        </h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Who I Am</h2>
            <p className="leading-relaxed">
              Hi! I'm [Your Name], a [your role/profession] passionate about building simple, 
              useful tools that solve real problems. I believe great software should be accessible 
              to everyone, which is why SIS is completely free to use.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why I Built SIS</h2>
            <p className="leading-relaxed mb-4">
              As a freelancer/consultant, I found myself spending too much time formatting invoices 
              every month. Most invoice tools were either too complex, required subscriptions, or 
              locked features behind paywalls.
            </p>
            <p className="leading-relaxed">
              I wanted something simple: fill in your details once, generate professional PDFs 
              instantly, no account required. So I built SIS - a tool that does one thing really 
              well, and does it for free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Get in Touch</h2>
            <p className="leading-relaxed mb-6">
              I'd love to hear from you! Whether you have feedback, found a bug, or just want to 
              say hi, feel free to reach out.
            </p>
            
            <div className="flex flex-col gap-3">
              <a 
                href="mailto:your.email@example.com" 
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>your.email@example.com</span>
              </a>
              
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>github.com/yourusername</span>
              </a>
              
              <a 
                href="https://www.linkedin.com/in/ivan-yalovets-524280217/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
                <span>linkedin.com/ivan_yalovets</span>
              </a>
              
              <a 
                href="https://twitter.com/yourhandle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Twitter className="h-5 w-5" />
                <span>@yourhandle</span>
              </a>
            </div>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-sm">
              SIS is built with React, TypeScript, and AWS. It's a passion project made with care, 
              and will always remain free to use.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
