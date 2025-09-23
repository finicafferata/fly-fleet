'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'About Fly-Fleet',
      mission: {
        title: 'Our Mission',
        text: 'Democratize access to private aviation by connecting passengers with certified operators transparently and efficiently.'
      },
      certifications: {
        title: 'Certifications and Insurance',
        items: [
          'ANAC, FAA, EASA certified operators',
          'Comprehensive liability insurance',
          'Operational safety certifications',
          'International regulatory compliance'
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
      cta: 'Experience the Fly-Fleet Difference'
    },
    es: {
      title: 'Acerca de Fly-Fleet',
      mission: {
        title: 'Nuestra Misión',
        text: 'Democratizar el acceso a la aviación privada conectando pasajeros con operadores certificados de manera transparente y eficiente.'
      },
      certifications: {
        title: 'Certificaciones y Seguros',
        items: [
          'Operadores certificados ANAC, FAA, EASA',
          'Seguro de responsabilidad civil integral',
          'Certificaciones de seguridad operacional',
          'Cumplimiento regulatorio internacional'
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
      cta: 'Experimentá la Diferencia Fly-Fleet'
    },
    pt: {
      title: 'Sobre a Fly-Fleet',
      mission: {
        title: 'Nossa Missão',
        text: 'Democratizar o acesso à aviação privada conectando passageiros com operadores certificados de forma transparente e eficiente.'
      },
      certifications: {
        title: 'Certificações e Seguros',
        items: [
          'Operadores certificados ANAC, FAA, EASA',
          'Seguro de responsabilidade civil integral',
          'Certificações de segurança operacional',
          'Conformidade regulatória internacional'
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
      cta: 'Experimente a Diferença Fly-Fleet'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function AboutPage() {
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
          <div className="grid md:grid-cols-2 gap-8">
            {content.commitment.items.map((item, index) => (
              <div key={index} className="text-center md:text-left">
                <h3 className="text-xl font-semibold mb-3 text-navy-primary">
                  {item.title}
                </h3>
                <p className="text-gray-600">
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
    </div>
  );
}