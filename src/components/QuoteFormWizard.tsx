'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';
import { AirportSearch } from './AirportSearch';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface QuoteFormData {
  // Step 1: Service & Contact
  serviceType: 'charter' | 'empty_legs' | 'multicity' | 'helicopter' | 'medical' | 'cargo' | 'other';
  fullName: string;
  phone: string;
  contactWhatsApp?: boolean;
  email: string;

  // Step 2: Flight Details
  passengers: number;
  origin?: Airport;
  destination?: Airport;
  date: string;
  time: string;

  // Step 3: Baggage & Pets
  baggageSize?: 'light' | 'medium' | 'large';
  baggagePieces?: number;
  specialItems?: string;
  hasPets?: boolean;
  petSpecies?: string;
  petSize?: 'small' | 'medium' | 'large';
  petDocuments?: 'yes' | 'need_help';

  // Step 4: Additional Services
  additionalServices?: string[];

  // Step 5: Final Details
  comments?: string;
  privacyConsent: boolean;
}

interface QuoteFormWizardProps {
  locale: 'en' | 'es' | 'pt';
  onSubmitSuccess?: (data: any) => void;
  className?: string;
}

const getContent = (locale: string) => {
  const content = {
    en: {
      steps: {
        contact: 'Service & Contact',
        details: 'Flight Details',
        baggage: 'Baggage & Pets',
        services: 'Additional Services',
        final: 'Review & Submit'
      },
      serviceType: {
        label: 'Service',
        placeholder: 'Select a service',
        options: {
          charter: 'Point-to-point charter',
          empty_legs: 'Empty legs',
          multicity: 'Multicity',
          helicopter: 'Helicopter',
          medical: 'Medical',
          cargo: 'Cargo',
          other: 'Other'
        }
      },
      fullName: { label: 'Full name', placeholder: 'Your full name' },
      phone: { label: 'Phone', placeholder: 'Include country code', whatsapp: 'Contact via WhatsApp' },
      email: { label: 'Email', placeholder: 'you@mail.com' },
      passengers: { label: 'Passengers', placeholder: 'Number of travelers (1-14+)' },
      origin: { label: 'From', placeholder: 'City or IATA code (AEP)', fallback: 'Type city name if you don\'t know the code' },
      destination: { label: 'To', placeholder: 'City or IATA code (PDP)', fallback: 'Type city name if you don\'t know the code' },
      date: { label: 'Date', placeholder: 'dd/mm/yyyy' },
      time: { label: 'Time', placeholder: 'HH:MM' },
      baggage: {
        label: 'Baggage',
        placeholder: 'Size and pieces',
        sizes: { light: 'Light (carry-on bags)', medium: 'Medium (standard luggage)', large: 'Large (oversized baggage)' },
        pieces: 'Pieces:',
        specialItems: 'Special items:'
      },
      pets: {
        label: 'Pets',
        question: 'Traveling with pets?',
        species: 'Species:',
        speciesOptions: { dog: 'Dog', cat: 'Cat', other: 'Other' },
        size: 'Size:',
        sizeOptions: { small: 'Small', medium: 'Medium', large: 'Large' },
        documents: 'Documentation:',
        documentsOptions: { yes: 'Yes', need_help: 'Need help' }
      },
      additionalServices: {
        label: 'Add-on services',
        placeholder: 'Select what you need',
        options: {
          international: 'International flight support',
          documentation: 'Country documentation',
          petFriendly: 'Pet-friendly transport',
          transfer: 'Ground transfer / driver',
          catering: 'Premium catering',
          vip: 'VIP lounge / specific FBO',
          immigration: 'Immigration/customs assistance'
        }
      },
      comments: { label: 'Notes', placeholder: 'Anything else we should know' },
      consent: { label: 'I accept the Privacy Policy and data use for quotation purposes.' },
      buttons: {
        next: 'Next',
        previous: 'Previous',
        submit: 'Submit Quote Request'
      }
    },
    es: {
      steps: {
        contact: 'Servicio y Contacto',
        details: 'Detalles del Vuelo',
        baggage: 'Equipaje y Mascotas',
        services: 'Servicios Adicionales',
        final: 'Revisar y Enviar'
      },
      serviceType: {
        label: 'Servicio',
        placeholder: 'Seleccioná un servicio',
        options: {
          charter: 'Charter point-to-point',
          empty_legs: 'Empty legs',
          multicity: 'Multicity',
          helicopter: 'Helicóptero',
          medical: 'Medical',
          cargo: 'Cargo',
          other: 'Otros'
        }
      },
      fullName: { label: 'Nombre y apellido', placeholder: 'Tu nombre completo' },
      phone: { label: 'Teléfono', placeholder: 'Incluí código de país', whatsapp: 'Contactar por WhatsApp' },
      email: { label: 'E-mail', placeholder: 'tu@correo.com' },
      passengers: { label: 'Pasajeros', placeholder: 'Cantidad de personas (1-14+)' },
      origin: { label: 'Origen', placeholder: 'Ciudad o código IATA (AEP)', fallback: 'Escribí el nombre de la ciudad si no conocés el código' },
      destination: { label: 'Destino', placeholder: 'Ciudad o código IATA (PDP)', fallback: 'Escribí el nombre de la ciudad si no conocés el código' },
      date: { label: 'Fecha', placeholder: 'dd/mm/aaaa' },
      time: { label: 'Horario', placeholder: 'HH:MM' },
      baggage: {
        label: 'Equipaje',
        placeholder: 'Tamaño y cantidad',
        sizes: { light: 'Liviano (maletas de mano)', medium: 'Mediano (equipaje estándar)', large: 'Grande (equipaje voluminoso)' },
        pieces: 'Piezas:',
        specialItems: 'Bultos especiales:'
      },
      pets: {
        label: 'Mascotas',
        question: '¿Viajás con mascota?',
        species: 'Especie:',
        speciesOptions: { dog: 'Perro', cat: 'Gato', other: 'Otro' },
        size: 'Tamaño:',
        sizeOptions: { small: 'Pequeño', medium: 'Mediano', large: 'Grande' },
        documents: 'Documentos:',
        documentsOptions: { yes: 'Sí', need_help: 'Necesito ayuda' }
      },
      additionalServices: {
        label: 'Servicios adicionales',
        placeholder: 'Marcá lo que necesitás',
        options: {
          international: 'Apoyo vuelos internacionales',
          documentation: 'Documentación por país',
          petFriendly: 'Transporte pet-friendly',
          transfer: 'Transfer terrestre / chofer',
          catering: 'Catering premium',
          vip: 'Sala VIP / FBO específico',
          immigration: 'Asistencia migraciones/aduana'
        }
      },
      comments: { label: 'Comentarios', placeholder: 'Detalles útiles para tu vuelo' },
      consent: { label: 'Acepto la Política de privacidad y uso de datos para presupuestación.' },
      buttons: {
        next: 'Siguiente',
        previous: 'Anterior',
        submit: 'Enviar Cotización'
      }
    },
    pt: {
      steps: {
        contact: 'Serviço e Contato',
        details: 'Detalhes do Voo',
        baggage: 'Bagagem e Pets',
        services: 'Serviços Adicionais',
        final: 'Revisar e Enviar'
      },
      serviceType: {
        label: 'Serviço',
        placeholder: 'Selecione um serviço',
        options: {
          charter: 'Charter ponto-a-ponto',
          empty_legs: 'Empty legs',
          multicity: 'Multicity',
          helicopter: 'Helicóptero',
          medical: 'Medical',
          cargo: 'Cargo',
          other: 'Outro'
        }
      },
      fullName: { label: 'Nome completo', placeholder: 'Seu nome completo' },
      phone: { label: 'Telefone', placeholder: 'Inclua código do país', whatsapp: 'Contato via WhatsApp' },
      email: { label: 'E-mail', placeholder: 'voce@mail.com' },
      passengers: { label: 'Passageiros', placeholder: 'Número de pessoas (1-14+)' },
      origin: { label: 'Origem', placeholder: 'Cidade ou código IATA (AEP)', fallback: 'Digite o nome da cidade se não souber o código' },
      destination: { label: 'Destino', placeholder: 'Cidade ou código IATA (PDP)', fallback: 'Digite o nome da cidade se não souber o código' },
      date: { label: 'Data', placeholder: 'dd/mm/aaaa' },
      time: { label: 'Horário', placeholder: 'HH:MM' },
      baggage: {
        label: 'Bagagem',
        placeholder: 'Tamanho e quantidade',
        sizes: { light: 'Leve (bagagem de mão)', medium: 'Média (bagagem padrão)', large: 'Grande (bagagem volumosa)' },
        pieces: 'Peças:',
        specialItems: 'Itens especiais:'
      },
      pets: {
        label: 'Pets',
        question: 'Viajando com pets?',
        species: 'Espécie:',
        speciesOptions: { dog: 'Cão', cat: 'Gato', other: 'Outro' },
        size: 'Tamanho:',
        sizeOptions: { small: 'Pequeno', medium: 'Médio', large: 'Grande' },
        documents: 'Documentação:',
        documentsOptions: { yes: 'Sim', need_help: 'Preciso ajuda' }
      },
      additionalServices: {
        label: 'Serviços adicionais',
        placeholder: 'Selecione o que precisa',
        options: {
          international: 'Suporte para voos internacionais',
          documentation: 'Documentação por país',
          petFriendly: 'Transporte pet-friendly',
          transfer: 'Transfer terrestre / motorista',
          catering: 'Catering premium',
          vip: 'Sala VIP / FBO específico',
          immigration: 'Assistência imigração/alfândega'
        }
      },
      comments: { label: 'Comentários', placeholder: 'Detalhes do voo' },
      consent: { label: 'Aceito a Política de Privacidade e uso de dados para cotação.' },
      buttons: {
        next: 'Próximo',
        previous: 'Anterior',
        submit: 'Enviar Solicitação'
      }
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export function QuoteFormWizard({ locale, onSubmitSuccess, className }: QuoteFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const content = getContent(locale);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger
  } = useForm<QuoteFormData>({
    mode: 'onChange'
  });

  const watchedValues = watch();
  const totalSteps = 5;

  const validateStep = (step: number): boolean => {
    const values = watchedValues;

    switch (step) {
      case 1:
        return !!(values.serviceType && values.fullName && values.phone && values.email);
      case 2:
        return !!(values.passengers && values.origin && values.destination && values.date && values.time);
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return !!values.privacyConsent;
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };


  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          locale
        }),
      });

      if (response.ok) {
        onSubmitSuccess?.(data);
      } else {
        throw new Error('Failed to submit quote');
      }
    } catch (error) {
      console.error('Quote submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step === currentStep
                ? 'bg-accent-blue text-white'
                : step < currentStep
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 text-gray-500'
            )}
          >
            {step < currentStep ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div
              className={clsx(
                'flex-1 h-1 mx-2',
                step < currentStep ? 'bg-green-500' : 'bg-gray-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-navy-primary mb-4">
              {content.steps.contact}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.serviceType.label}
              </label>
              <select
                {...register('serviceType')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              >
                <option value="">{content.serviceType.placeholder}</option>
                {Object.entries(content.serviceType.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              {errors.serviceType && (
                <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.fullName.label}
              </label>
              <input
                type="text"
                {...register('fullName')}
                placeholder={content.fullName.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.phone.label}
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder={content.phone.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
              <div className="mt-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('contactWhatsApp')}
                    className="rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
                  />
                  <span className="ml-2 text-sm text-gray-600">{content.phone.whatsapp}</span>
                </label>
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.email.label}
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder={content.email.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-navy-primary mb-4">
              {content.steps.details}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.passengers.label}
              </label>
              <input
                type="number"
                min="1"
                max="14"
                {...register('passengers', { valueAsNumber: true })}
                placeholder={content.passengers.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
              {errors.passengers && (
                <p className="mt-1 text-sm text-red-600">{errors.passengers.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {content.origin.label}
                </label>
                <AirportSearch
                  placeholder={content.origin.placeholder}
                  onSelect={(airport) => setValue('origin', airport)}
                  locale={locale}
                />
                <p className="mt-1 text-xs text-gray-500">{content.origin.fallback}</p>
                {errors.origin && (
                  <p className="mt-1 text-sm text-red-600">Origin airport is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {content.destination.label}
                </label>
                <AirportSearch
                  placeholder={content.destination.placeholder}
                  onSelect={(airport) => setValue('destination', airport)}
                  locale={locale}
                />
                <p className="mt-1 text-xs text-gray-500">{content.destination.fallback}</p>
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">Destination airport is required</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {content.date.label}
                </label>
                <input
                  type="date"
                  {...register('date')}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {content.time.label}
                </label>
                <input
                  type="time"
                  {...register('time')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                {errors.time && (
                  <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-navy-primary mb-4">
              {content.steps.baggage}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.baggage.label}
              </label>
              <div className="space-y-3">
                {Object.entries(content.baggage.sizes).map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="radio"
                      value={key}
                      {...register('baggageSize')}
                      className="text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="ml-2 text-sm">{label}</span>
                  </label>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {content.baggage.pieces}
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('baggagePieces', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {content.baggage.specialItems}
                  </label>
                  <input
                    type="text"
                    {...register('specialItems')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.pets.label}
              </label>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register('hasPets')}
                    className="rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
                  />
                  <span className="ml-2 text-sm">{content.pets.question}</span>
                </label>
              </div>

              {watchedValues.hasPets && (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {content.pets.species}
                    </label>
                    <select
                      {...register('petSpecies')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm"
                    >
                      <option value="">Select</option>
                      {Object.entries(content.pets.speciesOptions).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {content.pets.size}
                    </label>
                    <select
                      {...register('petSize')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm"
                    >
                      <option value="">Select</option>
                      {Object.entries(content.pets.sizeOptions).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {content.pets.documents}
                    </label>
                    <select
                      {...register('petDocuments')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm"
                    >
                      <option value="">Select</option>
                      {Object.entries(content.pets.documentsOptions).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-navy-primary mb-4">
              {content.steps.services}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                {content.additionalServices.label}
              </label>
              <div className="space-y-3">
                {Object.entries(content.additionalServices.options).map(([key, label]) => (
                  <label key={key} className="flex items-start">
                    <input
                      type="checkbox"
                      value={key}
                      {...register('additionalServices')}
                      className="mt-1 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
                    />
                    <span className="ml-3 text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-navy-primary mb-4">
              {content.steps.final}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {content.comments.label}
              </label>
              <textarea
                {...register('comments')}
                rows={4}
                placeholder={content.comments.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
              />
            </div>

            <div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  {...register('privacyConsent')}
                  className="mt-1 rounded border-gray-300 text-accent-blue focus:ring-accent-blue"
                />
                <span className="ml-3 text-sm text-gray-700">
                  {content.consent.label}
                </span>
              </label>
              {errors.privacyConsent && (
                <p className="mt-1 text-sm text-red-600">{errors.privacyConsent.message}</p>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={clsx('max-w-2xl mx-auto', className)}>
      {renderStepIndicator()}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {renderStep()}

        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {content.buttons.previous}
            </button>
          )}

          <div className="flex-1" />

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 bg-accent-blue text-white rounded-md hover:bg-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-accent-blue"
            >
              {content.buttons.next}
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-accent-blue text-white rounded-md hover:bg-accent-blue/90 focus:outline-none focus:ring-2 focus:ring-accent-blue disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : content.buttons.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}