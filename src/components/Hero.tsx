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
      headline: 'Fly Private, Without Complications.',
      subheadline: 'Get your next flight quote in minutes. Certified operators and 24/7 assistance.',
      primaryCTA: 'Quote Now',
      actionsHeading: 'Available Actions',
      trustIndicators: [
        'IATA Certified',
        '24/7 Support',
        'Safety First'
      ],
      statsLabel: 'Trusted by travelers worldwide',
    },
    es: {
      headline: 'Volá privado, sin complicaciones.',
      subheadline: 'Cotizá tu próximo vuelo en minutos. Operadores certificados y asistencia 24/7.',
      primaryCTA: 'Cotizar ahora',
      actionsHeading: 'Acciones Disponibles',
      trustIndicators: [
        'Certificado IATA',
        'Soporte 24/7',
        'Seguridad Primero'
      ],
      statsLabel: 'Confianza de viajeros en todo el mundo',
    },
    pt: {
      headline: 'Voe Privado, Sem Complicações.',
      subheadline: 'Obtenha sua cotação de voo em minutos. Operadores certificados e assistência 24/7.',
      primaryCTA: 'Cotar Agora',
      actionsHeading: 'Ações Disponíveis',
      trustIndicators: [
        'Certificado IATA',
        'Suporte 24/7',
        'Segurança em Primeiro'
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
          'hero relative min-h-screen flex items-center justify-center',
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
      <div className="hero-content relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl">
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
                'text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
                'font-bold text-white leading-tight mb-6',
                'animate-fade-in-up'
              )}
            >
              {content.headline}
            </h1>

            <p
              className={clsx(
                'text-lg md:text-xl lg:text-2xl',
                'text-white/90 leading-relaxed mb-8 max-w-3xl',
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

            {/* Trust Indicators */}
            <div
              className={clsx(
                'flex flex-wrap items-center gap-6 md:gap-8',
                'animate-fade-in-up animation-delay-600'
              )}
            >
              <span className="text-white/70 text-sm font-medium">
                {content.statsLabel}
              </span>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                {content.trustIndicators.map((indicator, index) => (
                  <div
                    key={index}
                    className={clsx(
                      'flex items-center space-x-2',
                      'px-3 py-1 rounded-full',
                      'bg-white/10 backdrop-blur-sm',
                      'border border-white/20'
                    )}
                  >
                    <div className="w-2 h-2 bg-accent-blue rounded-full" />
                    <span className="text-white text-sm font-medium">
                      {indicator}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={clsx(
          'absolute bottom-8 left-1/2 transform -translate-x-1/2',
          'animate-bounce',
          'transition-opacity duration-1000 delay-1000',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex flex-col items-center space-y-2">
          <span className="text-white/60 text-sm">Scroll to explore</span>
          <svg
            className="w-6 h-6 text-white/60"
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