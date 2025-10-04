'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  contactViaWhatsApp: z.boolean().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: string) => void;
}

const getContent = (locale: string) => {
  const content = {
    en: {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      phoneOptional: 'Optional',
      contactWhatsApp: 'Contact via WhatsApp',
      message: 'Message',
      messageHelp: 'Please provide details about your inquiry (minimum 10 characters)',
      submit: 'Send Message',
      submitting: 'Sending...',
      successMessage: 'Thank you! We have received your request. We will contact you shortly.',
      errorMessage: 'There was an error sending your message. Please try again.',
      requiredField: 'This field is required',
      invalidEmail: 'Invalid email address',
      messageMinLength: 'Message must be at least 10 characters'
    },
    es: {
      firstName: 'Nombre',
      lastName: 'Apellido',
      email: 'Correo Electrónico',
      phone: 'Teléfono',
      phoneOptional: 'Opcional',
      contactWhatsApp: 'Contactar por WhatsApp',
      message: 'Mensaje',
      messageHelp: 'Por favor proporcione detalles sobre su consulta (mínimo 10 caracteres)',
      submit: 'Enviar Mensaje',
      submitting: 'Enviando...',
      successMessage: '¡Gracias! Hemos recibido tu solicitud. Te contactaremos pronto.',
      errorMessage: 'Hubo un error al enviar tu mensaje. Por favor intenta nuevamente.',
      requiredField: 'Este campo es obligatorio',
      invalidEmail: 'Correo electrónico inválido',
      messageMinLength: 'El mensaje debe tener al menos 10 caracteres'
    },
    pt: {
      firstName: 'Nome',
      lastName: 'Sobrenome',
      email: 'E-mail',
      phone: 'Telefone',
      phoneOptional: 'Opcional',
      contactWhatsApp: 'Contato via WhatsApp',
      message: 'Mensagem',
      messageHelp: 'Por favor forneça detalhes sobre sua consulta (mínimo 10 caracteres)',
      submit: 'Enviar Mensagem',
      submitting: 'Enviando...',
      successMessage: 'Obrigado! Recebemos sua solicitação. Entraremos em contato em breve.',
      errorMessage: 'Houve um erro ao enviar sua mensagem. Por favor tente novamente.',
      requiredField: 'Este campo é obrigatório',
      invalidEmail: 'E-mail inválido',
      messageMinLength: 'A mensagem deve ter pelo menos 10 caracteres'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export function ContactForm({
  locale = 'en',
  className = '',
  onSubmitSuccess,
  onSubmitError
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const content = getContent(locale);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    defaultValues: {
      contactViaWhatsApp: false
    }
  });

  const onSubmit = useCallback(async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          inquiryType: 'general',
          locale
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      setSubmitStatus('success');
      reset();
      onSubmitSuccess?.(result);

    } catch (error) {
      console.error('Contact submission error:', error);
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : content.errorMessage;
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [locale, reset, onSubmitSuccess, onSubmitError, content.errorMessage]);

  if (submitStatus === 'success') {
    return (
      <div className="text-center py-12">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">
          {content.successMessage}
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              {content.firstName} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('firstName')}
              id="firstName"
              type="text"
              autoComplete="given-name"
              className={clsx(
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors',
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              {content.lastName} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('lastName')}
              id="lastName"
              type="text"
              autoComplete="family-name"
              className={clsx(
                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors',
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              )}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {content.email} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            autoComplete="email"
            className={clsx(
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors',
              errors.email ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            {content.phone} <span className="text-gray-500 text-xs">({content.phoneOptional})</span>
          </label>
          <input
            {...register('phone')}
            id="phone"
            type="tel"
            autoComplete="tel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors"
          />

          {/* WhatsApp Checkbox */}
          <div className="mt-3">
            <label className="flex items-center cursor-pointer">
              <input
                {...register('contactViaWhatsApp')}
                type="checkbox"
                className="w-4 h-4 text-accent-blue border-gray-300 rounded focus:ring-2 focus:ring-accent-blue"
              />
              <span className="ml-2 text-sm text-gray-700">{content.contactWhatsApp}</span>
            </label>
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            {content.message} <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('message')}
            id="message"
            rows={6}
            className={clsx(
              'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:border-accent-blue transition-colors resize-vertical',
              errors.message ? 'border-red-500' : 'border-gray-300'
            )}
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">{content.messageHelp}</p>
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{content.errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={clsx(
            'w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200',
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-accent-blue hover:bg-accent-blue/90 hover:shadow-lg transform hover:scale-105'
          )}
        >
          {isSubmitting ? content.submitting : content.submit}
        </button>
      </form>
    </div>
  );
}
