'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';

export interface ProcessStepsProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
}

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const getContent = (locale: string) => {
  const content = {
    en: {
      heading: 'How It Works',
      subheading: 'Simple steps to your perfect flight',
      steps: [
        {
          title: 'Request Quote',
          description: 'Tell us your travel details, preferred dates, and passenger count. Our experts will find the perfect aircraft for your needs.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          title: 'Review & Confirm',
          description: 'Review your personalized quote with aircraft options, pricing, and itinerary. Confirm your booking with our secure payment.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: 'Fly in Luxury',
          description: 'Enjoy your private flight with premium service, luxury amenities, and the flexibility to travel on your schedule.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
      ] as Step[],
    },
    es: {
      heading: 'Cómo funciona nuestro servicio',
      subheading: 'Pasos simples hacia tu vuelo perfecto',
      steps: [
        {
          title: 'Contanos tu plan',
          description: 'Completá nuestro formulario con los detalles de tu viaje. Te contactamos en minutos.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          title: 'Curamos opciones verificadas',
          description: 'Seleccionamos las mejores aeronaves y operadores certificados para tu ruta específica.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: 'Volás. Coordinamos todo',
          description: 'Nos encargamos de todos los detalles: documentación, handling, FBO y servicios a bordo.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
      ] as Step[],
    },
    pt: {
      heading: 'Como Funciona',
      subheading: 'Passos simples para seu voo perfeito',
      steps: [
        {
          title: 'Solicitar Cotação',
          description: 'Compartilhe os detalhes da sua viagem, datas preferidas e número de passageiros. Nossos especialistas encontrarão a aeronave perfeita.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          title: 'Revisar e Confirmar',
          description: 'Revise sua cotação personalizada com opções de aeronaves, preços e itinerário. Confirme sua reserva com nosso pagamento seguro.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: 'Voar com Luxo',
          description: 'Desfrute seu voo privado com serviço premium, comodidades de luxo e flexibilidade para viajar no seu horário.',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
      ] as Step[],
    },
  };

  return content[locale as keyof typeof content] || content.en;
};

export function ProcessSteps({ locale = 'en', className }: ProcessStepsProps) {
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

  return (
    <section
      ref={sectionRef}
      className={clsx(
        'py-16 md:py-24 bg-white',
        className
      )}
      aria-labelledby="process-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2
            id="process-heading"
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
              'text-lg md:text-xl text-neutral-medium max-w-2xl mx-auto',
              'transform transition-all duration-800 ease-out delay-200',
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            {content.subheading}
          </p>
        </div>

        {/* Steps */}
        <ol className="steps-list grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 relative" role="list">
          {/* Connecting Lines - Desktop Only */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-accent-blue via-accent-blue to-accent-blue transform -translate-y-1/2 z-0" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-blue/50 to-transparent" />
          </div>

          {content.steps.map((step, index) => (
            <li
              key={index}
              className={clsx(
                'step-item relative z-10',
                'transform transition-all duration-800 ease-out',
                isVisible
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-8 opacity-0'
              )}
              style={{
                transitionDelay: `${(index + 1) * 200}ms`,
              }}
              role="listitem"
            >
              {/* Step Number */}
              <div
                className={clsx(
                  'step-number w-12 h-12 md:w-16 md:h-16 mx-auto mb-6',
                  'bg-gradient-to-br from-accent-blue to-accent-blue/80',
                  'rounded-full flex items-center justify-center',
                  'text-white text-lg md:text-xl font-bold',
                  'shadow-large border-4 border-white'
                )}
                aria-hidden="true"
              >
                {index + 1}
              </div>

              {/* Step Content */}
              <div className="step-content text-center space-y-4">
                <h3 className="step-title text-xl md:text-2xl font-bold text-navy-primary">
                  {step.title}
                </h3>
                <p className="step-description text-neutral-medium leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>

              {/* Mobile Connecting Line */}
              {index < content.steps.length - 1 && (
                <div className="step-connector md:hidden flex justify-center mt-8" aria-hidden="true">
                  <div className="w-0.5 h-8 bg-gradient-to-b from-accent-blue to-accent-blue/50" />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}