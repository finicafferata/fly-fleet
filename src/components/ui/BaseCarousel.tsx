'use client';

import React, { useCallback, useState, useEffect, ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { clsx } from 'clsx';

export interface BaseCarouselProps {
  children: ReactNode;
  className?: string;
  autoplayDelay?: number;
  slidesToScroll?: number;
  align?: 'start' | 'center' | 'end';
  breakpoints?: Record<string, { slidesToScroll?: number }>;
  showControls?: boolean;
  showProgress?: boolean;
  loop?: boolean;
  slideCount?: number;
  ariaLabel?: string;
}

export function BaseCarousel({
  children,
  className,
  autoplayDelay = 5000,
  slidesToScroll = 1,
  align = 'center',
  breakpoints,
  showControls = true,
  showProgress = true,
  loop = true,
  slideCount,
  ariaLabel = 'Carousel'
}: BaseCarouselProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop,
      align,
      slidesToScroll,
      breakpoints
    },
    [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
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

  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

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

  // Calculate total number of slides if not provided
  const totalSlides = slideCount || React.Children.count(children);

  return (
    <div className={clsx('relative', className)}>
      {/* Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {children}
        </div>
      </div>

      {showControls && (
        <>
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
        </>
      )}

      {showProgress && (
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
          <div className="flex gap-2" role="tablist" aria-label={ariaLabel}>
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
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
      )}
    </div>
  );
}
