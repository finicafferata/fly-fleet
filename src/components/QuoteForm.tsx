'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import { AirportSearch } from './AirportSearch';
import { FormField } from './ui/FormField';
import { FocusRing } from './ui/FocusRing';
import { LiveRegion } from './ui/LiveRegion';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useFocusManagement } from '../hooks/useFocusManagement';
import { trackFormStart, trackFormSubmitQuote } from '../lib/analytics/accessibleTracking';

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region: string;
  isPopular: boolean;
}

const quoteFormSchema = z.object({
  serviceType: z.enum(['charter', 'empty_legs', 'multicity', 'helicopter', 'medical', 'cargo']),
  departureAirport: z.object({
    code: z.string(),
    name: z.string(),
    city: z.string(),
    country: z.string()
  }),
  arrivalAirport: z.object({
    code: z.string(),
    name: z.string(),
    city: z.string(),
    country: z.string()
  }),
  departureDate: z.string().min(1, 'Departure date is required'),
  departureTime: z.string().optional(),
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  passengers: z.number().min(1, 'At least 1 passenger required').max(50, 'Maximum 50 passengers'),
  standardBags: z.number().min(0).max(20).default(0),
  specialItems: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  countryCode: z.string().optional(),
  pets: z.boolean().default(false),
  petSpecies: z.string().optional(),
  petSize: z.string().optional(),
  additionalServices: z.array(z.string()).optional(),
  message: z.string().optional(),
  privacyConsent: z.boolean().refine(val => val === true, 'Privacy consent is required'),
  recaptchaToken: z.string().min(1, 'Please complete the verification')
});

type QuoteFormData = z.infer<typeof quoteFormSchema>;

interface QuoteFormProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: string) => void;
  detectedCountryCode?: string;
}

const serviceTypeOptions = [
  { value: 'charter', label: 'Private Charter', description: 'Exclusive private flights' },
  { value: 'empty_legs', label: 'Empty Legs', description: 'Discounted repositioning flights' },
  { value: 'multicity', label: 'Multi-City', description: 'Multiple destination trips' },
  { value: 'helicopter', label: 'Helicopter', description: 'Helicopter charter services' },
  { value: 'medical', label: 'Medical', description: 'Emergency medical transport' },
  { value: 'cargo', label: 'Cargo', description: 'Freight and cargo transport' }
];

const additionalServicesOptions = [
  { value: 'ground_transport', label: 'Ground Transportation' },
  { value: 'catering', label: 'In-flight Catering' },
  { value: 'wifi', label: 'Wi-Fi Access' },
  { value: 'concierge', label: 'Concierge Services' },
  { value: 'customs', label: 'Customs Assistance' }
];

const accessiblePlaceholders = {
  en: {
    fullName: "Enter your full name",
    fullNameAriaLabel: "Full name, required",
    email: "your@email.com",
    emailAriaLabel: "Email address, required",
    emailHelp: "We'll use this to send your quote",
    phone: "Enter phone number",
    phoneAriaLabel: "Phone number, required"
  },
  es: {
    fullName: "Ingresá tu nombre completo",
    fullNameAriaLabel: "Nombre completo, requerido",
    email: "tu@correo.com",
    emailAriaLabel: "Dirección de correo electrónico, requerido",
    emailHelp: "Ej: juan@correo.com",
    phone: "Ingresá tu teléfono",
    phoneAriaLabel: "Número de teléfono, requerido"
  },
  pt: {
    fullName: "Digite seu nome completo",
    fullNameAriaLabel: "Nome completo, obrigatório",
    email: "seu@email.com",
    emailAriaLabel: "Endereço de email, obrigatório",
    emailHelp: "Ex: joao@email.com",
    phone: "Digite seu telefone",
    phoneAriaLabel: "Número de telefone, obrigatório"
  }
};

export function QuoteForm({
  locale = 'en',
  className = '',
  onSubmitSuccess,
  onSubmitError,
  detectedCountryCode
}: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [announcement, setAnnouncement] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [showPetSection, setShowPetSection] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [characterCount, setCharacterCount] = useState(0);
  const [formStarted, setFormStarted] = useState(false);

  const placeholders = accessiblePlaceholders[locale];

  const { announce, announceAssertive } = useAnnouncer();
  const { focusElement } = useFocusManagement();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema) as any,
    mode: 'onBlur',
    defaultValues: {
      serviceType: 'charter',
      passengers: 1,
      standardBags: 0,
      pets: false,
      privacyConsent: false,
      countryCode: detectedCountryCode || '+1'
    }
  });

  const serviceType = watch('serviceType');
  const passengers = watch('passengers');
  const standardBags = watch('standardBags');
  const pets = watch('pets');
  const message = watch('message');

  // Update character count for message field
  React.useEffect(() => {
    setCharacterCount(message?.length || 0);
  }, [message]);

  // Show/hide pet section based on pets checkbox
  React.useEffect(() => {
    setShowPetSection(pets);
    if (!pets) {
      setValue('petSpecies', '');
      setValue('petSize', '');
    }
  }, [pets, setValue]);

  const onSubmit = useCallback(async (data: QuoteFormData) => {
    if (!recaptchaToken) {
      announceAssertive('Please complete the verification before submitting');
      return;
    }

    // Track form submission with exact GA4 format
    trackFormSubmitQuote({
      service: data.serviceType,
      origin: data.departureAirport.code,
      destination: data.arrivalAirport.code,
      passengers: data.passengers,
      standardBagsCount: data.standardBags,
      pets: showPetSection,
      additionalServices: selectedServices
    });

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setAnnouncement('Submitting quote request...');

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          recaptchaToken,
          locale
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Submission failed');
      }

      setSubmitStatus('success');
      setAnnouncement(result.accessibility?.ariaLiveMessage || 'Quote request submitted successfully');

      // Focus management for success state
      if (result.accessibility?.focusTarget) {
        setTimeout(() => {
          focusElement(result.accessibility.focusTarget);
        }, 100);
      }

      reset();
      setRecaptchaToken('');
      onSubmitSuccess?.(result);

    } catch (error) {
      console.error('Quote submission error:', error);
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request';
      setAnnouncement(`Error: ${errorMessage}`);
      announceAssertive(errorMessage);
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [recaptchaToken, locale, reset, announce, announceAssertive, focusElement, onSubmitSuccess, onSubmitError, showPetSection, selectedServices]);

  // Track form start on first interaction
  const handleFormStart = useCallback(() => {
    if (!formStarted) {
      trackFormStart();
      setFormStarted(true);
    }
  }, [formStarted]);

  const handleDepartureSelect = useCallback((airport: Airport) => {
    handleFormStart(); // Track form start on first interaction
    setValue('departureAirport', {
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country
    }, { shouldValidate: true });
    announce(`Departure airport selected: ${airport.code} - ${airport.name}`, { priority: 'polite' });
  }, [setValue, announce, handleFormStart]);

  const handleArrivalSelect = useCallback((airport: Airport) => {
    handleFormStart(); // Track form start on first interaction
    setValue('arrivalAirport', {
      code: airport.code,
      name: airport.name,
      city: airport.city,
      country: airport.country
    }, { shouldValidate: true });
    announce(`Arrival airport selected: ${airport.code} - ${airport.name}`, { priority: 'polite' });
  }, [setValue, announce, handleFormStart]);

  const handlePassengerChange = useCallback((increment: boolean) => {
    const newValue = increment
      ? Math.min(passengers + 1, 50)
      : Math.max(passengers - 1, 1);

    setValue('passengers', newValue, { shouldValidate: true });
    announce(`Passengers: ${newValue}`, { priority: 'polite' });
  }, [passengers, setValue, announce]);

  return (
    <div className={clsx('max-w-4xl mx-auto', className)}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        role="form"
        aria-labelledby="quote-form-title"
      >
        <h2 id="quote-form-title" className="text-2xl font-semibold text-navy-primary mb-6">
          Request Your Private Charter Quote
        </h2>

        <fieldset disabled={isSubmitting} className="space-y-8">
          <legend className="sr-only">Quote Request Form</legend>

          {/* Service Type Selection */}
          <FormField
            label="Service Type"
            required
            error={errors.serviceType?.message}
            description="Select the type of service you need"
          >
            <div
              role="radiogroup"
              aria-labelledby="service-type-label"
              aria-describedby="service-type-description"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {serviceTypeOptions.map((option) => (
                <FocusRing key={option.value}>
                  <label
                    className={clsx(
                      'relative flex flex-col p-4 border rounded-lg cursor-pointer transition-all',
                      'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                      serviceType === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    <input
                      {...register('serviceType')}
                      type="radio"
                      value={option.value}
                      className="sr-only"
                      aria-describedby={`${option.value}-description`}
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </span>
                    <span
                      id={`${option.value}-description`}
                      className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                    >
                      {option.description}
                    </span>
                    {serviceType === option.value && (
                      <div
                        className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </label>
                </FocusRing>
              ))}
            </div>
          </FormField>

          {/* Airport Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Departure Airport"
              required
              error={errors.departureAirport?.message}
            >
              <AirportSearch
                onSelect={handleDepartureSelect}
                placeholder="Search departure airport..."
                locale={locale}
                error={errors.departureAirport?.message}
              />
            </FormField>

            <FormField
              label="Arrival Airport"
              required
              error={errors.arrivalAirport?.message}
            >
              <AirportSearch
                onSelect={handleArrivalSelect}
                placeholder="Search arrival airport..."
                locale={locale}
                error={errors.arrivalAirport?.message}
              />
            </FormField>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Departure Date"
              required
              error={errors.departureDate?.message}
            >
              <input
                {...register('departureDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                aria-describedby="departure-date-help"
              />
              <VisuallyHidden id="departure-date-help">
                Select your preferred departure date
              </VisuallyHidden>
            </FormField>

            <FormField
              label="Return Date"
              error={errors.returnDate?.message}
              description="Optional for one-way trips"
            >
              <input
                {...register('returnDate')}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                aria-describedby="return-date-help"
              />
              <VisuallyHidden id="return-date-help">
                Select your return date if needed
              </VisuallyHidden>
            </FormField>
          </div>

          {/* Passenger Count */}
          <FormField
            label="Number of Passengers"
            required
            error={errors.passengers?.message}
            description="Include all passengers (1-50)"
          >
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handlePassengerChange(false)}
                disabled={passengers <= 1}
                aria-label="Decrease passenger count"
                className={clsx(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                  passengers <= 1
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                )}
              >
                <span aria-hidden="true">−</span>
              </button>

              <div
                role="spinbutton"
                aria-valuenow={passengers}
                aria-valuemin={1}
                aria-valuemax={50}
                aria-label="Number of passengers"
                className="flex-1 text-center font-medium text-lg py-2 px-4 border rounded-md"
              >
                {passengers} {passengers === 1 ? 'Passenger' : 'Passengers'}
              </div>

              <button
                type="button"
                onClick={() => handlePassengerChange(true)}
                disabled={passengers >= 50}
                aria-label="Increase passenger count"
                className={clsx(
                  'w-10 h-10 rounded-full border-2 flex items-center justify-center',
                  'transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                  passengers >= 50
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                    : 'border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                )}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          </FormField>

          {/* Personal Information Section */}
          <div role="group" aria-labelledby="personal-info-heading">
            <h3 id="personal-info-heading" className="text-lg font-semibold text-navy-primary mb-4">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                {...register('firstName')}
                label="First Name"
                required
                error={errors.firstName?.message}
                type="text"
                autoComplete="given-name"
                placeholder={placeholders.fullName}
                aria-label={placeholders.fullNameAriaLabel}
              />

              <Input
                {...register('lastName')}
                label="Last Name"
                required
                error={errors.lastName?.message}
                type="text"
                autoComplete="family-name"
                placeholder="Enter your last name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                {...register('email')}
                label="Email Address"
                required
                error={errors.email?.message}
                type="email"
                autoComplete="email"
                placeholder={placeholders.email}
                aria-label={placeholders.emailAriaLabel}
                helpText={placeholders.emailHelp}
              />

              <div className="space-y-1">
                <Input
                  {...register('phone')}
                  label="Phone Number"
                  required
                  error={errors.phone?.message}
                  type="tel"
                  autoComplete="tel"
                  placeholder={placeholders.phone}
                  aria-label={placeholders.phoneAriaLabel}
                  leftIcon={
                    <span className="text-sm font-medium">
                      {detectedCountryCode || '+1'}
                    </span>
                  }
                />
                <p className="text-xs text-neutral-medium">
                  Country code automatically detected: {detectedCountryCode || '+1 (US)'}
                </p>
              </div>
            </div>

            {/* Baggage Section */}
            <div role="group" aria-labelledby="baggage-heading" className="space-y-4">
              <h4 id="baggage-heading" className="text-base font-medium text-navy-primary">
                Baggage Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-navy-primary">
                    Standard Bags (0-20)
                    <span className="text-red-500 ml-1" aria-label="required">*</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.max(standardBags - 1, 0);
                        setValue('standardBags', newValue, { shouldValidate: true });
                        announce(`Standard bags: ${newValue}`, { priority: 'polite' });
                      }}
                      disabled={standardBags <= 0}
                      aria-label="Decrease standard bags count"
                      className={clsx(
                        'w-10 h-10 rounded-full border-2 flex items-center justify-center min-h-[44px]',
                        'transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue',
                        standardBags <= 0
                          ? 'border-neutral-medium text-neutral-medium cursor-not-allowed'
                          : 'border-accent-blue text-accent-blue hover:bg-neutral-light'
                      )}
                    >
                      <span aria-hidden="true">−</span>
                    </button>

                    <div
                      role="spinbutton"
                      aria-valuenow={standardBags}
                      aria-valuemin={0}
                      aria-valuemax={20}
                      aria-label="Number of standard bags"
                      className="flex-1 text-center font-medium text-lg py-2 px-4 border border-neutral-medium rounded-md min-h-[44px] flex items-center justify-center"
                    >
                      {standardBags} {standardBags === 1 ? 'Bag' : 'Bags'}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newValue = Math.min(standardBags + 1, 20);
                        setValue('standardBags', newValue, { shouldValidate: true });
                        announce(`Standard bags: ${newValue}`, { priority: 'polite' });
                      }}
                      disabled={standardBags >= 20}
                      aria-label="Increase standard bags count"
                      className={clsx(
                        'w-10 h-10 rounded-full border-2 flex items-center justify-center min-h-[44px]',
                        'transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue',
                        standardBags >= 20
                          ? 'border-neutral-medium text-neutral-medium cursor-not-allowed'
                          : 'border-accent-blue text-accent-blue hover:bg-neutral-light'
                      )}
                    >
                      <span aria-hidden="true">+</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="special-items"
                    className="block text-sm font-medium text-navy-primary"
                  >
                    Special Items
                  </label>
                  <textarea
                    {...register('specialItems')}
                    id="special-items"
                    rows={3}
                    placeholder="Golf clubs, skis, musical instruments, etc."
                    className="w-full px-3 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical"
                    aria-describedby="special-items-help"
                  />
                  <p id="special-items-help" className="text-xs text-neutral-medium">
                    List any special or oversized items
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Services */}
            <div role="group" aria-labelledby="services-heading" className="space-y-4">
              <h4 id="services-heading" className="text-base font-medium text-navy-primary">
                Additional Services
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {additionalServicesOptions.map((service) => (
                  <label
                    key={service.value}
                    className="flex items-center space-x-3 p-3 border border-neutral-medium rounded-lg hover:bg-neutral-light cursor-pointer min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      value={service.value}
                      checked={selectedServices.includes(service.value)}
                      onChange={(e) => {
                        const newServices = e.target.checked
                          ? [...selectedServices, service.value]
                          : selectedServices.filter(s => s !== service.value);
                        setSelectedServices(newServices);
                        setValue('additionalServices', newServices);
                      }}
                      className="w-4 h-4 text-accent-blue border-neutral-medium rounded focus:ring-2 focus:ring-accent-blue"
                    />
                    <span className="text-sm font-medium text-navy-primary">
                      {service.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Pet Section */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-3 border border-neutral-medium rounded-lg hover:bg-neutral-light cursor-pointer min-h-[44px]">
                <input
                  {...register('pets')}
                  type="checkbox"
                  className="w-4 h-4 text-accent-blue border-neutral-medium rounded focus:ring-2 focus:ring-accent-blue"
                />
                <span className="text-sm font-medium text-navy-primary">
                  Traveling with pets
                </span>
              </label>

              {showPetSection && (
                <div
                  role="group"
                  aria-labelledby="pet-details-heading"
                  aria-live="polite"
                  className="ml-6 space-y-4 animate-fade-in"
                >
                  <h5 id="pet-details-heading" className="text-sm font-medium text-navy-primary">
                    Pet Details
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      {...register('petSpecies')}
                      label="Species/Type"
                      placeholder="Dog, cat, bird, etc."
                      aria-label="Pet species or type"
                    />
                    <Select
                      options={[
                        { value: 'light', label: 'Light (under 20 lbs)' },
                        { value: 'medium', label: 'Medium (20-60 lbs)' },
                        { value: 'heavy', label: 'Heavy (over 60 lbs)' }
                      ]}
                      value={watch('petSize') || ''}
                      onChange={(value) => setValue('petSize', value)}
                      label="Size"
                      placeholder="Select pet size"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="space-y-1">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-navy-primary"
              >
                Additional Comments
              </label>
              <textarea
                {...register('message')}
                id="message"
                rows={4}
                placeholder="Tell us about any special requirements, preferred aircraft type, or other details..."
                className="w-full px-3 py-2 border border-neutral-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-blue resize-vertical"
                aria-describedby="message-count"
                maxLength={1000}
              />
              <div className="flex justify-between text-xs text-neutral-medium">
                <span>Optional: Any special requirements or additional information</span>
                <span id="message-count" aria-live="polite">
                  {characterCount}/1000 characters
                </span>
              </div>
            </div>

            {/* Privacy Consent */}
            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-3 border border-neutral-medium rounded-lg min-h-[44px]">
                <input
                  {...register('privacyConsent')}
                  type="checkbox"
                  className="w-4 h-4 text-accent-blue border-neutral-medium rounded focus:ring-2 focus:ring-accent-blue mt-0.5"
                  aria-required="true"
                />
                <span className="text-sm text-navy-primary">
                  I agree to the{' '}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent-blue underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-1 rounded"
                  >
                    Privacy Policy
                  </a>{' '}
                  and consent to the processing of my personal data for quote purposes.
                  <span className="text-red-500 ml-1" aria-label="required">*</span>
                </span>
              </label>
              {errors.privacyConsent && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.privacyConsent.message}
                </p>
              )}
            </div>
          </div>

          {/* reCAPTCHA Placeholder */}
          <FormField
            label="Verification"
            required
            error={errors.recaptchaToken?.message}
            description="Please complete the verification to submit your request"
          >
            <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                reCAPTCHA component will be integrated here
              </p>
              <button
                type="button"
                onClick={() => setRecaptchaToken('mock-token-' + Date.now())}
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Mock Verify
              </button>
            </div>
          </FormField>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid || !recaptchaToken}
              loading={isSubmitting}
              loadingText="Submitting Request..."
              className="w-full"
              size="lg"
              aria-describedby="submit-status"
            >
              Request Quote
            </Button>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div
              role="alert"
              aria-live="polite"
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-green-800 dark:text-green-200">
                    Quote Request Submitted
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    We&apos;ve received your request and will get back to you within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div
              role="alert"
              aria-live="assertive"
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="font-medium text-red-800 dark:text-red-200">
                    Submission Failed
                  </h3>
                  <p className="text-red-700 dark:text-red-300 mt-1">
                    Please check your information and try again.
                  </p>
                </div>
              </div>
            </div>
          )}
        </fieldset>
      </form>

      {/* Skip Links for better navigation */}
      <div className="sr-only">
        <a href="#quote-form-title" className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-accent-blue text-white px-4 py-2 rounded">
          Skip to form top
        </a>
      </div>

      {/* Enhanced keyboard navigation instructions */}
      <div className="sr-only" role="region" aria-label="Form navigation instructions">
        <p>Use Tab to navigate between fields, Space to select checkboxes and radio buttons, Arrow keys for number inputs, and Enter to submit the form.</p>
        <p>Form validation will announce errors when you move between fields. All required fields are marked with an asterisk.</p>
      </div>

      {/* Live Region for Announcements */}
      <LiveRegion
        message={announcement}
        priority="polite"
        clearAfter={5000}
        onMessageCleared={() => setAnnouncement('')}
      />

      {/* Screen Reader Instructions */}
      <VisuallyHidden>
        <div role="region" aria-label="Form instructions">
          Quote request form: Fill out all required fields marked with an asterisk.
          Use Tab to navigate between fields, Space to select options, and Enter to submit.
          Form validation will announce any errors when you move between fields.
        </div>
      </VisuallyHidden>
    </div>
  );
}