'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { trackCTAClick } from '../lib/analytics/accessibleTracking';

interface TestimonialsComponentProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  variant?: 'carousel' | 'grid';
  showCTA?: boolean;
  onQuoteClick?: () => void;
}

interface Testimonial {
  id: string;
  customerName: string;
  customerTitle: string;
  customerCompany: string;
  customerLocation: string;
  customerPhoto: string;
  testimonialText: string;
  rating: number;
  serviceUsed: string;
  dateOfService: string;
  isFeatured: boolean;
  videoUrl?: string;
}

export function TestimonialsComponent({
  locale = 'en',
  className,
  variant = 'carousel',
  showCTA = false,
  onQuoteClick
}: TestimonialsComponentProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [announceText, setAnnounceText] = useState('');
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const getContent = (locale: string) => {
    const content = {
      en: {
        title: 'What Our Clients Say',
        subtitle: 'Real experiences from satisfied customers who trust Fly-Fleet for their private aviation needs',
        readMore: 'Read More',
        readLess: 'Read Less',
        playVideo: 'Play Video Testimonial',
        pauseCarousel: 'Pause carousel',
        playCarousel: 'Play carousel',
        nextTestimonial: 'Next testimonial',
        prevTestimonial: 'Previous testimonial',
        starRating: (rating: number) => `${rating} out of 5 stars`,
        cta: {
          title: 'Experience Excellence Yourself',
          subtitle: 'Join hundreds of satisfied clients who trust Fly-Fleet',
          button: 'Get Your Quote'
        },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'Eduardo Martinez',
            customerTitle: 'Business Director',
            customerCompany: 'Import/Export Corp',
            customerLocation: 'São Paulo, Brazil',
            customerPhoto: '/images/testimonials/eduardo-martinez.jpg',
            testimonialText: 'Thanks to Fly-Fleet\'s service we were able to organize a lightning business trip to São Paulo without wasting time at airports. Everything impeccable and safe.',
            rating: 5,
            serviceUsed: 'Private Charter',
            dateOfService: '2024-02-15',
            isFeatured: true
          },
          {
            id: 'testimonial-2',
            customerName: 'Sofia & Family',
            customerTitle: 'Family Vacation',
            customerCompany: '',
            customerLocation: 'Punta Cana, Dominican Republic',
            customerPhoto: '/images/testimonials/sofia-family.jpg',
            testimonialText: 'We chose Fly-Fleet for a family flight to Punta Cana and the experience was perfect: 24/7 support, comfort, and the peace of mind of traveling with our pet.',
            rating: 5,
            serviceUsed: 'Family Charter',
            dateOfService: '2024-01-28',
            isFeatured: true
          },
          {
            id: 'testimonial-3',
            customerName: 'Ricardo & Ana',
            customerTitle: 'Leisure Travel',
            customerCompany: '',
            customerLocation: 'Punta del Este, Uruguay',
            customerPhoto: '/images/testimonials/ricardo-ana.jpg',
            testimonialText: 'We flew to Punta del Este with Fly-Fleet and everything was spectacular: fast, comfortable and stress-free, just as we wanted.',
            rating: 5,
            serviceUsed: 'Private Charter',
            dateOfService: '2024-03-10',
            isFeatured: true
          },
          {
            id: 'testimonial-4',
            customerName: 'Ana Gutierrez',
            customerTitle: 'Family Office Director',
            customerCompany: 'Private Family Office',
            customerLocation: 'Santiago, Chile',
            customerPhoto: '/images/testimonials/ana-gutierrez.jpg',
            testimonialText: 'Safety and reliability are paramount when traveling with family. Fly-Fleet\'s commitment to both is evident in every aspect of their service. From the pilot briefings to the aircraft maintenance standards, everything exceeds commercial aviation. My family and I always feel secure and well-cared for.',
            rating: 5,
            serviceUsed: 'Family Charter',
            dateOfService: '2024-02-22',
            isFeatured: false
          },
          {
            id: 'testimonial-5',
            customerName: 'James Patterson',
            customerTitle: 'Board Member',
            customerCompany: 'International Mining Corp',
            customerLocation: 'Miami, USA',
            customerPhoto: '/images/testimonials/james-patterson.jpg',
            testimonialText: 'Fly-Fleet\'s empty leg program offers incredible value without compromising on quality. I\'ve saved thousands while maintaining the luxury and convenience I expect. The team proactively notifies me of opportunities that match my travel patterns. It\'s smart, efficient, and cost-effective.',
            rating: 5,
            serviceUsed: 'Empty Leg Flights',
            dateOfService: '2024-01-12',
            isFeatured: false
          },
          {
            id: 'testimonial-6',
            customerName: 'Isabella Costa',
            customerTitle: 'Marketing Director',
            customerCompany: 'Costa Enterprises',
            customerLocation: 'Rio de Janeiro, Brazil',
            customerPhoto: '/images/testimonials/isabella-costa.jpg',
            testimonialText: 'The helicopter transfer from Santos Dumont to our resort was breathtaking and incredibly convenient. Fly-Fleet arranged everything perfectly, including ground coordination and luggage handling. It transformed what would have been a stressful commute into a memorable experience. Highly recommend their helicopter services.',
            rating: 5,
            serviceUsed: 'Helicopter Transfer',
            dateOfService: '2024-03-05',
            isFeatured: false
          }
        ]
      },
      es: {
        title: 'Lo Que Dicen Nuestros Clientes',
        subtitle: 'Experiencias reales de clientes satisfechos que confían en Fly-Fleet para sus necesidades de aviación privada',
        readMore: 'Leer Más',
        readLess: 'Leer Menos',
        playVideo: 'Reproducir Video Testimonial',
        pauseCarousel: 'Pausar carrusel',
        playCarousel: 'Reproducir carrusel',
        nextTestimonial: 'Siguiente testimonio',
        prevTestimonial: 'Testimonio anterior',
        starRating: (rating: number) => `${rating} de 5 estrellas`,
        cta: {
          title: 'Experimenta la Excelencia Tú Mismo',
          subtitle: 'Únete a cientos de clientes satisfechos que confían en Fly-Fleet',
          button: 'Obtener Cotización'
        },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'Eduardo Martinez',
            customerTitle: 'Director de Negocios',
            customerCompany: 'Import/Export Corp',
            customerLocation: 'São Paulo, Brasil',
            customerPhoto: '/images/testimonials/eduardo-martinez.jpg',
            testimonialText: 'Gracias al servicio de Fly-Fleet pudimos organizar un viaje relámpago de negocios a São Paulo sin perder tiempo en aeropuertos. Todo impecable y seguro.',
            rating: 5,
            serviceUsed: 'Charter Privado',
            dateOfService: '2024-02-15',
            isFeatured: true
          },
          {
            id: 'testimonial-2',
            customerName: 'Sofia & Familia',
            customerTitle: 'Vacaciones Familiares',
            customerCompany: '',
            customerLocation: 'Punta Cana, República Dominicana',
            customerPhoto: '/images/testimonials/sofia-family.jpg',
            testimonialText: 'Elegimos Fly-Fleet para un vuelo familiar a Punta Cana y la experiencia fue perfecta: atención 24/7, comodidad y la tranquilidad de viajar con nuestra mascota.',
            rating: 5,
            serviceUsed: 'Charter Familiar',
            dateOfService: '2024-01-28',
            isFeatured: true
          },
          {
            id: 'testimonial-3',
            customerName: 'Ricardo & Ana',
            customerTitle: 'Viaje de Placer',
            customerCompany: '',
            customerLocation: 'Punta del Este, Uruguay',
            customerPhoto: '/images/testimonials/ricardo-ana.jpg',
            testimonialText: 'Volamos a Punta del Este con Fly-Fleet y todo salió espectacular: rápido, cómodo y sin estrés, justo como queríamos.',
            rating: 5,
            serviceUsed: 'Charter Privado',
            dateOfService: '2024-03-10',
            isFeatured: true
          }
        ]
      },
      pt: {
        title: 'O Que Nossos Clientes Dizem',
        subtitle: 'Experiências reais de clientes satisfeitos que confiam na Fly-Fleet para suas necessidades de aviação privada',
        readMore: 'Ler Mais',
        readLess: 'Ler Menos',
        playVideo: 'Reproduzir Vídeo Depoimento',
        pauseCarousel: 'Pausar carrossel',
        playCarousel: 'Reproduzir carrossel',
        nextTestimonial: 'Próximo depoimento',
        prevTestimonial: 'Depoimento anterior',
        starRating: (rating: number) => `${rating} de 5 estrelas`,
        cta: {
          title: 'Experimente a Excelência Você Mesmo',
          subtitle: 'Junte-se a centenas de clientes satisfeitos que confiam na Fly-Fleet',
          button: 'Obter Cotação'
        },
        testimonials: [
          {
            id: 'testimonial-1',
            customerName: 'Eduardo Martinez',
            customerTitle: 'Diretor de Negócios',
            customerCompany: 'Import/Export Corp',
            customerLocation: 'São Paulo, Brasil',
            customerPhoto: '/images/testimonials/eduardo-martinez.jpg',
            testimonialText: 'Graças ao serviço da Fly-Fleet pudemos organizar uma viagem relâmpago de negócios a São Paulo sem perder tempo em aeroportos. Tudo impecável e seguro.',
            rating: 5,
            serviceUsed: 'Charter Privado',
            dateOfService: '2024-02-15',
            isFeatured: true
          },
          {
            id: 'testimonial-2',
            customerName: 'Sofia & Família',
            customerTitle: 'Férias em Família',
            customerCompany: '',
            customerLocation: 'Punta Cana, República Dominicana',
            customerPhoto: '/images/testimonials/sofia-family.jpg',
            testimonialText: 'Escolhemos a Fly-Fleet para um voo familiar a Punta Cana e a experiência foi perfeita: atendimento 24/7, conforto e a tranquilidade de viajar com nosso animal de estimação.',
            rating: 5,
            serviceUsed: 'Charter Familiar',
            dateOfService: '2024-01-28',
            isFeatured: true
          },
          {
            id: 'testimonial-3',
            customerName: 'Ricardo & Ana',
            customerTitle: 'Viagem de Lazer',
            customerCompany: '',
            customerLocation: 'Punta del Este, Uruguai',
            customerPhoto: '/images/testimonials/ricardo-ana.jpg',
            testimonialText: 'Voamos para Punta del Este com a Fly-Fleet e tudo foi espetacular: rápido, confortável e sem estresse, exatamente como queríamos.',
            rating: 5,
            serviceUsed: 'Charter Privado',
            dateOfService: '2024-03-10',
            isFeatured: true
          }
        ]
      }
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = getContent(locale);
  const featuredTestimonials = content.testimonials.filter(t => t.isFeatured);
  const displayTestimonials = variant === 'carousel' ? featuredTestimonials : content.testimonials;

  // Auto-play carousel
  useEffect(() => {
    if (variant === 'carousel' && isAutoPlaying && displayTestimonials.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => {
          const newIndex = (prev + 1) % displayTestimonials.length;
          setAnnounceText(`Showing testimonial ${newIndex + 1} of ${displayTestimonials.length}`);
          return newIndex;
        });
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying, displayTestimonials.length, variant]);

  // Keyboard navigation for carousel
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (variant === 'carousel' && carouselRef.current?.contains(document.activeElement)) {
        switch (event.key) {
          case 'ArrowLeft':
            event.preventDefault();
            setActiveIndex((prev) => {
              const newIndex = (prev - 1 + displayTestimonials.length) % displayTestimonials.length;
              setAnnounceText(`Showing testimonial ${newIndex + 1} of ${displayTestimonials.length}`);
              return newIndex;
            });
            break;
          case 'ArrowRight':
            event.preventDefault();
            setActiveIndex((prev) => {
              const newIndex = (prev + 1) % displayTestimonials.length;
              setAnnounceText(`Showing testimonial ${newIndex + 1} of ${displayTestimonials.length}`);
              return newIndex;
            });
            break;
          case ' ':
            event.preventDefault();
            setIsAutoPlaying(!isAutoPlaying);
            setAnnounceText(isAutoPlaying ? 'Carousel paused' : 'Carousel playing');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [variant, isAutoPlaying, displayTestimonials.length]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={clsx(
          'w-5 h-5',
          index < rating ? 'text-yellow-400 fill-current' : 'text-neutral-medium'
        )}
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const TestimonialCard = ({ testimonial, isActive = false }: { testimonial: Testimonial; isActive?: boolean }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const shouldTruncate = testimonial.testimonialText.length > 200;
    const displayText = !isExpanded && shouldTruncate
      ? `${testimonial.testimonialText.substring(0, 200)}...`
      : testimonial.testimonialText;

    return (
      <div
        className={clsx(
          'bg-white rounded-lg shadow-medium p-2 h-full w-full flex flex-col',
          variant === 'grid' && 'hover:shadow-large transition-shadow duration-300',
          variant === 'carousel' && isActive && 'ring-2 ring-accent-blue/50'
        )}
      >
        {/* Video Section */}
        {testimonial.videoUrl && (
          <div className="mb-6">
            {!showVideo ? (
              <div className="relative">
                <img
                  src={testimonial.customerPhoto}
                  alt={testimonial.customerName}
                  className="w-full h-48 object-cover rounded-lg"
                  loading="lazy"
                />
                <button
                  onClick={() => setShowVideo(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg hover:bg-black/60 transition-colors"
                  aria-label={content.playVideo}
                >
                  <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </button>
              </div>
            ) : (
              <video
                controls
                autoPlay
                className="w-full h-48 rounded-lg"
                poster={testimonial.customerPhoto}
              >
                <source src={testimonial.videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex" aria-label={content.starRating(testimonial.rating)}>
            {renderStars(testimonial.rating)}
          </div>
          <span className="sr-only">{content.starRating(testimonial.rating)}</span>
        </div>

        {/* Testimonial Text */}
        <blockquote className="text-neutral-dark mb-6 leading-relaxed flex-grow">
          <p>"{displayText}"</p>
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-accent-blue hover:text-navy-primary font-medium text-sm transition-colors"
            >
              {isExpanded ? content.readLess : content.readMore}
            </button>
          )}
        </blockquote>

        {/* Customer Info */}
        <div className="flex items-start space-x-4">
          {!testimonial.videoUrl && (
            <img
              src={testimonial.customerPhoto}
              alt={testimonial.customerName}
              className="w-16 h-16 rounded-full object-cover border-2 border-neutral-light"
              loading="lazy"
            />
          )}
          <div className="flex-1">
            <div className="font-semibold text-navy-primary">{testimonial.customerName}</div>
            <div className="text-sm text-accent-blue">{testimonial.customerTitle}</div>
            <div className="text-sm text-neutral-medium">{testimonial.customerCompany}</div>
            <div className="text-xs text-neutral-medium mt-1">
              {testimonial.customerLocation} • {testimonial.serviceUsed}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleCTAClick = () => {
    trackCTAClick('quote_button', content.cta.button, 'testimonials');
    onQuoteClick?.();
  };

  // Schema.org Review structured data
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Fly-Fleet",
    "review": displayTestimonials.map(testimonial => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": testimonial.customerName
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": testimonial.rating,
        "bestRating": 5
      },
      "reviewBody": testimonial.testimonialText,
      "datePublished": testimonial.dateOfService
    }))
  };

  if (variant === 'carousel') {
    return (
      <section className={clsx('testimonials', className)} aria-labelledby="testimonials-title">
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
        />

        <div
          ref={carouselRef}
          className="testimonials-carousel relative"
          role="region"
          aria-label="Customer testimonials"
        >
          {/* Screen reader announcements */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {announceText}
          </div>

          {/* Desktop: Three cards side by side */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-4 max-w-full xl:max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
              {displayTestimonials.map((testimonial, index) => (
                <article key={testimonial.id} className="testimonial-card flex">
                  <TestimonialCard testimonial={testimonial} isActive={false} />
                </article>
              ))}
            </div>
          </div>

          {/* Mobile: Single carousel */}
          <div className="md:hidden">
            <div className="carousel-container overflow-hidden max-w-sm mx-auto" aria-live="polite">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {displayTestimonials.map((testimonial, index) => (
                  <article
                    key={testimonial.id}
                    className={clsx(
                      'testimonial-card w-full flex-shrink-0 px-2',
                      index === activeIndex ? 'active' : ''
                    )}
                    aria-hidden={index !== activeIndex}
                  >
                    <TestimonialCard testimonial={testimonial} isActive={index === activeIndex} />
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Controls - Mobile Only */}
          <div className="carousel-controls md:hidden" role="group" aria-label="Testimonial navigation">
            {displayTestimonials.length > 1 && (
              <>
                <button
                  className="carousel-prev absolute left-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-large hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  onClick={() => {
                    const newIndex = (activeIndex - 1 + displayTestimonials.length) % displayTestimonials.length;
                    setActiveIndex(newIndex);
                    setAnnounceText(`Showing testimonial ${newIndex + 1} of ${displayTestimonials.length}`);
                  }}
                  aria-label={content.prevTestimonial}
                >
                  <span aria-hidden="true">‹</span>
                </button>

                <button
                  className="carousel-next absolute right-2 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-3 shadow-large hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  onClick={() => {
                    const newIndex = (activeIndex + 1) % displayTestimonials.length;
                    setActiveIndex(newIndex);
                    setAnnounceText(`Showing testimonial ${newIndex + 1} of ${displayTestimonials.length}`);
                  }}
                  aria-label={content.nextTestimonial}
                >
                  <span aria-hidden="true">›</span>
                </button>

                {/* Auto-play Control */}
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="absolute top-4 right-4 bg-white/90 rounded-full p-2 shadow-medium hover:shadow-large transition-shadow focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  aria-label={isAutoPlaying ? content.pauseCarousel : content.playCarousel}
                >
                  {isAutoPlaying ? (
                    <svg className="w-4 h-4 text-navy-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM11 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-navy-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  )}
                </button>

                {/* Dots Indicator */}
                <div className="carousel-indicators flex justify-center mt-6 space-x-2" role="tablist" aria-label="Choose testimonial">
                  {displayTestimonials.map((_, index) => (
                    <button
                      key={index}
                      role="tab"
                      className={clsx(
                        'indicator w-3 h-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
                        index === activeIndex ? 'bg-accent-blue active' : 'bg-neutral-medium/30 hover:bg-neutral-medium/50'
                      )}
                      aria-selected={index === activeIndex}
                      aria-label={`Go to testimonial ${index + 1}`}
                      onClick={() => {
                        setActiveIndex(index);
                        setAnnounceText(`Showing testimonial ${index + 1} of ${displayTestimonials.length}`);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {showCTA && (
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-navy-primary mb-4">
              {content.cta.title}
            </h3>
            <p className="text-lg text-neutral-medium mb-8">
              {content.cta.subtitle}
            </p>
            <Button
              onClick={handleCTAClick}
              size="lg"
              className="bg-accent-blue hover:bg-accent-blue/90 text-white"
            >
              {content.cta.button}
            </Button>
          </div>
        )}
      </section>
    );
  }

  // Grid variant
  return (
    <section className={clsx('testimonials', className)} aria-labelledby="testimonials-title">
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />

      <div className="testimonials-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="All testimonials">
        {displayTestimonials.map((testimonial) => (
          <article className="testimonial-summary" role="listitem" key={testimonial.id}>
            <TestimonialCard testimonial={testimonial} />
          </article>
        ))}
      </div>

      {/* CTA Section */}
      {showCTA && (
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-navy-primary mb-4">
            {content.cta.title}
          </h3>
          <p className="text-lg text-neutral-medium mb-8">
            {content.cta.subtitle}
          </p>
          <Button
            onClick={handleCTAClick}
            size="lg"
            className="bg-accent-blue hover:bg-accent-blue/90 text-white"
          >
            {content.cta.button}
          </Button>
        </div>
      )}
    </section>
  );
}