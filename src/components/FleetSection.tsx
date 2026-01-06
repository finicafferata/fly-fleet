'use client';

import React, { useRef, useEffect } from 'react';

interface FleetSectionProps {
  locale: 'en' | 'es' | 'pt';
  title?: string;
  subtitle?: string;
}

const getFleetContent = (locale: string) => {
  const content = {
    en: {
      title: 'Our Fleet',
      subtitle: 'Next-generation aircraft for every need',
      lightJets: {
        title: 'Light Jets',
        models: 'Learjet 45, Citation CJ2',
        passengers: 'Up to 6 passengers',
        ideal: 'Short and medium flights'
      },
      midJets: {
        title: 'Midsize Jets',
        models: 'Hawker 800, Learjet 60',
        passengers: '6–8 passengers',
        ideal: 'Executive comfort'
      },
      heavyJets: {
        title: 'Heavy Jets',
        models: 'Challenger 605, Gulfstream G450',
        passengers: '10–14 passengers',
        ideal: 'Long flights'
      },
      turboprop: {
        title: 'Turboprop / Piston',
        models: 'Sovereign, Metroliner',
        passengers: '9–19 passengers',
        ideal: 'Regional flights'
      }
    },
    es: {
      title: 'Nuestra Flota',
      subtitle: 'Aeronaves de última generación para cada necesidad',
      lightJets: {
        title: 'Jets Ligeros',
        models: 'Learjet 45, Citation CJ2',
        passengers: 'Hasta 6 pasajeros',
        ideal: 'Vuelos cortos y medianos'
      },
      midJets: {
        title: 'Jets Medianos',
        models: 'Hawker 800, Learjet 60',
        passengers: '6–8 pasajeros',
        ideal: 'Confort ejecutivo'
      },
      heavyJets: {
        title: 'Jets Pesados',
        models: 'Challenger 605, Gulfstream G450',
        passengers: '10–14 pasajeros',
        ideal: 'Vuelos largos'
      },
      turboprop: {
        title: 'Turbo / Pistón',
        models: 'Sovereign, Metroliner',
        passengers: '9–19 pasajeros',
        ideal: 'Vuelos regionales'
      }
    },
    pt: {
      title: 'Nossa Frota',
      subtitle: 'Aeronaves de última geração para cada necessidade',
      lightJets: {
        title: 'Jets Leves',
        models: 'Learjet 45, Citation CJ2',
        passengers: 'Até 6 passageiros',
        ideal: 'Voos curtos e médios'
      },
      midJets: {
        title: 'Jets Médios',
        models: 'Hawker 800, Learjet 60',
        passengers: '6–8 passageiros',
        ideal: 'Conforto executivo'
      },
      heavyJets: {
        title: 'Jets Pesados',
        models: 'Challenger 605, Gulfstream G450',
        passengers: '10–14 passageiros',
        ideal: 'Voos longos'
      },
      turboprop: {
        title: 'Turboélice / Pistão',
        models: 'Sovereign, Metroliner',
        passengers: '9–19 passageiros',
        ideal: 'Voos regionais'
      }
    }
  };

  return content[locale as keyof typeof content] || content.en;
};

export function FleetSection({ locale, title, subtitle }: FleetSectionProps) {
  const content = getFleetContent(locale);
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
              {title || content.title}
            </h2>
            {subtitle && (
              <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
                {subtitle || content.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Fleet Grid */}
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
                  {content.lightJets.title}
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
                  <span className="font-semibold text-sm">{content.lightJets.models}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">{content.lightJets.passengers}</span>
                </div>
                <div className="flex items-center text-navy-primary">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{content.lightJets.ideal}</span>
                </div>
              </div>
            </div>

            {/* Mini Gallery */}
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
                  {content.midJets.title}
                </h3>
              </div>
            </div>

            <div className="p-6 flex-grow">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span className="font-semibold text-sm">{content.midJets.models}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">{content.midJets.passengers}</span>
                </div>
                <div className="flex items-center text-navy-primary">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{content.midJets.ideal}</span>
                </div>
              </div>
            </div>

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
                  {content.heavyJets.title}
                </h3>
              </div>
            </div>

            <div className="p-6 flex-grow">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span className="font-semibold text-sm">{content.heavyJets.models}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">{content.heavyJets.passengers}</span>
                </div>
                <div className="flex items-center text-navy-primary">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{content.heavyJets.ideal}</span>
                </div>
              </div>
            </div>

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
                  {content.turboprop.title}
                </h3>
              </div>
            </div>

            <div className="p-6 flex-grow">
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  <span className="font-semibold text-sm">{content.turboprop.models}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-3 text-navy-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm">{content.turboprop.passengers}</span>
                </div>
                <div className="flex items-center text-navy-primary">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{content.turboprop.ideal}</span>
                </div>
              </div>
            </div>

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
    </section>
  );
}
