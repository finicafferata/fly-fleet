'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Additional Services',
      subtitle: 'Complete your flight experience',
      services: [
        {
          title: 'Premium catering',
          description: 'Customized gourmet menus and special dietary options.',
          icon: 'restaurant'
        },
        {
          title: 'VIP lounge/FBO',
          description: 'Access to exclusive lounges and preferential FBO services.',
          icon: 'home'
        },
        {
          title: 'Ground transfer/driver',
          description: 'Premium ground transportation to and from airports.',
          icon: 'location'
        },
        {
          title: 'Pet-friendly transport',
          description: 'Special coordination for pets, including veterinary documentation.',
          icon: 'heart'
        },
        {
          title: 'Immigration/customs assistance',
          description: 'Support through immigration processes and customs procedures.',
          icon: 'globe'
        },
        {
          title: 'International handling',
          description: 'Documentation, flight permits and coordination with local authorities.',
          icon: 'document'
        },
        {
          title: 'Country-entry documentation',
          description: 'Visa processing, health certificates and specific entry requirements.',
          icon: 'checkmark'
        },
        {
          title: 'Travel insurance',
          description: 'Comprehensive coverage for passengers and baggage.',
          icon: 'shield'
        },
        {
          title: 'Security',
          description: 'Personal protection services and risk assessment.',
          icon: 'security'
        },
        {
          title: 'Oversized baggage',
          description: 'Transport of special cargo, sports equipment and valuables.',
          icon: 'cart'
        },
        {
          title: 'Medevac',
          description: 'Medical evacuations with specialized equipment.',
          icon: 'medical'
        }
      ],
      cta: 'Request Additional Services'
    },
    es: {
      title: 'Servicios Adicionales',
      subtitle: 'Complementá tu experiencia de vuelo',
      services: [
        {
          title: 'Catering premium',
          description: 'Menús gourmet personalizados y opciones dietarias especiales.',
          icon: 'restaurant'
        },
        {
          title: 'Sala VIP o FBO',
          description: 'Acceso a salones exclusivos y servicios FBO preferenciales.',
          icon: 'home'
        },
        {
          title: 'Transfer o chofer',
          description: 'Traslados terrestres desde y hacia aeropuertos con vehículos premium.',
          icon: 'location'
        },
        {
          title: 'Transporte pet-friendly',
          description: 'Coordinación especial para mascotas, incluyendo documentación veterinaria.',
          icon: 'heart'
        },
        {
          title: 'Asistencia migraciones o aduana',
          description: 'Acompañamiento en procesos migratorios y trámites aduaneros.',
          icon: 'globe'
        },
        {
          title: 'Apoyo internacional',
          description: 'Documentación, permisos de vuelo y coordinación con autoridades locales.',
          icon: 'document'
        },
        {
          title: 'Documentación por país',
          description: 'Gestión de visas, certificados sanitarios y requisitos de entrada específicos.',
          icon: 'checkmark'
        },
        {
          title: 'Seguro de viaje',
          description: 'Cobertura integral para pasajeros y equipaje.',
          icon: 'shield'
        },
        {
          title: 'Seguridad',
          description: 'Servicios de protección personal y evaluación de riesgos.',
          icon: 'security'
        },
        {
          title: 'Equipaje voluminoso',
          description: 'Transporte de carga especial, equipos deportivos y objetos de valor.',
          icon: 'cart'
        },
        {
          title: 'Medevac',
          description: 'Evacuaciones sanitarias,',
          icon: 'medical'
        }
      ],
      cta: 'Solicitar Servicios Adicionales'
    },
    pt: {
      title: 'Serviços Adicionais',
      subtitle: 'Complete sua experiência de voo',
      services: [
        {
          title: 'Catering premium',
          description: 'Menus gourmet personalizados e opções dietárias especiais.',
          icon: 'restaurant'
        },
        {
          title: 'Sala VIP ou FBO',
          description: 'Acesso a lounges exclusivos e serviços FBO preferenciais.',
          icon: 'home'
        },
        {
          title: 'Transfer ou motorista',
          description: 'Transporte terrestre premium de e para aeroportos.',
          icon: 'location'
        },
        {
          title: 'Pet-friendly',
          description: 'Coordenação especial para pets, incluindo documentação veterinária.',
          icon: 'heart'
        },
        {
          title: 'Assistência de imigração ou alfândega',
          description: 'Suporte em processos migratórios e procedimentos alfandegários.',
          icon: 'globe'
        },
        {
          title: 'Handling internacional',
          description: 'Documentação, autorizações de voo e coordenação com autoridades locais.',
          icon: 'document'
        },
        {
          title: 'Documentação de entrada',
          description: 'Processamento de vistos, certificados sanitários e requisitos específicos.',
          icon: 'checkmark'
        },
        {
          title: 'Seguro viagem',
          description: 'Cobertura abrangente para passageiros e bagagem.',
          icon: 'shield'
        },
        {
          title: 'Segurança',
          description: 'Serviços de proteção pessoal e avaliação de riscos.',
          icon: 'security'
        },
        {
          title: 'Bagagem volumosa',
          description: 'Transporte de carga especial, equipamentos esportivos e objetos de valor.',
          icon: 'cart'
        },
        {
          title: 'Medevac',
          description: 'Evacuações médicas com equipamento especializado.',
          icon: 'medical'
        }
      ],
      cta: 'Solicitar Serviços Adicionais'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

const getIcon = (iconName: string) => {
  const icons: Record<string, JSX.Element> = {
    restaurant: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
    home: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    location: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    heart: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    globe: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    document: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    checkmark: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    shield: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    security: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    cart: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    medical: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m-4-4h8" />
      </svg>
    )
  };

  return icons[iconName] || icons.document;
};

export default function AdditionalServicesPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/additional-services`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-14">
        {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {content.title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services.map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-xl shadow-soft border border-gray-100 hover:shadow-large hover:border-navy-primary/30 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex flex-col items-start space-y-4">
                  {/* Icon Container */}
                  <div className="w-16 h-16 bg-gradient-to-br from-navy-primary/10 to-navy-primary/5 rounded-2xl flex items-center justify-center text-navy-primary group-hover:from-navy-primary group-hover:to-navy-primary/80 group-hover:text-white transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3">
                    {getIcon(service.icon)}
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-navy-primary group-hover:text-navy-primary transition-colors duration-200">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-navy-primary">
            {content.cta}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/quote`}
              className="inline-flex items-center justify-center bg-navy-primary hover:bg-navy-primary/90 text-white min-h-[56px] px-8 text-lg font-semibold rounded-lg shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {locale === 'es' ? 'Cotizar con servicios' :
               locale === 'pt' ? 'Cotação com serviços' :
               'Quote with services'}
            </a>
            <a
              href="https://wa.me/5491166601927"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-navy-primary border-2 border-navy-primary min-h-[56px] px-8 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              {locale === 'es' ? 'Consultar por WhatsApp' :
               locale === 'pt' ? 'Consultar via WhatsApp' :
               'Contact via WhatsApp'}
            </a>
          </div>
        </div>
      </section>
      </main>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}