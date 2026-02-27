const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          Terms of Service
        </h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Acceptance of Terms</h2>
            <p>
              By accessing and using Simple Invoice Service (SIS), you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Service</h2>
            <p>
              SIS provides a free invoice generation tool. You may use this service to create, preview, and download 
              invoices for legitimate business purposes. You agree not to use the service for any unlawful or 
              prohibited activities.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and for all activities that 
              occur under your account. You agree to ensure that all information you provide is accurate and current.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by SIS and are protected 
              by international copyright, trademark, and other intellectual property laws. The invoices you create 
              remain your property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p>
              SIS is provided "as is" without warranties of any kind. We shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of or inability to 
              use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Modifications</h2>
            <p>
              We reserve the right to modify or discontinue the service at any time without notice. We shall not 
              be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. We will notify users of any material changes 
              by posting the new terms on this page. Your continued use of the service after such changes constitutes 
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us through the feedback form 
              in the application.
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

export default Terms;
