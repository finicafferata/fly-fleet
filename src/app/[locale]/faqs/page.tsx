'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about private charter flights',
      categories: {
        quotes: 'Quotes and Bookings',
        documentation: 'Documentation',
        pets: 'Pet Policies',
        fleet: 'Fleet and Capacity',
        airports: 'Airports and FBOs',
        pricing: 'Pricing',
        changes: 'Changes and Cancellations'
      },
      questions: [
        {
          id: 1,
          category: 'quotes',
          question: 'How long does a quote take?',
          answer: ''
        },
        {
          id: 2,
          category: 'documentation',
          question: 'What documents do I need for international flights?',
          answer: ''
        },
        {
          id: 3,
          category: 'pets',
          question: 'Can I travel with pets?',
          answer: ''
        },
        {
          id: 4,
          category: 'fleet',
          question: 'What types of aircraft do you offer and how many passengers do they accommodate?',
          answer: ''
        },
        {
          id: 5,
          category: 'airports',
          question: 'Which airports and FBOs do you use?',
          answer: ''
        },
        {
          id: 6,
          category: 'pricing',
          question: 'How is charter pricing calculated?',
          answer: ''
        },
        {
          id: 7,
          category: 'changes',
          question: 'Are there penalties for changes or cancellations?',
          answer: ''
        }
      ],
      cta: 'Still have questions?'
    },
    es: {
      title: 'Preguntas Frecuentes',
      subtitle: 'Todo lo que necesitás saber sobre vuelos charter privados',
      categories: {
        quotes: 'Cotización y Reservas',
        documentation: 'Documentación',
        pets: 'Políticas de Mascotas',
        fleet: 'Flota y Capacidad',
        airports: 'Aeropuertos y FBO',
        pricing: 'Precios',
        changes: 'Cambios y Cancelaciones'
      },
      questions: [
        {
          id: 1,
          category: 'quotes',
          question: '¿Cuánto demora una cotización?',
          answer: ''
        },
        {
          id: 2,
          category: 'documentation',
          question: '¿Qué documentos necesito para un vuelo internacional?',
          answer: ''
        },
        {
          id: 3,
          category: 'pets',
          question: '¿Puedo viajar con mascotas?',
          answer: ''
        },
        {
          id: 4,
          category: 'fleet',
          question: '¿Qué tipos de aeronaves ofrecen y cuántos pasajeros permiten?',
          answer: ''
        },
        {
          id: 5,
          category: 'airports',
          question: '¿Qué aeropuertos y FBO utilizan?',
          answer: ''
        },
        {
          id: 6,
          category: 'pricing',
          question: '¿Cómo se calcula el precio del chárter?',
          answer: ''
        },
        {
          id: 7,
          category: 'changes',
          question: '¿Hay penalidades por cambios o cancelaciones?',
          answer: ''
        }
      ],
      cta: '¿Tenés más preguntas?'
    },
    pt: {
      title: 'Perguntas Frequentes',
      subtitle: 'Tudo que você precisa saber sobre voos charter privados',
      categories: {
        quotes: 'Cotação e Reservas',
        documentation: 'Documentação',
        pets: 'Políticas para Pets',
        fleet: 'Frota e Capacidade',
        airports: 'Aeroportos e FBOs',
        pricing: 'Preços',
        changes: 'Mudanças e Cancelamentos'
      },
      questions: [
        {
          id: 1,
          category: 'quotes',
          question: 'Quanto tempo demora uma cotação?',
          answer: ''
        },
        {
          id: 2,
          category: 'documentation',
          question: 'Que documentos preciso para voos internacionais?',
          answer: ''
        },
        {
          id: 3,
          category: 'pets',
          question: 'Posso viajar com pets?',
          answer: ''
        },
        {
          id: 4,
          category: 'fleet',
          question: 'Que tipos de aeronaves vocês oferecem e quantos passageiros comportam?',
          answer: ''
        },
        {
          id: 5,
          category: 'airports',
          question: 'Quais aeroportos e FBOs vocês utilizam?',
          answer: ''
        },
        {
          id: 6,
          category: 'pricing',
          question: 'Como é calculado o preço do charter?',
          answer: ''
        },
        {
          id: 7,
          category: 'changes',
          question: 'Há penalidades para mudanças ou cancelamentos?',
          answer: ''
        }
      ],
      cta: 'Ainda tem dúvidas?'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function FAQsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const content = getContent(locale);

  const filteredQuestions = activeCategory
    ? content.questions.filter(q => q.category === activeCategory)
    : content.questions;

  const categoryKeys = Object.keys(content.categories) as Array<keyof typeof content.categories>;

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/faqs`);
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

      {/* Category Filter */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeCategory === null
                  ? 'bg-navy-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {locale === 'es' ? 'Todas' :
               locale === 'pt' ? 'Todas' :
               'All'}
            </button>
            {categoryKeys.map((categoryKey) => (
              <button
                key={categoryKey}
                onClick={() => setActiveCategory(categoryKey)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  activeCategory === categoryKey
                    ? 'bg-navy-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {content.categories[categoryKey]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {filteredQuestions.map((faq) => (
              <div key={faq.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                <button
                  onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                  className="w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-inset"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-navy-primary font-medium mb-1 uppercase">
                        {content.categories[faq.category as keyof typeof content.categories]}
                      </div>
                      <h3 className="text-lg font-semibold text-navy-primary">
                        {faq.question}
                      </h3>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        openQuestion === faq.id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {openQuestion === faq.id && (
                  <div className="px-6 pb-4">
                    <div className="pt-4 border-t border-gray-100">
                      {faq.answer ? (
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-yellow-800 text-sm">
                            {locale === 'es' ? 'Respuesta en desarrollo. Contáctanos por WhatsApp para más información.' :
                             locale === 'pt' ? 'Resposta em desenvolvimento. Entre em contato pelo WhatsApp para mais informações.' :
                             'Answer in development. Contact us via WhatsApp for more information.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
          <div className="flex justify-center">
            <WhatsAppWidget
              variant="inline"
              locale={locale}
              className="inline-flex"
            />
          </div>
        </div>
      </section>
      </main>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}