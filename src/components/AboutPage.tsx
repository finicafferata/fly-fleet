'use client';

import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { trackCTAClick } from '../lib/analytics/accessibleTracking';

interface AboutPageProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onContactClick?: () => void;
  onQuoteClick?: () => void;
}

interface StatCounter {
  id: string;
  value: number;
  suffix: string;
  label: string;
}

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
}

interface Certification {
  name: string;
  description: string;
  icon: string;
  issued: string;
}

export function AboutPage({
  locale = 'en',
  className,
  onContactClick,
  onQuoteClick
}: AboutPageProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counters, setCounters] = useState<StatCounter[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  const getContent = (locale: string) => {
    const content = {
      en: {
        title: 'About Fly-Fleet',
        subtitle: 'Excellence in Private Aviation Since 2020',
        story: {
          title: 'Our Story',
          content: 'Founded with a vision to revolutionize private aviation in Latin America, Fly-Fleet combines cutting-edge technology with unparalleled service excellence. We understand that every flight is more than transportation—it\'s about connecting people, enabling business, and creating exceptional experiences.',
          mission: 'Our mission is to provide seamless, safe, and luxurious private aviation solutions while maintaining the highest standards of service and reliability.',
          vision: 'To become the leading private jet charter brokerage in Latin America, setting new standards for excellence in aviation services.'
        },
        stats: [
          { id: 'flights', value: 2500, suffix: '+', label: 'Successful Flights' },
          { id: 'clients', value: 850, suffix: '+', label: 'Satisfied Clients' },
          { id: 'destinations', value: 120, suffix: '+', label: 'Destinations Served' },
          { id: 'experience', value: 15, suffix: ' Years', label: 'Combined Experience' }
        ],
        team: {
          title: 'Our Leadership Team',
          subtitle: 'Industry experts dedicated to your journey',
          members: [
            {
              name: 'Carlos Rodriguez',
              role: 'CEO & Founder',
              bio: 'With over 15 years in aviation, Carlos brings extensive experience in aircraft operations and luxury travel services.',
              image: '/images/team/carlos-rodriguez.jpg',
              linkedin: 'https://linkedin.com/in/carlos-rodriguez'
            },
            {
              name: 'Maria Gonzalez',
              role: 'Head of Operations',
              bio: 'Maria ensures every flight meets our exacting standards, coordinating complex logistics with precision and care.',
              image: '/images/team/maria-gonzalez.jpg',
              linkedin: 'https://linkedin.com/in/maria-gonzalez'
            },
            {
              name: 'Roberto Silva',
              role: 'Safety Director',
              bio: 'Roberto oversees all safety protocols and compliance, ensuring every journey exceeds international aviation standards.',
              image: '/images/team/roberto-silva.jpg',
              linkedin: 'https://linkedin.com/in/roberto-silva'
            }
          ]
        },
        certifications: {
          title: 'Certifications & Partnerships',
          subtitle: 'Maintaining the highest industry standards',
          items: [
            {
              name: 'IATA Certified',
              description: 'International Air Transport Association certified agent',
              icon: '🏆',
              issued: '2021'
            },
            {
              name: 'WYVERN Wingman',
              description: 'Safety management system certification',
              icon: '🛡️',
              issued: '2022'
            },
            {
              name: 'ARG/US Registered',
              description: 'Audited and registered aviation operator',
              icon: '✈️',
              issued: '2020'
            },
            {
              name: 'IS-BAO Compliant',
              description: 'International Standard for Business Aircraft Operations',
              icon: '⭐',
              issued: '2023'
            }
          ]
        },
        cta: {
          title: 'Ready to Experience Excellence?',
          subtitle: 'Join hundreds of satisfied clients who trust Fly-Fleet for their private aviation needs',
          primaryButton: 'Get Your Quote',
          secondaryButton: 'Contact Us'
        }
      },
      es: {
        title: 'Acerca de Fly-Fleet',
        subtitle: 'Excelencia en Aviación Privada desde 2020',
        story: {
          title: 'Nuestra Historia',
          content: 'Fundada con la visión de revolucionar la aviación privada en América Latina, Fly-Fleet combina tecnología de vanguardia con excelencia en el servicio. Entendemos que cada vuelo es más que transporte: se trata de conectar personas, facilitar negocios y crear experiencias excepcionales.',
          mission: 'Nuestra misión es proporcionar soluciones de aviación privada fluidas, seguras y lujosas manteniendo los más altos estándares de servicio y confiabilidad.',
          vision: 'Convertirnos en el bróker líder de chárteres de jets privados en América Latina, estableciendo nuevos estándares de excelencia en servicios de aviación.'
        },
        stats: [
          { id: 'flights', value: 2500, suffix: '+', label: 'Vuelos Exitosos' },
          { id: 'clients', value: 850, suffix: '+', label: 'Clientes Satisfechos' },
          { id: 'destinations', value: 120, suffix: '+', label: 'Destinos Servidos' },
          { id: 'experience', value: 15, suffix: ' Años', label: 'Experiencia Combinada' }
        ],
        team: {
          title: 'Nuestro Equipo Directivo',
          subtitle: 'Expertos de la industria dedicados a tu viaje',
          members: [
            {
              name: 'Carlos Rodriguez',
              role: 'CEO y Fundador',
              bio: 'Con más de 15 años en aviación, Carlos aporta amplia experiencia en operaciones de aeronaves y servicios de viajes de lujo.',
              image: '/images/team/carlos-rodriguez.jpg',
              linkedin: 'https://linkedin.com/in/carlos-rodriguez'
            },
            {
              name: 'Maria Gonzalez',
              role: 'Jefa de Operaciones',
              bio: 'Maria asegura que cada vuelo cumpla nuestros estándares exigentes, coordinando logística compleja con precisión y cuidado.',
              image: '/images/team/maria-gonzalez.jpg',
              linkedin: 'https://linkedin.com/in/maria-gonzalez'
            },
            {
              name: 'Roberto Silva',
              role: 'Director de Seguridad',
              bio: 'Roberto supervisa todos los protocolos de seguridad y cumplimiento, asegurando que cada viaje supere los estándares internacionales de aviación.',
              image: '/images/team/roberto-silva.jpg',
              linkedin: 'https://linkedin.com/in/roberto-silva'
            }
          ]
        },
        certifications: {
          title: 'Certificaciones y Alianzas',
          subtitle: 'Manteniendo los más altos estándares de la industria',
          items: [
            {
              name: 'Certificado IATA',
              description: 'Agente certificado por la Asociación Internacional de Transporte Aéreo',
              icon: '🏆',
              issued: '2021'
            },
            {
              name: 'WYVERN Wingman',
              description: 'Certificación del sistema de gestión de seguridad',
              icon: '🛡️',
              issued: '2022'
            },
            {
              name: 'Registrado ARG/US',
              description: 'Operador de aviación auditado y registrado',
              icon: '✈️',
              issued: '2020'
            },
            {
              name: 'Cumple IS-BAO',
              description: 'Estándar Internacional para Operaciones de Aeronaves de Negocios',
              icon: '⭐',
              issued: '2023'
            }
          ]
        },
        cta: {
          title: '¿Listo para Experimentar la Excelencia?',
          subtitle: 'Únete a cientos de clientes satisfechos que confían en Fly-Fleet para sus necesidades de aviación privada',
          primaryButton: 'Obtener Cotización',
          secondaryButton: 'Contáctanos'
        }
      },
      pt: {
        title: 'Sobre a Fly-Fleet',
        subtitle: 'Excelência em Aviação Privada desde 2020',
        story: {
          title: 'Nossa História',
          content: 'Fundada com a visão de revolucionar a aviação privada na América Latina, a Fly-Fleet combina tecnologia de ponta com excelência de serviço incomparável. Entendemos que cada voo é mais que transporte—é sobre conectar pessoas, possibilitar negócios e criar experiências excepcionais.',
          mission: 'Nossa missão é fornecer soluções de aviação privada fluidas, seguras e luxuosas mantendo os mais altos padrões de serviço e confiabilidade.',
          vision: 'Tornar-se o corretor líder de fretamento de jatos privados na América Latina, estabelecendo novos padrões de excelência em serviços de aviação.'
        },
        stats: [
          { id: 'flights', value: 2500, suffix: '+', label: 'Voos Bem-sucedidos' },
          { id: 'clients', value: 850, suffix: '+', label: 'Clientes Satisfeitos' },
          { id: 'destinations', value: 120, suffix: '+', label: 'Destinos Atendidos' },
          { id: 'experience', value: 15, suffix: ' Anos', label: 'Experiência Combinada' }
        ],
        team: {
          title: 'Nossa Equipe de Liderança',
          subtitle: 'Especialistas da indústria dedicados à sua jornada',
          members: [
            {
              name: 'Carlos Rodriguez',
              role: 'CEO e Fundador',
              bio: 'Com mais de 15 anos em aviação, Carlos traz vasta experiência em operações de aeronaves e serviços de viagens de luxo.',
              image: '/images/team/carlos-rodriguez.jpg',
              linkedin: 'https://linkedin.com/in/carlos-rodriguez'
            },
            {
              name: 'Maria Gonzalez',
              role: 'Chefe de Operações',
              bio: 'Maria garante que cada voo atenda nossos padrões exigentes, coordenando logística complexa com precisão e cuidado.',
              image: '/images/team/maria-gonzalez.jpg',
              linkedin: 'https://linkedin.com/in/maria-gonzalez'
            },
            {
              name: 'Roberto Silva',
              role: 'Diretor de Segurança',
              bio: 'Roberto supervisiona todos os protocolos de segurança e conformidade, garantindo que cada viagem supere os padrões internacionais de aviação.',
              image: '/images/team/roberto-silva.jpg',
              linkedin: 'https://linkedin.com/in/roberto-silva'
            }
          ]
        },
        certifications: {
          title: 'Certificações e Parcerias',
          subtitle: 'Mantendo os mais altos padrões da indústria',
          items: [
            {
              name: 'Certificado IATA',
              description: 'Agente certificado pela Associação Internacional de Transporte Aéreo',
              icon: '🏆',
              issued: '2021'
            },
            {
              name: 'WYVERN Wingman',
              description: 'Certificação do sistema de gestão de segurança',
              icon: '🛡️',
              issued: '2022'
            },
            {
              name: 'Registrado ARG/US',
              description: 'Operador de aviação auditado e registrado',
              icon: '✈️',
              issued: '2020'
            },
            {
              name: 'Conforme IS-BAO',
              description: 'Padrão Internacional para Operações de Aeronaves de Negócios',
              icon: '⭐',
              issued: '2023'
            }
          ]
        },
        cta: {
          title: 'Pronto para Experimentar a Excelência?',
          subtitle: 'Junte-se a centenas de clientes satisfeitos que confiam na Fly-Fleet para suas necessidades de aviação privada',
          primaryButton: 'Obter Cotação',
          secondaryButton: 'Entre em Contato'
        }
      }
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = getContent(locale);

  // Animated counter effect
  const animateCounters = (stats: StatCounter[]) => {
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 frames
    const increment = duration / steps;

    stats.forEach((stat, index) => {
      let current = 0;
      const target = stat.value;
      const step = target / steps;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }

        setCounters(prev =>
          prev.map((counter, i) =>
            i === index ? { ...counter, value: Math.floor(current) } : counter
          )
        );
      }, increment);
    });
  };

  // Initialize counters with zero values
  useEffect(() => {
    const initialCounters = content.stats.map(stat => ({
      ...stat,
      value: 0
    }));
    setCounters(initialCounters);
  }, [content.stats]);

  // Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            animateCounters(content.stats);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, content.stats]);

  const handlePrimaryClick = () => {
    trackCTAClick('quote_button', content.cta.primaryButton, 'about_page');
    onQuoteClick?.();
  };

  const handleSecondaryClick = () => {
    trackCTAClick('contact_button', content.cta.secondaryButton, 'about_page');
    onContactClick?.();
  };

  return (
    <main role="main" aria-labelledby="about-title" className={clsx('about-page', className)}>
      {/* Hero Section */}
      <header className="page-header bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 id="about-title" className="text-4xl md:text-6xl font-bold mb-6">
              {content.title}
            </h1>
            <p className="page-subtitle text-xl md:text-2xl text-neutral-light max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Company Story Section */}
      <section aria-labelledby="story-heading" className="company-story py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="story-content">
              <h2 id="story-heading" className="text-3xl md:text-4xl font-bold text-navy-primary mb-6">
                {content.story.title}
              </h2>
              <p className="text-lg text-neutral-dark mb-6 leading-relaxed">
                {content.story.content}
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-accent-blue pl-6">
                  <h3 className="font-semibold text-navy-primary mb-2">Mission</h3>
                  <p className="text-neutral-medium">{content.story.mission}</p>
                </div>
                <div className="border-l-4 border-accent-blue pl-6">
                  <h3 className="font-semibold text-navy-primary mb-2">Vision</h3>
                  <p className="text-neutral-medium">{content.story.vision}</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/images/about/company-story.jpg"
                alt="Fly-Fleet private jet on tarmac"
                className="rounded-lg shadow-xl w-full h-96 object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-navy-primary/20 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section ref={statsRef} aria-labelledby="stats-heading" className="statistics py-20 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="stats-heading" className="text-3xl md:text-4xl font-bold text-navy-primary mb-4">
              Our Track Record
            </h2>
            <p className="text-lg text-neutral-medium max-w-2xl mx-auto">
              Our track record speaks for itself. These numbers represent our commitment to excellence.
            </p>
          </div>
          <div className="stats-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
            {counters.map((stat, index) => (
              <div
                key={stat.id}
                className="stat-item bg-white rounded-lg p-8 text-center shadow-medium hover:shadow-large transition-shadow duration-300"
                role="listitem"
              >
                <span className="stat-number text-4xl md:text-5xl font-bold text-accent-blue mb-2 block" aria-label={`${stat.value.toLocaleString()}${stat.suffix} ${stat.label}`}>
                  {stat.value.toLocaleString()}{stat.suffix}
                </span>
                <span className="stat-label text-lg font-semibold text-navy-primary">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section aria-labelledby="team-heading" className="team-section py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="team-heading" className="text-3xl md:text-4xl font-bold text-navy-primary mb-4">
              {content.team.title}
            </h2>
            <p className="text-lg text-neutral-medium max-w-2xl mx-auto">
              {content.team.subtitle}
            </p>
          </div>
          <div className="team-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12" role="list">
            {content.team.members.map((member, index) => (
              <article
                key={index}
                className="team-member bg-neutral-light rounded-lg p-8 text-center hover:shadow-large transition-shadow duration-300"
                role="listitem"
              >
                <img
                  src={member.image}
                  alt={`${member.name}, ${member.role}`}
                  className="member-photo w-32 h-32 rounded-full mx-auto mb-6 object-cover border-4 border-white shadow-medium"
                  loading="lazy"
                />
                <h3 className="text-xl font-bold text-navy-primary mb-2">
                  {member.name}
                </h3>
                <p className="member-title text-accent-blue font-semibold mb-4">
                  {member.role}
                </p>
                <p className="member-bio text-neutral-medium leading-relaxed mb-6">
                  {member.bio}
                </p>
                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-accent-blue hover:text-navy-primary transition-colors duration-200"
                    aria-label={`View ${member.name}'s LinkedIn profile`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section aria-labelledby="certifications-heading" className="certifications py-20 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="certifications-heading" className="text-3xl md:text-4xl font-bold text-navy-primary mb-4">
              {content.certifications.title}
            </h2>
            <p className="text-lg text-neutral-medium max-w-2xl mx-auto">
              {content.certifications.subtitle}
            </p>
          </div>
          <div className="cert-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="list">
            {content.certifications.items.map((cert, index) => (
              <div
                key={index}
                className="cert-card bg-white rounded-lg p-6 text-center hover:shadow-large transition-shadow duration-300"
                role="listitem"
              >
                <img
                  src={`/images/certifications/${cert.name.toLowerCase().replace(/[\s/]/g, '-')}.png`}
                  alt={`${cert.name} certification badge`}
                  className="cert-badge text-4xl mb-4 mx-auto w-16 h-16 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const iconDiv = target.nextElementSibling as HTMLDivElement;
                    if (iconDiv) iconDiv.style.display = 'block';
                  }}
                />
                <div className="text-4xl mb-4" style={{display: 'none'}}>{cert.icon}</div>
                <h3 className="text-lg font-bold text-navy-primary mb-2">
                  {cert.name}
                </h3>
                <p className="text-neutral-medium text-sm mb-3 leading-relaxed">
                  {cert.description}
                </p>
                <div className="text-xs text-accent-blue font-semibold">
                  Since {cert.issued}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-navy-primary to-accent-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-10 text-neutral-light">
            {content.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handlePrimaryClick}
              size="lg"
              className="bg-white text-navy-primary hover:bg-neutral-light transition-colors duration-200"
            >
              {content.cta.primaryButton}
            </Button>
            <Button
              onClick={handleSecondaryClick}
              variant="secondary"
              size="lg"
              className="border-white text-white hover:bg-white/10 transition-colors duration-200"
            >
              {content.cta.secondaryButton}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}