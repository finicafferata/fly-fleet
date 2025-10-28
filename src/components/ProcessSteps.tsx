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
      steps: [
        {
          title: 'Share your plan',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          title: 'Receive an exclusive proposal',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: 'Choose your aircraft',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
        {
          title: 'We coordinate everything, you fly!',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        },
      ] as Step[],
    },
    es: {
      heading: 'Cómo funciona nuestro servicio',
      steps: [
        {
          title: 'Contanos tu plan',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          title: 'Recibí una propuesta exclusiva',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: 'Elegí tu aeronave',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
        {
          title: 'Coordinamos todo, vos volás!',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
        },
      ] as Step[],
    },
    pt: {
      heading: 'Como Funciona',
      steps: [
        {
          title: 'Conte seu plano',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          title: 'Receba uma proposta exclusiva',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          title: 'Escolha sua aeronave',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          ),
        },
        {
          title: 'Coordenamos tudo, você voa!',
          description: '',
          icon: (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
        </div>

        {/* Steps */}
        <ol className="steps-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 relative" role="list">
          {/* Connecting Lines - Desktop Only */}
          <div className="hidden md:block absolute inset-0 pointer-events-none z-0" aria-hidden="true">
            <div className="flex items-center justify-center h-16 relative">
              {/* Single continuous line */}
              <div className="absolute left-1/6 right-1/6 h-0.5 bg-accent-blue top-1/2 transform -translate-y-1/2" />
            </div>
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
                  'bg-accent-blue',
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
                <h3 className="step-title text-lg md:text-xl font-bold text-navy-primary leading-tight max-w-32 mx-auto">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="step-description text-neutral-medium leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>
                )}
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