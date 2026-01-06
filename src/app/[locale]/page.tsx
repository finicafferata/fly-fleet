'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Navigation/Header';
import { Hero } from '@/components/Hero';
import { ServicesGrid } from '@/components/ServicesGrid';
import { ProcessSteps } from '@/components/ProcessSteps';
import { Footer } from '@/components/Footer';
import { QuoteForm } from '@/components/QuoteForm';
import { ContactForm } from '@/components/ContactForm';
import { FAQComponent } from '@/components/FAQComponent';
import { TestimonialsComponent } from '@/components/TestimonialsComponent';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';
import { FleetSection } from '@/components/FleetSection';
import { DestinationsCarousel } from '@/components/DestinationsCarousel';
import { AdditionalServicesCarousel } from '@/components/AdditionalServicesCarousel';
import { WhyChooseSection } from '@/components/WhyChooseSection';
import { UseCasesSection } from '@/components/UseCasesSection';
import { Modal } from '@/components/ui/Modal';
import { useParams, useRouter } from 'next/navigation';

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      {/* Navigation */}
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-14">
        {/* Hero Section */}
        <Hero
          locale={locale}
          onQuoteRequest={() => setShowQuoteForm(true)}
        />

        {/* Services Section */}
        <ServicesGrid locale={locale} />

      {/* Process Steps Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ProcessSteps locale={locale} />
        </div>
      </section>

      {/* Why Choose Fly-Fleet Section */}
      <WhyChooseSection locale={locale} />

      {/* Additional Services Section */}
      <AdditionalServicesCarousel locale={locale} />

      {/* Fleet Section with Videos */}
      <FleetSection locale={locale} />

      {/* Destinations Section */}
      <DestinationsCarousel locale={locale} />

      {/* Use Cases Section */}
      <UseCasesSection locale={locale} />

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <TestimonialsComponent locale={locale} />
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FAQComponent locale={locale} />
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />

      {/* WhatsApp Widget */}
      <WhatsAppWidget locale={locale} />

      {/* Quote Form Modal */}
      <Modal
        isOpen={showQuoteForm}
        onClose={() => setShowQuoteForm(false)}
        title={
          locale === 'es' ? 'Solicitar Cotización' :
          locale === 'pt' ? 'Solicitar Cotação' :
          'Request Quote'
        }
        size="lg"
      >
        <QuoteForm
          locale={locale}
          onSubmitSuccess={() => setShowQuoteForm(false)}
        />
      </Modal>

      {/* Contact Form Modal */}
      <Modal
        isOpen={showContactForm}
        onClose={() => setShowContactForm(false)}
        title={
          locale === 'es' ? 'Contacto' :
          locale === 'pt' ? 'Contato' :
          'Contact'
        }
        size="md"
      >
        <ContactForm
          locale={locale}
          onSubmitSuccess={() => setShowContactForm(false)}
        />
      </Modal>
      </main>
    </div>
  );
}