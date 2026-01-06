'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation/Header';
import { Footer } from '@/components/Footer';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Terms of Service',
      role: {
        title: 'Fly-Fleet Role',
        text: 'Fly-Fleet acts as an intermediary (brokerage) for air charter services. We are not air operators nor aircraft owners.'
      },
      responsibilities: {
        title: 'Responsibilities and Limitations',
        items: [
          'Services are subject to weather conditions and operational requirements of the selected operator',
          'Fly-Fleet has liability limits as a service broker',
          'Final flight conditions are determined by the certified operator'
        ]
      },
      payments: {
        title: 'Payments and Cancellations',
        items: [
          'Refund policies vary according to operator and service type',
          'Rescheduling is subject to availability and operator policies',
          'No-show cases may generate penalties according to operator terms'
        ]
      },
      privacy: {
        title: 'Personal Data Processing',
        items: [
          'Purpose: Data is used exclusively for quotation and service contracting',
          'Retention: Data is kept according to legal and commercial requirements',
          'Rights: Users have the right to access, rectify and delete their data',
          'Cookies: The site uses technical and analytical cookies to improve experience'
        ]
      },
      contact: 'For legal inquiries: legal@fly-fleet.com'
    },
    es: {
      title: 'Términos de Servicio',
      role: {
        title: 'Rol de Fly-Fleet',
        text: 'Fly-Fleet actúa como intermediario (brokerage) para servicios de charter aéreo. No somos operadores aéreos ni propietarios de aeronaves.'
      },
      responsibilities: {
        title: 'Responsabilidades y Limitaciones',
        items: [
          'Los servicios están sujetos a condiciones climáticas y operativas del operador seleccionado',
          'Fly-Fleet tiene límites de responsabilidad como broker de servicios',
          'Las condiciones finales de vuelo están determinadas por el operador certificado'
        ]
      },
      payments: {
        title: 'Pagos y Cancelaciones',
        items: [
          'Las políticas de reembolso varían según el operador y tipo de servicio',
          'Las reprogramaciones están sujetas a disponibilidad y políticas del operador',
          'Los casos de no-show pueden generar penalidades según términos del operador'
        ]
      },
      privacy: {
        title: 'Tratamiento de Datos Personales',
        items: [
          'Finalidad: Los datos se utilizan exclusivamente para presupuestación y contratación de servicios',
          'Conservación: Los datos se conservan según requerimientos legales y comerciales',
          'Derechos: Los usuarios tienen derecho a acceder, rectificar y eliminar sus datos',
          'Cookies: El sitio utiliza cookies técnicas y analíticas para mejorar la experiencia'
        ]
      },
      contact: 'Para consultas legales: legal@fly-fleet.com'
    },
    pt: {
      title: 'Termos de Serviço',
      role: {
        title: 'Papel da Fly-Fleet',
        text: 'A Fly-Fleet atua como intermediária (brokerage) para serviços de charter aéreo. Não somos operadores aéreos nem proprietários de aeronaves.'
      },
      responsibilities: {
        title: 'Responsabilidades e Limitações',
        items: [
          'Os serviços estão sujeitos às condições climáticas e operacionais do operador selecionado',
          'A Fly-Fleet tem limites de responsabilidade como broker de serviços',
          'As condições finais de voo são determinadas pelo operador certificado'
        ]
      },
      payments: {
        title: 'Pagamentos e Cancelamentos',
        items: [
          'As políticas de reembolso variam de acordo com o operador e tipo de serviço',
          'Reagendamentos estão sujeitos à disponibilidade e políticas do operador',
          'Casos de no-show podem gerar penalidades conforme termos do operador'
        ]
      },
      privacy: {
        title: 'Tratamento de Dados Pessoais',
        items: [
          'Finalidade: Os dados são utilizados exclusivamente para cotação e contratação de serviços',
          'Retenção: Os dados são mantidos conforme requisitos legais e comerciais',
          'Direitos: Os usuários têm direito de acessar, retificar e excluir seus dados',
          'Cookies: O site utiliza cookies técnicos e analíticos para melhorar a experiência'
        ]
      },
      contact: 'Para consultas legais: legal@fly-fleet.com'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function LegalPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/legal`);
        }}
      />

      {/* Main Content - Account for fixed header */}
      <main className="pt-14">
        {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {content.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Legal Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            {/* Role Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-navy-primary">
                {content.role.title}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {content.role.text}
              </p>
            </div>

            {/* Responsibilities Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-navy-primary">
                {content.responsibilities.title}
              </h2>
              <ul className="space-y-3">
                {content.responsibilities.items.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-navy-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payments Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-navy-primary">
                {content.payments.title}
              </h2>
              <ul className="space-y-3">
                {content.payments.items.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-navy-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Privacy Section */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-navy-primary">
                {content.privacy.title}
              </h2>
              <ul className="space-y-3">
                {content.privacy.items.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-navy-primary rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-600 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-600 text-center">
                {content.contact}
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer locale={locale} />
    </div>
  );
}