'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { WhatsAppWidget } from './WhatsAppWidget';

export interface HeroProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onQuoteRequest?: () => void;
  onLearnMore?: () => void;
}

const getContent = (locale: string) => {
  const content = {
    en: {
      headline: 'Fly private, hassle-free.',
      subheadline: 'Get a quote in minutes. Certified operators and 24/7 support.',
      primaryCTA: 'Get a quote',
      secondaryCTA: 'Chat on WhatsApp',
      actionsHeading: 'Available Actions',
      trustIndicators: [
        'ANAC/FAA/EASA Certified',
        '24/7 Support',
        '+500 Successful Flights'
      ],
      statsLabel: 'Trusted by travelers worldwide',
    },
    es: {
      headline: 'Volá privado, sin complicaciones.',
      subheadline: 'Cotizá tu próximo vuelo en minutos. Operadores certificados y asistencia 24/7.',
      primaryCTA: 'Cotizar ahora',
      secondaryCTA: 'Hablar por WhatsApp',
      actionsHeading: 'Acciones Disponibles',
      trustIndicators: [
        'Certificado ANAC/FAA/EASA',
        'Soporte 24/7',
        '+500 Vuelos Exitosos'
      ],
      statsLabel: 'Confianza de viajeros en todo el mundo',
    },
    pt: {
      headline: 'Voe privado, sem complicações.',
      subheadline: 'Peça sua cotação em minutos. Operadores certificados e suporte 24/7.',
      primaryCTA: 'Pedir cotação',
      secondaryCTA: 'Falar no WhatsApp',
      actionsHeading: 'Ações Disponíveis',
      trustIndicators: [
        'Certificado ANAC/FAA/EASA',
        'Suporte 24/7',
        '+500 Voos Realizados'
      ],
      statsLabel: 'Confiança de viajantes ao redor do mundo',
    },
  };

  return content[locale as keyof typeof content] || content.en;
};

export function Hero({
  locale = 'en',
  className,
  onQuoteRequest,
  onLearnMore,
}: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const content = getContent(locale);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handlePrimaryCTA = () => {
    // Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'hero_primary_cta_click', {
        event_category: 'engagement',
        event_label: 'hero_get_quote',
        value: 1,
      });
    }
    onQuoteRequest?.();
  };

  const handleSecondaryCTA = () => {
    // Track analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'hero_secondary_cta_click', {
        event_category: 'engagement',
        event_label: 'hero_view_fleet',
        value: 1,
      });
    }
    onLearnMore?.();
  };

  return (
    <>
      {/* Skip Links */}
      <div className="sr-only">
        <a
          href="#main-content"
          className="skip-link focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-navy-primary focus:text-white focus:rounded"
        >
          Skip to main content
        </a>
      </div>

      <section
        className={clsx(
          'hero relative h-[85vh] min-h-[600px] max-h-[900px] flex items-center justify-center',
          'bg-gradient-to-br from-navy-primary via-navy-primary/95 to-navy-primary/80',
          'overflow-hidden',
          className
        )}
        role="banner"
        aria-labelledby="hero-heading"
      >
      {/* Background Image */}
      <div className="hero-media absolute inset-0 z-0" aria-hidden="true">
        <img
          src="/images/hero-jet.jpg"
          alt=""
          className={clsx(
            'hero-background w-full h-full object-cover',
            'transition-opacity duration-1000',
            imageLoaded ? 'opacity-30' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 w-full py-20">
        <div style={{ paddingLeft: 'clamp(2rem, 5vw, 5rem)', paddingRight: 'clamp(2rem, 5vw, 5rem)' }}>
          {/* Main Content */}
          <div
            className={clsx(
              'transform transition-all duration-1000 ease-out',
              isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            )}
          >
            <h1
              id="hero-heading"
              className={clsx(
                'font-bold text-white mb-6',
                'animate-fade-in-up'
              )}
            >
              {content.headline}
            </h1>

            <p
              className={clsx(
                'hero-text text-white/90 mb-8',
                'animate-fade-in-up animation-delay-200'
              )}
            >
              {content.subheadline}
            </p>

            {/* CTA Buttons */}
            <div
              className={clsx(
                'hero-ctas flex flex-col sm:flex-row gap-4 mb-12',
                'animate-fade-in-up animation-delay-400'
              )}
              role="group"
              aria-labelledby="hero-actions"
            >
              <h2 id="hero-actions" className="sr-only">
                {content.actionsHeading}
              </h2>

              <a
                href="/quote"
                className={clsx(
                  'cta-primary inline-flex items-center justify-center',
                  'bg-accent-blue hover:bg-accent-blue/90 text-white',
                  'min-h-[56px] px-8 text-lg font-semibold rounded-lg',
                  'shadow-large hover:shadow-xl',
                  'transform hover:scale-105 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-navy-primary'
                )}
                aria-describedby="cta-primary-desc"
                onClick={handlePrimaryCTA}
              >
                {content.primaryCTA}
              </a>
              <div id="cta-primary-desc" className="sr-only">
                Start your private charter quote request
              </div>

              <WhatsAppWidget
                variant="inline"
                locale={locale}
                className="inline-flex"
                aria-describedby="cta-whatsapp-desc"
              />
              <div id="cta-whatsapp-desc" className="sr-only">
                Contact us immediately via WhatsApp
              </div>
            </div>

            {/* Trust Badges */}
            <div
              className={clsx(
                'flex flex-wrap gap-6 items-center',
                'animate-fade-in-up animation-delay-600'
              )}
            >
              {content.trustIndicators.map((indicator, index) => (
                <div key={index} className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-navy-primary mb-1">500+</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Vuelos Completados' : locale === 'pt' ? 'Voos Completados' : 'Flights Completed'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-navy-primary mb-1">24/7</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Soporte Activo' : locale === 'pt' ? 'Suporte Ativo' : 'Active Support'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-navy-primary mb-1">50+</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Aeronaves Disponibles' : locale === 'pt' ? 'Aeronaves Disponíveis' : 'Aircraft Available'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-navy-primary mb-1">100%</div>
              <div className="text-sm text-gray-600">
                {locale === 'es' ? 'Certificado & Seguro' : locale === 'pt' ? 'Certificado & Seguro' : 'Certified & Insured'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={clsx(
          'absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20',
          'animate-bounce',
          'transition-opacity duration-1000 delay-1000',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex flex-col items-center space-y-2 text-center">
          <span className="text-white/80 text-base font-medium tracking-wide">
            {locale === 'es' ? 'Desplázate para explorar' :
             locale === 'pt' ? 'Role para explorar' :
             'Scroll to explore'}
          </span>
          <svg
            className="w-6 h-6 text-white/80"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      </section>
    </>
  );
}