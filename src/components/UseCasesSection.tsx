import React from 'react';

interface UseCasesSectionProps {
  locale: 'en' | 'es' | 'pt';
}

export const UseCasesSection: React.FC<UseCasesSectionProps> = ({ locale }) => {
  const content = {
    title: {
      es: 'Soluciones para cada necesidad',
      pt: 'Soluções Para Cada Necessidade',
      en: 'Solutions For Every Need',
    },
    useCases: [
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        title: {
          es: 'Ejecutivo',
          pt: 'Executivo',
          en: 'Business',
        },
        description: {
          es: 'Optimizá tu tiempo con vuelos directos y horarios flexibles',
          pt: 'Otimize seu tempo com voos diretos e horários flexíveis',
          en: 'Optimize your time with direct flights and flexible schedules',
        },
      },
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
        title: {
          es: 'Ocio & Turismo',
          pt: 'Lazer & Turismo',
          en: 'Leisure & Tourism',
        },
        description: {
          es: 'Viajes personalizados con máxima comodidad y privacidad',
          pt: 'Viagens personalizadas com máximo conforto e privacidade',
          en: 'Personalized travel with maximum comfort and privacy',
        },
      },
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        title: {
          es: 'Médico',
          pt: 'Médico',
          en: 'Medical',
        },
        description: {
          es: 'Evacuaciones médicas con equipamiento especializado disponible 24/7',
          pt: 'Evacuações médicas com equipamento especializado 24/7',
          en: 'Medical evacuations with specialized equipment 24/7',
        },
      },
      {
        icon: (
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        title: {
          es: 'Carga',
          pt: 'Carga',
          en: 'Cargo',
        },
        description: {
          es: 'Transporte seguro de carga especializada y equipos de alto valor',
          pt: 'Transporte seguro de carga especializada e equipamentos de alto valor',
          en: 'Secure transport of specialized cargo and high-value equipment',
        },
      },
    ],
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
            {content.title[locale]}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.useCases.map((useCase, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="w-16 h-16 mb-4 bg-gradient-to-br from-navy-primary to-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                {useCase.icon}
              </div>
              <h3 className="text-xl font-bold text-navy-primary mb-3">
                {useCase.title[locale]}
              </h3>
              <p className="text-gray-600 text-sm">
                {useCase.description[locale]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
