import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  twitterImage?: string;
}

export function SEO({
  title = 'OneThing Invoice - Free Online Invoice Generator | Create Professional Invoices',
  description = 'Create professional invoices instantly. Free, no signup required. Build, preview, and download PDF invoices in seconds. Simple invoice maker for freelancers and small businesses.',
  canonical,
  ogImage = 'https://makeinvoices.app/og-image.png',
  twitterImage = 'https://makeinvoices.app/twitter-image.png',
}: SEOProps) {
  const fullCanonical = canonical ? `https://makeinvoices.app${canonical}` : 'https://makeinvoices.app/';

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:url" content={fullCanonical} />
      <meta property="twitter:image" content={twitterImage} />
    </Helmet>
  );
}
