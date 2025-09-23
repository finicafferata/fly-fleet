'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

export interface NavigationProps {
  locale: 'en' | 'es' | 'pt';
  className?: string;
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
      aboutUs: 'Acerca de',
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

export function Navigation({ locale, className }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const content = getNavigationContent(locale);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    { href: `/${locale}/fleet-destinations`, label: content.fleetDestinations, key: 'fleet-destinations' },
    { href: `/${locale}/about`, label: content.aboutUs, key: 'about' },
    { href: `/${locale}/contact`, label: content.contact, key: 'contact' },
    { href: `/${locale}/additional-services`, label: content.additionalServices, key: 'additional-services' },
    { href: `/${locale}/faqs`, label: content.faqs, key: 'faqs' },
  ];

  const isActive = (href: string) => {
    if (href === `/${locale}`) {
      return pathname === `/${locale}` || pathname === '/';
    }
    return pathname?.startsWith(href);
  };

  const getLinkClassName = (href: string) => clsx(
    'relative text-sm font-medium transition-colors duration-200',
    'hover:text-accent-blue focus:text-accent-blue',
    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-white',
    'px-3 py-2 rounded-md',
    isActive(href)
      ? 'text-accent-blue border-b-2 border-accent-blue'
      : 'text-gray-700 hover:text-accent-blue'
  );

  const getMobileLinkClassName = (href: string) => clsx(
    'block px-4 py-3 text-base font-medium transition-colors duration-200',
    'hover:bg-gray-50 hover:text-accent-blue',
    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-inset',
    isActive(href)
      ? 'text-accent-blue bg-accent-blue/5 border-r-4 border-accent-blue'
      : 'text-gray-700'
  );

  if (!mounted) {
    return null;
  }

  return (
    <nav
      className={clsx('bg-white shadow-sm relative z-40', className)}
      aria-label={content.menuLabel}
      ref={menuRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center space-x-2 text-navy-primary hover:text-accent-blue transition-colors duration-200"
          >
            <svg
              className="h-8 w-8"
              viewBox="0 0 32 32"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M16 2L3 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-13-5z" />
            </svg>
            <span className="font-bold text-xl">Fly-Fleet</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
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

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-accent-blue hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-inset"
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={content.toggleMenu}
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg
              className={clsx('h-6 w-6 transition-transform duration-200', isOpen && 'rotate-90')}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={clsx(
          'lg:hidden fixed top-16 inset-x-0 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="py-4 space-y-1 max-h-screen overflow-y-auto">
          {/* Core Services Group */}
          <div className="px-4 py-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {locale === 'es' ? 'Servicios Principales' :
               locale === 'pt' ? 'Serviços Principais' :
               'Core Services'}
            </h3>
          </div>
          {navigationItems.slice(1, 4).map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={getMobileLinkClassName(item.href)}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Information Group */}
          <div className="px-4 py-2 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {locale === 'es' ? 'Información' :
               locale === 'pt' ? 'Informação' :
               'Information'}
            </h3>
          </div>
          {[navigationItems[4], navigationItems[6], navigationItems[7]].map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={getMobileLinkClassName(item.href)}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          {/* Support Group */}
          <div className="px-4 py-2 mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {locale === 'es' ? 'Soporte' :
               locale === 'pt' ? 'Suporte' :
               'Support'}
            </h3>
          </div>
          <Link
            href={navigationItems[5].href}
            className={getMobileLinkClassName(navigationItems[5].href)}
            onClick={() => setIsOpen(false)}
          >
            {navigationItems[5].label}
          </Link>

          {/* Home Link */}
          <div className="border-t border-gray-200 mt-4 pt-4">
            <Link
              href={navigationItems[0].href}
              className={getMobileLinkClassName(navigationItems[0].href)}
              onClick={() => setIsOpen(false)}
            >
              {navigationItems[0].label}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}