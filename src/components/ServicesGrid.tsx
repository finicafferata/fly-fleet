'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';

export interface ServicesGridProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onServiceRequest?: (serviceType: string) => void;
}

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  ctaText: string;
}

const getContent = (locale: string) => {
  const content = {
    en: {
      heading: 'Our Services',
      subheading: 'Private aviation solutions tailored to your needs',
      services: [
        {
          id: 'charter',
          title: 'Private Charter',
          description: 'Customized flights on your schedule with premium aircraft and personalized service.',
          features: ['On-demand flights', 'Flexible scheduling', 'Premium aircraft', 'Personalized service'],
          ctaText: 'Get Charter Quote',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
        {
          id: 'multicity',
          title: 'Multi-City Tours',
          description: 'Visit multiple destinations in one seamless journey with coordinated ground services.',
          features: ['Multiple stops', 'Coordinated logistics', 'Ground services', 'Custom itineraries'],
          ctaText: 'Plan Tour',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          id: 'helicopter',
          title: 'Helicopter Services',
          description: 'Urban transfers and short-distance flights with helicopter charter services.',
          features: ['City transfers', 'Airport shuttle', 'Scenic tours', 'Emergency transport'],
          ctaText: 'Book Helicopter',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          id: 'medical',
          title: 'Medical Transport',
          description: 'Specialized medical evacuation and transport with equipped aircraft and medical staff.',
          features: ['Medical equipment', 'Trained staff', '24/7 availability', 'Emergency response'],
          ctaText: 'Emergency Contact',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          id: 'cargo',
          title: 'Cargo Services',
          description: 'Freight and cargo transportation with specialized aircraft for time-sensitive shipments.',
          features: ['Time-sensitive cargo', 'Specialized aircraft', 'Global reach', 'Secure transport'],
          ctaText: 'Ship Cargo',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
        },
      ] as Service[],
    },
    es: {
      heading: 'Nuestros Servicios',
      subheading: 'Soluciones de aviación privada adaptadas a sus necesidades',
      services: [
        {
          id: 'charter',
          title: 'Charter Privado',
          description: 'Vuelos personalizados según su horario con aeronaves premium y servicio personalizado.',
          features: ['Vuelos bajo demanda', 'Horarios flexibles', 'Aeronaves premium', 'Servicio personalizado'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
        {
          id: 'multicity',
          title: 'Tours Multi-Ciudad',
          description: 'Visite múltiples destinos en un viaje fluido con servicios terrestres coordinados.',
          features: ['Múltiples paradas', 'Logística coordinada', 'Servicios terrestres', 'Itinerarios personalizados'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          id: 'helicopter',
          title: 'Servicios de Helicóptero',
          description: 'Traslados urbanos y vuelos de corta distancia con servicios de charter de helicóptero.',
          features: ['Traslados urbanos', 'Shuttle aeropuerto', 'Tours panorámicos', 'Transporte de emergencia'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          id: 'medical',
          title: 'Transporte Médico',
          description: 'Evacuación y transporte médico especializado con aeronaves equipadas y personal médico.',
          features: ['Equipo médico', 'Personal capacitado', 'Disponibilidad 24/7', 'Respuesta de emergencia'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          id: 'cargo',
          title: 'Servicios de Carga',
          description: 'Transporte de carga y mercancías con aeronaves especializadas para envíos urgentes.',
          features: ['Carga urgente', 'Aeronaves especializadas', 'Alcance global', 'Transporte seguro'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
        },
      ] as Service[],
    },
    pt: {
      heading: 'Nossos Serviços',
      subheading: 'Soluções de aviação privada adaptadas às suas necessidades',
      services: [
        {
          id: 'charter',
          title: 'Charter Privado',
          description: 'Voos personalizados no seu horário com aeronaves premium e serviço personalizado.',
          features: ['Voos sob demanda', 'Horários flexíveis', 'Aeronaves premium', 'Serviço personalizado'],
          ctaText: 'Cotar Charter',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
        {
          id: 'multicity',
          title: 'Tours Multi-Cidade',
          description: 'Visite múltiplos destinos em uma jornada fluida com serviços terrestres coordenados.',
          features: ['Múltiplas paradas', 'Logística coordenada', 'Serviços terrestres', 'Itinerários personalizados'],
          ctaText: 'Planejar Tour',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          id: 'helicopter',
          title: 'Serviços de Helicóptero',
          description: 'Transfers urbanos e voos de curta distância com serviços de charter de helicóptero.',
          features: ['Transfers urbanos', 'Shuttle aeroporto', 'Tours panorâmicos', 'Transporte emergência'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        },
        {
          id: 'medical',
          title: 'Transporte Médico',
          description: 'Evacuação e transporte médico especializado com aeronaves equipadas e equipe médica.',
          features: ['Equipamento médico', 'Equipe treinada', 'Disponibilidade 24/7', 'Resposta emergência'],
          ctaText: 'Contato Emergência',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          id: 'cargo',
          title: 'Serviços de Carga',
          description: 'Transporte de carga e mercadorias com aeronaves especializadas para embarques urgentes.',
          features: ['Carga urgente', 'Aeronaves especializadas', 'Alcance global', 'Transporte seguro'],
          ctaText: 'Cotizar servicio',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
        },
      ] as Service[],
    },
  };

  return content[locale as keyof typeof content] || content.en;
};

export function ServicesGrid({
  locale = 'en',
  className,
  onServiceRequest,
}: ServicesGridProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const content = getContent(locale);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px 0px',
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleServiceCTA = (serviceId: string) => {
    // Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'service_cta_click', {
        event_category: 'engagement',
        event_label: serviceId,
        value: 1,
      });
    }
    onServiceRequest?.(serviceId);
  };

  return (
    <section
      ref={sectionRef}
      className={clsx(
        'py-16 md:py-24 bg-neutral-light',
        className
      )}
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            id="services-heading"
            className={clsx(
              'text-3xl md:text-4xl lg:text-5xl font-bold text-navy-primary mb-4',
              'transform transition-all duration-800 ease-out',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            {content.heading}
          </h2>
          <p
            className={clsx(
              'text-lg md:text-xl text-neutral-medium max-w-3xl mx-auto',
              'transform transition-all duration-800 ease-out delay-200',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            {content.subheading}
          </p>
        </div>

        {/* Services Grid */}
        <div className="services-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
          {content.services.map((service, index) => (
            <article
              key={service.id}
              className={clsx(
                'service-card bg-white rounded-xl shadow-medium hover:shadow-large',
                'border border-neutral-medium/20',
                'p-6 md:p-8',
                'transform transition-all duration-800 ease-out',
                'hover:scale-105 hover:-translate-y-2',
                'group',
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              )}
              style={{
                transitionDelay: `${(index + 1) * 100}ms`,
              }}
              role="listitem"
            >
              {/* Icon */}
              <div className="service-icon mb-6" aria-hidden="true">
                <div
                  className={clsx(
                    'w-12 h-12 md:w-16 md:h-16',
                    'bg-gradient-to-br from-navy-primary to-navy-primary/80',
                    'rounded-xl flex items-center justify-center',
                    'text-white shadow-medium',
                    'group-hover:scale-110 transition-transform duration-300'
                  )}
                >
                  {service.icon}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="service-title text-xl md:text-2xl font-bold text-navy-primary">
                  {service.title}
                </h3>

                <p className="service-description text-neutral-medium leading-relaxed">
                  {service.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-navy-primary rounded-full flex-shrink-0" />
                      <span className="text-sm text-neutral-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <div className="pt-4">
                  <a
                    href="/quote"
                    className={clsx(
                      'service-cta inline-flex items-center justify-center w-full',
                      'bg-navy-primary hover:bg-navy-primary/90 text-white',
                      'px-4 py-2 rounded-lg font-medium text-center',
                      'group-hover:shadow-large transition-all duration-300',
                      'focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2',
                      'min-h-[44px]'
                    )}
                    aria-label={`Request quote for ${service.title}`}
                    onClick={() => handleServiceCTA(service.id)}
                  >
                    {service.ctaText}
                  </a>
                </div>
              </div>

            </article>
          ))}
        </div>
      </div>
    </section>
  );
}