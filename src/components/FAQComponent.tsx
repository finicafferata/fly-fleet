'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';

interface FAQComponentProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onContactClick?: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  id: string;
  name: string;
  count: number;
}

export function FAQComponent({
  locale = 'en',
  className,
  onContactClick
}: FAQComponentProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const getContent = (locale: string) => {
    const content = {
      en: {
        title: 'Frequently Asked Questions',
        subtitle: 'Find answers to common questions about our private aviation services',
        searchPlaceholder: 'Search FAQs...',
        searchLabel: 'Search frequently asked questions',
        allCategories: 'All Categories',
        noResults: 'No FAQs found matching your search.',
        noResultsDescription: 'Try adjusting your search terms or browse all categories.',
        contactCTA: {
          title: 'Still have questions?',
          subtitle: 'Our team is here to help with any specific inquiries',
          button: 'Contact Us'
        },
        categories: [
          { id: 'all', name: 'All Categories', count: 0 },
          { id: 'booking', name: 'Booking & Reservations', count: 0 },
          { id: 'aircraft', name: 'Aircraft & Fleet', count: 0 },
          { id: 'pricing', name: 'Pricing & Payments', count: 0 },
          { id: 'safety', name: 'Safety & Security', count: 0 },
          { id: 'travel', name: 'Travel & Documentation', count: 0 },
          { id: 'services', name: 'Additional Services', count: 0 }
        ],
        faqs: [
          {
            id: 'booking-1',
            category: 'booking',
            question: 'How far in advance should I book a private jet?',
            answer: 'While we can accommodate last-minute requests (as little as 4 hours notice), we recommend booking at least 24-48 hours in advance for the best aircraft availability and pricing. For peak travel periods, holidays, or specific aircraft requirements, booking 1-2 weeks ahead is ideal.'
          },
          {
            id: 'booking-2',
            category: 'booking',
            question: 'Can I modify or cancel my booking?',
            answer: 'Yes, modifications and cancellations are possible depending on the timing and specific terms of your charter agreement. Changes made more than 24 hours before departure typically have minimal fees, while last-minute changes may incur additional costs. We always work to accommodate your needs while being transparent about any applicable fees.'
          },
          {
            id: 'booking-3',
            category: 'booking',
            question: 'What information do I need to provide when booking?',
            answer: 'To complete your booking, we need: passenger names (as they appear on identification), departure/arrival airports, preferred departure time, number of passengers, any special requests (catering, ground transportation), and contact information. For international flights, passport information is required.'
          },
          {
            id: 'aircraft-1',
            category: 'aircraft',
            question: 'What types of aircraft do you offer?',
            answer: 'We offer a comprehensive fleet including Light Jets (6-8 passengers, ideal for regional travel), Midsize Jets (8-10 passengers, perfect for business trips), Heavy Jets (10-16 passengers, long-range comfort), and Ultra Long Range aircraft (14-19 passengers, intercontinental flights). We also provide helicopters for short transfers and specialized aircraft for cargo or medical transport.'
          },
          {
            id: 'aircraft-2',
            category: 'aircraft',
            question: 'Are all aircraft owned by Fly-Fleet?',
            answer: 'As a charter brokerage, we work with a carefully vetted network of certified aircraft operators and owners. Every aircraft in our network meets strict safety standards and is operated by professional crews. This model allows us to offer you the best aircraft for your specific needs while maintaining the highest safety and service standards.'
          },
          {
            id: 'aircraft-3',
            category: 'aircraft',
            question: 'What amenities are available on board?',
            answer: 'Amenities vary by aircraft type but typically include comfortable leather seating, Wi-Fi, entertainment systems, refreshment centers, and lavatory facilities. Larger aircraft may feature conference areas, bedrooms, and full galley kitchens. We can arrange custom catering, ground transportation, and other services to enhance your travel experience.'
          },
          {
            id: 'pricing-1',
            category: 'pricing',
            question: 'How is private jet charter pricing calculated?',
            answer: 'Pricing is based on several factors: aircraft type and size, flight distance and duration, departure/arrival airports, time of year, crew costs, landing fees, fuel costs, and any additional services. We provide transparent, all-inclusive quotes with no hidden fees. Empty leg flights offer significant savings when your schedule is flexible.'
          },
          {
            id: 'pricing-2',
            category: 'pricing',
            question: 'What payment methods do you accept?',
            answer: 'We accept wire transfers, certified checks, and major credit cards. For new clients, payment is typically required before departure. Established clients may be eligible for credit terms. We also offer charter card programs and jet membership options for frequent travelers.'
          },
          {
            id: 'pricing-3',
            category: 'pricing',
            question: 'Are there any additional fees I should know about?',
            answer: 'Our quotes are all-inclusive and include aircraft rental, crew, fuel, standard catering, and most airport fees. Additional costs may apply for: premium catering, ground transportation, overnight crew expenses, international handling fees, customs/immigration services, or de-icing in winter conditions. All potential additional costs are disclosed upfront.'
          },
          {
            id: 'safety-1',
            category: 'safety',
            question: 'What safety standards do you maintain?',
            answer: 'Safety is our top priority. All aircraft operators in our network maintain ARG/US, Wyvern, or IS-BAO safety ratings. Pilots undergo regular training and proficiency checks, aircraft receive thorough maintenance per manufacturer specifications, and we conduct ongoing safety audits of all operators.'
          },
          {
            id: 'safety-2',
            category: 'safety',
            question: 'Are pilots required to undergo drug and alcohol testing?',
            answer: 'Yes, all pilots in our network are subject to comprehensive drug and alcohol testing programs as required by aviation regulations. This includes pre-employment testing, random testing, post-incident testing, and follow-up testing. We maintain zero tolerance for substance abuse.'
          },
          {
            id: 'safety-3',
            category: 'safety',
            question: 'What happens in case of weather delays?',
            answer: 'Safety always comes first. If weather conditions are unsafe for departure, flights will be delayed until conditions improve. We monitor weather continuously and will proactively communicate any potential delays. We work to minimize disruptions through alternative routing when possible and assist with accommodation arrangements for extended delays.'
          },
          {
            id: 'travel-1',
            category: 'travel',
            question: 'What documents do I need for international travel?',
            answer: 'For international flights, you need a valid passport (with at least 6 months remaining validity) and any required visas for your destination. Some countries require additional documentation. Our team assists with entry requirements and can recommend visa services when needed. We also help coordinate customs and immigration procedures.'
          },
          {
            id: 'travel-2',
            category: 'travel',
            question: 'Can I bring pets on the aircraft?',
            answer: 'Yes, pets are welcome on most private aircraft. Unlike commercial airlines, pets can remain in the cabin with you. We require health certificates and vaccination records, and for international travel, additional documentation may be needed. Some destinations have quarantine requirements we help you navigate.'
          },
          {
            id: 'travel-3',
            category: 'travel',
            question: 'What are the baggage limitations?',
            answer: 'Private jets offer much more flexibility than commercial airlines. Baggage limits depend on aircraft size, passenger count, and flight distance. Generally, you can bring more luggage, and we can accommodate oversized items like golf clubs, skis, or artwork. We discuss baggage requirements during booking to ensure adequate space.'
          },
          {
            id: 'services-1',
            category: 'services',
            question: 'Do you provide ground transportation?',
            answer: 'Yes, we arrange luxury ground transportation to complement your flight. Options include executive sedans, SUVs, limousines, and specialty vehicles. Ground transportation can be coordinated for departure and arrival cities, and we ensure timing aligns perfectly with your flight schedule.'
          },
          {
            id: 'services-2',
            category: 'services',
            question: 'What catering options are available?',
            answer: 'We offer comprehensive catering services ranging from light refreshments to multi-course gourmet meals. Our catering partners can accommodate dietary restrictions, cultural preferences, and special occasions. Options include continental breakfast, business lunches, formal dinners, cocktail service, and children\'s meals.'
          },
          {
            id: 'services-3',
            category: 'services',
            question: 'Can you arrange hotel accommodations and activities?',
            answer: 'While our primary focus is aviation services, we can assist with basic hotel recommendations and activity suggestions through our concierge partnerships. For comprehensive travel planning, we recommend working with specialized travel agencies, though we\'re happy to coordinate any services that enhance your aviation experience.'
          }
        ]
      },
      es: {
        title: 'Preguntas Frecuentes',
        subtitle: 'Encuentra respuestas a preguntas comunes sobre nuestros servicios de aviación privada',
        searchPlaceholder: 'Buscar en preguntas frecuentes...',
        searchLabel: 'Buscar preguntas frecuentes',
        allCategories: 'Todas las Categorías',
        noResults: 'No se encontraron preguntas que coincidan con tu búsqueda.',
        noResultsDescription: 'Intenta ajustar tus términos de búsqueda o navega por todas las categorías.',
        contactCTA: {
          title: '¿Aún tienes preguntas?',
          subtitle: 'Nuestro equipo está aquí para ayudarte con cualquier consulta específica',
          button: 'Contáctanos'
        },
        categories: [
          { id: 'all', name: 'Todas las Categorías', count: 0 },
          { id: 'booking', name: 'Reservas y Contratación', count: 0 },
          { id: 'aircraft', name: 'Aeronaves y Flota', count: 0 },
          { id: 'pricing', name: 'Precios y Pagos', count: 0 },
          { id: 'safety', name: 'Seguridad', count: 0 },
          { id: 'travel', name: 'Viajes y Documentación', count: 0 },
          { id: 'services', name: 'Servicios Adicionales', count: 0 }
        ],
        faqs: [
          {
            id: 'booking-1',
            category: 'booking',
            question: '¿Con cuánta anticipación debo reservar un jet privado?',
            answer: 'Aunque podemos acomodar solicitudes de último momento (hasta 4 horas de aviso), recomendamos reservar con al menos 24-48 horas de anticipación para la mejor disponibilidad de aeronaves y precios. Para períodos de alta demanda, feriados o requerimientos específicos de aeronaves, reservar 1-2 semanas antes es ideal.'
          },
          {
            id: 'booking-2',
            category: 'booking',
            question: '¿Puedo modificar o cancelar mi reserva?',
            answer: 'Sí, las modificaciones y cancelaciones son posibles dependiendo del tiempo y términos específicos de tu acuerdo de charter. Cambios realizados más de 24 horas antes de la salida típicamente tienen tarifas mínimas, mientras que cambios de último momento pueden incurrir costos adicionales. Siempre trabajamos para acomodar tus necesidades siendo transparentes sobre cualquier tarifa aplicable.'
          },
          {
            id: 'booking-3',
            category: 'booking',
            question: '¿Qué información necesito proporcionar al reservar?',
            answer: 'Para completar tu reserva, necesitamos: nombres de pasajeros (como aparecen en la identificación), aeropuertos de salida/llegada, hora preferida de salida, número de pasajeros, solicitudes especiales (catering, transporte terrestre), e información de contacto. Para vuelos internacionales, se requiere información del pasaporte.'
          }
          // Additional Spanish FAQs would continue here...
        ]
      },
      pt: {
        title: 'Perguntas Frequentes',
        subtitle: 'Encontre respostas para perguntas comuns sobre nossos serviços de aviação privada',
        searchPlaceholder: 'Buscar nas perguntas frequentes...',
        searchLabel: 'Buscar perguntas frequentes',
        allCategories: 'Todas as Categorias',
        noResults: 'Nenhuma pergunta encontrada que corresponda à sua busca.',
        noResultsDescription: 'Tente ajustar seus termos de busca ou navegue por todas as categorias.',
        contactCTA: {
          title: 'Ainda tem dúvidas?',
          subtitle: 'Nossa equipe está aqui para ajudar com qualquer pergunta específica',
          button: 'Entre em Contato'
        },
        categories: [
          { id: 'all', name: 'Todas as Categorias', count: 0 },
          { id: 'booking', name: 'Reservas e Contratação', count: 0 },
          { id: 'aircraft', name: 'Aeronaves e Frota', count: 0 },
          { id: 'pricing', name: 'Preços e Pagamentos', count: 0 },
          { id: 'safety', name: 'Segurança', count: 0 },
          { id: 'travel', name: 'Viagens e Documentação', count: 0 },
          { id: 'services', name: 'Serviços Adicionais', count: 0 }
        ],
        faqs: [
          {
            id: 'booking-1',
            category: 'booking',
            question: 'Com que antecedência devo reservar um jato privado?',
            answer: 'Embora possamos acomodar solicitações de última hora (até 4 horas de aviso), recomendamos reservar com pelo menos 24-48 horas de antecedência para melhor disponibilidade de aeronaves e preços. Para períodos de alta demanda, feriados ou requisitos específicos de aeronaves, reservar 1-2 semanas antes é ideal.'
          },
          {
            id: 'booking-2',
            category: 'booking',
            question: 'Posso modificar ou cancelar minha reserva?',
            answer: 'Sim, modificações e cancelamentos são possíveis dependendo do tempo e termos específicos do seu acordo de charter. Mudanças feitas mais de 24 horas antes da partida tipicamente têm taxas mínimas, enquanto mudanças de última hora podem incorrer custos adicionais. Sempre trabalhamos para acomodar suas necessidades sendo transparentes sobre qualquer taxa aplicável.'
          },
          {
            id: 'booking-3',
            category: 'booking',
            question: 'Que informações preciso fornecer ao reservar?',
            answer: 'Para completar sua reserva, precisamos: nomes dos passageiros (como aparecem na identificação), aeroportos de partida/chegada, horário preferido de partida, número de passageiros, solicitações especiais (catering, transporte terrestre), e informações de contato. Para voos internacionais, informações do passaporte são necessárias.'
          }
          // Additional Portuguese FAQs would continue here...
        ]
      }
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = useMemo(() => getContent(locale), [locale]);

  // Calculate category counts
  const categoriesWithCounts = useMemo(() =>
    content.categories.map(category => ({
      ...category,
      count: category.id === 'all'
        ? content.faqs.length
        : content.faqs.filter(faq => faq.category === category.id).length
    })), [content]);

  // Filter FAQs based on active category and search query
  useEffect(() => {
    let filtered = content.faqs;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFAQs(filtered);
  }, [activeCategory, searchQuery, content]);

  const toggleExpanded = (faqId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>;
      }
      return part;
    });
  };

  // Schema.org FAQPage structured data
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": filteredFAQs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className={clsx('faq-section', className)} aria-labelledby="faq-title">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="faq-title" className="text-4xl md:text-5xl font-bold mb-6">
            {content.title}
          </h2>
          <p className="text-xl text-neutral-light">
            {content.subtitle}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="py-12 bg-neutral-light">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="faq-search max-w-2xl mx-auto mb-8" role="search">
            <div className="relative">
              <label htmlFor="faq-search-input" className="sr-only">
                {content.searchLabel}
              </label>
              <input
                ref={searchInputRef}
                id="faq-search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={content.searchPlaceholder}
                className="w-full px-6 py-4 pl-12 pr-12 text-lg rounded-lg border border-neutral-medium/30 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Type to search through frequently asked questions
              </div>
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-medium"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-medium hover:text-navy-primary transition-colors"
                  aria-label="Clear search"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="faq-filters" role="group" aria-labelledby="filter-heading">
            <h3 id="filter-heading" className="sr-only">Filter by Category</h3>
            <div className="filter-tabs flex flex-wrap justify-center gap-3 mb-8" role="tablist" aria-label="FAQ categories">
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.id}
                  role="tab"
                  aria-selected={activeCategory === category.id}
                  aria-controls={`faq-panel-${category.id}`}
                  id={`faq-tab-${category.id}`}
                  onClick={() => setActiveCategory(category.id)}
                  className={clsx(
                    'filter-tab px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm',
                    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                    activeCategory === category.id
                      ? 'bg-accent-blue text-white active'
                      : 'bg-white text-navy-primary hover:bg-accent-blue/10 border border-neutral-medium/30'
                  )}
                >
                  {category.name}
                  <span className="ml-2 text-xs opacity-75">
                    ({category.count})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ List */}
      <div className="faq-content py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-neutral-medium mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-3v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-navy-primary mb-2">
                {content.noResults}
              </h3>
              <p className="text-neutral-medium mb-6">
                {content.noResultsDescription}
              </p>
              <Button
                onClick={handleClearSearch}
                variant="secondary"
                className="border-accent-blue text-accent-blue hover:bg-accent-blue hover:text-white"
              >
                Clear Search
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq) => {
                const isExpanded = expandedItems.has(faq.id);
                return (
                  <article key={faq.id} className="faq-item border border-neutral-medium/20 rounded-lg bg-white shadow-small hover:shadow-medium transition-shadow duration-200">
                    <h3>
                      <button
                        className="faq-question w-full px-6 py-4 text-left focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-inset"
                        aria-expanded={isExpanded}
                        aria-controls={`faq-answer-${faq.id}`}
                        onClick={() => toggleExpanded(faq.id)}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-lg font-semibold text-navy-primary pr-4 leading-relaxed">
                            {highlightSearchTerm(faq.question, searchQuery)}
                          </span>
                          <span className={clsx(
                            'faq-icon w-5 h-5 text-accent-blue transition-transform duration-200 flex-shrink-0 mt-1',
                            isExpanded && 'transform rotate-180'
                          )} aria-hidden="true">
                            {isExpanded ? '−' : '+'}
                          </span>
                        </div>
                      </button>
                    </h3>
                    <div
                      id={`faq-answer-${faq.id}`}
                      className={clsx(
                        'faq-answer transition-all duration-200 overflow-hidden',
                        isExpanded ? 'expanded max-h-none opacity-100' : 'max-h-0 opacity-0'
                      )}
                      aria-hidden={!isExpanded}
                    >
                      <div className="faq-content px-6 pb-6 text-neutral-dark leading-relaxed">
                        <div className="border-t border-neutral-medium/10 pt-4">
                          {highlightSearchTerm(faq.answer, searchQuery)}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Contact CTA */}
      <section className="py-16 bg-gradient-to-r from-accent-blue to-navy-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {content.contactCTA.title}
          </h2>
          <p className="text-lg text-neutral-light mb-8">
            {content.contactCTA.subtitle}
          </p>
          <Button
            onClick={onContactClick}
            size="lg"
            className="bg-white text-navy-primary hover:bg-neutral-light transition-colors duration-200"
          >
            {content.contactCTA.button}
          </Button>
        </div>
      </section>
    </section>
  );
}