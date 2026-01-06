import React from 'react';

interface WhyChooseSectionProps {
  locale: 'en' | 'es' | 'pt';
}

export const WhyChooseSection: React.FC<WhyChooseSectionProps> = ({ locale }) => {
  const content = {
    title: {
      es: '¿Por Qué Elegir Fly-Fleet?',
      pt: 'Por Que Escolher Fly-Fleet?',
      en: 'Why Choose Fly-Fleet?',
    },
    subtitle: {
      es: 'Somos tu socio estratégico en el aire',
      pt: 'Somos seu parceiro estratégico no ar',
      en: 'We are your strategic partner in the air',
    },
    features: [
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
        title: {
          es: 'Seguridad Certificada',
          pt: 'Segurança Certificada',
          en: 'Certified Safety',
        },
        description: {
          es: 'Operadores certificados FAA, EASA, ANAC con seguros integrales',
          pt: 'Operadores certificados FAA, EASA, ANAC com seguros integrais',
          en: 'FAA, EASA, ANAC certified operators with comprehensive insurance',
        },
      },
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        title: {
          es: 'Respuesta Rápida',
          pt: 'Resposta Rápida',
          en: 'Fast Response',
        },
        description: {
          es: 'Cotizaciones en minutos. Atención 24/7 en múltiples idiomas',
          pt: 'Cotações em minutos. Atendimento 24/7 em múltiplos idiomas',
          en: 'Quotes in minutes. 24/7 support in multiple languages',
        },
      },
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
        title: {
          es: 'Transparencia Total',
          pt: 'Transparência Total',
          en: 'Total Transparency',
        },
        description: {
          es: 'Precios claros sin tarifas ocultas. Información completa en cada paso',
          pt: 'Preços claros sem taxas ocultas. Informação completa em cada etapa',
          en: 'Clear pricing with no hidden fees. Complete information at every step',
        },
      },
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        ),
        title: {
          es: 'Red de Excelencia',
          pt: 'Rede de Excelência',
          en: 'Excellence Network',
        },
        description: {
          es: 'Operadores seleccionados por seguridad, servicio y trayectoria comprobada',
          pt: 'Operadores selecionados por segurança, serviço e trajetória comprovada',
          en: 'Operators selected for safety, service and proven track record',
        },
      },
    ],
  };

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/clouds.png)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
            {content.title[locale]}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {content.subtitle[locale]}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.features.map((feature, index) => (
            <div
              key={index}
              className="group text-center p-6 rounded-2xl bg-gradient-to-br from-navy-primary/5 to-transparent hover:from-navy-primary/10 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-navy-primary to-blue-600 rounded-2xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {feature.title[locale]}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description[locale]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
