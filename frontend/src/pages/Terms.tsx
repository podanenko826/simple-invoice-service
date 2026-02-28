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
              By accessing and using OneThing Invoice, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Use of Service</h2>
            <p className="mb-3">
              OneThing Invoice provides a free invoice generation tool. You may use this service to create, 
              preview, and download invoices for legitimate business purposes.
            </p>
            <p>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the service for any unlawful or prohibited activities</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Use the service to transmit malicious code or spam</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the service or servers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">User Responsibilities</h2>
            <p className="mb-3">
              You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Maintaining the confidentiality of your account access</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring all information you provide is accurate and current</li>
              <li>The content of invoices you create</li>
              <li>Compliance with applicable tax and business regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Content</h2>
            <p className="mb-3">
              The invoices and data you create remain your property. By using our service, you grant us 
              permission to store and process your data solely for the purpose of providing the service.
            </p>
            <p>
              We do not claim ownership of your content. You retain all rights to your invoices and data.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Service Availability</h2>
            <p className="mb-3">
              We strive to provide reliable service, but we do not guarantee:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Uninterrupted or error-free operation</li>
              <li>That defects will be corrected</li>
              <li>That the service is free of viruses or harmful components</li>
            </ul>
            <p className="mt-3">
              We reserve the right to modify, suspend, or discontinue the service at any time, with or 
              without notice. We are not liable for any modification, suspension, or discontinuance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Free Service</h2>
            <p>
              OneThing Invoice is provided free of charge. We reserve the right to introduce paid features 
              in the future, but the core invoice generation functionality will always remain free. 
              Any future paid features will be clearly marked and entirely optional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Limitation of Liability</h2>
            <p className="mb-3">
              OneThing Invoice is provided "as is" without warranties of any kind, either express or implied. 
              To the fullest extent permitted by law:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>We are not liable for any loss of profits, revenue, data, or business opportunities</li>
              <li>Our total liability shall not exceed the amount you paid us (which is zero for free users)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are owned by OneThing and 
              are protected by international copyright, trademark, and other intellectual property laws. 
              You may not copy, modify, distribute, or reverse engineer any part of our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Termination</h2>
            <p>
              We may terminate or suspend your access immediately, without prior notice, for any reason, 
              including breach of these terms. Upon termination, your right to use the service will cease 
              immediately. You may delete your account at any time through your account settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to Terms</h2>
            <p>
              We reserve the right to update these terms at any time. We will notify users of material 
              changes by posting the new terms on this page and updating the "Last updated" date. 
              Your continued use of the service after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with applicable laws, 
              without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at 
              contact@makeinvoices.app or through the feedback form in the application.
            </p>
          </section>

          <p className="text-sm mt-8 pt-8 border-t border-border">
            Last updated: February 28, 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
