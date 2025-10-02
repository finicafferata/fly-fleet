'use client';

import React from 'react';
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
            title: 'Light Jets (Learjet 45, Citation CJ2)',
            passengers: 'Up to 6 passengers',
            range: '',
            ideal: 'Short and medium flights'
          },
          midJets: {
            title: 'Midsize Jets (Hawker 800, Learjet 60)',
            passengers: '6–8 passengers',
            range: '',
            ideal: 'Executive comfort'
          },
          heavyJets: {
            title: 'Heavy Jets (Challenger 605, Gulfstream G450)',
            passengers: '10–14 passengers',
            range: '',
            ideal: 'Long flights'
          }
        },
        specialized: {
          title: 'Specialized Services',
          helicopter: {
            title: 'Helicopters',
            passengers: '',
            description: 'Short transfers, executive or tourist',
            feature: ''
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
      popularDestinations: {
        title: 'Popular Destinations',
        subtitle: 'Save time, avoid waits and experience the freedom to choose your destination without limitations.',
        destinations: [
          {
            title: 'Argentina ↔ Brazil',
            routes: 'Buenos Aires – São Paulo / Rio de Janeiro',
            image: '/images/destinations/brazil.jpg'
          },
          {
            title: 'Argentina ↔ Uruguay',
            routes: 'Buenos Aires – Punta del Este / Montevideo',
            image: '/images/destinations/uruguay.jpg'
          },
          {
            title: 'Argentina ↔ Chile',
            routes: 'Buenos Aires – Santiago',
            image: '/images/destinations/chile.jpg'
          },
          {
            title: 'Panama Hub',
            routes: 'Connections to Miami, Bogotá, Mexico City',
            image: '/images/destinations/panama.jpg'
          },
          {
            title: 'Caribbean',
            routes: 'Flights to Cancún, Punta Cana, Bahamas',
            image: '/images/destinations/caribbean.jpg'
          }
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
            title: 'Jets Ligeros (Learjet 45, Citation CJ2)',
            passengers: 'Hasta 6 pasajeros',
            range: '',
            ideal: 'Vuelos cortos y medianos'
          },
          midJets: {
            title: 'Jets Medianos (Hawker 800, Learjet 60)',
            passengers: '6–8 pasajeros',
            range: '',
            ideal: 'Confort ejecutivo'
          },
          heavyJets: {
            title: 'Jets Pesados (Challenger 605, Gulfstream G450)',
            passengers: '10–14 pasajeros',
            range: '',
            ideal: 'Vuelos largos'
          }
        },
        specialized: {
          title: 'Servicios Especializados',
          helicopter: {
            title: 'Helicópteros',
            passengers: '',
            description: 'Traslados cortos, ejecutivos o turísticos',
            feature: ''
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
      popularDestinations: {
        title: 'Destinos Populares',
        subtitle: 'Ganá tiempo, evitá esperas y viví la libertad de elegir tu destino sin limitaciones.',
        destinations: [
          {
            title: 'Argentina ↔ Brasil',
            routes: 'Buenos Aires – São Paulo / Río de Janeiro',
            image: '/images/destinations/brazil.jpg'
          },
          {
            title: 'Argentina ↔ Uruguay',
            routes: 'Buenos Aires – Punta del Este / Montevideo',
            image: '/images/destinations/uruguay.jpg'
          },
          {
            title: 'Argentina ↔ Chile',
            routes: 'Buenos Aires – Santiago',
            image: '/images/destinations/chile.jpg'
          },
          {
            title: 'Panamá Hub',
            routes: 'Conexiones a Miami, Bogotá, Ciudad de México',
            image: '/images/destinations/panama.jpg'
          },
          {
            title: 'Caribe',
            routes: 'Vuelos a Cancún, Punta Cana, Bahamas',
            image: '/images/destinations/caribbean.jpg'
          }
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
            title: 'Jets Leves (Learjet 45, Citation CJ2)',
            passengers: 'Até 6 passageiros',
            range: '',
            ideal: 'Voos curtos e médios'
          },
          midJets: {
            title: 'Jets Médios (Hawker 800, Learjet 60)',
            passengers: '6–8 passageiros',
            range: '',
            ideal: 'Conforto executivo'
          },
          heavyJets: {
            title: 'Jets Pesados (Challenger 605, Gulfstream G450)',
            passengers: '10–14 passageiros',
            range: '',
            ideal: 'Voos longos'
          }
        },
        specialized: {
          title: 'Serviços Especializados',
          helicopter: {
            title: 'Helicópteros',
            passengers: '',
            description: 'Transfers curtos, executivos ou turísticos',
            feature: ''
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
      popularDestinations: {
        title: 'Destinos Populares',
        subtitle: 'Ganhe tempo, evite esperas e viva a liberdade de escolher seu destino sem limitações.',
        destinations: [
          {
            title: 'Argentina ↔ Brasil',
            routes: 'Buenos Aires – São Paulo / Rio de Janeiro',
            image: '/images/destinations/brazil.jpg'
          },
          {
            title: 'Argentina ↔ Uruguai',
            routes: 'Buenos Aires – Punta del Este / Montevidéu',
            image: '/images/destinations/uruguay.jpg'
          },
          {
            title: 'Argentina ↔ Chile',
            routes: 'Buenos Aires – Santiago',
            image: '/images/destinations/chile.jpg'
          },
          {
            title: 'Hub Panamá',
            routes: 'Conexões para Miami, Bogotá, Cidade do México',
            image: '/images/destinations/panama.jpg'
          },
          {
            title: 'Caribe',
            routes: 'Voos para Cancún, Punta Cana, Bahamas',
            image: '/images/destinations/caribbean.jpg'
          }
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

      {/* Fleet Content */}
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

      {/* Destinations Content */}
      <section className="py-20 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-16">
            {/* Domestic Routes */}
            <div>
              <div className="mb-10">
                <div className="inline-flex items-center bg-gradient-to-r from-accent-blue to-blue-600 text-white px-6 py-3 rounded-full shadow-lg mb-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-sm uppercase tracking-wider">{content.domesticRoutes}</span>
                </div>
              </div>
              <div className="space-y-4">
                {content.routes.domestic.map((route, index) => {
                  const [origin, destination] = route.split(' ↔ ');
                  return (
                    <div
                      key={index}
                      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-accent-blue/50 overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/0 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative flex items-center justify-between">
                        {/* Origin */}
                        <div className="flex-1">
                          <p className="text-lg font-bold text-navy-primary group-hover:text-accent-blue transition-colors duration-300">
                            {origin}
                          </p>
                        </div>

                        {/* Plane Icon with Animation */}
                        <div className="px-6 flex-shrink-0 relative">
                          <svg className="w-8 h-8 text-accent-blue transform rotate-90 group-hover:translate-x-20 transition-transform duration-1000 ease-in-out" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                          {/* Dashed line */}
                          <div className="absolute top-1/2 left-0 right-0 w-full border-t-2 border-dashed border-accent-blue/30 group-hover:border-accent-blue/60 transition-colors duration-300 -z-10"></div>
                        </div>

                        {/* Destination */}
                        <div className="flex-1 text-right">
                          <p className="text-lg font-bold text-navy-primary group-hover:text-accent-blue transition-colors duration-300">
                            {destination}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* International Routes */}
            <div>
              <div className="mb-10">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-accent-blue text-white px-6 py-3 rounded-full shadow-lg mb-2">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                  <span className="font-bold text-sm uppercase tracking-wider">{content.internationalRoutes}</span>
                </div>
              </div>
              <div className="space-y-4">
                {content.routes.international.map((route, index) => {
                  const [origin, destination] = route.split(' ↔ ');
                  return (
                    <div
                      key={index}
                      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-accent-blue/50 overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative flex items-center justify-between">
                        {/* Origin */}
                        <div className="flex-1">
                          <p className="text-lg font-bold text-navy-primary group-hover:text-blue-600 transition-colors duration-300">
                            {origin}
                          </p>
                        </div>

                        {/* Plane Icon with Animation */}
                        <div className="px-6 flex-shrink-0 relative">
                          <svg className="w-8 h-8 text-blue-600 transform rotate-90 group-hover:translate-x-20 transition-transform duration-1000 ease-in-out" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                          {/* Dashed line */}
                          <div className="absolute top-1/2 left-0 right-0 w-full border-t-2 border-dashed border-blue-600/30 group-hover:border-blue-600/60 transition-colors duration-300 -z-10"></div>
                        </div>

                        {/* Destination */}
                        <div className="flex-1 text-right">
                          <p className="text-lg font-bold text-navy-primary group-hover:text-blue-600 transition-colors duration-300">
                            {destination}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Destinations Section - NEW DESIGN */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
              {content.popularDestinations.title}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              {content.popularDestinations.subtitle}
            </p>
          </div>

          {/* Destinations Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.popularDestinations.destinations.map((destination, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative h-64 bg-gradient-to-br from-accent-blue/20 to-blue-600/20 overflow-hidden">
                  {/* Placeholder gradient - replace with actual image */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/40 to-blue-600/60 group-hover:scale-110 transition-transform duration-700"></div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold mb-2 transform group-hover:translate-x-2 transition-transform duration-300">
                      {destination.title}
                    </h3>
                    <div className="flex items-start">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-accent-blue" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {destination.routes}
                      </p>
                    </div>
                  </div>

                  {/* Hover effect - Plane icon */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <svg className="w-6 h-6 text-white transform rotate-45" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="bg-white p-4 border-t-2 border-accent-blue/20">
                  <button className="w-full text-center text-accent-blue font-semibold group-hover:text-blue-600 transition-colors duration-300 flex items-center justify-center">
                    <span>{locale === 'es' ? 'Ver más' : locale === 'pt' ? 'Ver mais' : 'See more'}</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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