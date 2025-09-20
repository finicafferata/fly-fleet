'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { WhatsAppIcon } from './ui/icons/WhatsAppIcon';
import { Button } from './ui/Button';
import { trackWhatsAppClick } from '../lib/analytics/accessibleTracking';

export interface WhatsAppWidgetProps {
  variant?: 'floating' | 'inline' | 'header';
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  formData?: {
    origin?: string;
    destination?: string;
    serviceType?: string;
    passengers?: number;
  };
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  phoneNumber?: string;
  disabled?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}

const generateAccessibleMessage = (locale: string, formData?: WhatsAppWidgetProps['formData']) => {
  const messages = {
    en: `Hello Fly-Fleet, I would like to request a quote for a private flight.${
      formData
        ? ` From: ${formData.origin || 'Not specified'}, To: ${formData.destination || 'Not specified'}${
            formData.serviceType ? `, Service: ${formData.serviceType}` : ''
          }${formData.passengers ? `, Passengers: ${formData.passengers}` : ''}`
        : ''
    }`,
    es: `Hola Fly-Fleet, quiero cotizar un vuelo privado.${
      formData
        ? ` Origen: ${formData.origin || 'No especificado'}, Destino: ${formData.destination || 'No especificado'}${
            formData.serviceType ? `, Servicio: ${formData.serviceType}` : ''
          }${formData.passengers ? `, Pasajeros: ${formData.passengers}` : ''}`
        : ''
    }`,
    pt: `Olá Fly-Fleet, gostaria de solicitar um orçamento para um voo privado.${
      formData
        ? ` De: ${formData.origin || 'Não especificado'}, Para: ${formData.destination || 'Não especificado'}${
            formData.serviceType ? `, Serviço: ${formData.serviceType}` : ''
          }${formData.passengers ? `, Passageiros: ${formData.passengers}` : ''}`
        : ''
    }`,
  };

  return encodeURIComponent(messages[locale as keyof typeof messages] || messages.en);
};

const getLanguageLabels = (locale: string) => {
  const labels = {
    en: {
      contactLabel: 'Contact us on WhatsApp in English',
      helpText: 'Opens WhatsApp with pre-filled message for immediate assistance',
      buttonText: 'WhatsApp',
      openChat: 'Open WhatsApp chat',
      announcement: 'Opening WhatsApp messenger',
    },
    es: {
      contactLabel: 'Contáctanos por WhatsApp en Español',
      helpText: 'Abre WhatsApp con un mensaje predeterminado para asistencia inmediata',
      buttonText: 'WhatsApp',
      openChat: 'Abrir chat de WhatsApp',
      announcement: 'Abriendo WhatsApp messenger',
    },
    pt: {
      contactLabel: 'Entre em contato conosco pelo WhatsApp em Português',
      helpText: 'Abre o WhatsApp com mensagem pré-definida para assistência imediata',
      buttonText: 'WhatsApp',
      openChat: 'Abrir chat do WhatsApp',
      announcement: 'Abrindo WhatsApp messenger',
    },
  };

  return labels[locale as keyof typeof labels] || labels.en;
};

export function WhatsAppWidget({
  variant = 'floating',
  locale = 'en',
  className,
  formData,
  position = 'bottom-right',
  phoneNumber = '+5491123456789', // Default number - should be configurable
  disabled = false,
  showOnMobile = true,
  showOnDesktop = true,
}: WhatsAppWidgetProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const labels = getLanguageLabels(locale);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click with analytics and accessibility
  const handleWhatsAppClick = useCallback((event: React.MouseEvent) => {
    if (disabled) {
      event.preventDefault();
      return;
    }

    // Announce to screen readers
    setAnnouncement(labels.announcement);

    // Track WhatsApp click with exact GA4 format
    trackWhatsAppClick(formData);

    // Generate WhatsApp URL
    const message = generateAccessibleMessage(locale, formData);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`;

    // Respect user's reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      // Add subtle visual feedback
      event.currentTarget.style.transform = 'scale(0.95)';
      setTimeout(() => {
        (event.currentTarget as HTMLElement).style.transform = '';
      }, 150);
    }

    // Open WhatsApp
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

    // Clear announcement after a delay
    setTimeout(() => setAnnouncement(''), 3000);
  }, [disabled, labels.announcement, variant, locale, formData, isMobile, position, phoneNumber]);

  // Handle keyboard interaction
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && variant === 'floating') {
      (event.target as HTMLElement).blur();
    }
  };

  // Don't render if disabled for current device
  if ((isMobile && !showOnMobile) || (!isMobile && !showOnDesktop)) {
    return null;
  }

  const baseClasses = [
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ];

  const variantClasses = {
    floating: [
      'fixed z-50 group',
      'bg-green-500 hover:bg-green-600 text-white',
      'rounded-full shadow-large',
      'min-h-[56px] min-w-[56px]',
      'flex items-center justify-center',
      // Position classes
      position === 'bottom-right' && 'bottom-4 right-4',
      position === 'bottom-left' && 'bottom-4 left-4',
      position === 'top-right' && 'top-4 right-4',
      position === 'top-left' && 'top-4 left-4',
      // Hover state
      'hover:shadow-xl hover:scale-105',
      // Mobile optimization
      isMobile && 'bottom-6 right-6 min-h-[60px] min-w-[60px]',
    ],
    inline: [
      'inline-flex items-center space-x-2',
      'bg-green-500 hover:bg-green-600 text-white',
      'px-4 py-2 rounded-lg',
      'min-h-[44px]',
    ],
    header: [
      'hidden md:inline-flex items-center space-x-2',
      'bg-green-500 hover:bg-green-600 text-white',
      'px-3 py-2 rounded-lg text-sm',
      'min-h-[40px]',
    ],
  };

  const iconSize = {
    floating: isMobile ? 28 : 24,
    inline: 20,
    header: 16,
  };

  if (variant === 'floating') {
    return (
      <>
        <button
          className={clsx(baseClasses, variantClasses.floating, className)}
          aria-label={labels.contactLabel}
          aria-describedby="whatsapp-help"
          onClick={handleWhatsAppClick}
          onKeyDown={handleKeyDown}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={disabled}
          type="button"
        >
          <span className="sr-only">{labels.openChat}</span>
          <WhatsAppIcon size={iconSize.floating} />

          {/* Tooltip on hover for desktop */}
          {isHovered && !isMobile && (
            <div
              className="absolute right-full mr-3 px-3 py-2 bg-navy-primary text-white text-sm rounded-lg whitespace-nowrap shadow-lg"
              role="tooltip"
              aria-hidden="true"
            >
              {labels.buttonText}
              <div className="absolute top-1/2 left-full transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-navy-primary border-t-4 border-t-transparent border-b-4 border-b-transparent" />
            </div>
          )}
        </button>

        <div id="whatsapp-help" className="sr-only">
          {labels.helpText}
        </div>

        {/* Live region for announcements */}
        {announcement && (
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            {announcement}
          </div>
        )}
      </>
    );
  }

  if (variant === 'header') {
    return (
      <Button
        onClick={handleWhatsAppClick}
        onKeyDown={handleKeyDown}
        className={clsx(variantClasses.header, className)}
        aria-label={labels.contactLabel}
        aria-describedby="whatsapp-help-header"
        disabled={disabled}
        size="sm"
        variant="ghost"
      >
        <WhatsAppIcon size={iconSize.header} />
        <span>{labels.buttonText}</span>

        <div id="whatsapp-help-header" className="sr-only">
          {labels.helpText}
        </div>
      </Button>
    );
  }

  // Inline variant
  return (
    <Button
      onClick={handleWhatsAppClick}
      onKeyDown={handleKeyDown}
      className={clsx(variantClasses.inline, 'bg-green-500 hover:bg-green-600', className)}
      aria-label={labels.contactLabel}
      aria-describedby="whatsapp-help-inline"
      disabled={disabled}
    >
      <WhatsAppIcon size={iconSize.inline} />
      <span>{labels.buttonText}</span>

      <div id="whatsapp-help-inline" className="sr-only">
        {labels.helpText}
      </div>
    </Button>
  );
}