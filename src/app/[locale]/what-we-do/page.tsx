'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'What We Do',
      introText: [
        'At Fly-Fleet we transform your needs into private, secure and exclusive flight experiences.',
        'Access a global network of certified operators and get instant quotes with complete transparency.',
        'We handle everything: immigration requirements, customs, gourmet catering, VIP transfers and even pet-friendly flights.'
      ],
      advisoryTitle: 'Comprehensive private aviation advisory',
      advisoryPoints: [
        'Access a global network of certified operators.',
        'Get instant and transparent quotes.',
        'Receive guidance on immigration, customs requirements and additional services (catering, transfers, pet-friendly, etc.)'
      ],
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
      benefits: [
        'Absolute flexibility: schedules and routes adapted to your agenda.',
        'Privacy and security without compromise: operators with international certifications.',
        'Global coverage: more than 5,000 airports in LATAM, USA and Europe',
        'Personalized 24/7 support: in Spanish, English and Portuguese.',
        'Distinctive services: pets on board, exclusive concierge and door-to-door transfers.'
      ],
      closingStatement: 'With Fly-Fleet you don\'t just fly, you live the experience of limitless freedom.',
      cta: 'Get Started Today'
    },
    es: {
      title: 'Qué Hacemos',
      introText: [
        'En Fly-Fleet convertimos tus necesidades en experiencias de vuelo privadas, seguras y exclusivas.',
        'Accedé a una red global de operadores certificados y obtené cotización inmediata con transparencia total.',
        'Nos ocupamos de todo: requisitos migratorios, aduaneros, catering gourmet, traslados VIP y hasta vuelos pet-friendly.'
      ],
      advisoryTitle: 'Asesoría integral de vuelos privados',
      advisoryPoints: [
        'Accedé a una red global de operadores certificados.',
        'Cotizá de inmediato y transparente.',
        'Asesorate sobre requisitos migratorios, aduaneros y servicios adicionales (catering, traslados, pet-friendly, etc.)'
      ],
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
      benefits: [
        'Flexibilidad absoluta: horarios y rutas adaptadas a tu agenda.',
        'Privacidad y seguridad sin compromisos: operadores con certificaciones internacionales.',
        'Cobertura global: más de 5.000 aeropuertos en LATAM, USA y Europa',
        'Atención personalizada 24/7: en español, inglés y portugués.',
        'Servicios diferenciales: mascotas a bordo, concierge exclusivo y traslados puerta a puerta.'
      ],
      closingStatement: 'Con Fly-Fleet no solo volás, vivís la experiencia de libertad sin límites.',
      cta: 'Comenzar Hoy'
    },
    pt: {
      title: 'O Que Fazemos',
      introText: [
        'Na Fly-Fleet transformamos suas necessidades em experiências de voo privadas, seguras e exclusivas.',
        'Acesse uma rede global de operadores certificados e obtenha cotações imediatas com total transparência.',
        'Cuidamos de tudo: requisitos de imigração, alfândega, catering gourmet, transfers VIP e até voos pet-friendly.'
      ],
      advisoryTitle: 'Assessoria integral de aviação privada',
      advisoryPoints: [
        'Acesse uma rede global de operadores certificados.',
        'Obtenha cotações imediatas e transparentes.',
        'Receba orientação sobre requisitos de imigração, alfândega e serviços adicionais (catering, transfers, pet-friendly, etc.)'
      ],
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
      benefits: [
        'Flexibilidade absoluta: horários e rotas adaptadas à sua agenda.',
        'Privacidade e segurança sem compromissos: operadores com certificações internacionais.',
        'Cobertura global: mais de 5.000 aeroportos na LATAM, EUA e Europa',
        'Atendimento personalizado 24/7: em espanhol, inglês e português.',
        'Serviços diferenciados: pets a bordo, concierge exclusivo e transfers porta a porta.'
      ],
      closingStatement: 'Com a Fly-Fleet você não apenas voa, você vive a experiência de liberdade sem limites.',
      cta: 'Começar Hoje'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function WhatWeDoPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Navigation
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/what-we-do`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-20">
        {/* Title Banner */}
      <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            {content.title}
          </h1>
        </div>
      </section>

      {/* Content Section - White Background */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            {content.introText.map((paragraph, index) => (
              <p key={index} className="text-base md:text-lg text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps - Match Homepage Design */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
            {/* Connecting Lines - Desktop Only */}
            <div className="hidden md:block absolute inset-0 pointer-events-none z-0" aria-hidden="true">
              <div className="flex items-center justify-center h-12 relative">
                <div className="absolute left-1/6 right-1/6 h-0.5 bg-accent-blue top-1/2 transform -translate-y-1/2" />
              </div>
            </div>

            {/* Step 1 */}
            <div className="text-center relative z-10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-blue rounded-full flex items-center justify-center text-white text-base md:text-lg font-bold mx-auto mb-3 shadow-large border-4 border-white">
                1
              </div>
              <h3 className="text-sm md:text-base font-bold text-navy-primary leading-tight max-w-32 mx-auto">
                {content.step1.title}
              </h3>
            </div>

            {/* Step 2 */}
            <div className="text-center relative z-10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-blue rounded-full flex items-center justify-center text-white text-base md:text-lg font-bold mx-auto mb-3 shadow-large border-4 border-white">
                2
              </div>
              <h3 className="text-sm md:text-base font-bold text-navy-primary leading-tight max-w-32 mx-auto">
                {content.step2.title}
              </h3>
            </div>

            {/* Step 3 */}
            <div className="text-center relative z-10">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-blue rounded-full flex items-center justify-center text-white text-base md:text-lg font-bold mx-auto mb-3 shadow-large border-4 border-white">
                3
              </div>
              <h3 className="text-sm md:text-base font-bold text-navy-primary leading-tight max-w-32 mx-auto">
                {content.step3.title}
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Restructured */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 text-navy-primary">
            {content.benefitsTitle}
          </h2>

          {/* Closing Statement - Below Title */}
          <p className="text-base md:text-lg font-medium text-navy-primary italic mb-8">
            {content.closingStatement}
          </p>

          {/* Cards Grid */}
          <div className="space-y-6">
            {/* Top Row - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.benefits.slice(0, 3).map((benefit, index) => {
                const [title, description] = benefit.split(': ');
                return (
                  <div key={index} className="bg-gray-50 p-5 rounded-lg shadow-sm">
                    <h3 className="text-base font-bold text-navy-primary mb-2 leading-tight">
                      {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Bottom Row - 2 Cards Centered */}
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                {content.benefits.slice(3, 5).map((benefit, index) => {
                  const [title, description] = benefit.split(': ');
                  return (
                    <div key={index + 3} className="bg-gray-50 p-5 rounded-lg shadow-sm">
                      <h3 className="text-base font-bold text-navy-primary mb-2 leading-tight">
                        {title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}