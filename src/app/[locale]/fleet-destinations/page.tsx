'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Fleet & Destinations',
      subtitle: 'Discover our aircraft categories and popular destinations',
      fleetTitle: 'Aircraft Categories',
      destinationsTitle: 'Popular Destinations',
      domesticRoutes: 'Domestic Routes',
      internationalRoutes: 'International Routes',
      aircraft: {
        charter: {
          title: 'Point-to-Point Charter',
          lightJets: {
            title: 'Light Jets',
            passengers: '4-8 passengers',
            range: 'Range: 1,500-2,500 nm',
            ideal: 'Ideal for: Regional and domestic flights'
          },
          midJets: {
            title: 'Midsize Jets',
            passengers: '6-9 passengers',
            range: 'Range: 2,000-3,500 nm',
            ideal: 'Ideal for: Continental flights'
          },
          heavyJets: {
            title: 'Heavy Jets',
            passengers: '8-16 passengers',
            range: 'Range: 3,500-6,000 nm',
            ideal: 'Ideal for: Intercontinental flights'
          }
        },
        specialized: {
          title: 'Specialized Services',
          helicopter: {
            title: 'Helicopters',
            passengers: '2-6 passengers',
            description: 'Urban executive transfers',
            feature: 'Exclusive heliport access'
          },
          medical: {
            title: 'Medical',
            description: 'Hospital configuration',
            equipment: 'Certified medical equipment',
            staff: 'Specialized medical staff'
          },
          cargo: {
            title: 'Cargo',
            capacity: 'Variable cargo capacity',
            doors: 'Large cargo doors',
            configuration: 'Flexible configuration'
          }
        }
      },
      routes: {
        domestic: [
          'Buenos Aires ↔ Bariloche',
          'Buenos Aires ↔ Mendoza',
          'Buenos Aires ↔ Salta',
          'São Paulo ↔ Rio de Janeiro',
          'São Paulo ↔ Florianópolis'
        ],
        international: [
          'Buenos Aires ↔ Miami',
          'São Paulo ↔ New York',
          'Santiago ↔ Lima',
          'Bogotá ↔ Panama'
        ]
      },
      cta: 'Get Quote for Your Route'
    },
    es: {
      title: 'Flota y Destinos',
      subtitle: 'Descubrí nuestras categorías de aeronaves y destinos populares',
      fleetTitle: 'Categorías de Aeronaves',
      destinationsTitle: 'Destinos Populares',
      domesticRoutes: 'Rutas Domésticas',
      internationalRoutes: 'Rutas Internacionales',
      aircraft: {
        charter: {
          title: 'Charter Point-to-Point',
          lightJets: {
            title: 'Jets Ligeros',
            passengers: '4-8 pasajeros',
            range: 'Alcance: 1,500-2,500 nm',
            ideal: 'Ideal para: Vuelos regionales y domésticos'
          },
          midJets: {
            title: 'Jets Medianos',
            passengers: '6-9 pasajeros',
            range: 'Alcance: 2,000-3,500 nm',
            ideal: 'Ideal para: Vuelos continentales'
          },
          heavyJets: {
            title: 'Jets Pesados',
            passengers: '8-16 pasajeros',
            range: 'Alcance: 3,500-6,000 nm',
            ideal: 'Ideal para: Vuelos intercontinentales'
          }
        },
        specialized: {
          title: 'Servicios Especializados',
          helicopter: {
            title: 'Helicópteros',
            passengers: '2-6 pasajeros',
            description: 'Traslados ejecutivos urbanos',
            feature: 'Acceso a helipuertos exclusivos'
          },
          medical: {
            title: 'Medical',
            description: 'Configuración hospitalaria',
            equipment: 'Equipamiento médico certificado',
            staff: 'Personal sanitario especializado'
          },
          cargo: {
            title: 'Cargo',
            capacity: 'Capacidad de carga variable',
            doors: 'Puertas de carga amplias',
            configuration: 'Configuración flexible'
          }
        }
      },
      routes: {
        domestic: [
          'Buenos Aires ↔ Bariloche',
          'Buenos Aires ↔ Mendoza',
          'Buenos Aires ↔ Salta',
          'São Paulo ↔ Rio de Janeiro',
          'São Paulo ↔ Florianópolis'
        ],
        international: [
          'Buenos Aires ↔ Miami',
          'São Paulo ↔ Nueva York',
          'Santiago ↔ Lima',
          'Bogotá ↔ Panamá'
        ]
      },
      cta: 'Cotizar para Tu Ruta'
    },
    pt: {
      title: 'Frota e Destinos',
      subtitle: 'Descubra nossas categorias de aeronaves e destinos populares',
      fleetTitle: 'Categorias de Aeronaves',
      destinationsTitle: 'Destinos Populares',
      domesticRoutes: 'Rotas Domésticas',
      internationalRoutes: 'Rotas Internacionais',
      aircraft: {
        charter: {
          title: 'Charter Ponto-a-Ponto',
          lightJets: {
            title: 'Jets Leves',
            passengers: '4-8 passageiros',
            range: 'Alcance: 1,500-2,500 nm',
            ideal: 'Ideal para: Voos regionais e domésticos'
          },
          midJets: {
            title: 'Jets Médios',
            passengers: '6-9 passageiros',
            range: 'Alcance: 2,000-3,500 nm',
            ideal: 'Ideal para: Voos continentais'
          },
          heavyJets: {
            title: 'Jets Pesados',
            passengers: '8-16 passageiros',
            range: 'Alcance: 3,500-6,000 nm',
            ideal: 'Ideal para: Voos intercontinentais'
          }
        },
        specialized: {
          title: 'Serviços Especializados',
          helicopter: {
            title: 'Helicópteros',
            passengers: '2-6 passageiros',
            description: 'Transfers executivos urbanos',
            feature: 'Acesso a heliportos exclusivos'
          },
          medical: {
            title: 'Medical',
            description: 'Configuração hospitalar',
            equipment: 'Equipamento médico certificado',
            staff: 'Pessoal médico especializado'
          },
          cargo: {
            title: 'Cargo',
            capacity: 'Capacidade de carga variável',
            doors: 'Portas de carga amplas',
            configuration: 'Configuração flexível'
          }
        }
      },
      routes: {
        domestic: [
          'Buenos Aires ↔ Bariloche',
          'Buenos Aires ↔ Mendoza',
          'Buenos Aires ↔ Salta',
          'São Paulo ↔ Rio de Janeiro',
          'São Paulo ↔ Florianópolis'
        ],
        international: [
          'Buenos Aires ↔ Miami',
          'São Paulo ↔ Nova York',
          'Santiago ↔ Lima',
          'Bogotá ↔ Panamá'
        ]
      },
      cta: 'Cotação para Sua Rota'
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export default function FleetDestinationsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as 'en' | 'es' | 'pt';
  const [activeTab, setActiveTab] = useState<'fleet' | 'destinations'>('fleet');
  const content = getContent(locale);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Navigation
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/fleet-destinations`);
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

      {/* Tab Navigation */}
      <section className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('fleet')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'fleet'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {content.fleetTitle}
            </button>
            <button
              onClick={() => setActiveTab('destinations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'destinations'
                  ? 'border-accent-blue text-accent-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {content.destinationsTitle}
            </button>
          </div>
        </div>
      </section>

      {/* Fleet Tab Content */}
      {activeTab === 'fleet' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Charter Aircraft */}
            <div className="mb-16">
              <h2 className="text-3xl font-bold mb-12 text-navy-primary">
                {content.aircraft.charter.title}
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Light Jets */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                    {content.aircraft.charter.lightJets.title}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{content.aircraft.charter.lightJets.passengers}</p>
                    <p>{content.aircraft.charter.lightJets.range}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      {content.aircraft.charter.lightJets.ideal}
                    </p>
                  </div>
                </div>

                {/* Midsize Jets */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                    {content.aircraft.charter.midJets.title}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{content.aircraft.charter.midJets.passengers}</p>
                    <p>{content.aircraft.charter.midJets.range}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      {content.aircraft.charter.midJets.ideal}
                    </p>
                  </div>
                </div>

                {/* Heavy Jets */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                    {content.aircraft.charter.heavyJets.title}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{content.aircraft.charter.heavyJets.passengers}</p>
                    <p>{content.aircraft.charter.heavyJets.range}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      {content.aircraft.charter.heavyJets.ideal}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialized Services */}
            <div>
              <h2 className="text-3xl font-bold mb-12 text-navy-primary">
                {content.aircraft.specialized.title}
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                {/* Helicopters */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                    {content.aircraft.specialized.helicopter.title}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{content.aircraft.specialized.helicopter.passengers}</p>
                    <p>{content.aircraft.specialized.helicopter.description}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      {content.aircraft.specialized.helicopter.feature}
                    </p>
                  </div>
                </div>

                {/* Medical */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                    {content.aircraft.specialized.medical.title}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{content.aircraft.specialized.medical.description}</p>
                    <p>{content.aircraft.specialized.medical.equipment}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      {content.aircraft.specialized.medical.staff}
                    </p>
                  </div>
                </div>

                {/* Cargo */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-navy-primary">
                    {content.aircraft.specialized.cargo.title}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>{content.aircraft.specialized.cargo.capacity}</p>
                    <p>{content.aircraft.specialized.cargo.doors}</p>
                    <p className="text-sm font-medium text-accent-blue">
                      {content.aircraft.specialized.cargo.configuration}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Destinations Tab Content */}
      {activeTab === 'destinations' && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Domestic Routes */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-navy-primary">
                  {content.domesticRoutes}
                </h2>
                <div className="space-y-4">
                  {content.routes.domestic.map((route, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-lg font-medium text-gray-800">{route}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* International Routes */}
              <div>
                <h2 className="text-3xl font-bold mb-8 text-navy-primary">
                  {content.internationalRoutes}
                </h2>
                <div className="space-y-4">
                  {content.routes.international.map((route, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                      <p className="text-lg font-medium text-gray-800">{route}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-navy-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            {content.cta}
          </h2>
          <a
            href={`/${locale}/quote`}
            className="inline-flex items-center justify-center bg-accent-blue hover:bg-accent-blue/90 text-white min-h-[56px] px-8 text-lg font-semibold rounded-lg shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {locale === 'es' ? 'Cotizar ahora' :
             locale === 'pt' ? 'Pedir cotação' :
             'Get a quote'}
          </a>
        </div>
      </section>
      </main>

      <Footer locale={locale} />
      <WhatsAppWidget locale={locale} />
    </div>
  );
}