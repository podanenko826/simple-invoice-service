const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-8">
          Privacy Policy
        </h1>
        
        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <p className="text-lg leading-relaxed text-foreground mb-6">
              At OneThing, we believe privacy is a fundamental right. This policy explains what data we collect, 
              why we collect it, and how we protect it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Our Privacy Principles</h2>
            <div className="space-y-3">
              <p><strong className="text-foreground">Minimal Collection:</strong> We only collect what's necessary to provide the service.</p>
              <p><strong className="text-foreground">No Tracking:</strong> We don't use analytics, cookies, or tracking pixels.</p>
              <p><strong className="text-foreground">No Selling:</strong> We never sell your data to third parties.</p>
              <p><strong className="text-foreground">Your Control:</strong> You can export or delete your data anytime.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Information We Collect</h2>
            
            <h3 className="text-lg font-semibold text-foreground mb-3 mt-4">Account Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Email address:</strong> Used for authentication via magic links. We don't require passwords.</li>
              <li><strong className="text-foreground">Authentication tokens:</strong> Stored securely to keep you logged in.</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3 mt-4">Invoice Data</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Invoice templates:</strong> Your saved company and client information.</li>
              <li><strong className="text-foreground">Generated invoices:</strong> Invoice data and PDFs you create.</li>
              <li><strong className="text-foreground">Metadata:</strong> Creation dates, invoice numbers, and basic usage statistics.</li>
            </ul>

            <h3 className="text-lg font-semibold text-foreground mb-3 mt-4">Technical Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Server logs:</strong> Basic request logs for security and debugging (IP addresses, timestamps, error messages).</li>
              <li><strong className="text-foreground">No tracking:</strong> We do not use Google Analytics, Facebook Pixel, or any third-party tracking tools.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">How We Use Your Information</h2>
            <p className="mb-3">We use your information solely to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide and maintain the invoice generation service</li>
              <li>Authenticate your account via magic links</li>
              <li>Store your invoice templates and generated invoices</li>
              <li>Send you authentication emails (magic links)</li>
              <li>Respond to your support requests</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not use your data for marketing, advertising, or any purpose beyond providing the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Storage and Security</h2>
            <p className="mb-3">
              Your data is stored securely on AWS infrastructure with industry-standard security measures:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Encryption in transit:</strong> All data transmitted between your browser and our servers uses TLS 1.3 encryption.</li>
              <li><strong className="text-foreground">Encryption at rest:</strong> All stored data is encrypted using AES-256 encryption.</li>
              <li><strong className="text-foreground">Access control:</strong> Only you can access your invoice data. Our team cannot view your invoices.</li>
              <li><strong className="text-foreground">Regular backups:</strong> Your data is backed up regularly to prevent loss.</li>
              <li><strong className="text-foreground">Secure authentication:</strong> We use AWS Cognito for secure, passwordless authentication.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Sharing and Third Parties</h2>
            <p className="mb-3">
              We do not sell, trade, or rent your personal information to third parties. We only share data in these limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Service providers:</strong> AWS provides our infrastructure. They process data on our behalf under strict confidentiality agreements.</li>
              <li><strong className="text-foreground">Legal requirements:</strong> We may disclose information if required by law, court order, or government request.</li>
              <li><strong className="text-foreground">Protection of rights:</strong> We may share information to protect our rights, property, or safety, or that of our users.</li>
            </ul>
            <p className="mt-3">
              We do not integrate with advertising networks, social media platforms, or analytics services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Your Rights and Control</h2>
            <p className="mb-3">You have complete control over your data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Access:</strong> View all your invoice data through your account.</li>
              <li><strong className="text-foreground">Export:</strong> Download your invoices as PDFs anytime.</li>
              <li><strong className="text-foreground">Delete:</strong> Delete individual invoices or your entire account through account settings.</li>
              <li><strong className="text-foreground">Correct:</strong> Update your invoice templates and information anytime.</li>
              <li><strong className="text-foreground">Portability:</strong> Your invoices are standard PDFs that work anywhere.</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, use your account settings or contact us at contact@makeinvoices.app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Data Retention</h2>
            <p className="mb-3">
              We retain your data as long as your account is active. When you delete your account:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Your invoice data is permanently deleted within 30 days</li>
              <li>Backups are purged within 90 days</li>
              <li>We may retain minimal logs for legal compliance (up to 1 year)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Cookies and Tracking</h2>
            <p className="mb-3">
              We use minimal cookies only for essential functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-foreground">Authentication:</strong> To keep you logged in (stored in browser localStorage).</li>
              <li><strong className="text-foreground">No tracking cookies:</strong> We do not use cookies for analytics, advertising, or tracking.</li>
              <li><strong className="text-foreground">No third-party cookies:</strong> We do not allow third-party cookies on our site.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Children's Privacy</h2>
            <p>
              OneThing Invoice is not intended for users under 18 years of age. We do not knowingly collect 
              personal information from children. If you believe we have collected information from a child, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">International Users</h2>
            <p>
              Your data is stored on AWS servers. By using our service, you consent to the transfer and 
              processing of your data in accordance with this privacy policy and applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of material changes by 
              posting the new policy on this page and updating the "Last updated" date. Your continued use of 
              the service after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <ul className="list-none pl-0 mt-3 space-y-1">
              <li>Email: contact@makeinvoices.app</li>
              <li>Feedback form: Available in the application</li>
            </ul>
          </section>

          <p className="text-sm mt-8 pt-8 border-t border-border">
            Last updated: February 28, 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
