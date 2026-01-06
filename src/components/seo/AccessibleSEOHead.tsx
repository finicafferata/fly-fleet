'use client';

import Head from 'next/head';
import { useLocale } from 'next-intl';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterImageAlt?: string;
  canonical?: string;
  structuredData?: object;
  noIndex?: boolean;
  noFollow?: boolean;
}

interface AccessibleSEOHeadProps {
  page: string;
  locale?: 'en' | 'es' | 'pt';
  customSEO?: Partial<SEOData>;
}

export function AccessibleSEOHead({
  page,
  locale: propLocale,
  customSEO = {}
}: AccessibleSEOHeadProps) {
  const systemLocale = useLocale();
  const locale = propLocale || systemLocale || 'en';

  const getSEOData = (page: string, locale: string): SEOData => {
    const seoTemplates = {
      homepage: {
        en: {
          title: "Fly-Fleet | Private Jet Charter – Get a Quote in Minutes",
          description: "Request your private charter quote with certified operators. 24/7 support, international handling, pet-friendly services, and luxury aviation solutions.",
          keywords: ["private jet", "charter", "aviation", "private flights", "luxury travel", "aircraft rental"],
          path: ""
        },
        es: {
          title: "Fly-Fleet | Vuelos Privados y Chárter – Cotizá en Minutos",
          description: "Cotizá tu vuelo privado con operadores certificados. Atención 24/7, soporte internacional, pet-friendly y servicios a medida.",
          keywords: ["vuelos privados", "charter", "jet privado", "aviación", "viajes de lujo", "alquiler aeronaves"],
          path: ""
        },
        pt: {
          title: "Fly-Fleet | Voos Privados – Peça uma Cotação em Minutos",
          description: "Peça sua cotação de voo privado. Operadores certificados, suporte 24/7, handling internacional e serviço pet-friendly.",
          keywords: ["voos privados", "charter", "jato privado", "aviação", "viagens de luxo", "aluguel aeronaves"],
          path: ""
        }
      },
      about: {
        en: {
          title: "About Fly-Fleet | Private Aviation Excellence Since 2020",
          description: "Learn about Fly-Fleet's mission to provide premium private aviation services across Latin America with safety, reliability, and exceptional customer service.",
          keywords: ["about fly-fleet", "private aviation company", "charter brokerage", "aviation safety", "latin america"],
          path: "/about"
        },
        es: {
          title: "Nosotros | Excelencia en Aviación Privada desde 2020",
          description: "Conoce la misión de Fly-Fleet de proporcionar servicios premium de aviación privada en América Latina con seguridad, confiabilidad y servicio excepcional.",
          keywords: ["acerca fly-fleet", "empresa aviación privada", "bróker charter", "seguridad aviación", "américa latina"],
          path: "/about"
        },
        pt: {
          title: "Sobre a Fly-Fleet | Excelência em Aviação Privada desde 2020",
          description: "Conheça a missão da Fly-Fleet de fornecer serviços premium de aviação privada na América Latina com segurança, confiabilidade e atendimento excepcional.",
          keywords: ["sobre fly-fleet", "empresa aviação privada", "corretor charter", "segurança aviação", "américa latina"],
          path: "/about"
        }
      },
      services: {
        en: {
          title: "Private Jet Services | Charter, Multi-City Tours",
          description: "Comprehensive private aviation services including charter flights, helicopter transfers, medical transport, and cargo operations across Latin America.",
          keywords: ["private jet services", "charter flights", "helicopter", "medical transport", "cargo"],
          path: "/services"
        },
        es: {
          title: "Servicios de Jets Privados | Charter, Tours Multi-Ciudad",
          description: "Servicios integrales de aviación privada incluyendo vuelos charter, traslados en helicóptero, transporte médico y operaciones de carga.",
          keywords: ["servicios jets privados", "vuelos charter", "helicóptero", "transporte médico", "carga"],
          path: "/services"
        },
        pt: {
          title: "Serviços de Jatos Privados | Charter, Tours Multi-Cidade",
          description: "Serviços abrangentes de aviação privada incluindo voos charter, transferências de helicóptero, transporte médico e operações de carga.",
          keywords: ["serviços jatos privados", "voos charter", "helicóptero", "transporte médico", "carga"],
          path: "/services"
        }
      },
      contact: {
        en: {
          title: "Contact Fly-Fleet | 24/7 Private Aviation Support",
          description: "Contact our private aviation experts for quotes, bookings, and support. Available 24/7 with multilingual assistance and emergency response.",
          keywords: ["contact fly-fleet", "private aviation support", "24/7 assistance", "flight booking", "emergency"],
          path: "/contact"
        },
        es: {
          title: "Contactar Fly-Fleet | Soporte 24/7 en Aviación Privada",
          description: "Contacta a nuestros expertos en aviación privada para cotizaciones, reservas y soporte. Disponible 24/7 con asistencia multilingüe y respuesta de emergencia.",
          keywords: ["contactar fly-fleet", "soporte aviación privada", "asistencia 24/7", "reserva vuelos", "emergencia"],
          path: "/contact"
        },
        pt: {
          title: "Contatar Fly-Fleet | Suporte 24/7 em Aviação Privada",
          description: "Entre em contato com nossos especialistas em aviação privada para cotações, reservas e suporte. Disponível 24/7 com assistência multilíngue e resposta de emergência.",
          keywords: ["contatar fly-fleet", "suporte aviação privada", "assistência 24/7", "reserva voos", "emergência"],
          path: "/contact"
        }
      },
      quote: {
        en: {
          title: "Get Private Jet Quote | Instant Charter Pricing",
          description: "Get instant private jet charter quotes from certified operators. Compare prices, aircraft options, and book your luxury flight in minutes.",
          keywords: ["private jet quote", "charter pricing", "instant quote", "flight booking", "aircraft comparison"],
          path: "/quote"
        },
        es: {
          title: "Cotización de Jet Privado | Precios Instantáneos de Charter",
          description: "Obtén cotizaciones instantáneas de charter de jets privados de operadores certificados. Compara precios, opciones de aeronaves y reserva tu vuelo de lujo en minutos.",
          keywords: ["cotización jet privado", "precios charter", "cotización instantánea", "reserva vuelos", "comparación aeronaves"],
          path: "/quote"
        },
        pt: {
          title: "Cotação de Jato Privado | Preços Instantâneos de Charter",
          description: "Obtenha cotações instantâneas de charter de jatos privados de operadores certificados. Compare preços, opções de aeronaves e reserve seu voo de luxo em minutos.",
          keywords: ["cotação jato privado", "preços charter", "cotação instantânea", "reserva voos", "comparação aeronaves"],
          path: "/quote"
        }
      },
      faq: {
        en: {
          title: "FAQ | Private Jet Charter Questions & Answers",
          description: "Find answers to frequently asked questions about private jet charter, booking process, safety standards, pricing, and services.",
          keywords: ["private jet faq", "charter questions", "aviation safety", "booking process", "flight pricing"],
          path: "/faq"
        },
        es: {
          title: "FAQ | Preguntas y Respuestas sobre Charter de Jets Privados",
          description: "Encuentra respuestas a preguntas frecuentes sobre charter de jets privados, proceso de reserva, estándares de seguridad, precios y servicios.",
          keywords: ["faq jets privados", "preguntas charter", "seguridad aviación", "proceso reserva", "precios vuelos"],
          path: "/faq"
        },
        pt: {
          title: "FAQ | Perguntas e Respostas sobre Charter de Jatos Privados",
          description: "Encontre respostas para perguntas frequentes sobre charter de jatos privados, processo de reserva, padrões de segurança, preços e serviços.",
          keywords: ["faq jatos privados", "perguntas charter", "segurança aviação", "processo reserva", "preços voos"],
          path: "/faq"
        }
      }
    };

    const pageTemplates = (seoTemplates as any)[page] || seoTemplates.homepage;
    const pageData = (pageTemplates as any)[locale] || pageTemplates.en || seoTemplates.homepage.en;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fly-fleet.com';
    const localizedPath = locale === 'en' ? pageData.path : `/${locale}${pageData.path}`;
    const canonical = `${baseUrl}${localizedPath}`;

    return {
      ...pageData,
      canonical,
      ogTitle: pageData.title,
      ogDescription: pageData.description,
      ogImage: `${baseUrl}/images/og/${page}-${locale}.jpg`,
      ogImageAlt: `${pageData.title} - Fly-Fleet Private Aviation`,
      twitterTitle: pageData.title,
      twitterDescription: pageData.description,
      twitterImage: `${baseUrl}/images/twitter/${page}-${locale}.jpg`,
      twitterImageAlt: `${pageData.title} - Fly-Fleet`,
      structuredData: generateStructuredData(page, locale, pageData)
    };
  };

  const generateStructuredData = (page: string, locale: string, pageData: any) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://fly-fleet.com';

    const organization = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      "name": "Fly-Fleet",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/images/logo/fly-fleet-logo.png`,
        "width": 300,
        "height": 100
      },
      "description": getLocalizedText(locale, {
        en: "Premium private jet charter brokerage serving Latin America with certified operators, 24/7 support, and luxury aviation services.",
        es: "Servicios premium de charter de jets privados para América Latina con operadores certificados, soporte 24/7 y servicios de aviación de lujo.",
        pt: "Serviços premium de charter de jatos privados para a América Latina com operadores certificados, suporte 24/7 e serviços de aviação de luxo."
      }),
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-555-FLY-FLEET",
        "contactType": "customer service",
        "availableLanguage": ["English", "Spanish", "Portuguese"],
        "hoursAvailable": "Mo-Su 00:00-23:59"
      },
      "sameAs": [
        "https://www.linkedin.com/company/fly-fleet",
        "https://www.instagram.com/flyfleet",
        "https://twitter.com/flyfleet"
      ],
      "serviceArea": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": "-15.0",
          "longitude": "-60.0"
        },
        "geoRadius": "5000000"
      }
    };

    const localBusiness = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": `${baseUrl}/#localbusiness`,
      "name": "Fly-Fleet",
      "description": organization.description,
      "url": baseUrl,
      "telephone": "+1-555-FLY-FLEET",
      "email": "info@fly-fleet.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Aviation Way",
        "addressLocality": "Miami",
        "addressRegion": "FL",
        "postalCode": "33101",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "25.7617",
        "longitude": "-80.1918"
      },
      "openingHours": "Mo-Su 00:00-23:59",
      "priceRange": "$$$",
      "currenciesAccepted": "USD",
      "paymentAccepted": "Credit Card, Wire Transfer, Check"
    };

    const service = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": getLocalizedText(locale, {
        en: "Private Jet Charter Services",
        es: "Servicios de Charter de Jets Privados",
        pt: "Serviços de Charter de Jatos Privados"
      }),
      "description": getLocalizedText(locale, {
        en: "Comprehensive private aviation services including charter flights, helicopter transfers, and luxury travel solutions.",
        es: "Servicios integrales de aviación privada incluyendo vuelos charter, traslados en helicóptero y soluciones de viaje de lujo.",
        pt: "Serviços abrangentes de aviação privada incluindo voos charter, transferências de helicóptero e soluções de viagem de luxo."
      }),
      "provider": organization,
      "serviceType": "Private Aviation Charter",
      "areaServed": "Latin America",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": baseUrl,
        "servicePhone": "+1-555-FLY-FLEET",
        "availableLanguage": ["en", "es", "pt"]
      }
    };

    // Page-specific structured data
    switch (page) {
      case 'homepage':
        return [organization, localBusiness, service];

      case 'about':
        return [organization, {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "mainEntity": organization,
          "description": pageData.description
        }];

      case 'services':
        return [organization, service, {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": [
            {
              "@type": "Service",
              "position": 1,
              "name": getLocalizedText(locale, {
                en: "Private Charter",
                es: "Charter Privado",
                pt: "Charter Privado"
              })
            },
            {
              "@type": "Service",
              "position": 2,
              "name": getLocalizedText(locale, {
                en: "Helicopter Services",
                es: "Servicios de Helicóptero",
                pt: "Serviços de Helicóptero"
              })
            }
          ]
        }];

      case 'contact':
        return [organization, localBusiness, {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "mainEntity": localBusiness
        }];

      default:
        return [organization];
    }
  };

  const getLocalizedText = (locale: string, texts: Record<string, string>) => {
    return texts[locale] || texts.en;
  };

  const getOGLocale = (locale: string) => {
    const localeMap = {
      'en': 'en_US',
      'es': 'es_ES',
      'pt': 'pt_BR'
    };
    return localeMap[locale as keyof typeof localeMap] || 'en_US';
  };

  const seoData = getSEOData(page, locale);
  const mergedSEOData = { ...seoData, ...customSEO };

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{mergedSEOData.title}</title>
      <meta name="description" content={mergedSEOData.description} />
      <meta name="keywords" content={mergedSEOData.keywords.join(', ')} />
      <meta name="author" content="Fly-Fleet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Language and Accessibility */}
      <html lang={locale} />
      <meta httpEquiv="Content-Language" content={locale} />

      {/* Robots */}
      {(mergedSEOData.noIndex || mergedSEOData.noFollow) && (
        <meta name="robots" content={`${mergedSEOData.noIndex ? 'noindex' : 'index'}, ${mergedSEOData.noFollow ? 'nofollow' : 'follow'}`} />
      )}

      {/* Multilingual Support */}
      <link rel="alternate" hrefLang="es" href={`https://fly-fleet.com${mergedSEOData.path}`} />
      <link rel="alternate" hrefLang="en" href={`https://fly-fleet.com/en${mergedSEOData.path}`} />
      <link rel="alternate" hrefLang="pt" href={`https://fly-fleet.com/pt${mergedSEOData.path}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://fly-fleet.com${mergedSEOData.path}`} />

      {/* Open Graph with Accessibility */}
      <meta property="og:title" content={mergedSEOData.ogTitle || mergedSEOData.title} />
      <meta property="og:description" content={mergedSEOData.ogDescription || mergedSEOData.description} />
      <meta property="og:image" content={mergedSEOData.ogImage} />
      <meta property="og:image:alt" content={mergedSEOData.ogImageAlt} />
      <meta property="og:url" content={mergedSEOData.canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={getOGLocale(locale)} />
      <meta property="og:site_name" content="Fly-Fleet" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={mergedSEOData.twitterTitle || mergedSEOData.title} />
      <meta name="twitter:description" content={mergedSEOData.twitterDescription || mergedSEOData.description} />
      <meta name="twitter:image" content={mergedSEOData.twitterImage || mergedSEOData.ogImage} />
      <meta name="twitter:image:alt" content={mergedSEOData.twitterImageAlt || mergedSEOData.ogImageAlt} />
      <meta name="twitter:site" content="@flyfleet" />
      <meta name="twitter:creator" content="@flyfleet" />

      {/* Structured Data */}
      {mergedSEOData.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(mergedSEOData.structuredData)
          }}
        />
      )}

      {/* Canonical and Performance */}
      <link rel="canonical" href={mergedSEOData.canonical} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />

      {/* Accessibility Enhancements */}
      <meta name="theme-color" content="#0B1E3C" />
      <meta name="color-scheme" content="light dark" />
      <meta name="format-detection" content="telephone=no" />

      {/* Security */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />

      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* PWA Support */}
      <meta name="application-name" content="Fly-Fleet" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Fly-Fleet" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="msapplication-TileColor" content="#0B1E3C" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
    </Head>
  );
}