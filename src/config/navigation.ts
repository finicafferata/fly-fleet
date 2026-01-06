/**
 * Navigation Configuration
 *
 * Centralized configuration for all navigation items across the application.
 * Supports multi-language navigation with English, Spanish, and Portuguese.
 */

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
}

export interface NavigationConfig {
  en: NavigationItem[];
  es: NavigationItem[];
  pt: NavigationItem[];
}

/**
 * Main navigation items
 * These appear in the header navigation bar
 */
export const navigationConfig: NavigationConfig = {
  en: [
    {
      href: '/',
      label: 'Home',
      description: 'Return to homepage'
    },
    {
      href: '/what-we-do',
      label: 'What We Do',
      description: 'Our aviation services'
    },
    {
      href: '/quote',
      label: 'Get a Quote',
      description: 'Request a quote'
    },
    {
      href: '/additional-services',
      label: 'Additional Services',
      description: 'Extra services'
    },
    {
      href: '/fleet-destinations',
      label: 'Fleet & Destinations',
      description: 'Aircraft fleet information'
    },
    {
      href: '/faqs',
      label: 'FAQs',
      description: 'Frequently asked questions'
    },
    {
      href: '/about',
      label: 'About Us',
      description: 'About Fly-Fleet'
    },
  ],
  es: [
    {
      href: '/',
      label: 'Inicio',
      description: 'Volver al inicio'
    },
    {
      href: '/what-we-do',
      label: 'Qué Hacemos',
      description: 'Nuestros servicios de aviación'
    },
    {
      href: '/quote',
      label: 'Cotizar',
      description: 'Solicitar cotización'
    },
    {
      href: '/additional-services',
      label: 'Servicios Adicionales',
      description: 'Servicios extra'
    },
    {
      href: '/fleet-destinations',
      label: 'Flota y Destinos',
      description: 'Información de la flota'
    },
    {
      href: '/faqs',
      label: 'FAQs',
      description: 'Preguntas frecuentes'
    },
    {
      href: '/about',
      label: 'Nosotros',
      description: 'Nosotros - Fly-Fleet'
    },
  ],
  pt: [
    {
      href: '/',
      label: 'Início',
      description: 'Voltar ao início'
    },
    {
      href: '/what-we-do',
      label: 'O Que Fazemos',
      description: 'Nossos serviços de aviação'
    },
    {
      href: '/quote',
      label: 'Cotar',
      description: 'Solicitar cotação'
    },
    {
      href: '/additional-services',
      label: 'Serviços Adicionais',
      description: 'Serviços extras'
    },
    {
      href: '/fleet-destinations',
      label: 'Frota e Destinos',
      description: 'Informações da frota'
    },
    {
      href: '/faqs',
      label: 'FAQs',
      description: 'Perguntas frequentes'
    },
    {
      href: '/about',
      label: 'Sobre Nós',
      description: 'Sobre a Fly-Fleet'
    },
  ],
};

/**
 * Helper function to get navigation items for a specific locale
 * @param locale - The locale to get navigation items for (en, es, pt)
 * @returns Array of navigation items for the specified locale
 */
export function getNavigationItems(locale: 'en' | 'es' | 'pt'): NavigationItem[] {
  return navigationConfig[locale] || navigationConfig.en;
}

/**
 * Helper function to find a navigation item by href
 * @param href - The href to search for
 * @param locale - The locale to search in
 * @returns The navigation item or undefined if not found
 */
export function findNavigationItem(href: string, locale: 'en' | 'es' | 'pt'): NavigationItem | undefined {
  const items = getNavigationItems(locale);
  return items.find(item => item.href === href);
}
