import { NextRequest, NextResponse } from 'next/server';


interface MetaTag {
  property?: string;
  name?: string;
  content: string;
}

interface SEOData {
  title: string;
  description: string;
  keywords: string;
  metaTags: MetaTag[];
  structuredData: object;
  canonicalUrl: string;
  alternateUrls: { [locale: string]: string };
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
    site: string;
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ page: string; locale: string }> }) {
  try {
    const { page, locale } = await params;

    // Validate locale
    const supportedLocales = ['es', 'en', 'pt'];
    if (!supportedLocales.includes(locale)) {
      return NextResponse.json(
        { error: 'Unsupported locale', supportedLocales },
        { status: 400 }
      );
    }

    // Get base URL for canonical and alternate URLs
    const baseUrl = 'https://fly-fleet.com';

    // Generate SEO data based on page and locale
    const seoData = generateSEOData(page, locale, baseUrl);

    // Add cache headers for performance
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1 hour cache
      'ETag': `"seo-${page}-${locale}-${Date.now()}"`
    };

    return NextResponse.json({
      success: true,
      page,
      locale,
      seo: seoData,
      timestamp: new Date().toISOString()
    }, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('SEO API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateSEOData(page: string, locale: string, baseUrl: string): SEOData {
  // Default SEO content by locale
  const defaultContent = {
    es: {
      siteName: 'Fly-Fleet - Charter de Jets Privados',
      companyDescription: 'Servicios de charter de jets privados en América Latina. Vuelos charter, helicópteros y más.',
      keywords: 'jet privado, charter, vuelos privados, América Latina, Argentina, Brasil, Chile'
    },
    en: {
      siteName: 'Fly-Fleet - Private Jet Charter',
      companyDescription: 'Private jet charter services in Latin America. Charter flights, helicopters and more.',
      keywords: 'private jet, charter, private flights, Latin America, Argentina, Brazil, Chile'
    },
    pt: {
      siteName: 'Fly-Fleet - Charter de Jatos Privados',
      companyDescription: 'Serviços de charter de jatos privados na América Latina. Voos charter, helicópteros e mais.',
      keywords: 'jato privado, charter, voos privados, América Latina, Argentina, Brasil, Chile'
    }
  };

  // Page-specific SEO data
  const pageContent = getPageSEOContent(page, locale);
  const baseContent = defaultContent[locale as keyof typeof defaultContent];

  // Generate alternate URLs for all locales
  const alternateUrls: { [locale: string]: string } = {};
  ['es', 'en', 'pt'].forEach(loc => {
    const pagePath = getLocalizedPagePath(page, loc);
    alternateUrls[loc] = loc === 'es' ? `${baseUrl}${pagePath}` : `${baseUrl}/${loc}${pagePath}`;
  });

  // Get canonical URL
  const pagePath = getLocalizedPagePath(page, locale);
  const canonicalUrl = locale === 'es' ? `${baseUrl}${pagePath}` : `${baseUrl}/${locale}${pagePath}`;

  // Generate comprehensive meta tags
  const metaTags: MetaTag[] = [
    { name: 'description', content: pageContent.description },
    { name: 'keywords', content: `${pageContent.keywords}, ${baseContent.keywords}` },
    { name: 'author', content: 'Fly-Fleet' },
    { name: 'robots', content: 'index, follow' },
    { name: 'language', content: locale },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },

    // Open Graph
    { property: 'og:title', content: pageContent.title },
    { property: 'og:description', content: pageContent.description },
    { property: 'og:image', content: `${baseUrl}/images/og-${page}-${locale}.jpg` },
    { property: 'og:url', content: canonicalUrl },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: baseContent.siteName },
    { property: 'og:locale', content: getOGLocale(locale) },

    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: pageContent.title },
    { name: 'twitter:description', content: pageContent.description },
    { name: 'twitter:image', content: `${baseUrl}/images/twitter-${page}-${locale}.jpg` },
    { name: 'twitter:site', content: '@flyfleet' },

    // Business-specific
    { name: 'geo.region', content: getRegionCode(locale) },
    { name: 'geo.placename', content: getPlaceName(locale) },
    { name: 'business.contact_data.country_name', content: getCountryName(locale) },
    { name: 'business.contact_data.phone_number', content: '+5491166601927' },
    { name: 'business.contact_data.email', content: 'contact@fly-fleet.com' }
  ];

  // Generate structured data (JSON-LD)
  const structuredData = generateStructuredData(page, locale, pageContent, baseContent, canonicalUrl);

  return {
    title: pageContent.title,
    description: pageContent.description,
    keywords: `${pageContent.keywords}, ${baseContent.keywords}`,
    metaTags,
    structuredData,
    canonicalUrl,
    alternateUrls,
    openGraph: {
      title: pageContent.title,
      description: pageContent.description,
      image: `${baseUrl}/images/og-${page}-${locale}.jpg`,
      url: canonicalUrl,
      type: 'website',
      siteName: baseContent.siteName
    },
    twitter: {
      card: 'summary_large_image',
      title: pageContent.title,
      description: pageContent.description,
      image: `${baseUrl}/images/twitter-${page}-${locale}.jpg`,
      site: '@flyfleet'
    }
  };
}

function getPageSEOContent(page: string, locale: string) {
  const content: { [page: string]: { [locale: string]: any } } = {
    homepage: {
      es: {
        title: 'Fly-Fleet | Charter de Jets Privados en América Latina',
        description: 'Servicios premium de charter de jets privados. Vuelos charter, helicópteros y más. Cotiza tu vuelo privado ahora.',
        keywords: 'jet privado Argentina, charter Buenos Aires, vuelos privados'
      },
      en: {
        title: 'Fly-Fleet | Private Jet Charter in Latin America',
        description: 'Premium private jet charter services. Charter flights, helicopters and more. Quote your private flight now.',
        keywords: 'private jet Argentina, charter Buenos Aires, private flights'
      },
      pt: {
        title: 'Fly-Fleet | Charter de Jatos Privados na América Latina',
        description: 'Serviços premium de charter de jatos privados. Voos charter, helicópteros e mais. Faça sua cotação agora.',
        keywords: 'jato privado Argentina, charter Buenos Aires, voos privados'
      }
    },
    'que-hacemos': {
      es: {
        title: 'Qué Hacemos | Servicios de Charter de Jets Privados - Fly-Fleet',
        description: 'Descubre nuestros servicios de charter de jets privados: vuelos charter, helicópteros, vuelos médicos y de carga.',
        keywords: 'servicios charter, vuelos privados, helicópteros, vuelos médicos'
      },
      en: {
        title: 'What We Do | Private Jet Charter Services - Fly-Fleet',
        description: 'Discover our private jet charter services: charter flights, helicopters, medical flights and cargo.',
        keywords: 'charter services, private flights, helicopters, medical flights'
      },
      pt: {
        title: 'O Que Fazemos | Serviços de Charter de Jatos Privados - Fly-Fleet',
        description: 'Descubra nossos serviços de charter de jatos privados: voos charter, helicópteros, voos médicos e carga.',
        keywords: 'serviços charter, voos privados, helicópteros, voos médicos'
      }
    },
    cotizar: {
      es: {
        title: 'Cotizar Vuelo Privado | Solicita tu Presupuesto - Fly-Fleet',
        description: 'Solicita una cotización para tu vuelo privado. Formulario rápido y fácil. Respuesta en 2 horas.',
        keywords: 'cotizar vuelo privado, presupuesto jet, solicitar cotización'
      },
      en: {
        title: 'Quote Private Flight | Request Your Quote - Fly-Fleet',
        description: 'Request a quote for your private flight. Quick and easy form. Response within 2 hours.',
        keywords: 'quote private flight, jet quote, request quote'
      },
      pt: {
        title: 'Cotação Voo Privado | Solicite seu Orçamento - Fly-Fleet',
        description: 'Solicite uma cotação para seu voo privado. Formulário rápido e fácil. Resposta em 2 horas.',
        keywords: 'cotação voo privado, orçamento jato, solicitar cotação'
      }
    },
    servicios: {
      es: {
        title: 'Servicios | Charter de Jets Privados - Fly-Fleet',
        description: 'Servicios completos de aviación privada: charter, helicópteros, vuelos médicos, carga y servicios adicionales.',
        keywords: 'servicios aviación, charter completo, vuelos médicos, transporte carga'
      },
      en: {
        title: 'Services | Private Jet Charter - Fly-Fleet',
        description: 'Complete private aviation services: charter, helicopters, medical flights, cargo and additional services.',
        keywords: 'aviation services, complete charter, medical flights, cargo transport'
      },
      pt: {
        title: 'Serviços | Charter de Jatos Privados - Fly-Fleet',
        description: 'Serviços completos de aviação privada: charter, helicópteros, voos médicos, carga e serviços adicionais.',
        keywords: 'serviços aviação, charter completo, voos médicos, transporte carga'
      }
    },
    'flota-destinos': {
      es: {
        title: 'Flota y Destinos | Jets Privados América Latina - Fly-Fleet',
        description: 'Nuestra flota de jets privados y destinos disponibles en América Latina. Cobertura completa en Argentina, Brasil, Chile y más.',
        keywords: 'flota jets, destinos vuelos, América Latina, Argentina, Brasil'
      },
      en: {
        title: 'Fleet and Destinations | Private Jets Latin America - Fly-Fleet',
        description: 'Our private jet fleet and available destinations in Latin America. Complete coverage in Argentina, Brazil, Chile and more.',
        keywords: 'jet fleet, flight destinations, Latin America, Argentina, Brazil'
      },
      pt: {
        title: 'Frota e Destinos | Jatos Privados América Latina - Fly-Fleet',
        description: 'Nossa frota de jatos privados e destinos disponíveis na América Latina. Cobertura completa na Argentina, Brasil, Chile e mais.',
        keywords: 'frota jatos, destinos voos, América Latina, Argentina, Brasil'
      }
    },
    faqs: {
      es: {
        title: 'Preguntas Frecuentes | Charter de Jets Privados - Fly-Fleet',
        description: 'Respuestas a las preguntas más frecuentes sobre charter de jets privados, precios, documentación y servicios.',
        keywords: 'preguntas frecuentes, FAQ charter, dudas jets privados'
      },
      en: {
        title: 'Frequently Asked Questions | Private Jet Charter - Fly-Fleet',
        description: 'Answers to frequently asked questions about private jet charter, prices, documentation and services.',
        keywords: 'frequently asked questions, charter FAQ, private jet doubts'
      },
      pt: {
        title: 'Perguntas Frequentes | Charter de Jatos Privados - Fly-Fleet',
        description: 'Respostas às perguntas mais frequentes sobre charter de jatos privados, preços, documentação e serviços.',
        keywords: 'perguntas frequentes, FAQ charter, dúvidas jatos privados'
      }
    },
    nosotros: {
      es: {
        title: 'Nosotros | Sobre Fly-Fleet Charter de Jets Privados',
        description: 'Conoce Fly-Fleet, tu bróker de confianza para charter de jets privados en América Latina. Experiencia, seguridad y servicio premium.',
        keywords: 'sobre nosotros, empresa charter, bróker jets privados, experiencia'
      },
      en: {
        title: 'About Us | About Fly-Fleet Private Jet Charter',
        description: 'Meet Fly-Fleet, your trusted broker for private jet charter in Latin America. Experience, safety and premium service.',
        keywords: 'about us, charter company, private jet broker, experience'
      },
      pt: {
        title: 'Sobre Nós | Sobre Fly-Fleet Charter de Jatos Privados',
        description: 'Conheça a Fly-Fleet, seu corretor de confiança para charter de jatos privados na América Latina. Experiência, segurança e serviço premium.',
        keywords: 'sobre nós, empresa charter, corretor jatos privados, experiência'
      }
    },
    contacto: {
      es: {
        title: 'Contacto | Fly-Fleet Charter de Jets Privados',
        description: 'Contacta con Fly-Fleet para tu próximo vuelo privado. WhatsApp, teléfono, email. Disponibles 24/7.',
        keywords: 'contacto Fly-Fleet, WhatsApp charter, teléfono jets privados'
      },
      en: {
        title: 'Contact | Fly-Fleet Private Jet Charter',
        description: 'Contact Fly-Fleet for your next private flight. WhatsApp, phone, email. Available 24/7.',
        keywords: 'contact Fly-Fleet, WhatsApp charter, private jet phone'
      },
      pt: {
        title: 'Contato | Fly-Fleet Charter de Jatos Privados',
        description: 'Entre em contato com a Fly-Fleet para seu próximo voo privado. WhatsApp, telefone, email. Disponível 24/7.',
        keywords: 'contato Fly-Fleet, WhatsApp charter, telefone jatos privados'
      }
    }
  };

  const pageKey = page === '' || page === '/' ? 'homepage' : page.replace('/', '');
  return content[pageKey]?.[locale] || content.homepage[locale];
}

function getLocalizedPagePath(page: string, locale: string): string {
  const pagePaths: { [page: string]: { [locale: string]: string } } = {
    homepage: { es: '/', en: '/', pt: '/' },
    'que-hacemos': { es: '/que-hacemos', en: '/what-we-do', pt: '/o-que-fazemos' },
    cotizar: { es: '/cotizar', en: '/quote', pt: '/cotacao' },
    servicios: { es: '/servicios', en: '/services', pt: '/servicos' },
    'flota-destinos': { es: '/flota-destinos', en: '/fleet-destinations', pt: '/frota-destinos' },
    faqs: { es: '/faqs', en: '/faqs', pt: '/faqs' },
    nosotros: { es: '/nosotros', en: '/about', pt: '/sobre-nos' },
    contacto: { es: '/contacto', en: '/contact', pt: '/contato' }
  };

  const pageKey = page === '' || page === '/' ? 'homepage' : page.replace('/', '');
  return pagePaths[pageKey]?.[locale] || '/';
}

function getOGLocale(locale: string): string {
  const ogLocales: { [key: string]: string } = {
    es: 'es_ES',
    en: 'en_US',
    pt: 'pt_BR'
  };
  return ogLocales[locale] || 'es_ES';
}

function getRegionCode(locale: string): string {
  const regions: { [key: string]: string } = {
    es: 'AR-C',
    en: 'AR-C',
    pt: 'BR-SP'
  };
  return regions[locale] || 'AR-C';
}

function getPlaceName(locale: string): string {
  const places: { [key: string]: string } = {
    es: 'Buenos Aires',
    en: 'Buenos Aires',
    pt: 'São Paulo'
  };
  return places[locale] || 'Buenos Aires';
}

function getCountryName(locale: string): string {
  const countries: { [key: string]: string } = {
    es: 'Argentina',
    en: 'Argentina',
    pt: 'Brasil'
  };
  return countries[locale] || 'Argentina';
}

function generateStructuredData(page: string, locale: string, pageContent: any, baseContent: any, canonicalUrl: string) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: baseContent.siteName,
    url: canonicalUrl,
    logo: 'https://fly-fleet.com/logo.png',
    description: baseContent.companyDescription,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+54-11-6660-1927',
      contactType: 'customer service',
      availableLanguage: ['Spanish', 'English', 'Portuguese'],
      areaServed: 'South America'
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'AR',
      addressRegion: 'Buenos Aires'
    },
    sameAs: [
      'https://www.instagram.com/flyfleet',
      'https://www.linkedin.com/company/flyfleet'
    ]
  };

  // Add page-specific structured data
  if (page === 'faqs' || page === '/faqs') {
    return {
      ...baseStructuredData,
      '@type': 'FAQPage',
      mainEntity: [] // This would be populated with actual FAQ data
    };
  }

  if (page === 'servicios' || page === '/servicios' || page === 'services' || page === 'servicos') {
    return {
      ...baseStructuredData,
      '@type': 'Service',
      serviceType: 'Private Jet Charter',
      provider: {
        '@type': 'Organization',
        name: baseContent.siteName
      },
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: '-34.6118',
          longitude: '-58.3960'
        },
        geoRadius: '5000000'
      }
    };
  }

  return baseStructuredData;
}