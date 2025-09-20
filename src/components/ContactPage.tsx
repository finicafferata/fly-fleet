'use client';

import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { ContactForm } from './ContactForm';
import { WhatsAppWidget } from './WhatsAppWidget';

interface ContactPageProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onContactSuccess?: (data: any) => void;
  onContactError?: (error: string) => void;
}

interface BusinessHours {
  day: string;
  hours: string;
  timezone: string;
}

interface ContactMethod {
  type: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  description: string;
  availability: string;
}

export function ContactPage({
  locale = 'en',
  className,
  onContactSuccess,
  onContactError
}: ContactPageProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const getContent = (locale: string) => {
    const content = {
      en: {
        title: 'Contact Fly-Fleet',
        subtitle: 'Get in touch with our aviation experts for personalized service and immediate assistance',
        formSection: {
          title: 'Send Us a Message',
          subtitle: 'Fill out the form below and we\'ll get back to you within 2 hours during business hours'
        },
        contactInfo: {
          title: 'Contact Information',
          subtitle: 'Multiple ways to reach our team',
          methods: [
            {
              type: 'phone',
              label: 'Phone',
              value: '+54 9 11 6660-1927',
              href: 'tel:+5491166601927',
              description: 'Speak directly with our aviation specialists',
              availability: '24/7 Emergency Line',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )
            },
            {
              type: 'whatsapp',
              label: 'WhatsApp',
              value: '+54 9 11 6660-1927',
              href: 'https://wa.me/5491166601927',
              description: 'Instant messaging for quick questions and quotes',
              availability: 'Fastest Response Time',
              icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
              )
            },
            {
              type: 'email',
              label: 'Email',
              value: 'contact@fly-fleet.com',
              href: 'mailto:contact@fly-fleet.com',
              description: 'Send detailed inquiries and documentation',
              availability: 'Response within 2 hours',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              type: 'address',
              label: 'Office',
              value: 'Puerto Madero, Buenos Aires, Argentina',
              href: 'https://maps.google.com/?q=Puerto+Madero+Buenos+Aires+Argentina',
              description: 'Visit our offices by appointment',
              availability: 'Mon-Fri 9:00-18:00 ART',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            }
          ]
        },
        businessHours: {
          title: 'Business Hours',
          subtitle: 'We operate across multiple time zones to serve our international clients',
          timezone: 'Times shown in Argentina Time (ART)',
          currentTime: 'Current time in Buenos Aires',
          emergencyNote: 'Emergency charter services available 24/7',
          hours: [
            { day: 'Monday - Friday', hours: '9:00 AM - 6:00 PM', timezone: 'ART' },
            { day: 'Saturday', hours: '10:00 AM - 4:00 PM', timezone: 'ART' },
            { day: 'Sunday', hours: 'Emergency Only', timezone: 'ART' },
            { day: 'Emergency Line', hours: '24/7 Available', timezone: 'All Zones' }
          ]
        },
        mapSection: {
          title: 'Our Location',
          subtitle: 'Located in the heart of Buenos Aires\' business district',
          directions: 'Get Directions'
        },
        whatsappSection: {
          title: 'Instant Assistance',
          subtitle: 'Get immediate help through WhatsApp for urgent travel needs',
          ctaText: 'Start WhatsApp Conversation'
        }
      },
      es: {
        title: 'Contacta con Fly-Fleet',
        subtitle: 'Ponte en contacto con nuestros expertos en aviación para un servicio personalizado y asistencia inmediata',
        formSection: {
          title: 'Envíanos un Mensaje',
          subtitle: 'Completa el formulario y te responderemos en 2 horas durante horario comercial'
        },
        contactInfo: {
          title: 'Información de Contacto',
          subtitle: 'Múltiples formas de contactar a nuestro equipo',
          methods: [
            {
              type: 'phone',
              label: 'Teléfono',
              value: '+54 9 11 6660-1927',
              href: 'tel:+5491166601927',
              description: 'Habla directamente con nuestros especialistas en aviación',
              availability: 'Línea de Emergencia 24/7',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )
            },
            {
              type: 'whatsapp',
              label: 'WhatsApp',
              value: '+54 9 11 6660-1927',
              href: 'https://wa.me/5491166601927',
              description: 'Mensajería instantánea para preguntas rápidas y cotizaciones',
              availability: 'Tiempo de Respuesta Más Rápido',
              icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
              )
            },
            {
              type: 'email',
              label: 'Email',
              value: 'contact@fly-fleet.com',
              href: 'mailto:contact@fly-fleet.com',
              description: 'Envía consultas detalladas y documentación',
              availability: 'Respuesta en 2 horas',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              type: 'address',
              label: 'Oficina',
              value: 'Puerto Madero, Buenos Aires, Argentina',
              href: 'https://maps.google.com/?q=Puerto+Madero+Buenos+Aires+Argentina',
              description: 'Visita nuestras oficinas con cita previa',
              availability: 'Lun-Vie 9:00-18:00 ART',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            }
          ]
        },
        businessHours: {
          title: 'Horarios de Atención',
          subtitle: 'Operamos en múltiples zonas horarias para servir a nuestros clientes internacionales',
          timezone: 'Horarios mostrados en Hora Argentina (ART)',
          currentTime: 'Hora actual en Buenos Aires',
          emergencyNote: 'Servicios de charter de emergencia disponibles 24/7',
          hours: [
            { day: 'Lunes - Viernes', hours: '9:00 - 18:00', timezone: 'ART' },
            { day: 'Sábado', hours: '10:00 - 16:00', timezone: 'ART' },
            { day: 'Domingo', hours: 'Solo Emergencias', timezone: 'ART' },
            { day: 'Línea de Emergencia', hours: '24/7 Disponible', timezone: 'Todas las Zonas' }
          ]
        },
        mapSection: {
          title: 'Nuestra Ubicación',
          subtitle: 'Ubicados en el corazón del distrito comercial de Buenos Aires',
          directions: 'Cómo Llegar'
        },
        whatsappSection: {
          title: 'Asistencia Instantánea',
          subtitle: 'Obtén ayuda inmediata a través de WhatsApp para necesidades urgentes de viaje',
          ctaText: 'Iniciar Conversación WhatsApp'
        }
      },
      pt: {
        title: 'Entre em Contato com a Fly-Fleet',
        subtitle: 'Entre em contato com nossos especialistas em aviação para serviço personalizado e assistência imediata',
        formSection: {
          title: 'Envie uma Mensagem',
          subtitle: 'Preencha o formulário abaixo e responderemos em 2 horas durante o horário comercial'
        },
        contactInfo: {
          title: 'Informações de Contato',
          subtitle: 'Múltiplas formas de entrar em contato com nossa equipe',
          methods: [
            {
              type: 'phone',
              label: 'Telefone',
              value: '+54 9 11 6660-1927',
              href: 'tel:+5491166601927',
              description: 'Fale diretamente com nossos especialistas em aviação',
              availability: 'Linha de Emergência 24/7',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              )
            },
            {
              type: 'whatsapp',
              label: 'WhatsApp',
              value: '+54 9 11 6660-1927',
              href: 'https://wa.me/5491166601927',
              description: 'Mensagens instantâneas para perguntas rápidas e cotações',
              availability: 'Tempo de Resposta Mais Rápido',
              icon: (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787" />
                </svg>
              )
            },
            {
              type: 'email',
              label: 'Email',
              value: 'contact@fly-fleet.com',
              href: 'mailto:contact@fly-fleet.com',
              description: 'Envie consultas detalhadas e documentação',
              availability: 'Resposta em 2 horas',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              type: 'address',
              label: 'Escritório',
              value: 'Puerto Madero, Buenos Aires, Argentina',
              href: 'https://maps.google.com/?q=Puerto+Madero+Buenos+Aires+Argentina',
              description: 'Visite nossos escritórios com agendamento',
              availability: 'Seg-Sex 9:00-18:00 ART',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )
            }
          ]
        },
        businessHours: {
          title: 'Horários de Atendimento',
          subtitle: 'Operamos em múltiplos fusos horários para atender nossos clientes internacionais',
          timezone: 'Horários mostrados em Hora da Argentina (ART)',
          currentTime: 'Hora atual em Buenos Aires',
          emergencyNote: 'Serviços de charter de emergência disponíveis 24/7',
          hours: [
            { day: 'Segunda - Sexta', hours: '9:00 - 18:00', timezone: 'ART' },
            { day: 'Sábado', hours: '10:00 - 16:00', timezone: 'ART' },
            { day: 'Domingo', hours: 'Apenas Emergências', timezone: 'ART' },
            { day: 'Linha de Emergência', hours: '24/7 Disponível', timezone: 'Todos os Fusos' }
          ]
        },
        mapSection: {
          title: 'Nossa Localização',
          subtitle: 'Localizado no coração do distrito comercial de Buenos Aires',
          directions: 'Como Chegar'
        },
        whatsappSection: {
          title: 'Assistência Instantânea',
          subtitle: 'Obtenha ajuda imediata através do WhatsApp para necessidades urgentes de viagem',
          ctaText: 'Iniciar Conversa WhatsApp'
        }
      }
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = getContent(locale);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(locale === 'en' ? 'en-US' : locale === 'es' ? 'es-AR' : 'pt-BR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: locale === 'en'
    });
  };

  return (
    <div className={clsx('contact-page', className)}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {content.title}
          </h1>
          <p className="text-xl text-neutral-light">
            {content.subtitle}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="bg-white rounded-lg shadow-large p-8">
              <h2 className="text-2xl font-bold text-navy-primary mb-4">
                {content.formSection.title}
              </h2>
              <p className="text-neutral-medium mb-8">
                {content.formSection.subtitle}
              </p>
              <ContactForm
                locale={locale}
                onSubmitSuccess={onContactSuccess}
                onSubmitError={onContactError}
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              {/* Contact Methods */}
              <div className="bg-white rounded-lg shadow-large p-8">
                <h2 className="text-2xl font-bold text-navy-primary mb-4">
                  {content.contactInfo.title}
                </h2>
                <p className="text-neutral-medium mb-8">
                  {content.contactInfo.subtitle}
                </p>
                <div className="space-y-6">
                  {content.contactInfo.methods.map((method, index) => (
                    <a
                      key={index}
                      href={method.href}
                      target={method.type === 'whatsapp' || method.type === 'address' ? '_blank' : undefined}
                      rel={method.type === 'whatsapp' || method.type === 'address' ? 'noopener noreferrer' : undefined}
                      className="flex items-start space-x-4 p-4 rounded-lg hover:bg-neutral-light transition-colors duration-200 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-accent-blue rounded-lg flex items-center justify-center text-white group-hover:bg-navy-primary transition-colors duration-200">
                        {method.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-navy-primary group-hover:text-accent-blue transition-colors duration-200">
                          {method.label}
                        </h3>
                        <div className="text-lg font-medium text-navy-primary mb-1">
                          {method.value}
                        </div>
                        <p className="text-neutral-medium text-sm mb-2">
                          {method.description}
                        </p>
                        <div className="text-xs text-accent-blue font-semibold">
                          {method.availability}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Business Hours */}
              <div className="bg-white rounded-lg shadow-large p-8">
                <h2 className="text-2xl font-bold text-navy-primary mb-4">
                  {content.businessHours.title}
                </h2>
                <p className="text-neutral-medium mb-6">
                  {content.businessHours.subtitle}
                </p>

                {/* Current Time */}
                <div className="bg-accent-blue/10 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-navy-primary font-semibold">
                      {content.businessHours.currentTime}:
                    </span>
                    <span className="text-accent-blue font-bold text-lg">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-medium mt-1">
                    {content.businessHours.timezone}
                  </div>
                </div>

                {/* Hours List */}
                <div className="space-y-3 mb-6">
                  {content.businessHours.hours.map((schedule, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-neutral-light last:border-b-0">
                      <span className="text-navy-primary font-medium">
                        {schedule.day}
                      </span>
                      <div className="text-right">
                        <div className="text-neutral-dark font-semibold">
                          {schedule.hours}
                        </div>
                        <div className="text-xs text-neutral-medium">
                          {schedule.timezone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-sm text-red-700">
                      <strong>Emergency Services:</strong> {content.businessHours.emergencyNote}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-8 lg:space-y-0 lg:space-x-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-4">
                {content.whatsappSection.title}
              </h2>
              <p className="text-lg text-green-100">
                {content.whatsappSection.subtitle}
              </p>
            </div>
            <div className="flex-shrink-0">
              <WhatsAppWidget
                variant="inline"
                locale={locale}
                className="bg-white text-green-600 hover:bg-green-50 border-2 border-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy-primary mb-4">
              {content.mapSection.title}
            </h2>
            <p className="text-lg text-neutral-medium">
              {content.mapSection.subtitle}
            </p>
          </div>

          {/* Google Maps Embed */}
          <div className="bg-neutral-light rounded-lg overflow-hidden shadow-large">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13135.234567890123!2d-58.3816!3d-34.6118!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccacf96a93a0d%3A0x1234567890abcdef!2sPuerto%20Madero%2C%20Buenos%20Aires%2C%20Argentina!5e0!3m2!1sen!2sus!4v1234567890123"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Fly-Fleet Office Location in Puerto Madero, Buenos Aires"
            />
          </div>

          <div className="text-center mt-8">
            <a
              href="https://maps.google.com/?q=Puerto+Madero+Buenos+Aires+Argentina"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {content.mapSection.directions}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}