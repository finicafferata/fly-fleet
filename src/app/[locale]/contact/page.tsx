'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation/Header';
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
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/contact`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-20">
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

      {/* Contact Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm
            locale={locale}
            onSubmitSuccess={() => {
              console.log('Contact form submitted successfully');
            }}
          />
        </div>
      </section>
      </main>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}