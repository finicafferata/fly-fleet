'use client';

import { useState, useEffect } from 'react';

// Enhanced country code mapping with accessibility labels
export const ACCESSIBLE_COUNTRY_CODES = {
  'AR': { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  'BR': { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  'CL': { code: '+56', name: 'Chile', flag: '🇨🇱' },
  'UY': { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  'PY': { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  'BO': { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  'PE': { code: '+51', name: 'Peru', flag: '🇵🇪' },
  'EC': { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  'CO': { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  'VE': { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  'GY': { code: '+592', name: 'Guyana', flag: '🇬🇾' },
  'SR': { code: '+597', name: 'Suriname', flag: '🇸🇷' },
  'GF': { code: '+594', name: 'French Guiana', flag: '🇬🇫' },
  'US': { code: '+1', name: 'United States', flag: '🇺🇸' },
  'CA': { code: '+1', name: 'Canada', flag: '🇨🇦' },
  'MX': { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  'ES': { code: '+34', name: 'Spain', flag: '🇪🇸' },
  'FR': { code: '+33', name: 'France', flag: '🇫🇷' },
  'IT': { code: '+39', name: 'Italy', flag: '🇮🇹' },
  'DE': { code: '+49', name: 'Germany', flag: '🇩🇪' },
  'GB': { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  'PT': { code: '+351', name: 'Portugal', flag: '🇵🇹' },
} as const;

interface IPDetectionResult {
  countryCode: string;
  isDetecting: boolean;
  detectionStatus: string;
  detectionMethod: 'auto' | 'manual' | 'default';
  setCountryCode: (code: string) => void;
  retryDetection: () => void;
  hasUserConsent: boolean;
  setUserConsent: (consent: boolean) => void;
  detectedCountry?: {
    code: string;
    name: string;
    flag: string;
  };
}

interface IPAPIResponse {
  country_code: string;
  country_name: string;
  error?: boolean;
  reason?: string;
}

export const useAccessibleIPDetection = (locale: string = 'en'): IPDetectionResult => {
  const [countryCode, setCountryCodeState] = useState('+54');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState('');
  const [detectionMethod, setDetectionMethod] = useState<'auto' | 'manual' | 'default'>('default');
  const [hasUserConsent, setUserConsent] = useState(false);
  const [detectedCountry, setDetectedCountry] = useState<{code: string, name: string, flag: string}>();

  const getLocalizedMessages = (locale: string) => {
    const messages = {
      en: {
        detecting: 'Detecting your location...',
        autoSelected: (code: string, country: string) => `Country code ${code} automatically selected for ${country}`,
        defaultUsed: 'Using default Argentina country code +54',
        errorDetection: 'Could not detect location. Using default Argentina country code +54. You can change this manually.',
        privacyNotice: 'We use your IP address to detect your country for phone number formatting. This data is not stored.',
        retrySuccess: 'Location detection retried successfully',
        manualOverride: 'Country code manually selected',
      },
      es: {
        detecting: 'Detectando tu ubicación...',
        autoSelected: (code: string, country: string) => `Código de país ${code} seleccionado automáticamente para ${country}`,
        defaultUsed: 'Usando código de país predeterminado de Argentina +54',
        errorDetection: 'No se pudo detectar la ubicación. Usando código de país predeterminado de Argentina +54. Puedes cambiarlo manualmente.',
        privacyNotice: 'Usamos tu dirección IP para detectar tu país para el formato del número de teléfono. Estos datos no se almacenan.',
        retrySuccess: 'Detección de ubicación reintentada exitosamente',
        manualOverride: 'Código de país seleccionado manualmente',
      },
      pt: {
        detecting: 'Detectando sua localização...',
        autoSelected: (code: string, country: string) => `Código do país ${code} selecionado automaticamente para ${country}`,
        defaultUsed: 'Usando código de país padrão da Argentina +54',
        errorDetection: 'Não foi possível detectar a localização. Usando código de país padrão da Argentina +54. Você pode alterar manualmente.',
        privacyNotice: 'Usamos seu endereço IP para detectar seu país para formatação do número de telefone. Estes dados não são armazenados.',
        retrySuccess: 'Detecção de localização repetida com sucesso',
        manualOverride: 'Código do país selecionado manualmente',
      },
    };
    return messages[locale as keyof typeof messages] || messages.en;
  };

  const detectCountryWithA11y = async () => {
    const messages = getLocalizedMessages(locale);
    setIsDetecting(true);
    setDetectionStatus(messages.detecting);

    try {
      // Add timeout for better user experience
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: IPAPIResponse = await response.json();

      if (data.error) {
        throw new Error(data.reason || 'IP API returned an error');
      }

      const countryInfo = ACCESSIBLE_COUNTRY_CODES[data.country_code as keyof typeof ACCESSIBLE_COUNTRY_CODES];

      if (countryInfo) {
        setCountryCodeState(countryInfo.code);
        setDetectedCountry(countryInfo);
        setDetectionMethod('auto');
        setDetectionStatus(messages.autoSelected(countryInfo.code, countryInfo.name));
      } else {
        // Country not in our supported list
        setDetectionMethod('default');
        setDetectionStatus(messages.defaultUsed);
      }
    } catch (error) {
      console.error('IP detection failed:', error);

      // Determine if this is a VPN/proxy or network error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setDetectionMethod('default');
      setDetectionStatus(messages.errorDetection);

      // Track error for analytics (if consent given)
      if (hasUserConsent && typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'ip_detection_error', {
          event_category: 'technical',
          error_type: errorMessage.includes('abort') ? 'timeout' : 'network',
          fallback_used: true,
        });
      }
    } finally {
      setIsDetecting(false);
    }
  };

  const setCountryCode = (code: string) => {
    setCountryCodeState(code);
    setDetectionMethod('manual');

    const messages = getLocalizedMessages(locale);
    setDetectionStatus(messages.manualOverride);

    // Track manual override
    if (hasUserConsent && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'country_code_manual_override', {
        event_category: 'user_preference',
        country_code: code,
        previous_method: detectionMethod,
      });
    }
  };

  const retryDetection = () => {
    if (hasUserConsent) {
      detectCountryWithA11y();

      const messages = getLocalizedMessages(locale);
      setDetectionStatus(messages.retrySuccess);
    }
  };

  // Initial detection when user consents
  useEffect(() => {
    if (hasUserConsent && !isDetecting && detectionMethod === 'default') {
      detectCountryWithA11y();
    }
  }, [hasUserConsent, locale]);

  // Set default message on mount
  useEffect(() => {
    const messages = getLocalizedMessages(locale);
    if (!detectionStatus) {
      setDetectionStatus(messages.defaultUsed);
    }
  }, [locale]);

  return {
    countryCode,
    isDetecting,
    detectionStatus,
    detectionMethod,
    setCountryCode,
    retryDetection,
    hasUserConsent,
    setUserConsent,
    detectedCountry,
  };
};