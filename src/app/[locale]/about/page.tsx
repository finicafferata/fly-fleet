'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'About Fly-Fleet',
      mission: {
        title: 'Our Mission',
        text: 'At Fly-Fleet, we build trust from the first contact.'
      },
      certifications: {
        title: 'Certifications and Insurance',
        items: [
          'International regulations (FAA, EASA, ANAC)',
          'Comprehensive insurance for passengers and aircraft',
          'Team with experience in private and corporate aviation',
          'Exclusive 24/7 support',
          'Total transparency in every quote and operation'
        ]
      },
      commitment: {
        title: 'Service Commitment',
        items: [
          {
            title: '24/7 support',
            description: 'Team available in multiple languages'
          },
          {
            title: 'Total transparency',
            description: 'Clear pricing, no hidden fees'
          },
          {
            title: 'Curated network',
            description: 'Operators selected for safety and service'
          },
          {
            title: 'Fast response',
            description: 'Quotes in minutes, not days'
          }
        ]
      },
      values: {
        title: 'Values',
        items: [
          {
            title: 'Safety',
            description: 'Safety is our fundamental value'
          },
          {
            title: 'Transparency',
            description: 'Clear information at every step'
          },
          {
            title: 'Excellence',
            description: 'We consistently exceed expectations'
          },
          {
            title: 'Accessibility',
            description: 'We make private aviation more accessible'
          }
        ]
      },
      cta: 'We are more than a broker: we are your strategic partner in the air'
    },
    es: {
      title: 'Nosotros',
      mission: {
        title: 'Nuestra Misión',
        text: 'En Fly-Fleet construimos confianza desde el primer contacto.'
      },
      certifications: {
        title: 'Certificaciones y Seguros',
        items: [
          'Normativas internacionales (FAA, EASA, ANAC)',
          'Seguros integrales para pasajeros y aeronaves',
          'Equipo con trayectoria en aviación privada y corporativa',
          'Atención exclusiva 24/7',
          'Transparencia total en cada cotización y operación'
        ]
      },
      commitment: {
        title: 'Compromiso de Servicio',
        items: [
          {
            title: 'Atención 24/7',
            description: 'Equipo disponible en múltiples idiomas'
          },
          {
            title: 'Transparencia total',
            description: 'Precios claros, sin tarifas ocultas'
          },
          {
            title: 'Red curada',
            description: 'Operadores seleccionados por seguridad y servicio'
          },
          {
            title: 'Respuesta rápida',
            description: 'Cotizaciones en minutos, no días'
          }
        ]
      },
      values: {
        title: 'Valores',
        items: [
          {
            title: 'Seguridad',
            description: 'La seguridad es nuestro valor fundamental'
          },
          {
            title: 'Transparencia',
            description: 'Información clara en cada paso'
          },
          {
            title: 'Excelencia',
            description: 'Superamos expectativas constantemente'
          },
          {
            title: 'Accesibilidad',
            description: 'Hacemos la aviación privada más accesible'
          }
        ]
      },
      cta: 'Somos más que un bróker: somos tu socio estratégico en el aire'
    },
    pt: {
      title: 'Sobre a Fly-Fleet',
      mission: {
        title: 'Nossa Missão',
        text: 'Na Fly-Fleet, construímos confiança desde o primeiro contato.'
      },
      certifications: {
        title: 'Certificações e Seguros',
        items: [
          'Regulamentações internacionais (FAA, EASA, ANAC)',
          'Seguros integrais para passageiros e aeronaves',
          'Equipe com trajetória em aviação privada e corporativa',
          'Atendimento exclusivo 24/7',
          'Transparência total em cada cotação e operação'
        ]
      },
      commitment: {
        title: 'Compromisso de Serviço',
        items: [
          {
            title: 'Suporte 24/7',
            description: 'Equipe disponível em múltiplos idiomas'
          },
          {
            title: 'Transparência total',
            description: 'Preços claros, sem taxas ocultas'
          },
          {
            title: 'Rede curada',
            description: 'Operadores selecionados por segurança e serviço'
          },
          {
            title: 'Resposta rápida',
            description: 'Cotações em minutos, não dias'
          }
        ]
      },
      values: {
        title: 'Valores',
        items: [
          {
            title: 'Segurança',
            description: 'A segurança é nosso valor fundamental'
          },
          {
            title: 'Transparência',
            description: 'Informações claras em cada etapa'
          },
          {
            title: 'Excelência',
            description: 'Superamos expectativas consistentemente'
          },
          {
            title: 'Acessibilidade',
            description: 'Tornamos a aviação privada mais acessível'
          }
        ]
      },
      cta: 'Somos mais que um corretor: somos seu parceiro estratégico no ar'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function AboutPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/about`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {content.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-navy-primary">
            {content.mission.title}
          </h2>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            {content.mission.text}
          </p>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-primary">
            {content.certifications.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {content.certifications.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm">
                <div className="w-3 h-3 bg-accent-blue rounded-full flex-shrink-0" />
                <span className="text-gray-700 font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Commitment Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-primary">
            {content.commitment.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {content.commitment.items.map((item, index) => (
              <div key={index} className="group text-center p-6 rounded-2xl bg-gradient-to-br from-accent-blue/5 to-transparent hover:from-accent-blue/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {index === 0 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />}
                    {index === 1 && <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>}
                    {index === 2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />}
                    {index === 3 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />}
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-navy-primary mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-primary">
            {content.values.title}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.values.items.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <h3 className="text-lg font-semibold mb-3 text-navy-primary">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            {content.cta}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`/${locale}/quote`}
              className="inline-flex items-center justify-center bg-accent-blue hover:bg-accent-blue/90 text-white min-h-[56px] px-8 text-lg font-semibold rounded-lg shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {locale === 'es' ? 'Cotizar ahora' :
               locale === 'pt' ? 'Pedir cotação' :
               'Get a quote'}
            </a>
            <a
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-navy-primary border-2 border-white min-h-[56px] px-8 text-lg font-semibold rounded-lg transition-all duration-200"
            >
              {locale === 'es' ? 'Contactar' :
               locale === 'pt' ? 'Contatar' :
               'Contact us'}
            </a>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
      </main>
    </div>
  );
}