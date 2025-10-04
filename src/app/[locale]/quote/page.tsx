'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { QuoteForm } from '@/components/QuoteForm';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Get your next flight quote',
      subtitle: 'Complete the form and receive verified options in minutes.',
      formTitle: 'Quote Request Form',
      helpText: 'Need help? Contact us via WhatsApp for immediate assistance.',
    },
    es: {
      title: 'Cotizá tu próximo vuelo',
      subtitle: 'Completá el formulario y recibí opciones verificadas en minutos.',
      formTitle: 'Formulario de Cotización',
      helpText: '¿Necesitás ayuda? Contactanos por WhatsApp para asistencia inmediata.',
    },
    pt: {
      title: 'Solicite sua cotação',
      subtitle: 'Complete o formulário e receba opções verificadas em minutos.',
      formTitle: 'Formulário de Cotação',
      helpText: 'Precisa de ajuda? Entre em contato via WhatsApp para assistência imediata.',
    },
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function QuotePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Navigation
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/quote`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {content.title}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
            {content.subtitle}
          </p>
        </div>
      </section>

      {/* Quote Form Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navy-primary text-center">
              {content.formTitle}
            </h2>

            <QuoteForm
              locale={locale}
              onSubmitSuccess={() => {
                // Handle success - could redirect or show success message
                console.log('Quote submitted successfully');
              }}
            />
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 mb-6">
            {content.helpText}
          </p>
          <WhatsAppWidget
            variant="inline"
            locale={locale}
            className="inline-flex justify-center"
          />
        </div>
      </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}