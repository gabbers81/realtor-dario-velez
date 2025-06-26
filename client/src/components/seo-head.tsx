import { useTranslation } from 'react-i18next';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

export function SEOHead({ 
  title, 
  description, 
  image = "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=630",
  url = "",
  type = "website" 
}: SEOHeadProps) {
  const { t, i18n } = useTranslation(['common']);
  
  const currentLang = i18n.language || 'es';
  const siteTitle = t('common:seo.siteTitle', 'Dario Velez - Propiedades en República Dominicana');
  const defaultDescription = t('common:seo.description');
  
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const metaDescription = description || defaultDescription;
  const currentUrl = `${window.location.origin}${url}`;

  // Language-specific locale mapping
  const localeMap: Record<string, string> = {
    'es': 'es_DO',
    'en': 'en_US', 
    'ru': 'ru_RU',
    'fr': 'fr_FR',
    'de': 'de_DE',
    'pt': 'pt_BR'
  };

  // Alternative language URLs for hreflang
  const languages = ['es', 'en', 'ru', 'fr', 'de', 'pt'];
  const baseUrl = window.location.origin;
  const pathWithoutLang = url.replace(/^\/(es|en|ru|fr|de|pt)/, '') || '/';

  // Update document head
  if (typeof document !== 'undefined') {
    document.title = fullTitle;
    
    // Set document language
    document.documentElement.lang = currentLang;
    
    // Meta description
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement('meta');
      metaDescTag.setAttribute('name', 'description');
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute('content', metaDescription);

    // Language and content type meta tags
    const metaTags = [
      { name: 'language', content: currentLang },
      { name: 'content-language', content: currentLang },
      { httpEquiv: 'content-language', content: currentLang }
    ];

    metaTags.forEach(({ name, httpEquiv, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[http-equiv="${httpEquiv}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (name) tag.setAttribute('name', name);
        if (httpEquiv) tag.setAttribute('http-equiv', httpEquiv);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Hreflang tags for language alternatives
    // Remove existing hreflang tags
    document.querySelectorAll('link[hreflang]').forEach(tag => tag.remove());
    
    languages.forEach(lang => {
      const hreflangUrl = lang === 'es' ? `${baseUrl}${pathWithoutLang}` : `${baseUrl}/${lang}${pathWithoutLang}`;
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', hreflangUrl);
      document.head.appendChild(link);
    });

    // x-default hreflang for default language
    const defaultLink = document.createElement('link');
    defaultLink.setAttribute('rel', 'alternate');
    defaultLink.setAttribute('hreflang', 'x-default');
    defaultLink.setAttribute('href', `${baseUrl}${pathWithoutLang}`);
    document.head.appendChild(defaultLink);

    // Open Graph tags with locale information
    const ogTags = [
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: metaDescription },
      { property: 'og:image', content: image },
      { property: 'og:url', content: currentUrl },
      { property: 'og:type', content: type },
      { property: 'og:site_name', content: siteTitle },
      { property: 'og:locale', content: localeMap[currentLang] || 'es_DO' },
    ];

    // Add alternate locales for Open Graph
    languages.filter(lang => lang !== currentLang).forEach(lang => {
      ogTags.push({ 
        property: 'og:locale:alternate', 
        content: localeMap[lang] || 'es_DO' 
      });
    });

    ogTags.forEach(({ property, content }) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: metaDescription },
      { name: 'twitter:image', content: image },
    ];

    twitterTags.forEach(({ name, content }) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    });

    // Canonical URL (always points to current language version)
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', currentUrl);
  }

  return null;
}