'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  iataCode?: boolean;
  date?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => string | null;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

export interface AccessibleError {
  id: string;
  message: string;
  field: string;
  severity: 'error' | 'warning';
  suggestions?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, AccessibleError>;
  warnings: Record<string, AccessibleError>;
  hasErrors: boolean;
  hasWarnings: boolean;
}

interface ValidationAnnouncement {
  message: string;
  type: 'error' | 'success' | 'info';
  timestamp: number;
}

const AIRPORT_CODES = new Set([
  'EZE', 'AEP', 'IGR', 'COR', 'MDZ', 'USH', 'FTE', 'BRC', 'NQN', 'TUC',
  'SLA', 'JUJ', 'CNQ', 'LGS', 'VDM', 'PMY', 'CRD', 'PSS', 'RGA', 'REL',
  // Add more IATA codes as needed
]);

export const useAccessibleValidation = (schema: ValidationSchema, locale: string = 'en') => {
  const [errors, setErrors] = useState<Record<string, AccessibleError>>({});
  const [warnings, setWarnings] = useState<Record<string, AccessibleError>>({});
  const [announcements, setAnnouncements] = useState<ValidationAnnouncement[]>([]);
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});
  const [announcementTimeouts, setAnnouncementTimeouts] = useState<Record<string, NodeJS.Timeout>>({});

  const getLocalizedErrorMessages = (locale: string) => {
    const messages = {
      en: {
        required: 'This field is required',
        email: 'Please enter a valid email address',
        phone: 'Please enter a valid phone number',
        minLength: (min: number) => `Must be at least ${min} characters`,
        maxLength: (max: number) => `Must be no more than ${max} characters`,
        pattern: 'Please enter a valid format',
        iataCode: 'Please enter a valid 3-letter airport code',
        date: 'Please enter a valid date',
        min: (min: number) => `Must be at least ${min}`,
        max: (max: number) => `Must be no more than ${max}`,
        fieldFixed: 'Field error resolved',
        validationSuccess: 'All fields are valid',
        errorSummary: (count: number) => `Found ${count} error${count === 1 ? '' : 's'} in the form`,
      },
      es: {
        required: 'Este campo es obligatorio',
        email: 'Por favor ingrese una dirección de correo válida',
        phone: 'Por favor ingrese un número de teléfono válido',
        minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
        maxLength: (max: number) => `Debe tener máximo ${max} caracteres`,
        pattern: 'Por favor ingrese un formato válido',
        iataCode: 'Por favor ingrese un código de aeropuerto de 3 letras válido',
        date: 'Por favor ingrese una fecha válida',
        min: (min: number) => `Debe ser al menos ${min}`,
        max: (max: number) => `Debe ser máximo ${max}`,
        fieldFixed: 'Error de campo resuelto',
        validationSuccess: 'Todos los campos son válidos',
        errorSummary: (count: number) => `Se encontraron ${count} error${count === 1 ? '' : 'es'} en el formulario`,
      },
      pt: {
        required: 'Este campo é obrigatório',
        email: 'Por favor insira um endereço de email válido',
        phone: 'Por favor insira um número de telefone válido',
        minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
        maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
        pattern: 'Por favor insira um formato válido',
        iataCode: 'Por favor insira um código de aeroporto de 3 letras válido',
        date: 'Por favor insira uma data válida',
        min: (min: number) => `Deve ser pelo menos ${min}`,
        max: (max: number) => `Deve ser no máximo ${max}`,
        fieldFixed: 'Erro de campo resolvido',
        validationSuccess: 'Todos os campos são válidos',
        errorSummary: (count: number) => `Encontrados ${count} erro${count === 1 ? '' : 's'} no formulário`,
      },
    };

    return messages[locale as keyof typeof messages] || messages.en;
  };

  const messages = getLocalizedErrorMessages(locale);

  const validateField = useCallback((fieldName: string, value: any): AccessibleError | null => {
    const rule = schema[fieldName];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return {
        id: `${fieldName}-error`,
        message: messages.required,
        field: fieldName,
        severity: 'error',
        suggestions: ['Please provide a value for this field'],
      };
    }

    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return null;
    }

    const stringValue = value.toString().trim();

    // Length validations
    if (rule.minLength && stringValue.length < rule.minLength) {
      return {
        id: `${fieldName}-error`,
        message: messages.minLength(rule.minLength),
        field: fieldName,
        severity: 'error',
        suggestions: [`Add ${rule.minLength - stringValue.length} more character${rule.minLength - stringValue.length === 1 ? '' : 's'}`],
      };
    }

    if (rule.maxLength && stringValue.length > rule.maxLength) {
      return {
        id: `${fieldName}-error`,
        message: messages.maxLength(rule.maxLength),
        field: fieldName,
        severity: 'error',
        suggestions: [`Remove ${stringValue.length - rule.maxLength} character${stringValue.length - rule.maxLength === 1 ? '' : 's'}`],
      };
    }

    // Email validation
    if (rule.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(stringValue)) {
        return {
          id: `${fieldName}-error`,
          message: messages.email,
          field: fieldName,
          severity: 'error',
          suggestions: ['Example: name@domain.com'],
        };
      }
    }

    // Phone validation
    if (rule.phone) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(stringValue)) {
        return {
          id: `${fieldName}-error`,
          message: messages.phone,
          field: fieldName,
          severity: 'error',
          suggestions: ['Include country code if international, e.g., +54 11 1234-5678'],
        };
      }
    }

    // IATA code validation
    if (rule.iataCode) {
      const iataRegex = /^[A-Z]{3}$/;
      if (!iataRegex.test(stringValue)) {
        return {
          id: `${fieldName}-error`,
          message: messages.iataCode,
          field: fieldName,
          severity: 'error',
          suggestions: ['Examples: EZE, JFK, LHR'],
        };
      }

      // Check against known IATA codes
      if (!AIRPORT_CODES.has(stringValue)) {
        return {
          id: `${fieldName}-error`,
          message: 'Airport code not found in our database',
          field: fieldName,
          severity: 'warning',
          suggestions: ['Please verify the airport code or search from the list'],
        };
      }
    }

    // Date validation
    if (rule.date) {
      const dateValue = new Date(value);
      if (isNaN(dateValue.getTime())) {
        return {
          id: `${fieldName}-error`,
          message: messages.date,
          field: fieldName,
          severity: 'error',
          suggestions: ['Use format: MM/DD/YYYY or YYYY-MM-DD'],
        };
      }
    }

    // Numeric validations
    if (rule.min !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue < rule.min) {
        return {
          id: `${fieldName}-error`,
          message: messages.min(rule.min),
          field: fieldName,
          severity: 'error',
        };
      }
    }

    if (rule.max !== undefined) {
      const numValue = Number(value);
      if (isNaN(numValue) || numValue > rule.max) {
        return {
          id: `${fieldName}-error`,
          message: messages.max(rule.max),
          field: fieldName,
          severity: 'error',
        };
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return {
        id: `${fieldName}-error`,
        message: messages.pattern,
        field: fieldName,
        severity: 'error',
      };
    }

    // Custom validation
    if (rule.custom) {
      const customError = rule.custom(value);
      if (customError) {
        return {
          id: `${fieldName}-error`,
          message: customError,
          field: fieldName,
          severity: 'error',
        };
      }
    }

    return null;
  }, [schema, messages]);

  const validateFieldAccessibly = useCallback((fieldName: string, value: any) => {
    const fieldResult = validateField(fieldName, value);

    if (fieldResult) {
      if (fieldResult.severity === 'error') {
        setErrors(prev => ({ ...prev, [fieldName]: fieldResult }));
        setWarnings(prev => {
          const newWarnings = { ...prev };
          delete newWarnings[fieldName];
          return newWarnings;
        });
      } else {
        setWarnings(prev => ({ ...prev, [fieldName]: fieldResult }));
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Announce error to screen readers (debounced)
      announceError(fieldResult);
    } else {
      // Clear errors and warnings for this field
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
      setWarnings(prev => {
        const newWarnings = { ...prev };
        delete newWarnings[fieldName];
        return newWarnings;
      });

      // Announce success for previously invalid fields
      if (fieldTouched[fieldName] && (errors[fieldName] || warnings[fieldName])) {
        announceSuccess(fieldName);
      }
    }

    // Mark field as touched
    setFieldTouched(prev => ({ ...prev, [fieldName]: true }));
  }, [validateField, errors, warnings, fieldTouched]);

  const announceError = useCallback((error: AccessibleError) => {
    // Clear existing timeout for this field
    if (announcementTimeouts[error.field]) {
      clearTimeout(announcementTimeouts[error.field]);
    }

    // Debounce announcements to avoid overwhelming screen readers
    const timeout = setTimeout(() => {
      const announcement: ValidationAnnouncement = {
        message: `${error.field}: ${error.message}`,
        type: 'error',
        timestamp: Date.now(),
      };

      setAnnouncements(prev => {
        // Keep only recent announcements (last 5)
        const recent = prev.filter(a => Date.now() - a.timestamp < 10000).slice(-4);
        return [...recent, announcement];
      });

      // Clear the timeout from state
      setAnnouncementTimeouts(prev => {
        const newTimeouts = { ...prev };
        delete newTimeouts[error.field];
        return newTimeouts;
      });
    }, 500); // 500ms debounce

    setAnnouncementTimeouts(prev => ({ ...prev, [error.field]: timeout }));
  }, [announcementTimeouts]);

  const announceSuccess = useCallback((fieldName: string) => {
    const announcement: ValidationAnnouncement = {
      message: `${fieldName}: ${messages.fieldFixed}`,
      type: 'success',
      timestamp: Date.now(),
    };

    setAnnouncements(prev => {
      const recent = prev.filter(a => Date.now() - a.timestamp < 10000).slice(-4);
      return [...recent, announcement];
    });
  }, [messages]);

  const validateAllFields = useCallback((formData: Record<string, any>): ValidationResult => {
    const newErrors: Record<string, AccessibleError> = {};
    const newWarnings: Record<string, AccessibleError> = {};

    Object.keys(schema).forEach(fieldName => {
      const value = formData[fieldName];
      const result = validateField(fieldName, value);

      if (result) {
        if (result.severity === 'error') {
          newErrors[fieldName] = result;
        } else {
          newWarnings[fieldName] = result;
        }
      }
    });

    setErrors(newErrors);
    setWarnings(newWarnings);

    const hasErrors = Object.keys(newErrors).length > 0;
    const hasWarnings = Object.keys(newWarnings).length > 0;

    // Announce validation summary
    if (hasErrors) {
      const announcement: ValidationAnnouncement = {
        message: messages.errorSummary(Object.keys(newErrors).length),
        type: 'error',
        timestamp: Date.now(),
      };
      setAnnouncements(prev => [...prev.slice(-4), announcement]);
    } else {
      const announcement: ValidationAnnouncement = {
        message: messages.validationSuccess,
        type: 'success',
        timestamp: Date.now(),
      };
      setAnnouncements(prev => [...prev.slice(-4), announcement]);
    }

    return {
      isValid: !hasErrors,
      errors: newErrors,
      warnings: newWarnings,
      hasErrors,
      hasWarnings,
    };
  }, [schema, validateField, messages]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
    setWarnings(prev => {
      const newWarnings = { ...prev };
      delete newWarnings[fieldName];
      return newWarnings;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
    setWarnings({});
    setAnnouncements([]);
    setFieldTouched({});

    // Clear all timeouts
    Object.values(announcementTimeouts).forEach(timeout => {
      clearTimeout(timeout);
    });
    setAnnouncementTimeouts({});
  }, [announcementTimeouts]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(announcementTimeouts).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [announcementTimeouts]);

  return {
    errors,
    warnings,
    announcements,
    fieldTouched,
    validateFieldAccessibly,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
    hasErrors: Object.keys(errors).length > 0,
    hasWarnings: Object.keys(warnings).length > 0,
    isFormValid: Object.keys(errors).length === 0,
  };
};