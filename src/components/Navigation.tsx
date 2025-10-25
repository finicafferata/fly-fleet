'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LanguageSwitcher } from './LanguageSwitcher';

export interface NavigationProps {
  locale: 'en' | 'es' | 'pt';
  className?: string;
  onLanguageChange?: (locale: string) => void;
}

const getNavigationContent = (locale: string) => {
  const content = {
    en: {
      home: 'Home',
      whatWeDo: 'What We Do',
      getQuote: 'Get a Quote',
      fleetDestinations: 'Fleet & Destinations',
      aboutUs: 'About Us',
      contact: 'Contact',
      additionalServices: 'Additional Services',
      faqs: 'FAQs',
      menuLabel: 'Main navigation',
      toggleMenu: 'Toggle menu',
    },
    es: {
      home: 'Inicio',
      whatWeDo: 'Qué Hacemos',
      getQuote: 'Cotizar',
      fleetDestinations: 'Flota y Destinos',
      aboutUs: 'Nosotros',
      contact: 'Contacto',
      additionalServices: 'Servicios Adicionales',
      faqs: 'Preguntas Frecuentes',
      menuLabel: 'Navegación principal',
      toggleMenu: 'Alternar menú',
    },
    pt: {
      home: 'Início',
      whatWeDo: 'O Que Fazemos',
      getQuote: 'Cotação',
      fleetDestinations: 'Frota e Destinos',
      aboutUs: 'Sobre Nós',
      contact: 'Contato',
      additionalServices: 'Serviços Adicionais',
      faqs: 'Perguntas Frequentes',
      menuLabel: 'Navegação principal',
      toggleMenu: 'Alternar menu',
    },
  };

  return content[locale as keyof typeof content] || content.en;
};

export function Navigation({ locale, className, onLanguageChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const content = getNavigationContent(locale);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigationItems = [
    { href: `/${locale}`, label: content.home, key: 'home' },
    { href: `/${locale}/what-we-do`, label: content.whatWeDo, key: 'what-we-do' },
    { href: `/${locale}/quote`, label: content.getQuote, key: 'quote' },
    { href: `/${locale}/additional-services`, label: content.additionalServices, key: 'additional-services' },
    { href: `/${locale}/fleet-destinations`, label: content.fleetDestinations, key: 'fleet-destinations' },
    { href: `/${locale}/faqs`, label: content.faqs, key: 'faqs' },
    { href: `/${locale}/about`, label: content.aboutUs, key: 'about' },
    { href: `/${locale}/contact`, label: content.contact, key: 'contact' },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const getLinkClassName = (href: string) => clsx(
    'relative nav-text transition-colors duration-200 whitespace-nowrap',
    'hover:text-accent-blue focus:text-accent-blue',
    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-white',
    'px-2 min-[1200px]:px-4 py-2 min-[1200px]:py-3 rounded-lg',
    isActive(href)
      ? 'text-accent-blue border-b-2 border-accent-blue'
      : 'text-gray-700 hover:text-accent-blue'
  );

  const getMobileLinkClassName = (href: string) => clsx(
    'block px-6 py-4 text-lg font-medium transition-colors duration-200',
    'hover:bg-gray-50 hover:text-accent-blue',
    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-inset',
    isActive(href)
      ? 'text-accent-blue bg-accent-blue/5 border-l-4 border-accent-blue'
      : 'text-gray-700 border-l-4 border-transparent'
  );


  return (
    <nav
      className={clsx('bg-white shadow-sm fixed top-0 left-0 right-0 z-50', className)}
      aria-label={content.menuLabel}
      ref={menuRef}
    >
      <div className="max-w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center text-navy-primary hover:text-accent-blue transition-colors duration-200"
          >
            <img
              src="/images/flyfleet_logo.png"
              alt="Fly-Fleet"
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation and Language Switcher */}
          <div className="hidden min-[1200px]:flex min-[1200px]:items-center min-[1200px]:justify-end min-[1200px]:flex-1 min-[1200px]:space-x-6 xl:space-x-8">
            <div className="flex items-center space-x-1 xl:space-x-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className={getLinkClassName(item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <LanguageSwitcher
              currentLocale={locale}
              onLanguageChange={onLanguageChange}
              showFlags={true}
              showNativeNames={false}
            />
          </div>

          {/* Mobile Menu Button and Language Switcher */}
          <div className="flex items-center space-x-4">
            <LanguageSwitcher
              currentLocale={locale}
              onLanguageChange={onLanguageChange}
              showFlags={true}
              showNativeNames={false}
              className="max-[1199px]:block min-[1200px]:hidden"
            />

            {/* Hamburger Menu Button */}
            <button
              type="button"
              className="max-[1199px]:inline-flex min-[1200px]:hidden items-center justify-center p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-inset"
              style={{
                backgroundColor: isOpen ? '#2F6AEF' : 'transparent',
              }}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              aria-label={content.toggleMenu}
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#FFFFFF" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#0B1E3C" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={clsx(
          'max-[1199px]:block min-[1200px]:hidden fixed top-20 left-0 right-0 bg-white border-t border-gray-100 shadow-xl transition-all duration-300 ease-in-out',
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
        )}
        style={{ zIndex: 45 }}
      >
        <div className="py-8 max-h-[calc(100vh-120px)] overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={getMobileLinkClassName(item.href)}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500 mb-4">
              {locale === 'es' ? '¿Listo para volar?' :
               locale === 'pt' ? 'Pronto para voar?' :
               'Ready to fly?'}
            </p>
            <button
              onClick={() => {
                setIsOpen(false);
                // Trigger quote form - you may need to pass this from parent
              }}
              className="inline-flex items-center px-6 py-3 bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue/90 transition-colors duration-200"
            >
              {locale === 'es' ? 'Solicitar Cotización' :
               locale === 'pt' ? 'Solicitar Cotação' :
               'Get Quote'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}