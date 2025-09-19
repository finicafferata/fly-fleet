'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { Button } from '../ui/Button';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { WhatsAppWidget } from '../WhatsAppWidget';

export interface NavigationItem {
  href: string;
  label: string;
  description?: string;
  external?: boolean;
}

export interface HeaderProps {
  locale: 'en' | 'es' | 'pt';
  onLanguageChange?: (locale: string) => void;
  className?: string;
  sticky?: boolean;
  shrinkOnScroll?: boolean;
  logoSrc?: string;
}

const getNavigationItems = (locale: string): NavigationItem[] => {
  const items = {
    en: [
      { href: '/', label: 'Home', description: 'Return to homepage' },
      { href: '/services', label: 'Services', description: 'Our aviation services' },
      { href: '/fleet', label: 'Fleet', description: 'Aircraft fleet information' },
      { href: '/about', label: 'About', description: 'About Fly-Fleet' },
      { href: '/contact', label: 'Contact', description: 'Contact information' },
    ],
    es: [
      { href: '/', label: 'Inicio', description: 'Volver al inicio' },
      { href: '/services', label: 'Servicios', description: 'Nuestros servicios de aviación' },
      { href: '/fleet', label: 'Flota', description: 'Información de la flota' },
      { href: '/about', label: 'Nosotros', description: 'Acerca de Fly-Fleet' },
      { href: '/contact', label: 'Contacto', description: 'Información de contacto' },
    ],
    pt: [
      { href: '/', label: 'Início', description: 'Voltar ao início' },
      { href: '/services', label: 'Serviços', description: 'Nossos serviços de aviação' },
      { href: '/fleet', label: 'Frota', description: 'Informações da frota' },
      { href: '/about', label: 'Sobre', description: 'Sobre a Fly-Fleet' },
      { href: '/contact', label: 'Contato', description: 'Informações de contato' },
    ],
  };

  return items[locale as keyof typeof items] || items.en;
};

export function Header({
  locale,
  onLanguageChange,
  className,
  sticky = true,
  shrinkOnScroll = true,
  logoSrc = '/logo.svg',
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(true);
  const [announcement, setAnnouncement] = useState('');
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);

  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const mobileMenuFirstFocusableRef = useRef<HTMLAnchorElement>(null);
  const mobileMenuLastFocusableRef = useRef<HTMLButtonElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const lastScrollY = useRef(0);

  const navigationItems = getNavigationItems(locale);

  // Handle scroll behavior
  useEffect(() => {
    if (!shrinkOnScroll && !sticky) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (shrinkOnScroll) {
        setIsScrolled(currentScrollY > 10);
      }

      if (sticky) {
        setIsScrollingUp(currentScrollY < lastScrollY.current || currentScrollY < 10);
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [shrinkOnScroll, sticky]);

  // Focus trap for mobile menu
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      const focusableElements = menuRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          event.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    return () => document.removeEventListener('keydown', handleTabKey);
  }, [isMenuOpen]);

  // Close menu when clicking backdrop
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === backdropRef.current) {
      closeMobileMenu();
    }
  };

  // Touch gesture support for mobile menu
  const handleTouchStart = (event: React.TouchEvent) => {
    if (!isMenuOpen) return;
    setTouchStartX(event.touches[0].clientX);
    setTouchStartY(event.touches[0].clientY);
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!isMenuOpen) return;

    const touchEndX = event.changedTouches[0].clientX;
    const touchEndY = event.changedTouches[0].clientY;
    const deltaX = touchStartX - touchEndX;
    const deltaY = Math.abs(touchStartY - touchEndY);

    // Swipe left to close (horizontal swipe with minimal vertical movement)
    if (deltaX > 50 && deltaY < 100) {
      closeMobileMenu();
    }
  };

  // Close menu on route change
  useEffect(() => {
    if (isMenuOpen) {
      closeMobileMenu();
    }
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMenuOpen) {
        closeMobileMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  const openMobileMenu = () => {
    setIsMenuOpen(true);
    document.body.style.overflow = 'hidden';

    // Screen reader announcement
    setAnnouncement('Navigation menu opened');

    // Focus first menu item after a brief delay
    setTimeout(() => {
      mobileMenuFirstFocusableRef.current?.focus();
    }, 100);

    // Clear announcement
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'unset';

    // Screen reader announcement
    setAnnouncement('Navigation menu closed');

    // Return focus to menu button
    setTimeout(() => {
      menuToggleRef.current?.focus();
    }, 100);

    // Clear announcement
    setTimeout(() => setAnnouncement(''), 1000);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  };

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  const headerClasses = clsx(
    'w-full transition-all duration-300 ease-in-out z-40',
    // Motion preference respect
    'motion-reduce:transition-none',
    {
      'fixed top-0': sticky,
      'relative': !sticky,
      'transform -translate-y-full': sticky && !isScrollingUp && isScrolled,
      'transform translate-y-0': sticky && (isScrollingUp || !isScrolled),
      'py-2': isScrolled && shrinkOnScroll,
      'py-4': !isScrolled || !shrinkOnScroll,
    },
    className
  );

  const navContainerClasses = clsx(
    'transition-all duration-300 ease-in-out backdrop-blur-sm border-b shadow-sm',
    'motion-reduce:transition-none',
    // Navy blue theme with transparency effects
    isScrolled
      ? 'bg-navy-primary/95 border-navy-primary/20 text-white'
      : 'bg-white/95 border-neutral-light text-navy-primary'
  );

  return (
    <header className={headerClasses} role="banner">
      <div className={navContainerClasses}>
        <div className="nav-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            className="flex items-center justify-between"
            role="navigation"
            aria-label="Main navigation"
          >
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                className={clsx(
                  'logo-link flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 rounded-lg',
                  'transition-all duration-200',
                  'motion-reduce:transition-none',
                  isScrolled && shrinkOnScroll ? 'text-xl' : 'text-2xl'
                )}
                aria-label="Fly-Fleet homepage"
              >
                {/* Logo Image */}
                <img
                  src={logoSrc}
                  alt="Fly-Fleet"
                  className={clsx(
                    'transition-all duration-200',
                    'motion-reduce:transition-none',
                    isScrolled && shrinkOnScroll ? 'h-8 w-auto' : 'h-10 w-auto'
                  )}
                  onError={(e) => {
                    // Fallback to text logo if image fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
                {/* Text fallback */}
                <div
                  className={clsx(
                    'font-bold',
                    isScrolled ? 'text-white' : 'text-navy-primary'
                  )}
                  style={{ display: logoSrc ? 'none' : 'block' }}
                >
                  Fly-Fleet
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              <ul className="desktop-nav flex items-center space-x-6" role="menubar">
                {navigationItems.map((item) => (
                  <li key={item.href} role="none">
                    <Link
                      href={item.href}
                      className={clsx(
                        'px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                        'motion-reduce:transition-none',
                        // Dynamic colors based on scroll state
                        isScrolled
                          ? 'text-white hover:text-accent-blue hover:bg-white/10'
                          : 'text-navy-primary hover:text-accent-blue hover:bg-neutral-light',
                        isActiveRoute(item.href)
                          ? isScrolled
                            ? 'text-accent-blue bg-white/10 border-b-2 border-accent-blue'
                            : 'text-accent-blue bg-accent-blue/10 border-b-2 border-accent-blue'
                          : ''
                      )}
                      role="menuitem"
                      aria-current={isActiveRoute(item.href) ? 'page' : 'false'}
                      aria-describedby={`nav-desc-${item.href.replace('/', '')}`}
                    >
                      {item.label}
                      <span
                        id={`nav-desc-${item.href.replace('/', '')}`}
                        className="sr-only"
                      >
                        {item.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Desktop Actions */}
              <div className="flex items-center space-x-4">
                <LanguageSwitcher
                  currentLocale={locale}
                  onLanguageChange={onLanguageChange}
                  variant="inline"
                />

                {/* Desktop WhatsApp CTA */}
                <WhatsAppWidget
                  variant="header"
                  locale={locale}
                  showOnMobile={false}
                  showOnDesktop={true}
                />

                <Button
                  as="a"
                  href="/quote"
                  className="hidden lg:inline-flex"
                  size="sm"
                  variant={isScrolled ? 'secondary' : 'primary'}
                >
                  Get Quote
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-3">
              <LanguageSwitcher
                currentLocale={locale}
                onLanguageChange={onLanguageChange}
                variant="dropdown"
              />

              <button
                ref={menuToggleRef}
                type="button"
                onClick={toggleMenu}
                className={clsx(
                  'mobile-menu-toggle p-2 rounded-lg transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                  'motion-reduce:transition-none',
                  isScrolled
                    ? 'text-white hover:bg-white/10 hover:text-accent-blue'
                    : 'text-navy-primary hover:bg-neutral-light hover:text-accent-blue'
                )}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                aria-label="Toggle navigation menu"
              >
                <span className="sr-only">
                  {isMenuOpen ? 'Close' : 'Open'} navigation menu
                </span>
                {/* Menu Icon */}
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu Backdrop */}
        {isMenuOpen && (
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
        )}

        {/* Mobile Slide-out Menu */}
        <div
          ref={menuRef}
          id="mobile-menu"
          className={clsx(
            'mobile-menu fixed top-0 right-0 h-full w-80 max-w-sm z-50 md:hidden',
            'bg-white shadow-2xl transform transition-transform duration-300 ease-in-out',
            'motion-reduce:transition-none',
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          aria-hidden={!isMenuOpen}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-light">
              <span className="text-lg font-semibold text-navy-primary">Menu</span>
              <button
                ref={mobileMenuLastFocusableRef}
                type="button"
                onClick={closeMobileMenu}
                className="p-2 rounded-lg text-navy-primary hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent-blue"
                aria-label="Close navigation menu"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav role="navigation" aria-label="Mobile navigation">
                <ul className="space-y-1" role="menu">
                  {navigationItems.map((item, index) => (
                    <li key={item.href} role="none">
                      <Link
                        ref={index === 0 ? mobileMenuFirstFocusableRef : undefined}
                        href={item.href}
                        className={clsx(
                          'mobile-nav-item block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                          'hover:bg-neutral-light hover:text-accent-blue',
                          'min-h-[44px] flex items-center',
                          'motion-reduce:transition-none',
                          isActiveRoute(item.href)
                            ? 'text-accent-blue bg-accent-blue/10 border-l-4 border-accent-blue'
                            : 'text-navy-primary'
                        )}
                        role="menuitem"
                        aria-current={isActiveRoute(item.href) ? 'page' : undefined}
                        aria-describedby={`mobile-nav-desc-${item.href.replace('/', '')}`}
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                        <span
                          id={`mobile-nav-desc-${item.href.replace('/', '')}`}
                          className="sr-only"
                        >
                          {item.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="pt-4 mt-4 border-t border-neutral-light">
                  <Button
                    as="a"
                    href="/quote"
                    className="w-full"
                    size="lg"
                    onClick={closeMobileMenu}
                  >
                    Get Quote
                  </Button>
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Skip Navigation Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-blue text-white px-4 py-2 rounded z-50"
      >
        Skip to main content
      </a>

      {/* Screen reader announcements */}
      {announcement && (
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          {announcement}
        </div>
      )}
    </header>
  );
}