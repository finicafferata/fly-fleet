'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContactForm } from '@/components/ContactForm';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Contact',
      subtitle: "Let's talk about your next flight",
      methods: {
        title: 'Contact Methods',
        whatsapp: {
          title: 'WhatsApp',
          description: 'Immediate response'
        },
        form: {
          title: 'Form',
          description: 'Detailed inquiry'
        }
      },
      formTitle: 'General Contact Form',
      helpText: 'For quote requests, please use our dedicated quote form for faster processing.'
    },
    es: {
      title: 'Contacto',
      subtitle: 'Hablemos de tu próximo vuelo',
      methods: {
        title: 'Métodos de Contacto',
        whatsapp: {
          title: 'WhatsApp',
          description: 'Respuesta inmediata'
        },
        form: {
          title: 'Formulario',
          description: 'Consulta detallada'
        }
      },
      formTitle: 'Formulario de Contacto General',
      helpText: 'Para solicitar cotizaciones, usá nuestro formulario dedicado para un procesamiento más rápido.'
    },
    pt: {
      title: 'Contato',
      subtitle: 'Vamos falar sobre seu próximo voo',
      methods: {
        title: 'Métodos de Contato',
        whatsapp: {
          title: 'WhatsApp',
          description: 'Resposta imediata'
        },
        form: {
          title: 'Formulário',
          description: 'Consulta detalhada'
        }
      },
      formTitle: 'Formulário de Contato Geral',
      helpText: 'Para solicitações de cotação, use nosso formulário dedicado para processamento mais rápido.'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function ContactPage() {
  const params = useParams();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white">
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {content.title}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 leading-relaxed">
              {content.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-navy-primary">
            {content.methods.title}
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
            {/* WhatsApp */}
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.methods.whatsapp.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.methods.whatsapp.description}
              </p>
              <WhatsAppWidget
                variant="inline"
                locale={locale}
                className="inline-flex justify-center"
              />
            </div>

            {/* Form */}
            <div className="bg-gray-50 p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                {content.methods.form.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {content.methods.form.description}
              </p>
              <button
                onClick={() => {
                  document.getElementById('contact-form')?.scrollIntoView({
                    behavior: 'smooth'
                  });
                }}
                className="inline-flex items-center justify-center bg-accent-blue hover:bg-accent-blue/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {locale === 'es' ? 'Ir al formulario' :
                 locale === 'pt' ? 'Ir ao formulário' :
                 'Go to form'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-navy-primary text-center">
              {content.formTitle}
            </h2>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                {content.helpText}{' '}
                <a
                  href={`/${locale}/quote`}
                  className="font-semibold text-accent-blue hover:underline"
                >
                  {locale === 'es' ? 'Formulario de Cotización' :
                   locale === 'pt' ? 'Formulário de Cotação' :
                   'Quote Form'}
                </a>
              </p>
            </div>

            <ContactForm
              locale={locale}
              onSubmitSuccess={() => {
                console.log('Contact form submitted successfully');
              }}
            />
          </div>
        </div>
      </section>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}