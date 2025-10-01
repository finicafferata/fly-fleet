'use client';

import React from 'react';
import { clsx } from 'clsx';
import { WhatsAppWidget } from './WhatsAppWidget';
import { LanguageSwitcher } from './LanguageSwitcher';

export interface FooterProps {
  className?: string;
  locale?: 'en' | 'es' | 'pt';
  onLanguageChange?: (locale: string) => void;
}

interface QuickLink {
  label: string;
  href: string;
}

const getContent = (locale: string) => {
  const content = {
    en: {
      companyName: 'Fly-Fleet',
      companyDescription: 'Request your private charter quote. Certified operators, 24/7 support, international handling and pet-friendly services.',
      contactHeading: 'Contact Information',
      quickLinksHeading: 'Explore',
      phone: '+54 9 11 6660-1927',
      email: 'contact@fly-fleet.com',
      address: 'Buenos Aires, Argentina',
      copyright: '© 2024 Fly-Fleet. All rights reserved.',
      quickLinks: [
        { label: 'About Us', href: '/about' },
        { label: 'Fleet', href: '/fleet' },
        { label: 'Services', href: '/services' },
        { label: 'Quote Request', href: '/quote' },
        { label: 'Contact', href: '/contact' },
        { label: 'Legal', href: '/privacy' },
      ] as QuickLink[],
    },
    es: {
      companyName: 'Fly-Fleet',
      companyDescription: 'Cotizá tu vuelo privado con operadores certificados. Atención 24/7, soporte internacional, pet-friendly y servicios a medida.',
      contactHeading: 'Información de Contacto',
      quickLinksHeading: 'Explorar',
      phone: '+54 9 11 6660-1927',
      email: 'contact@fly-fleet.com',
      address: 'Buenos Aires, Argentina',
      copyright: '© 2024 Fly-Fleet. Todos los derechos reservados.',
      quickLinks: [
        { label: 'Nosotros', href: '/about' },
        { label: 'Flota', href: '/fleet' },
        { label: 'Servicios', href: '/services' },
        { label: 'Solicitar Cotización', href: '/quote' },
        { label: 'Contacto', href: '/contact' },
        { label: 'Legal', href: '/privacy' },
      ] as QuickLink[],
    },
    pt: {
      companyName: 'Fly-Fleet',
      companyDescription: 'Peça sua cotação de voo privado. Operadores certificados, suporte 24/7, handling internacional e serviço pet-friendly.',
      contactHeading: 'Informações de Contato',
      quickLinksHeading: 'Explorar',
      phone: '+54 9 11 6660-1927',
      email: 'contact@fly-fleet.com',
      address: 'Buenos Aires, Argentina',
      copyright: '© 2024 Fly-Fleet. Todos os direitos reservados.',
      quickLinks: [
        { label: 'Sobre Nós', href: '/about' },
        { label: 'Frota', href: '/fleet' },
        { label: 'Serviços', href: '/services' },
        { label: 'Solicitar Cotação', href: '/quote' },
        { label: 'Contato', href: '/contact' },
        { label: 'Legal', href: '/privacy' },
      ] as QuickLink[],
    },
  };

  return content[locale as keyof typeof content] || content.en;
};

export function Footer({ className, locale = 'en', onLanguageChange }: FooterProps) {
  const content = getContent(locale);

  return (
    <footer
      className={clsx(
        'bg-gradient-to-r from-navy-primary to-navy-primary/90',
        'text-white',
        className
      )}
      role="contentinfo"
    >
      <div className="max-w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {/* Company Section */}
          <section aria-labelledby="company-heading">
            <h2 id="company-heading" className="footer-title font-medium mb-4 text-white">
              {content.companyName}
            </h2>
            <p className="text-white/80 mb-6 leading-relaxed">
              {content.companyDescription}
            </p>
          </section>

          {/* Contact Section */}
          <section aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="footer-title font-medium mb-4 text-white">
              {content.contactHeading}
            </h2>
            <address className="not-italic text-white/70 space-y-3">
              <div className="flex items-center space-x-3 min-h-[44px]">
                <span className="text-accent-blue" aria-hidden="true">💬</span>
                <a
                  href="https://wa.me/5491166601927"
                  className="text-white/70 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-navy-primary rounded-sm"
                  aria-label="Contact us via WhatsApp"
                >
                  {content.phone}
                </a>
              </div>

              <div className="flex items-center space-x-3 min-h-[44px]">
                <span className="text-accent-blue" aria-hidden="true">✉️</span>
                <a
                  href={`mailto:${content.email}`}
                  className={clsx(
                    'text-white/70 hover:text-white',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-navy-primary',
                    'rounded-sm flex items-center'
                  )}
                  aria-label={`Email us at ${content.email}`}
                >
                  {content.email}
                </a>
              </div>

              <div className="flex items-center space-x-3">
                <span className="text-accent-blue" aria-hidden="true">📍</span>
                <span>{content.address}</span>
              </div>
            </address>
          </section>

          {/* Quick Links Section */}
          <section aria-labelledby="quicklinks-heading">
            <h2 id="quicklinks-heading" className="footer-title font-medium mb-4 text-white">
              {content.quickLinksHeading}
            </h2>
            <nav aria-label="Footer navigation">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {content.quickLinks.map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    className={clsx(
                      'text-white/70 hover:text-white',
                      'transition-colors duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-navy-primary',
                      'rounded-sm block py-1',
                      'min-h-[44px] flex items-center'
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </nav>
          </section>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="text-center">
            <p className="text-white/60 text-sm">
              {content.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}