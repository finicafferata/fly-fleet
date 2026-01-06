'use client';

import React, { useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/Navigation/Header';
import { Footer } from '@/components/Footer';
import { WhatsAppWidget } from '@/components/WhatsAppWidget';

const getContent = (locale: string) => {
  const content = {
    en: {
      title: 'Fleet & Destinations',
      subtitle: 'Discover our aircraft categories and popular destinations',
      fleetTitle: 'Aircraft Categories',
      destinationsTitle: 'Popular Destinations',
      internationalRoutes: 'International Routes',
      aircraft: {
        charter: {
          title: '',
          lightJets: {
            title: 'Light Jets',
            models: 'Learjet 45, Citation CJ2',
            passengers: 'Up to 6 passengers',
            range: '',
            ideal: 'Short and medium flights'
          },
          midJets: {
            title: 'Midsize Jets',
            models: 'Hawker 800, Learjet 60',
            passengers: '6–8 passengers',
            range: '',
            ideal: 'Executive comfort'
          },
          heavyJets: {
            title: 'Heavy Jets',
            models: 'Challenger 605, Gulfstream G450',
            passengers: '10–14 passengers',
            range: '',
            ideal: 'Long flights'
          },
          turboprop: {
            title: 'Turboprop / Piston',
            models: 'Sovereign, Metroliner',
            passengers: '9–19 passengers',
            range: '',
            ideal: 'Regional flights'
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
            title: 'Rio de Janeiro',
            routes: 'Buenos Aires – São Paulo / Rio de Janeiro',
            image: '/images/destinations/brazil.jpg'
          },
          {
            title: 'Montevideo',
            routes: 'Buenos Aires – Punta del Este / Montevideo',
            image: '/images/destinations/uruguay.jpg'
          },
          {
            title: 'Santiago de Chile',
            routes: 'Buenos Aires – Santiago',
            image: '/images/destinations/chile.jpg'
          },
          {
            title: 'Miami',
            routes: 'Connections to Miami, Bogotá, Mexico City',
            image: '/images/destinations/cancun.jpg'
          },
          {
            title: 'Cancun',
            routes: 'Flights to Cancún, Punta Cana, Bahamas',
            image: '/images/destinations/miami.jpg'
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
      internationalRoutes: 'Rutas Internacionales',
      aircraft: {
        charter: {
          title: '',
          lightJets: {
            title: 'Jets Ligeros',
            models: 'Learjet 45, Citation CJ2',
            passengers: 'Hasta 6 pasajeros',
            range: '',
            ideal: 'Vuelos cortos y medianos'
          },
          midJets: {
            title: 'Jets Medianos',
            models: 'Hawker 800, Learjet 60',
            passengers: '6–8 pasajeros',
            range: '',
            ideal: 'Confort ejecutivo'
          },
          heavyJets: {
            title: 'Jets Pesados',
            models: 'Challenger 605, Gulfstream G450',
            passengers: '10–14 pasajeros',
            range: '',
            ideal: 'Vuelos largos'
          },
          turboprop: {
            title: 'Turbo / Pistón',
            models: 'Sovereign, Metroliner',
            passengers: '9–19 pasajeros',
            range: '',
            ideal: 'Vuelos regionales'
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
            title: 'Rio de Janeiro',
            routes: 'Buenos Aires – São Paulo / Río de Janeiro',
            image: '/images/destinations/brazil.jpg'
          },
          {
            title: 'Montevideo',
            routes: 'Buenos Aires – Punta del Este / Montevideo',
            image: '/images/destinations/uruguay.jpg'
          },
          {
            title: 'Santiago de Chile',
            routes: 'Buenos Aires – Santiago',
            image: '/images/destinations/chile.jpg'
          },
          {
            title: 'Miami',
            routes: 'Conexiones a Miami, Bogotá, Ciudad de México',
            image: '/images/destinations/cancun.jpg'
          },
          {
            title: 'Cancun',
            routes: 'Vuelos a Cancún, Punta Cana, Bahamas',
            image: '/images/destinations/miami.jpg'
          }
        ]
      },
      cta: 'Cotizá tu vuelo'
    },
    pt: {
      title: 'Frota e Destinos',
      subtitle: 'Descubra nossas categorias de aeronaves e destinos populares',
      fleetTitle: 'Categorias de Aeronaves',
      destinationsTitle: 'Destinos Populares',
      internationalRoutes: 'Rotas Internacionais',
      aircraft: {
        charter: {
          title: '',
          lightJets: {
            title: 'Jets Leves',
            models: 'Learjet 45, Citation CJ2',
            passengers: 'Até 6 passageiros',
            range: '',
            ideal: 'Voos curtos e médios'
          },
          midJets: {
            title: 'Jets Médios',
            models: 'Hawker 800, Learjet 60',
            passengers: '6–8 passageiros',
            range: '',
            ideal: 'Conforto executivo'
          },
          heavyJets: {
            title: 'Jets Pesados',
            models: 'Challenger 605, Gulfstream G450',
            passengers: '10–14 passageiros',
            range: '',
            ideal: 'Voos longos'
          },
          turboprop: {
            title: 'Turboélice / Pistão',
            models: 'Sovereign, Metroliner',
            passengers: '9–19 passageiros',
            range: '',
            ideal: 'Voos regionais'
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
            title: 'Rio de Janeiro',
            routes: 'Buenos Aires – São Paulo / Rio de Janeiro',
            image: '/images/destinations/brazil.jpg'
          },
          {
            title: 'Montevideo',
            routes: 'Buenos Aires – Punta del Este / Montevidéu',
            image: '/images/destinations/uruguay.jpg'
          },
          {
            title: 'Santiago de Chile',
            routes: 'Buenos Aires – Santiago',
            image: '/images/destinations/chile.jpg'
          },
          {
            title: 'Miami',
            routes: 'Conexões para Miami, Bogotá, Cidade do México',
            image: '/images/destinations/cancun.jpg'
          },
          {
            title: 'Cancun',
            routes: 'Voos para Cancún, Punta Cana, Bahamas',
            image: '/images/destinations/miami.jpg'
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
  const lightVideoRef = useRef<HTMLVideoElement>(null);
  const mediumVideoRef = useRef<HTMLVideoElement>(null);
  const heavyVideoRef = useRef<HTMLVideoElement>(null);
  const pistonVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure videos play when component mounts
    if (lightVideoRef.current) {
      lightVideoRef.current.play().catch((error) => {
        console.log('Light video autoplay prevented:', error);
      });
    }
    if (mediumVideoRef.current) {
      mediumVideoRef.current.play().catch((error) => {
        console.log('Medium video autoplay prevented:', error);
      });
    }
    if (heavyVideoRef.current) {
      heavyVideoRef.current.play().catch((error) => {
        console.log('Heavy video autoplay prevented:', error);
      });
    }
    if (pistonVideoRef.current) {
      pistonVideoRef.current.play().catch((error) => {
        console.log('Piston video autoplay prevented:', error);
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-white" lang={locale}>
      <Header
        locale={locale}
        onLanguageChange={(newLocale) => {
          router.push(`/${newLocale}/fleet-destinations`);
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
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Light Jets */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
                  {/* Hero Video Background */}
                  <div className="relative h-56 overflow-hidden">
                    <video
                      ref={lightVideoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    >
                      <source src="/images/aircrafts/light/light_video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">
                        {content.aircraft.charter.lightJets.title}
                      </h3>
                    </div>
                  </div>

                  {/* Specs Section */}
                  <div className="p-6 flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="font-semibold text-sm">{content.aircraft.charter.lightJets.models}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm">{content.aircraft.charter.lightJets.passengers}</span>
                      </div>
                      <div className="flex items-center text-navy-primary">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{content.aircraft.charter.lightJets.ideal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Gallery - Stuck to bottom */}
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/light/light1.png" alt="Light jet view 1" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/light/light2.png" alt="Light jet view 2" className="w-full h-full object-cover opacity-80 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/light/light3.png" alt="Light jet view 3" className="w-full h-full object-cover opacity-60 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Midsize Jets */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
                  {/* Hero Video Background */}
                  <div className="relative h-56 overflow-hidden">
                    <video
                      ref={mediumVideoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    >
                      <source src="/images/aircrafts/medium/medium_video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">
                        {content.aircraft.charter.midJets.title}
                      </h3>
                    </div>
                  </div>

                  {/* Specs Section */}
                  <div className="p-6 flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="font-semibold text-sm">{content.aircraft.charter.midJets.models}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm">{content.aircraft.charter.midJets.passengers}</span>
                      </div>
                      <div className="flex items-center text-navy-primary">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{content.aircraft.charter.midJets.ideal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Gallery - Stuck to bottom */}
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/medium/medium_1.png" alt="Midsize jet view 1" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/medium/medium_2.png" alt="Midsize jet view 2" className="w-full h-full object-cover opacity-80 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/medium/medium_3.png" alt="Midsize jet view 3" className="w-full h-full object-cover opacity-60 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heavy Jets */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
                  {/* Hero Video Background */}
                  <div className="relative h-56 overflow-hidden">
                    <video
                      ref={heavyVideoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    >
                      <source src="/images/aircrafts/heavy/heavy_video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">
                        {content.aircraft.charter.heavyJets.title}
                      </h3>
                    </div>
                  </div>

                  {/* Specs Section */}
                  <div className="p-6 flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="font-semibold text-sm">{content.aircraft.charter.heavyJets.models}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm">{content.aircraft.charter.heavyJets.passengers}</span>
                      </div>
                      <div className="flex items-center text-navy-primary">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{content.aircraft.charter.heavyJets.ideal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Gallery - Stuck to bottom */}
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/heavy/heavy_1.png" alt="Heavy jet view 1" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/heavy/heavy_2.png" alt="Heavy jet view 2" className="w-full h-full object-cover opacity-80 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/heavy/heavy_3.png" alt="Heavy jet view 3" className="w-full h-full object-cover opacity-60 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Turboprop / Piston */}
                <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 flex flex-col">
                  {/* Hero Video Background */}
                  <div className="relative h-56 overflow-hidden">
                    <video
                      ref={pistonVideoRef}
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectFit: 'cover' }}
                    >
                      <source src="/images/aircrafts/piston/piston_video.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold">
                        {content.aircraft.charter.turboprop.title}
                      </h3>
                    </div>
                  </div>

                  {/* Specs Section */}
                  <div className="p-6 flex-grow">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                        <span className="font-semibold text-sm">{content.aircraft.charter.turboprop.models}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span className="text-sm">{content.aircraft.charter.turboprop.passengers}</span>
                      </div>
                      <div className="flex items-center text-navy-primary">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium">{content.aircraft.charter.turboprop.ideal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Gallery - Stuck to bottom */}
                  <div className="px-6 pb-6 pt-4 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/piston/piston_1.png" alt="Piston/Turboprop view 1" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/piston/piston_2.png" alt="Piston/Turboprop view 2" className="w-full h-full object-cover opacity-80 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                      <div className="relative h-16 rounded overflow-hidden group/img">
                        <img src="/images/aircrafts/piston/piston_3.png" alt="Piston/Turboprop view 3" className="w-full h-full object-cover opacity-60 group-hover/img:scale-110 group-hover/img:opacity-100 transition-all duration-300" />
                      </div>
                    </div>
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
                    <p className="text-sm font-medium text-navy-primary">
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
                    <p className="text-sm font-medium text-navy-primary">
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
                    <p className="text-sm font-medium text-navy-primary">
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

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* International Routes */}
          <div>
              <div className="mb-10">
                <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-navy-primary text-white px-6 py-3 rounded-full shadow-lg mb-2">
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
                      className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 hover:border-navy-primary/50 overflow-hidden"
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
                <div className="relative h-64 overflow-hidden">
                  {/* Background Image */}
                  <img
                    src={destination.image}
                    alt={destination.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/50 to-transparent"></div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
                    <h3 className="text-2xl font-bold mb-2 transform group-hover:translate-y-[-4px] transition-transform duration-300">
                      {destination.title}
                    </h3>
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
                <div className="bg-white p-4 border-t-2 border-navy-primary/20">
                  <a
                    href={`/${locale}/quote`}
                    className="w-full text-center text-navy-primary font-semibold group-hover:text-blue-600 transition-colors duration-300 flex items-center justify-center"
                  >
                    <span>{locale === 'es' ? 'Cotizá tu vuelo' : locale === 'pt' ? 'Pedir cotação' : 'Get a quote'}</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-navy-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <a
            href={`/${locale}/quote`}
            className="inline-flex items-center justify-center bg-navy-primary hover:bg-navy-primary/90 text-white min-h-[56px] px-8 text-lg font-semibold rounded-lg shadow-large hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            {locale === 'es' ? 'Cotizá tu vuelo' :
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