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
      headline: (
        <>
          Volá privado,<br />
          sin complicaciones.
        </>
      ),
      subheadline: 'Cotizá tu próximo vuelo en minutos. Operadores certificados y asistencia 24/7.',
      primaryCTA: 'Cotizá tu vuelo',
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
  const [isScrolled, setIsScrolled] = useState(false);
  const content = getContent(locale);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Scroll detection to hide scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          'overflow-hidden',
          className
        )}
        style={{ backgroundColor: '#060408' }}
        role="banner"
        aria-labelledby="hero-heading"
      >
      {/* Background Video */}
      <div className="hero-media absolute inset-0 z-0" aria-hidden="true">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={clsx(
            'hero-background w-full h-full object-cover transition-opacity duration-1000',
            imageLoaded ? 'opacity-30' : 'opacity-0'
          )}
          onLoadedData={() => {
            console.log('Hero background video loaded successfully');
            setImageLoaded(true);
          }}
          onError={() => {
            console.error('Hero background video failed to load');
            setImageLoaded(false);
          }}
        >
          <source src="/images/hero-video.mp4" type="video/mp4" />
          {/* Fallback image if video fails */}
          <img
            src="/images/hero-jet.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-primary/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="hero-content relative z-10 w-full py-20">
        <div className="flex items-center justify-between gap-8" style={{ paddingLeft: 'clamp(2rem, 5vw, 5rem)', paddingRight: 'clamp(2rem, 5vw, 5rem)' }}>
          <div className="flex-1">
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
                'hero-ctas flex flex-col sm:flex-row gap-4',
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

            </div>
          </div>
          </div>

          {/* Logo on the right side */}
          <div
            className={clsx(
              'hidden lg:block flex-shrink-0',
              'transform transition-all duration-1000 ease-out',
              isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            )}
          >
            <div className="relative group">
              {/* Subtle glow effect behind logo */}
              <div
                className="absolute inset-0 blur-3xl bg-accent-blue/20 rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                aria-hidden="true"
              />

              {/* Logo with enhanced styling */}
              <img
                src="/images/flyfleet_logo_white.png"
                alt="Fly-Fleet Logo"
                className="relative w-80 h-auto drop-shadow-2xl opacity-90 hover:opacity-100 hover:scale-105 transition-all duration-300"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={clsx(
          'absolute bottom-8 left-0 right-0 z-20',
          'animate-bounce',
          'transition-opacity duration-500',
          'pointer-events-none',
          isLoaded && !isScrolled ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex flex-col items-center justify-center space-y-2 text-center mx-auto">
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
