import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Heavenly Nature Schools';
const DEFAULT_DESCRIPTION =
  'Free, faith-based education for street children, orphans, and abandoned children in Juba City, South Sudan. Nurturing Right Leaders.';

const SEO = ({ title, description, path = '' }) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Nurturing Right Leaders`;
  const metaDesc = description || DEFAULT_DESCRIPTION;
  const canonical = `https://heavenlynatureschools.com${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
    </Helmet>
  );
};

export default SEO;
