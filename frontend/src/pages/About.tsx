import { Mail, Linkedin } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          About OneThing
        </h1>
        
        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Philosophy</h2>
            <p className="leading-relaxed mb-4">
              <strong className="text-foreground">Software should not be a project.</strong>
            </p>
            <p className="leading-relaxed mb-4">
              Most tools turn simple tasks into workflows, dashboards, and account systems. 
              We believe everyday work should stay everyday. If something takes five minutes, 
              it shouldn't require learning a platform.
            </p>
            <p className="leading-relaxed">
              OneThing Invoice is one of our focused tools. Each OneThing product exists for a 
              single purpose. Not ten features. Not endless settings. One clear job. Executed properly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">What We Believe</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">Do one thing. Do it well.</h3>
                <p className="leading-relaxed">
                  Every OneThing product exists for a single purpose. Not ten features. 
                  Not endless settings. Just one clear job, executed properly.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Simplicity is not a limitation.</h3>
                <p className="leading-relaxed">
                  Simple does not mean weak or incomplete. It means intentional. 
                  Every element must earn its place.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">No unnecessary friction.</h3>
                <p className="leading-relaxed">
                  No long onboarding. No password management. No complex setup. 
                  You open it. You use it. You're done.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Respect the user's time.</h3>
                <p className="leading-relaxed">
                  We design for speed and clarity. The tool should disappear behind the task. 
                  If you notice the interface too much, we've failed.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Focus over features.</h3>
                <p className="leading-relaxed">
                  We don't compete by adding more. We compete by removing what isn't essential. 
                  Restraint is a feature.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Tools, not platforms.</h3>
                <p className="leading-relaxed">
                  OneThing is not trying to become your workspace. Each product stands alone. 
                  No lock-in. No ecosystem pressure. Just useful tools.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-foreground mb-2">Calm by design.</h3>
                <p className="leading-relaxed">
                  No noise. No aggressive upsells. No cluttered dashboards. 
                  Clean typography. Clear actions. Nothing extra.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Why We Built This</h2>
            <p className="leading-relaxed mb-4">
              Creating professional invoices shouldn't require expensive software or complicated tools. 
              Most invoice tools were either too complex, required expensive subscriptions, or locked 
              essential features behind paywalls.
            </p>
            <p className="leading-relaxed">
              We wanted something simple: save your details once, generate professional PDFs instantly, 
              with secure cloud storage. So we built OneThing Invoice - a tool that does one thing 
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
                href="mailto:contact@makeinvoices.app" 
                className="flex items-center gap-3 text-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>contact@makeinvoices.app</span>
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
            <p className="text-sm italic text-center">
              "Focused tools for everyday work."
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
