'use client';

import React, { useCallback, useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
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
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: 'center',
      slidesToScroll: 1,
      breakpoints: {
        '(min-width: 640px)': { slidesToScroll: 1 },
        '(min-width: 768px)': { slidesToScroll: 2 },
        '(min-width: 1024px)': { slidesToScroll: 3 }
      }
    },
    [Autoplay({ delay: 5500, stopOnInteraction: false })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;
    const playOrStop = isPlaying ? autoplay.stop : autoplay.play;
    playOrStop();
    setIsPlaying(!isPlaying);
  }, [emblaApi, isPlaying]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      const autoplay = emblaApi.plugins()?.autoplay;
      if (autoplay) {
        autoplay.stop();
        setIsPlaying(false);
      }
    }

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

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
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
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
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white hover:bg-navy-primary text-navy-primary hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2"
            aria-label="Previous slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white hover:bg-navy-primary text-navy-primary hover:text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2"
            aria-label="Next slide"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Carousel Controls */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-16 flex items-center gap-4">
            {/* Pause/Play Button */}
            <button
              onClick={toggleAutoplay}
              className="w-10 h-10 bg-white hover:bg-navy-primary text-navy-primary hover:text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2"
              aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
              aria-pressed={!isPlaying}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Progress Indicators */}
            <div className="flex gap-2" role="tablist" aria-label="Carousel slides">
              {destinations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2 ${
                    index === selectedIndex
                      ? 'w-8 bg-navy-primary'
                      : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  role="tab"
                  aria-selected={index === selectedIndex}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
