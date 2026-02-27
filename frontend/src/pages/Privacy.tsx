const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            <p>
              When you use Simple Invoice Service (SIS), we collect minimal information necessary to provide our service. 
              This includes your email address for authentication and any invoice data you create.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p>
              We use your information solely to provide and improve our invoice generation service. Your email is used 
              for authentication via magic links. Your invoice data is stored securely and is only accessible by you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Storage and Security</h2>
            <p>
              All data is stored securely using industry-standard encryption. We implement appropriate technical and 
              organizational measures to protect your personal information against unauthorized access, alteration, 
              disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share information only 
              when required by law or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights</h2>
            <p>
              You have the right to access, correct, or delete your personal information at any time. You can manage 
              your data through your account settings or contact us directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us through the feedback form in the application.
            </p>
          </section>

          <p className="text-sm mt-8">
            Last updated: February 27, 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
