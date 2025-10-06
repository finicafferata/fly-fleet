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

      {/* Why Choose Fly-Fleet Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <svg width="100%" height="100%">
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
              {locale === 'es' ? '¿Por Qué Elegir Fly-Fleet?' :
               locale === 'pt' ? 'Por Que Escolher Fly-Fleet?' :
               'Why Choose Fly-Fleet?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'es' ? 'Somos más que un broker: somos tu socio estratégico en el aire' :
               locale === 'pt' ? 'Somos mais que um corretor: somos seu parceiro estratégico no ar' :
               'We are more than a broker: we are your strategic partner in the air'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-accent-blue/5 to-transparent hover:from-accent-blue/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Seguridad Certificada' :
                 locale === 'pt' ? 'Segurança Certificada' :
                 'Certified Safety'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {locale === 'es' ? 'Operadores certificados FAA, EASA, ANAC con seguros integrales' :
                 locale === 'pt' ? 'Operadores certificados FAA, EASA, ANAC com seguros integrais' :
                 'FAA, EASA, ANAC certified operators with comprehensive insurance'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-accent-blue/5 to-transparent hover:from-accent-blue/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Respuesta Rápida' :
                 locale === 'pt' ? 'Resposta Rápida' :
                 'Fast Response'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {locale === 'es' ? 'Cotizaciones en minutos, no días. Atención 24/7 en múltiples idiomas' :
                 locale === 'pt' ? 'Cotações em minutos, não dias. Atendimento 24/7 em múltiplos idiomas' :
                 'Quotes in minutes, not days. 24/7 support in multiple languages'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-accent-blue/5 to-transparent hover:from-accent-blue/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Transparencia Total' :
                 locale === 'pt' ? 'Transparência Total' :
                 'Total Transparency'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {locale === 'es' ? 'Precios claros sin tarifas ocultas. Información completa en cada paso' :
                 locale === 'pt' ? 'Preços claros sem taxas ocultas. Informação completa em cada etapa' :
                 'Clear pricing with no hidden fees. Complete information at every step'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-accent-blue/5 to-transparent hover:from-accent-blue/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Red de Excelencia' :
                 locale === 'pt' ? 'Rede de Excelência' :
                 'Excellence Network'}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {locale === 'es' ? 'Operadores seleccionados por seguridad, servicio y trayectoria comprobada' :
                 locale === 'pt' ? 'Operadores selecionados por segurança, serviço e trajetória comprovada' :
                 'Operators selected for safety, service and proven track record'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Divider - Wave */}
      <div className="relative h-24 bg-white">
        <svg className="absolute bottom-0 w-full h-24" viewBox="0 0 1440 120" fill="none" preserveAspectRatio="none">
          <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB"/>
        </svg>
      </div>

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
              { icon: '✈️', title: 'Sala VIP o FBO', desc: 'Lounges exclusivos' },
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
              { icon: '✈️', title: 'Sala VIP ou FBO', desc: 'Lounges exclusivos' },
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

      {/* Featured Aircraft Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
              {locale === 'es' ? 'Nuestra Flota' :
               locale === 'pt' ? 'Nossa Frota' :
               'Our Fleet'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'es' ? 'Aeronaves de última generación para cada necesidad' :
               locale === 'pt' ? 'Aeronaves de última geração para cada necessidade' :
               'State-of-the-art aircraft for every need'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Light Jets */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="relative h-64 bg-gradient-to-br from-accent-blue/20 to-blue-600/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/40 to-blue-600/60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {locale === 'es' ? 'Jets Ligeros' :
                     locale === 'pt' ? 'Jets Leves' :
                     'Light Jets'}
                  </h3>
                  <p className="text-sm text-white/90">Learjet 45, Citation CJ2</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>
                      {locale === 'es' ? 'Hasta 6 pasajeros' :
                       locale === 'pt' ? 'Até 6 passageiros' :
                       'Up to 6 passengers'}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span>
                      {locale === 'es' ? 'Vuelos cortos y medianos' :
                       locale === 'pt' ? 'Voos curtos e médios' :
                       'Short and medium flights'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mid Jets */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="relative h-64 bg-gradient-to-br from-blue-600/20 to-accent-blue/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-accent-blue/60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {locale === 'es' ? 'Jets Medianos' :
                     locale === 'pt' ? 'Jets Médios' :
                     'Midsize Jets'}
                  </h3>
                  <p className="text-sm text-white/90">Hawker 800, Learjet 60</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>6–8 {locale === 'es' ? 'pasajeros' : locale === 'pt' ? 'passageiros' : 'passengers'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span>
                      {locale === 'es' ? 'Confort ejecutivo' :
                       locale === 'pt' ? 'Conforto executivo' :
                       'Executive comfort'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Heavy Jets */}
            <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500">
              <div className="relative h-64 bg-gradient-to-br from-navy-primary/20 to-accent-blue/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-navy-primary/40 to-accent-blue/60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">
                    {locale === 'es' ? 'Jets Pesados' :
                     locale === 'pt' ? 'Jets Pesados' :
                     'Heavy Jets'}
                  </h3>
                  <p className="text-sm text-white/90">Challenger 605, Gulfstream G450</p>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>10–14 {locale === 'es' ? 'pasajeros' : locale === 'pt' ? 'passageiros' : 'passengers'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-3 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span>
                      {locale === 'es' ? 'Vuelos largos' :
                       locale === 'pt' ? 'Voos longos' :
                       'Long flights'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a
              href={`/${locale}/fleet-destinations`}
              className="inline-flex items-center px-8 py-4 bg-navy-primary hover:bg-navy-primary/90 text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:scale-105"
            >
              {locale === 'es' ? 'Ver Toda la Flota' :
               locale === 'pt' ? 'Ver Toda a Frota' :
               'View Full Fleet'}
              <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
              {locale === 'es' ? 'Soluciones Para Cada Necesidad' :
               locale === 'pt' ? 'Soluções Para Cada Necessidade' :
               'Solutions For Every Need'}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Business */}
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Ejecutivo' :
                 locale === 'pt' ? 'Executivo' :
                 'Business'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'es' ? 'Optimizá tu tiempo con vuelos directos y horarios flexibles' :
                 locale === 'pt' ? 'Otimize seu tempo com voos diretos e horários flexíveis' :
                 'Optimize your time with direct flights and flexible schedules'}
              </p>
            </div>

            {/* Leisure */}
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Ocio & Turismo' :
                 locale === 'pt' ? 'Lazer & Turismo' :
                 'Leisure & Tourism'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'es' ? 'Viajes personalizados con máxima comodidad y privacidad' :
                 locale === 'pt' ? 'Viagens personalizadas com máximo conforto e privacidade' :
                 'Personalized travel with maximum comfort and privacy'}
              </p>
            </div>

            {/* Medical */}
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Médico' :
                 locale === 'pt' ? 'Médico' :
                 'Medical'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'es' ? 'Evacuaciones médicas con equipamiento especializado 24/7' :
                 locale === 'pt' ? 'Evacuações médicas com equipamento especializado 24/7' :
                 'Medical evacuations with specialized equipment 24/7'}
              </p>
            </div>

            {/* Cargo */}
            <div className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-accent-blue to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {locale === 'es' ? 'Carga' :
                 locale === 'pt' ? 'Carga' :
                 'Cargo'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'es' ? 'Transporte seguro de carga especializada y equipos de alto valor' :
                 locale === 'pt' ? 'Transporte seguro de carga especializada e equipamentos de alto valor' :
                 'Secure transport of specialized cargo and high-value equipment'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <TestimonialsComponent locale={locale} />
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-full xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
          <FAQComponent locale={locale} />
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