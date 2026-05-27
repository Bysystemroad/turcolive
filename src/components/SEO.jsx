import { useEffect } from 'react';
import { defaultSeo, getAbsoluteUrl } from '../seo.js';

const socialImage = getAbsoluteUrl('/brand/turcolive-logo.png');

function setMetaByName(name, content) {
  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

function setJsonLd(id, data) {
  let tag = document.getElementById(id);
  if (!tag) {
    tag = document.createElement('script');
    tag.id = id;
    tag.type = 'application/ld+json';
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
}

export default function SEO({ title, description, keywords, path = '/', type = 'website' }) {
  useEffect(() => {
    const seoTitle = title || defaultSeo.title;
    const seoDescription = description || defaultSeo.description;
    const seoKeywords = Array.isArray(keywords) ? keywords.join(', ') : keywords || defaultSeo.keywords.join(', ');
    const canonicalUrl = getAbsoluteUrl(path);

    document.documentElement.lang = 'tr';
    document.title = seoTitle;

    setMetaByName('description', seoDescription);
    setMetaByName('keywords', seoKeywords);
    setMetaByName('robots', 'index, follow');
    setMetaByName('viewport', 'width=device-width, initial-scale=1.0');
    setMetaByName('theme-color', '#0B233D');

    setLink('canonical', canonicalUrl);

    setMetaByProperty('og:title', seoTitle);
    setMetaByProperty('og:description', seoDescription);
    setMetaByProperty('og:image', socialImage);
    setMetaByProperty('og:type', type);
    setMetaByProperty('og:url', canonicalUrl);
    setMetaByProperty('og:site_name', 'TurcoLive');
    setMetaByProperty('og:locale', 'tr_TR');

    setMetaByName('twitter:card', 'summary_large_image');
    setMetaByName('twitter:title', seoTitle);
    setMetaByName('twitter:description', seoDescription);
    setMetaByName('twitter:image', socialImage);

    setJsonLd('turcolive-organization-schema', {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'TurcoLive',
      url: getAbsoluteUrl('/'),
      logo: socialImage,
      description: defaultSeo.description,
      sameAs: ['https://www.instagram.com/', 'https://www.facebook.com/'],
    });

    setJsonLd('turcolive-website-schema', {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'TurcoLive',
      url: getAbsoluteUrl('/'),
      inLanguage: 'tr-TR',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${getAbsoluteUrl('/ilanlar')}?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    });
  }, [title, description, keywords, path, type]);

  return null;
}
