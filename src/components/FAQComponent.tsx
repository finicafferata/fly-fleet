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

  const simpleContent = {
    en: {
      title: 'Frequently Asked Questions',
      questions: [
        { question: 'How far in advance should I book a private jet?', answer: 'While we can accommodate last-minute requests (as little as 4 hours notice), we recommend booking at least 24-48 hours in advance for the best aircraft availability and pricing.' },
        { question: 'What types of aircraft do you offer?', answer: 'We offer Light Jets (6-8 passengers), Midsize Jets (8-10 passengers), Heavy Jets (10-16 passengers), and specialized aircraft for cargo or medical transport.' },
        { question: 'How is private jet charter pricing calculated?', answer: 'Pricing is based on aircraft type, flight distance, departure/arrival airports, time of year, and additional services. We provide transparent, all-inclusive quotes with no hidden fees.' }
      ]
    },
    es: {
      title: 'Preguntas Frecuentes',
      questions: [
        { question: '¿Con cuánta anticipación debo reservar un jet privado?', answer: 'Aunque podemos acomodar solicitudes de último momento (hasta 4 horas de aviso), recomendamos reservar con al menos 24-48 horas de anticipación para la mejor disponibilidad y precios.' },
        { question: '¿Qué tipos de aeronaves ofrecen?', answer: 'Ofrecemos Jets Ligeros (6-8 pasajeros), Jets Medianos (8-10 pasajeros), Jets Pesados (10-16 pasajeros), y aeronaves especializadas para transporte de carga o médico.' },
        { question: '¿Cómo se calcula el precio del chárter?', answer: 'El precio se basa en el tipo de aeronave, distancia de vuelo, aeropuertos de salida/llegada, época del año y servicios adicionales. Proporcionamos cotizaciones transparentes sin tarifas ocultas.' }
      ]
    },
    pt: {
      title: 'Perguntas Frequentes',
      questions: [
        { question: 'Com que antecedência devo reservar um jato privado?', answer: 'Embora possamos acomodar solicitações de última hora (até 4 horas de aviso), recomendamos reservar com pelo menos 24-48 horas de antecedência para melhor disponibilidade e preços.' },
        { question: 'Que tipos de aeronaves vocês oferecem?', answer: 'Oferecemos Jets Leves (6-8 passageiros), Jets Médios (8-10 passageiros), Jets Pesados (10-16 passageiros), e aeronaves especializadas para transporte de carga ou médico.' },
        { question: 'Como é calculado o preço do charter?', answer: 'O preço é baseado no tipo de aeronave, distância do voo, aeroportos de partida/chegada, época do ano e serviços adicionais. Fornecemos cotações transparentes sem taxas ocultas.' }
      ]
    }
  };

  const currentContent = simpleContent[locale as keyof typeof simpleContent] || simpleContent.en;

  return (
    <section className="py-0">
      <div className="max-w-5xl xl:max-w-6xl 2xl:max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
            {currentContent.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {locale === 'es' ? 'Respuestas a las preguntas más frecuentes sobre nuestros servicios de aviación privada.' :
             locale === 'pt' ? 'Respostas para as perguntas mais frequentes sobre nossos serviços de aviação privada.' :
             'Answers to the most frequently asked questions about our private aviation services.'}
          </p>
        </div>
        <div className="space-y-4 max-w-4xl mx-auto">
          {currentContent.questions.map((faq, index) => {
            const isExpanded = expandedItems.has(index.toString());
            return (
              <div key={index} className="group bg-white rounded-xl border border-gray-100 hover:border-accent-blue hover:shadow-lg transition-all duration-300">
                <button
                  className="w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-inset rounded-xl hover:bg-gray-50/50 transition-colors"
                  onClick={() => toggleExpanded(index.toString())}
                  aria-expanded={isExpanded}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-navy-primary pr-4 leading-snug">{faq.question}</span>
                    <svg
                      className={clsx(
                        'w-6 h-6 text-accent-blue transform transition-transform duration-300 flex-shrink-0',
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      )}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-5">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}