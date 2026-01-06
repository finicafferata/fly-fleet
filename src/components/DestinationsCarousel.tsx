'use client';

import React from 'react';
import { BaseCarousel } from './ui/BaseCarousel';
import { OptimizedImage } from './ui/OptimizedImage';

interface DestinationsCarouselProps {
  locale: 'en' | 'es' | 'pt';
}

const destinations = [
  {
    id: 1,
    image: '/images/destinations/brazil.jpg',
    title: {
      en: 'Rio de Janeiro',
      es: 'Río de Janeiro',
      pt: 'Rio de Janeiro'
    }
  },
  {
    id: 2,
    image: '/images/destinations/uruguay.jpg',
    title: {
      en: 'Montevideo',
      es: 'Montevideo',
      pt: 'Montevidéu'
    }
  },
  {
    id: 3,
    image: '/images/destinations/chile.jpg',
    title: {
      en: 'Santiago de Chile',
      es: 'Santiago de Chile',
      pt: 'Santiago do Chile'
    }
  },
  {
    id: 4,
    image: '/images/destinations/miami.jpg',
    title: {
      en: 'Miami',
      es: 'Miami',
      pt: 'Miami'
    }
  },
  {
    id: 5,
    image: '/images/destinations/cancun.jpg',
    title: {
      en: 'Cancún',
      es: 'Cancún',
      pt: 'Cancún'
    }
  }
];

export function DestinationsCarousel({ locale }: DestinationsCarouselProps) {

  const sectionTitle = {
    en: 'Popular Destinations',
    es: 'Destinos Populares',
    pt: 'Destinos Populares'
  };

  const sectionSubtitle = {
    en: 'Save time, avoid waits and experience the freedom to choose your destination without limitations.',
    es: 'Ganá tiempo, evitá esperas y viví la libertad de elegir tu destino sin limitaciones.',
    pt: 'Ganhe tempo, evite esperas e viva a liberdade de escolher seu destino sem limitações.'
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-navy-primary mb-6">
            {sectionTitle[locale]}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {sectionSubtitle[locale]}
          </p>
        </div>

        {/* Carousel Container */}
        <BaseCarousel
          autoplayDelay={5500}
          slideCount={destinations.length}
          ariaLabel="Popular destinations carousel"
          breakpoints={{
            '(min-width: 640px)': { slidesToScroll: 1 },
            '(min-width: 768px)': { slidesToScroll: 2 },
            '(min-width: 1024px)': { slidesToScroll: 3 }
          }}
        >
          {destinations.map((destination) => (
            <div
              key={destination.id}
              className="flex-[0_0_70%] sm:flex-[0_0_48%] md:flex-[0_0_30%] lg:flex-[0_0_28%] xl:flex-[0_0_25%] min-w-0 px-2.5"
            >
              <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 h-64 md:h-80 lg:h-[400px]">
                {/* Optimized Image with Lazy Loading */}
                <OptimizedImage
                  src={destination.image}
                  alt={destination.title[locale]}
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  sizes="(max-width: 640px) 70vw, (max-width: 768px) 48vw, (max-width: 1024px) 30vw, 25vw"
                  objectFit="cover"
                  placeholder="blur"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/90 via-navy-primary/40 to-transparent" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <h3 className="text-3xl font-bold">
                    {destination.title[locale]}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </BaseCarousel>
      </div>
    </section>
  );
}
