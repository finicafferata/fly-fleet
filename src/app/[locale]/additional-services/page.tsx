'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Additional Services',
      subtitle: 'Complete your flight experience',
      services: [
        {
          title: 'International handling',
          description: 'Documentation, flight permits and coordination with local authorities.'
        },
        {
          title: 'Country-entry documentation',
          description: 'Visa processing, health certificates and specific entry requirements.'
        },
        {
          title: 'Pet-friendly transport',
          description: 'Special coordination for pets, including veterinary documentation.'
        },
        {
          title: 'Ground transfer/driver',
          description: 'Premium ground transportation to and from airports.'
        },
        {
          title: 'Premium catering',
          description: 'Customized gourmet menus and special dietary options.'
        },
        {
          title: 'VIP lounge/FBO',
          description: 'Access to exclusive lounges and preferential FBO services.'
        },
        {
          title: 'Immigration/customs assistance',
          description: 'Support through immigration processes and customs procedures.'
        },
        {
          title: 'Travel insurance',
          description: 'Comprehensive coverage for passengers and baggage.'
        },
        {
          title: 'Medevac',
          description: 'Medical evacuations with specialized equipment.'
        },
        {
          title: 'Security',
          description: 'Personal protection services and risk assessment.'
        },
        {
          title: 'Oversized baggage',
          description: 'Transport of special cargo, sports equipment and valuables.'
        }
      ],
      cta: 'Request Additional Services'
    },
    es: {
      title: 'Servicios Adicionales',
      subtitle: 'Complementá tu experiencia de vuelo',
      services: [
        {
          title: 'Apoyo internacional',
          description: 'Documentación, permisos de vuelo y coordinación con autoridades locales.'
        },
        {
          title: 'Documentación por país',
          description: 'Gestión de visas, certificados sanitarios y requisitos de entrada específicos.'
        },
        {
          title: 'Transporte pet-friendly',
          description: 'Coordinación especial para mascotas, incluyendo documentación veterinaria.'
        },
        {
          title: 'Transfer/chofer',
          description: 'Traslados terrestres desde y hacia aeropuertos con vehículos premium.'
        },
        {
          title: 'Catering premium',
          description: 'Menús gourmet personalizados y opciones dietarias especiales.'
        },
        {
          title: 'Sala VIP/FBO',
          description: 'Acceso a salones exclusivos y servicios FBO preferenciales.'
        },
        {
          title: 'Asistencia migraciones/aduana',
          description: 'Acompañamiento en procesos migratorios y trámites aduaneros.'
        },
        {
          title: 'Seguro de viaje',
          description: 'Cobertura integral para pasajeros y equipaje.'
        },
        {
          title: 'Medevac',
          description: 'Evacuaciones médicas con equipamiento especializado.'
        },
        {
          title: 'Seguridad',
          description: 'Servicios de protección personal y evaluación de riesgos.'
        },
        {
          title: 'Equipaje voluminoso',
          description: 'Transporte de carga especial, equipos deportivos y objetos de valor.'
        }
      ],
      cta: 'Solicitar Servicios Adicionales'
    },
    pt: {
      title: 'Serviços Adicionais',
      subtitle: 'Complete sua experiência de voo',
      services: [
        {
          title: 'Handling internacional',
          description: 'Documentação, autorizações de voo e coordenação com autoridades locais.'
        },
        {
          title: 'Documentação de entrada',
          description: 'Processamento de vistos, certificados sanitários e requisitos específicos.'
        },
        {
          title: 'Pet-friendly',
          description: 'Coordenação especial para pets, incluindo documentação veterinária.'
        },
        {
          title: 'Transfer/motorista',
          description: 'Transporte terrestre premium de e para aeroportos.'
        },
        {
          title: 'Catering premium',
          description: 'Menus gourmet personalizados e opções dietárias especiais.'
        },
        {
          title: 'Sala VIP/FBO',
          description: 'Acesso a lounges exclusivos e serviços FBO preferenciais.'
        },
        {
          title: 'Assistência de imigração/alfândega',
          description: 'Suporte em processos migratórios e procedimentos alfandegários.'
        },
        {
          title: 'Seguro viagem',
          description: 'Cobertura abrangente para passageiros e bagagem.'
        },
        {
          title: 'Medevac',
          description: 'Evacuações médicas com equipamento especializado.'
        },
        {
          title: 'Segurança',
          description: 'Serviços de proteção pessoal e avaliação de riscos.'
        },
        {
          title: 'Bagagem volumosa',
          description: 'Transporte de carga especial, equipamentos esportivos e objetos de valor.'
        }
      ],
      cta: 'Solicitar Serviços Adicionais'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function AdditionalServicesPage() {
  const params = useParams();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white">
      <Navigation locale={locale} />

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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.services.map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent-blue rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-navy-primary">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
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
              className="inline-flex items-center justify-center bg-accent-blue hover:bg-accent-blue/90 text-white min-h-[56px] px-8 text-lg font-semibold rounded-lg shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {locale === 'es' ? 'Cotizar con servicios' :
               locale === 'pt' ? 'Cotação com serviços' :
               'Quote with services'}
            </a>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-navy-primary border-2 border-navy-primary min-h-[56px] px-8 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              {locale === 'es' ? 'Consultar directamente' :
               locale === 'pt' ? 'Consultar diretamente' :
               'Contact directly'}
            </a>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}