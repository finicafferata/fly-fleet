'use client';

import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { ServicesGrid } from '@/components/ServicesGrid';
import { ProcessSteps } from '@/components/ProcessSteps';
import { Footer } from '@/components/Footer';
import { QuoteForm } from '@/components/QuoteForm';
import { ContactForm } from '@/components/ContactForm';
import { FAQComponent } from '@/components/FAQComponent';
import { TestimonialsComponent } from '@/components/TestimonialsComponent';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';
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
      <Navigation
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-20">
        {/* Hero Section */}
        <Hero
          locale={locale}
          onQuoteRequest={() => setShowQuoteForm(true)}
        />

      {/* Process Steps Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
          <ProcessSteps locale={locale} />
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-20 bg-white relative">
        <div className="max-w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
              {locale === 'es' ? 'Servicios Adicionales' :
               locale === 'pt' ? 'Serviços Adicionais' :
               'Additional Services'}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {locale === 'es' ? 'Servicios complementarios para hacer de tu viaje una experiencia excepcional y sin complicaciones.' :
               locale === 'pt' ? 'Serviços complementares para tornar sua viagem uma experiência excepcional e sem complicações.' :
               'Complementary services to make your journey an exceptional and hassle-free experience.'}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {(locale === 'es' ? [
              { icon: '🌍', title: 'Apoyo internacional', desc: 'Asistencia global completa' },
              { icon: '📋', title: 'Documentación por país', desc: 'Trámites y permisos' },
              { icon: '🐕', title: 'Transporte pet-friendly', desc: 'Viaja con tu mascota' },
              { icon: '🚗', title: 'Transfer/chofer', desc: 'Traslados terrestres' },
              { icon: '🍽️', title: 'Catering premium', desc: 'Gastronomía de lujo' },
              { icon: '✈️', title: 'Sala VIP/FBO', desc: 'Lounges exclusivos' },
              { icon: '🛂', title: 'Migraciones/aduana', desc: 'Asistencia en aeropuertos' },
              { icon: '🛡️', title: 'Seguro de viaje', desc: 'Cobertura completa' },
              { icon: '🏥', title: 'Medevac', desc: 'Evacuación médica' },
              { icon: '🔒', title: 'Seguridad', desc: 'Protección personalizada' },
              { icon: '📦', title: 'Equipaje voluminoso', desc: 'Carga especializada' }
            ] : locale === 'pt' ? [
              { icon: '🌍', title: 'Handling internacional', desc: 'Assistência global completa' },
              { icon: '📋', title: 'Documentação de entrada', desc: 'Trâmites e permissões' },
              { icon: '🐕', title: 'Pet-friendly', desc: 'Viaje com seu animal' },
              { icon: '🚗', title: 'Transfer/motorista', desc: 'Traslados terrestres' },
              { icon: '🍽️', title: 'Catering premium', desc: 'Gastronomia de luxo' },
              { icon: '✈️', title: 'Sala VIP/FBO', desc: 'Lounges exclusivos' },
              { icon: '🛂', title: 'Imigração/alfândega', desc: 'Assistência em aeroportos' },
              { icon: '🛡️', title: 'Seguro viagem', desc: 'Cobertura completa' },
              { icon: '🏥', title: 'Medevac', desc: 'Evacuação médica' },
              { icon: '🔒', title: 'Segurança', desc: 'Proteção personalizada' },
              { icon: '📦', title: 'Bagagem volumosa', desc: 'Carga especializada' }
            ] : [
              { icon: '🌍', title: 'International handling', desc: 'Complete global assistance' },
              { icon: '📋', title: 'Country documentation', desc: 'Permits and procedures' },
              { icon: '🐕', title: 'Pet-friendly transport', desc: 'Travel with your pet' },
              { icon: '🚗', title: 'Ground transfer', desc: 'Land transportation' },
              { icon: '🍽️', title: 'Premium catering', desc: 'Luxury gastronomy' },
              { icon: '✈️', title: 'VIP lounge/FBO', desc: 'Exclusive lounges' },
              { icon: '🛂', title: 'Immigration/customs', desc: 'Airport assistance' },
              { icon: '🛡️', title: 'Travel insurance', desc: 'Complete coverage' },
              { icon: '🏥', title: 'Medevac', desc: 'Medical evacuation' },
              { icon: '🔒', title: 'Security', desc: 'Personal protection' },
              { icon: '📦', title: 'Oversized baggage', desc: 'Specialized cargo' }
            ]).map((service, index) => (
              <div key={index} className="group bg-white border border-gray-100 rounded-xl p-6 hover:border-accent-blue hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="font-semibold text-navy-primary mb-2 text-sm leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    {service.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <p className="text-gray-600 mb-6">
              {locale === 'es' ? '¿Necesitas algún servicio específico?' :
               locale === 'pt' ? 'Precisa de algum serviço específico?' :
               'Need a specific service?'}
            </p>
            <button
              onClick={() => setShowQuoteForm(true)}
              className="inline-flex items-center px-8 py-3 bg-accent-blue hover:bg-accent-blue/90 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              {locale === 'es' ? 'Solicitar Cotización' :
               locale === 'pt' ? 'Solicitar Cotação' :
               'Request Quote'}
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <TestimonialsComponent locale={locale} />
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
          <FAQComponent locale={locale} />
        </div>
      </section>

      {/* Contact CTA Banner */}
      <section className="bg-accent-blue py-20">
        <div className="flex items-center justify-center px-4">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">
              {locale === 'es' ? '¿Aún tienes preguntas?' :
               locale === 'pt' ? 'Ainda tem dúvidas?' :
               'Still have questions?'}
            </h3>
            <p className="text-white/90 mb-6 max-w-lg mx-auto">
              {locale === 'es' ? 'Nuestro equipo está aquí para ayudarte con cualquier consulta específica' :
               locale === 'pt' ? 'Nossa equipe está aqui para ajudar com qualquer pergunta específica' :
               'Our team is here to help with any specific inquiries'}
            </p>
            <button
              onClick={() => setShowContactForm(true)}
              className="bg-white text-accent-blue hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              {locale === 'es' ? 'Contáctanos' :
               locale === 'pt' ? 'Entre em Contato' :
               'Contact Us'}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer locale={locale} />

      {/* WhatsApp Widget */}
      <WhatsAppWidget locale={locale} />

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowQuoteForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">
                    {locale === 'es' ? 'Solicitar Cotización' :
                     locale === 'pt' ? 'Solicitar Cotação' :
                     'Request Quote'}
                  </h3>
                  <button
                    onClick={() => setShowQuoteForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <QuoteForm
                  locale={locale}
                  onSubmitSuccess={() => {
                    setShowQuoteForm(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowContactForm(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">
                    {locale === 'es' ? 'Contacto' :
                     locale === 'pt' ? 'Contato' :
                     'Contact'}
                  </h3>
                  <button
                    onClick={() => setShowContactForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <ContactForm
                  locale={locale}
                  onSubmitSuccess={() => {
                    setShowContactForm(false);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}