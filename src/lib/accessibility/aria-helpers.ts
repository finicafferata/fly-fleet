/**
 * ARIA Accessibility Helpers for Fly-Fleet API
 *
 * Provides utility functions for generating WCAG 2.1 AA compliant
 * ARIA attributes and announcements for API responses.
 */

export type Locale = 'es' | 'en' | 'pt';

export interface AriaErrorInfo {
  ariaLabel: string;
  ariaDescribedBy?: string;
  ariaInvalid: boolean;
  ariaErrorMessage: string;
  screenReaderAnnouncement: string;
}

export interface AriaSuccessInfo {
  ariaLiveMessage: string;
  ariaAnnouncement: string;
  focusTarget?: string;
  nextAction?: string;
}

export interface AriaValidationResponse {
  fieldErrors: Record<string, AriaErrorInfo>;
  globalError?: AriaErrorInfo;
  ariaLiveRegion: string;
  formStatus: 'invalid' | 'valid' | 'submitting' | 'submitted';
}

export interface AriaSearchResult {
  ariaLabel: string;
  ariaDescription: string;
  ariaRole: string;
  ariaPosInSet?: number;
  ariaSetSize?: number;
}

/**
 * Localized error messages for form validation
 */
const VALIDATION_MESSAGES = {
  es: {
    required: 'Este campo es obligatorio',
    email: 'Ingrese un email válido',
    minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
    maxLength: (max: number) => `No puede exceder ${max} caracteres`,
    invalidAirport: 'Código de aeropuerto no válido',
    invalidDate: 'Fecha no válida',
    invalidTime: 'Hora no válida',
    rateLimit: 'Ha excedido el límite de solicitudes. Intente más tarde',
    recaptcha: 'Verificación de seguridad fallida',
    server: 'Error del servidor. Intente nuevamente'
  },
  en: {
    required: 'This field is required',
    email: 'Please enter a valid email',
    minLength: (min: number) => `Must be at least ${min} characters`,
    maxLength: (max: number) => `Cannot exceed ${max} characters`,
    invalidAirport: 'Invalid airport code',
    invalidDate: 'Invalid date',
    invalidTime: 'Invalid time',
    rateLimit: 'Rate limit exceeded. Please try again later',
    recaptcha: 'Security verification failed',
    server: 'Server error. Please try again'
  },
  pt: {
    required: 'Este campo é obrigatório',
    email: 'Digite um email válido',
    minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
    maxLength: (max: number) => `Não pode exceder ${max} caracteres`,
    invalidAirport: 'Código de aeroporto inválido',
    invalidDate: 'Data inválida',
    invalidTime: 'Hora inválida',
    rateLimit: 'Limite de solicitações excedido. Tente mais tarde',
    recaptcha: 'Verificação de segurança falhou',
    server: 'Erro do servidor. Tente novamente'
  }
};

/**
 * Success messages for completed actions
 */
const SUCCESS_MESSAGES = {
  es: {
    quoteSubmitted: 'Cotización enviada exitosamente. Le contactaremos pronto.',
    contactSubmitted: 'Mensaje enviado exitosamente. Responderemos a la brevedad.',
    searchCompleted: (count: number) => `Búsqueda completada. ${count} resultados encontrados.`,
    focus: {
      quote: 'Enfoque movido al mensaje de confirmación',
      contact: 'Enfoque movido al mensaje de confirmación',
      search: 'Enfoque movido a los resultados de búsqueda'
    }
  },
  en: {
    quoteSubmitted: 'Quote request submitted successfully. We will contact you soon.',
    contactSubmitted: 'Message sent successfully. We will respond shortly.',
    searchCompleted: (count: number) => `Search completed. ${count} results found.`,
    focus: {
      quote: 'Focus moved to confirmation message',
      contact: 'Focus moved to confirmation message',
      search: 'Focus moved to search results'
    }
  },
  pt: {
    quoteSubmitted: 'Cotação enviada com sucesso. Entraremos em contato em breve.',
    contactSubmitted: 'Mensagem enviada com sucesso. Responderemos em breve.',
    searchCompleted: (count: number) => `Busca concluída. ${count} resultados encontrados.`,
    focus: {
      quote: 'Foco movido para mensagem de confirmação',
      contact: 'Foco movido para mensagem de confirmação',
      search: 'Foco movido para resultados da busca'
    }
  }
};

/**
 * Generate ARIA error information for form validation
 */
export function generateAriaErrorInfo(
  fieldName: string,
  errorCode: string,
  locale: Locale,
  params?: any
): AriaErrorInfo {
  const messages = VALIDATION_MESSAGES[locale];
  let errorMessage: string;

  switch (errorCode) {
    case 'too_small':
      errorMessage = messages.minLength(params?.minimum || 1);
      break;
    case 'too_big':
      errorMessage = messages.maxLength(params?.maximum || 100);
      break;
    case 'invalid_string':
      if (params?.validation === 'email') {
        errorMessage = messages.email;
      } else {
        errorMessage = messages.required;
      }
      break;
    default:
      errorMessage = messages.required;
  }

  const errorId = `${fieldName}-error`;

  return {
    ariaLabel: `${fieldName} - ${errorMessage}`,
    ariaDescribedBy: errorId,
    ariaInvalid: true,
    ariaErrorMessage: errorMessage,
    screenReaderAnnouncement: `Error en ${fieldName}: ${errorMessage}`
  };
}

/**
 * Generate ARIA validation response for form errors
 */
export function generateAriaValidationResponse(
  zodErrors: any[],
  locale: Locale,
  formType: 'quote' | 'contact' = 'quote'
): AriaValidationResponse {
  const fieldErrors: Record<string, AriaErrorInfo> = {};

  zodErrors.forEach(error => {
    const fieldName = error.path[0];
    fieldErrors[fieldName] = generateAriaErrorInfo(
      fieldName,
      error.code,
      locale,
      error
    );
  });

  const errorCount = Object.keys(fieldErrors).length;
  const messages = VALIDATION_MESSAGES[locale];

  return {
    fieldErrors,
    globalError: {
      ariaLabel: `Formulario contiene ${errorCount} errores`,
      ariaInvalid: true,
      ariaErrorMessage: `Por favor corrija ${errorCount} ${errorCount === 1 ? 'error' : 'errores'}`,
      screenReaderAnnouncement: `Error de validación: ${errorCount} ${errorCount === 1 ? 'campo requiere' : 'campos requieren'} atención`
    },
    ariaLiveRegion: `Formulario de ${formType} contiene errores de validación`,
    formStatus: 'invalid'
  };
}

/**
 * Generate ARIA success information
 */
export function generateAriaSuccessInfo(
  action: 'quote' | 'contact' | 'search',
  locale: Locale,
  params?: { count?: number; id?: string }
): AriaSuccessInfo {
  const messages = SUCCESS_MESSAGES[locale];

  switch (action) {
    case 'quote':
      return {
        ariaLiveMessage: messages.quoteSubmitted,
        ariaAnnouncement: messages.quoteSubmitted,
        focusTarget: '#quote-success-message',
        nextAction: 'Puede cerrar este formulario o revisar su email'
      };

    case 'contact':
      return {
        ariaLiveMessage: messages.contactSubmitted,
        ariaAnnouncement: messages.contactSubmitted,
        focusTarget: '#contact-success-message',
        nextAction: 'Puede cerrar este formulario o enviar otro mensaje'
      };

    case 'search':
      const count = params?.count || 0;
      return {
        ariaLiveMessage: messages.searchCompleted(count),
        ariaAnnouncement: messages.searchCompleted(count),
        focusTarget: '#search-results',
        nextAction: count > 0 ? 'Use las flechas para navegar los resultados' : 'Intente con otro término de búsqueda'
      };

    default:
      return {
        ariaLiveMessage: 'Acción completada exitosamente',
        ariaAnnouncement: 'Acción completada exitosamente',
        focusTarget: '#main-content'
      };
  }
}

/**
 * Generate ARIA labels for airport search results
 */
export function generateAirportAriaLabel(
  airport: {
    code: string;
    name: string;
    city: string;
    country: string;
    isPopular?: boolean;
  },
  position: number,
  total: number,
  locale: Locale
): AriaSearchResult {
  const popularText = {
    es: 'aeropuerto popular',
    en: 'popular airport',
    pt: 'aeroporto popular'
  };

  const ofText = {
    es: 'de',
    en: 'of',
    pt: 'de'
  };

  const resultText = {
    es: 'resultado',
    en: 'result',
    pt: 'resultado'
  };

  const popularSuffix = airport.isPopular ? `, ${popularText[locale]}` : '';

  return {
    ariaLabel: `${airport.code} - ${airport.name}, ${airport.city}, ${airport.country}${popularSuffix}`,
    ariaDescription: `${resultText[locale]} ${position} ${ofText[locale]} ${total}`,
    ariaRole: 'option',
    ariaPosInSet: position,
    ariaSetSize: total
  };
}

/**
 * Generate error response with ARIA information
 */
export function generateAriaErrorResponse(
  errorType: 'validation' | 'rateLimit' | 'recaptcha' | 'server' | 'notFound',
  locale: Locale,
  details?: any
) {
  const messages = VALIDATION_MESSAGES[locale];
  let errorMessage: string;
  let errorCode: string;

  switch (errorType) {
    case 'validation':
      errorMessage = 'Errores de validación detectados';
      errorCode = 'VALIDATION_ERROR';
      break;
    case 'rateLimit':
      errorMessage = messages.rateLimit;
      errorCode = 'RATE_LIMIT_EXCEEDED';
      break;
    case 'recaptcha':
      errorMessage = messages.recaptcha;
      errorCode = 'RECAPTCHA_FAILED';
      break;
    case 'notFound':
      errorMessage = 'Recurso no encontrado';
      errorCode = 'NOT_FOUND';
      break;
    default:
      errorMessage = messages.server;
      errorCode = 'SERVER_ERROR';
  }

  return {
    error: errorMessage,
    errorCode,
    ariaLiveMessage: errorMessage,
    ariaAnnouncement: `Error: ${errorMessage}`,
    ariaRole: 'alert',
    focusTarget: '#error-message',
    retryAction: errorType === 'server' ? 'Puede intentar nuevamente' : undefined,
    accessibility: {
      screenReaderText: errorMessage,
      politenessLevel: 'assertive' as const,
      atomic: true
    }
  };
}

/**
 * Generate loading state ARIA information
 */
export function generateAriaLoadingInfo(
  action: 'submitting' | 'searching' | 'loading',
  locale: Locale
) {
  const loadingMessages = {
    es: {
      submitting: 'Enviando formulario, por favor espere',
      searching: 'Buscando aeropuertos, por favor espere',
      loading: 'Cargando, por favor espere'
    },
    en: {
      submitting: 'Submitting form, please wait',
      searching: 'Searching airports, please wait',
      loading: 'Loading, please wait'
    },
    pt: {
      submitting: 'Enviando formulário, aguarde',
      searching: 'Buscando aeroportos, aguarde',
      loading: 'Carregando, aguarde'
    }
  };

  const message = loadingMessages[locale][action];

  return {
    ariaLiveMessage: message,
    ariaAnnouncement: message,
    ariaBusy: true,
    ariaRole: 'status',
    accessibility: {
      screenReaderText: message,
      politenessLevel: 'polite' as const,
      atomic: true
    }
  };
}

/**
 * Validate and sanitize ARIA attributes
 */
export function sanitizeAriaAttributes(attributes: Record<string, any>) {
  const allowedAttributes = [
    'aria-label',
    'aria-labelledby',
    'aria-describedby',
    'aria-invalid',
    'aria-required',
    'aria-expanded',
    'aria-selected',
    'aria-checked',
    'aria-disabled',
    'aria-hidden',
    'aria-live',
    'aria-atomic',
    'aria-busy',
    'aria-posinset',
    'aria-setsize',
    'role'
  ];

  const sanitized: Record<string, any> = {};

  Object.keys(attributes).forEach(key => {
    if (allowedAttributes.includes(key)) {
      // Ensure boolean values are properly formatted
      if (typeof attributes[key] === 'boolean') {
        sanitized[key] = attributes[key].toString();
      } else if (typeof attributes[key] === 'string' || typeof attributes[key] === 'number') {
        sanitized[key] = attributes[key];
      }
    }
  });

  return sanitized;
}

/**
 * Generate keyboard navigation instructions
 */
export function generateKeyboardInstructions(
  context: 'search' | 'form' | 'results',
  locale: Locale
) {
  const instructions = {
    es: {
      search: 'Use las flechas arriba/abajo para navegar, Enter para seleccionar, Escape para cerrar',
      form: 'Use Tab para navegar entre campos, Enter para enviar, Escape para cancelar',
      results: 'Use Tab o flechas para navegar resultados, Enter para seleccionar'
    },
    en: {
      search: 'Use up/down arrows to navigate, Enter to select, Escape to close',
      form: 'Use Tab to navigate fields, Enter to submit, Escape to cancel',
      results: 'Use Tab or arrows to navigate results, Enter to select'
    },
    pt: {
      search: 'Use setas para cima/baixo para navegar, Enter para selecionar, Escape para fechar',
      form: 'Use Tab para navegar entre campos, Enter para enviar, Escape para cancelar',
      results: 'Use Tab ou setas para navegar resultados, Enter para selecionar'
    }
  };

  return {
    instructions: instructions[locale][context],
    ariaDescription: instructions[locale][context],
    keyboardShortcuts: {
      navigate: context === 'search' ? 'ArrowUp, ArrowDown' : 'Tab',
      select: 'Enter',
      cancel: 'Escape'
    }
  };
}