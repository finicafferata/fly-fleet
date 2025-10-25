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
                <svg className="w-5 h-5 text-accent-blue" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <a
                  href="https://wa.me/5491166601927"
                  className="text-white/70 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-navy-primary rounded-sm"
                  aria-label="Contact us via WhatsApp"
                >
                  {content.phone}
                </a>
              </div>

              <div className="flex items-center space-x-3 min-h-[44px]">
                <svg className="w-5 h-5 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
                <svg className="w-5 h-5 text-accent-blue flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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