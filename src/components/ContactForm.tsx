'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { clsx } from 'clsx';
import { FormField } from './ui/FormField';
import { FocusRing } from './ui/FocusRing';
import { LiveRegion } from './ui/LiveRegion';
import { VisuallyHidden } from './ui/VisuallyHidden';
import { useAnnouncer } from '../hooks/useAnnouncer';
import { useFocusManagement } from '../hooks/useFocusManagement';

const contactFormSchema = z.object({
  inquiryType: z.enum(['general', 'quote', 'support', 'partnership', 'media']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  preferredContact: z.enum(['email', 'phone', 'either']),
  urgency: z.enum(['low', 'medium', 'high']),
  recaptchaToken: z.string().min(1, 'Please complete the verification')
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onSubmitSuccess?: (data: any) => void;
  onSubmitError?: (error: string) => void;
}

const inquiryTypeOptions = [
  { value: 'general', label: 'General Inquiry', description: 'General questions about our services' },
  { value: 'quote', label: 'Quote Request', description: 'Request a flight quote' },
  { value: 'support', label: 'Customer Support', description: 'Existing booking support' },
  { value: 'partnership', label: 'Partnership', description: 'Business partnership opportunities' },
  { value: 'media', label: 'Media & Press', description: 'Media inquiries and press requests' }
];

const urgencyOptions = [
  { value: 'low', label: 'Low', description: 'Response within 48-72 hours' },
  { value: 'medium', label: 'Medium', description: 'Response within 24 hours' },
  { value: 'high', label: 'High', description: 'Response within 4-6 hours' }
];

const contactMethodOptions = [
  { value: 'email', label: 'Email', description: 'Prefer email communication' },
  { value: 'phone', label: 'Phone', description: 'Prefer phone communication' },
  { value: 'either', label: 'Either', description: 'Either email or phone is fine' }
];

export function ContactForm({
  locale = 'en',
  className = '',
  onSubmitSuccess,
  onSubmitError
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [announcement, setAnnouncement] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState('');

  const { announce, announceAssertive } = useAnnouncer();
  const { focusElement } = useFocusManagement();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    defaultValues: {
      inquiryType: 'general',
      preferredContact: 'either',
      urgency: 'medium'
    }
  });

  const inquiryType = watch('inquiryType');
  const urgency = watch('urgency');
  const preferredContact = watch('preferredContact');

  const onSubmit = useCallback(async (data: ContactFormData) => {
    if (!recaptchaToken) {
      announceAssertive('Please complete the verification before submitting');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setAnnouncement('Submitting contact form...');

    try {
      const response = await fetch('/api/contact', {
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
      setAnnouncement(result.accessibility?.ariaLiveMessage || 'Message sent successfully');

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
      console.error('Contact submission error:', error);
      setSubmitStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      setAnnouncement(`Error: ${errorMessage}`);
      announceAssertive(errorMessage);
      onSubmitError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [recaptchaToken, locale, reset, announce, announceAssertive, focusElement, onSubmitSuccess, onSubmitError]);

  return (
    <div className={clsx('max-w-2xl mx-auto', className)}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <fieldset disabled={isSubmitting} className="space-y-6">
          <legend className="sr-only">Contact Form</legend>

          {/* Inquiry Type Selection */}
          <FormField
            label="Type of Inquiry"
            required
            error={errors.inquiryType?.message}
            description="Select the category that best describes your inquiry"
          >
            <div
              role="radiogroup"
              aria-labelledby="inquiry-type-label"
              aria-describedby="inquiry-type-description"
              className="space-y-3"
            >
              {inquiryTypeOptions.map((option) => (
                <FocusRing key={option.value}>
                  <label
                    className={clsx(
                      'relative flex items-start p-4 border rounded-lg cursor-pointer transition-all',
                      'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                      inquiryType === option.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    )}
                  >
                    <input
                      {...register('inquiryType')}
                      type="radio"
                      value={option.value}
                      className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      aria-describedby={`${option.value}-description`}
                    />
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </span>
                      <p
                        id={`${option.value}-description`}
                        className="text-sm text-gray-600 dark:text-gray-400 mt-1"
                      >
                        {option.description}
                      </p>
                    </div>
                  </label>
                </FocusRing>
              ))}
            </div>
          </FormField>

          {/* Personal Information */}
          <fieldset className="space-y-6">
            <legend className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Contact Information
            </legend>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="First Name"
                required
                error={errors.firstName?.message}
              >
                <input
                  {...register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  placeholder="Enter your first name"
                />
              </FormField>

              <FormField
                label="Last Name"
                required
                error={errors.lastName?.message}
              >
                <input
                  {...register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  placeholder="Enter your last name"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Email Address"
                required
                error={errors.email?.message}
              >
                <input
                  {...register('email')}
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                />
              </FormField>

              <FormField
                label="Phone Number"
                error={errors.phone?.message}
                description="Optional - include if you prefer phone contact"
              >
                <input
                  {...register('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="Enter your phone number"
                />
              </FormField>
            </div>

            <FormField
              label="Company"
              error={errors.company?.message}
              description="Optional - if contacting on behalf of a company"
            >
              <input
                {...register('company')}
                type="text"
                autoComplete="organization"
                placeholder="Enter your company name"
              />
            </FormField>
          </fieldset>

          {/* Message Details */}
          <fieldset className="space-y-6">
            <legend className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Message Details
            </legend>

            <FormField
              label="Subject"
              required
              error={errors.subject?.message}
            >
              <input
                {...register('subject')}
                type="text"
                placeholder="Brief subject line for your inquiry"
              />
            </FormField>

            <FormField
              label="Message"
              required
              error={errors.message?.message}
              description="Please provide details about your inquiry (minimum 10 characters)"
            >
              <textarea
                {...register('message')}
                rows={6}
                placeholder="Please provide details about your inquiry, requirements, or questions..."
                className="resize-vertical"
              />
            </FormField>
          </fieldset>

          {/* Communication Preferences */}
          <fieldset className="space-y-6">
            <legend className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Communication Preferences
            </legend>

            <FormField
              label="Preferred Contact Method"
              required
              error={errors.preferredContact?.message}
            >
              <div
                role="radiogroup"
                aria-labelledby="contact-method-label"
                className="flex flex-wrap gap-4"
              >
                {contactMethodOptions.map((option) => (
                  <FocusRing key={option.value}>
                    <label
                      className={clsx(
                        'flex items-center p-3 border rounded-lg cursor-pointer transition-all',
                        'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                        preferredContact === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      <input
                        {...register('preferredContact')}
                        type="radio"
                        value={option.value}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        aria-describedby={`contact-${option.value}-description`}
                      />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {option.label}
                        </span>
                        <p
                          id={`contact-${option.value}-description`}
                          className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                        >
                          {option.description}
                        </p>
                      </div>
                    </label>
                  </FocusRing>
                ))}
              </div>
            </FormField>

            <FormField
              label="Urgency Level"
              required
              error={errors.urgency?.message}
              description="Help us prioritize your request"
            >
              <div
                role="radiogroup"
                aria-labelledby="urgency-label"
                className="flex flex-wrap gap-4"
              >
                {urgencyOptions.map((option) => (
                  <FocusRing key={option.value}>
                    <label
                      className={clsx(
                        'flex items-center p-3 border rounded-lg cursor-pointer transition-all',
                        'hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                        urgency === option.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      )}
                    >
                      <input
                        {...register('urgency')}
                        type="radio"
                        value={option.value}
                        className="mr-3 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        aria-describedby={`urgency-${option.value}-description`}
                      />
                      <div>
                        <span
                          className={clsx(
                            'font-medium',
                            option.value === 'high' && 'text-red-600 dark:text-red-400',
                            option.value === 'medium' && 'text-yellow-600 dark:text-yellow-400',
                            option.value === 'low' && 'text-green-600 dark:text-green-400'
                          )}
                        >
                          {option.label}
                        </span>
                        <p
                          id={`urgency-${option.value}-description`}
                          className="text-xs text-gray-600 dark:text-gray-400 mt-1"
                        >
                          {option.description}
                        </p>
                      </div>
                    </label>
                  </FocusRing>
                ))}
              </div>
            </FormField>
          </fieldset>

          {/* reCAPTCHA Placeholder */}
          <FormField
            label="Verification"
            required
            error={errors.recaptchaToken?.message}
            description="Please complete the verification to submit your message"
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
            <FocusRing>
              <button
                type="submit"
                disabled={isSubmitting || !isValid || !recaptchaToken}
                className={clsx(
                  'w-full py-3 px-6 rounded-lg font-medium transition-all',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  isSubmitting || !isValid || !recaptchaToken
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                )}
                aria-describedby="submit-status"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    <span>Sending Message...</span>
                  </span>
                ) : (
                  'Send Message'
                )}
              </button>
            </FocusRing>
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
                    Message Sent Successfully
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mt-1">
                    Thank you for contacting us. We&apos;ll respond according to your urgency level.
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
                    Failed to Send Message
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
          Contact form: Fill out all required fields marked with an asterisk.
          Use Tab to navigate between fields, arrow keys for radio buttons, and Enter to submit.
          Form validation will announce any errors when you move between fields.
          Your urgency selection determines our response time commitment.
        </div>
      </VisuallyHidden>
    </div>
  );
}