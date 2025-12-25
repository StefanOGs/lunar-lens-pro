import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const DEFAULT_TITLE = 'Eclyptica.com - Астрология, Личен Хороскоп и Натални Карти';
const DEFAULT_DESCRIPTION = 'Персонализирани натални карти, дневни хороскопи и професионални астрологични анализи. Открийте космическата си истина с нашите експертни услуги.';
const DEFAULT_IMAGE = '/logo.png';
const SITE_NAME = 'Eclyptica';

export const SEOHead = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url = 'https://eclyptica.com',
  type = 'website',
  noIndex = false,
}: SEOHeadProps) => {
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | ${SITE_NAME}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="bg_BG" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
