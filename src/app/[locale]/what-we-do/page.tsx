'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'What We Do',
      subtitle: 'We match travelers with the right aircraft and certified operator for each route. We handle negotiations and end-to-end coordination: slots, FBO, handling, documentation and onboard services.',
      processTitle: 'Your journey, step by step',
      step1: {
        title: 'Share your plan',
        subtitle: 'Tell us your travel details',
        points: [
          'Origin and destination',
          'Flexible dates and times',
          'Number of passengers',
          'Special services'
        ]
      },
      step2: {
        title: 'We curate verified options',
        subtitle: 'We select the best alternatives',
        points: [
          'Certified operators',
          'Appropriate aircraft',
          'Best market prices',
          'Confirmed availability'
        ]
      },
      step3: {
        title: 'You fly. We handle the rest',
        subtitle: 'We take care of every detail',
        points: [
          'Slot coordination',
          'FBO services',
          'Handling and documentation',
          'Real-time tracking'
        ]
      },
      benefitsTitle: 'Why choose Fly-Fleet?',
      benefits: {
        access: {
          title: 'Exclusive access',
          description: 'We work with a curated network of certified operators, not just the biggest players.'
        },
        transparency: {
          title: 'Total transparency',
          description: 'Clear pricing, no hidden fees. Know all costs before confirming.'
        },
        support: {
          title: 'Specialized support',
          description: 'Dedicated team that knows every airport, regulation and procedure.'
        },
        response: {
          title: 'Immediate response',
          description: 'Quotes in minutes, not days. Quick confirmations for last-minute changes.'
        }
      },
      cta: 'Get Started Today'
    },
    es: {
      title: 'Qué Hacemos',
      subtitle: 'Conectamos pasajeros con la mejor opción de aeronave y operador certificado para cada ruta. Negociamos, coordinamos y acompañamos todo el proceso: slots, FBO, handling, documentación y servicios a bordo.',
      processTitle: 'Tu viaje, paso a paso',
      step1: {
        title: 'Contanos tu plan',
        subtitle: 'Compartí los detalles de tu viaje',
        points: [
          'Origen y destino',
          'Fechas y horarios flexibles',
          'Cantidad de pasajeros',
          'Servicios especiales'
        ]
      },
      step2: {
        title: 'Curamos opciones verificadas',
        subtitle: 'Seleccionamos las mejores alternativas',
        points: [
          'Operadores certificados',
          'Aeronaves apropiadas',
          'Mejores precios del mercado',
          'Disponibilidad confirmada'
        ]
      },
      step3: {
        title: 'Volás. Coordinamos todo',
        subtitle: 'Nos encargamos de cada detalle',
        points: [
          'Coordinación de slots',
          'Servicios FBO',
          'Handling y documentación',
          'Seguimiento en tiempo real'
        ]
      },
      benefitsTitle: '¿Por qué elegir Fly-Fleet?',
      benefits: {
        access: {
          title: 'Acceso exclusivo',
          description: 'Trabajamos con una red curada de operadores certificados, no solo con los más grandes del mercado.'
        },
        transparency: {
          title: 'Transparencia total',
          description: 'Precios claros, sin tarifas ocultas. Conocés todos los costos antes de confirmar.'
        },
        support: {
          title: 'Soporte especializado',
          description: 'Equipo dedicado que conoce cada aeropuerto, regulación y procedimiento.'
        },
        response: {
          title: 'Respuesta inmediata',
          description: 'Cotizaciones en minutos, no días. Confirmaciones rápidas para cambios de último momento.'
        }
      },
      cta: 'Comenzar Hoy'
    },
    pt: {
      title: 'O Que Fazemos',
      subtitle: 'Conectamos você à aeronave ideal e a operadores certificados para cada rota. Cuidamos de toda a coordenação: slots, FBO, handling, documentação e serviços a bordo.',
      processTitle: 'Sua viagem, passo a passo',
      step1: {
        title: 'Conte seu plano',
        subtitle: 'Compartilhe os detalhes da viagem',
        points: [
          'Origem e destino',
          'Datas e horários flexíveis',
          'Número de passageiros',
          'Serviços especiais'
        ]
      },
      step2: {
        title: 'Curadoria de opções verificadas',
        subtitle: 'Selecionamos as melhores alternativas',
        points: [
          'Operadores certificados',
          'Aeronaves apropriadas',
          'Melhores preços do mercado',
          'Disponibilidade confirmada'
        ]
      },
      step3: {
        title: 'Você voa. Nós cuidamos do resto',
        subtitle: 'Cuidamos de cada detalhe',
        points: [
          'Coordenação de slots',
          'Serviços FBO',
          'Handling e documentação',
          'Acompanhamento em tempo real'
        ]
      },
      benefitsTitle: 'Por que escolher a Fly-Fleet?',
      benefits: {
        access: {
          title: 'Acesso exclusivo',
          description: 'Trabalhamos com uma rede curada de operadores certificados, não apenas os maiores do mercado.'
        },
        transparency: {
          title: 'Transparência total',
          description: 'Preços claros, sem taxas ocultas. Conheça todos os custos antes de confirmar.'
        },
        support: {
          title: 'Suporte especializado',
          description: 'Equipe dedicada que conhece cada aeroporto, regulamentação e procedimento.'
        },
        response: {
          title: 'Resposta imediata',
          description: 'Cotações em minutos, não dias. Confirmações rápidas para mudanças de última hora.'
        }
      },
      cta: 'Começar Hoje'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function WhatWeDoPage() {
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

      {/* Process Steps */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-primary">
            {content.processTitle}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.step1.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.step1.subtitle}
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                {content.step1.points.map((point, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-accent-blue rounded-full mr-3" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.step2.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.step2.subtitle}
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                {content.step2.points.map((point, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-accent-blue rounded-full mr-3" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.step3.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.step3.subtitle}
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                {content.step3.points.map((point, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-accent-blue rounded-full mr-3" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-navy-primary">
            {content.benefitsTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.benefits.access.title}
              </h3>
              <p className="text-gray-600">
                {content.benefits.access.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.benefits.transparency.title}
              </h3>
              <p className="text-gray-600">
                {content.benefits.transparency.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.benefits.support.title}
              </h3>
              <p className="text-gray-600">
                {content.benefits.support.description}
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.benefits.response.title}
              </h3>
              <p className="text-gray-600">
                {content.benefits.response.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            {content.cta}
          </h2>
          <a
            href={`/${locale}/quote`}
            className="inline-flex items-center justify-center bg-accent-blue hover:bg-accent-blue/90 text-white min-h-[56px] px-8 text-lg font-semibold rounded-lg shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {locale === 'es' ? 'Cotizar ahora' :
             locale === 'pt' ? 'Pedir cotação' :
             'Get a quote'}
          </a>
        </div>
      </section>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}