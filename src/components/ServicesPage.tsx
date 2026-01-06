'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { Button } from './ui/Button';
import { trackCTAClick } from '../lib/analytics/accessibleTracking';

interface ServicesPageProps {
  locale?: 'en' | 'es' | 'pt';
  className?: string;
  onQuoteClick?: (serviceType?: string) => void;
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  aircraftTypes: string[];
  routes: RouteExample[];
  pricing: PricingRange;
}

interface RouteExample {
  from: string;
  to: string;
  duration: string;
  priceRange: string;
}

interface PricingRange {
  from: number;
  to: number;
  currency: string;
  unit: string;
}

interface AircraftType {
  category: string;
  name: string;
  capacity: string;
  range: string;
  speed: string;
  image: string;
  description: string;
}

interface AdditionalService {
  id: string;
  name: string;
  description: string;
  icon: string;
  availability: string;
}

export function ServicesPage({
  locale = 'en',
  className,
  onQuoteClick
}: ServicesPageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('charter');

  const getContent = (locale: string) => {
    const content = {
      en: {
        title: 'Our Services',
        subtitle: 'Comprehensive private aviation solutions tailored to your needs',
        categories: [
          {
            id: 'charter',
            name: 'Private Charter',
            description: 'Exclusive private flights with complete flexibility and luxury',
            icon: '✈️',
            features: [
              'Flexible scheduling',
              'Premium aircraft selection',
              'Dedicated flight crew',
              'Customized catering',
              'Ground transportation',
              'Concierge services'
            ],
            aircraftTypes: ['Light Jets', 'Midsize Jets', 'Heavy Jets', 'Ultra Long Range'],
            routes: [
              { from: 'Buenos Aires', to: 'São Paulo', duration: '2h 15m', priceRange: '$8,000 - $15,000' },
              { from: 'Mexico City', to: 'Miami', duration: '3h 30m', priceRange: '$12,000 - $25,000' },
              { from: 'Santiago', to: 'Lima', duration: '2h 45m', priceRange: '$9,000 - $18,000' }
            ],
            pricing: { from: 3000, to: 50000, currency: 'USD', unit: 'per flight' }
          },
          {
            id: 'multicity',
            name: 'Multi-City Tours',
            description: 'Complex itineraries with multiple destinations',
            icon: '🗺️',
            features: [
              'Complex routing',
              'Multiple destinations',
              'Coordinated logistics',
              'Flexible scheduling',
              'Ground arrangements',
              'Dedicated coordinator'
            ],
            aircraftTypes: ['Midsize Jets', 'Heavy Jets', 'Ultra Long Range'],
            routes: [
              { from: 'Buenos Aires', to: 'Multiple Cities', duration: 'Custom', priceRange: '$25,000 - $100,000' },
              { from: 'São Paulo', to: 'Regional Tour', duration: 'Custom', priceRange: '$20,000 - $80,000' },
              { from: 'Miami', to: 'Latin America Tour', duration: 'Custom', priceRange: '$35,000 - $150,000' }
            ],
            pricing: { from: 20000, to: 200000, currency: 'USD', unit: 'per tour' }
          },
          {
            id: 'helicopter',
            name: 'Helicopter Services',
            description: 'Short-range flights and specialized helicopter operations',
            icon: '🚁',
            features: [
              'Urban transfers',
              'Scenic tours',
              'Emergency medical',
              'Offshore operations',
              'Film production',
              'Special events'
            ],
            aircraftTypes: ['Light Helicopters', 'Medium Helicopters', 'Heavy Helicopters'],
            routes: [
              { from: 'Airport', to: 'City Center', duration: '15m', priceRange: '$500 - $1,500' },
              { from: 'Buenos Aires', to: 'Tigre Delta', duration: '45m', priceRange: '$800 - $2,000' },
              { from: 'São Paulo', to: 'Santos', duration: '30m', priceRange: '$600 - $1,800' }
            ],
            pricing: { from: 500, to: 5000, currency: 'USD', unit: 'per hour' }
          },
          {
            id: 'medical',
            name: 'Medical Transport',
            description: 'Specialized medical evacuation and transport services',
            icon: '🏥',
            features: [
              'Medical equipment',
              'Trained medical crew',
              'Emergency response',
              'Hospital coordination',
              'Insurance liaison',
              '24/7 availability'
            ],
            aircraftTypes: ['Air Ambulance', 'Medical Jets', 'ICU-equipped Aircraft'],
            routes: [
              { from: 'Regional Hospital', to: 'Major Medical Center', duration: 'Variable', priceRange: '$15,000 - $50,000' },
              { from: 'Remote Location', to: 'Trauma Center', duration: 'Emergency', priceRange: '$20,000 - $75,000' },
              { from: 'International', to: 'Home Country', duration: 'Long Range', priceRange: '$50,000 - $200,000' }
            ],
            pricing: { from: 15000, to: 200000, currency: 'USD', unit: 'per mission' }
          },
          {
            id: 'cargo',
            name: 'Cargo Operations',
            description: 'Specialized cargo and freight transportation',
            icon: '📦',
            features: [
              'Time-sensitive cargo',
              'Oversized items',
              'Dangerous goods',
              'Temperature control',
              'Secure transport',
              'Custom clearance'
            ],
            aircraftTypes: ['Cargo Jets', 'Freighter Aircraft', 'Combi Aircraft'],
            routes: [
              { from: 'Manufacturing Hub', to: 'Distribution Center', duration: 'Same Day', priceRange: '$5,000 - $25,000' },
              { from: 'Export Port', to: 'International Market', duration: 'Next Day', priceRange: '$10,000 - $50,000' },
              { from: 'Emergency Supply', to: 'Disaster Zone', duration: 'Immediate', priceRange: '$15,000 - $75,000' }
            ],
            pricing: { from: 5000, to: 100000, currency: 'USD', unit: 'per shipment' }
          }
        ],
        aircraftFleet: {
          title: 'Our Aircraft Fleet',
          subtitle: 'World-class aircraft for every mission',
          categories: [
            {
              category: 'Light Jets',
              name: 'Citation CJ3+',
              capacity: '6-8 passengers',
              range: '2,040 nm',
              speed: '478 mph',
              image: '/images/aircrafts/light_jets/CJ 2.pdf',
              description: 'Perfect for short to medium-range flights with exceptional efficiency'
            },
            {
              category: 'Midsize Jets',
              name: 'Hawker 850XP',
              capacity: '8-9 passengers',
              range: '2,642 nm',
              speed: '447 mph',
              image: '/images/aircrafts/medium_jets/Sovereing.pdf',
              description: 'Ideal balance of range, comfort, and performance for business travel'
            },
            {
              category: 'Heavy Jets',
              name: 'Falcon 7X',
              capacity: '12-16 passengers',
              range: '5,950 nm',
              speed: '559 mph',
              image: '/images/aircrafts/heavy_jets/Falcón 900.pdf',
              description: 'Long-range luxury with spacious cabin and advanced avionics'
            },
            {
              category: 'Ultra Long Range',
              name: 'Gulfstream G650',
              capacity: '14-19 passengers',
              range: '7,000 nm',
              speed: '610 mph',
              image: '/images/aircrafts/heavy_jets/Gulfstream 550.pdf',
              description: 'The pinnacle of private aviation with unmatched range and luxury'
            }
          ]
        },
        additionalServices: {
          title: 'Additional Services',
          subtitle: 'Comprehensive support for your journey',
          services: [
            {
              id: 'international_support',
              name: 'International Flight Support',
              description: 'Complete handling of international flight requirements, permits, and documentation',
              icon: '🌍',
              availability: 'Worldwide'
            },
            {
              id: 'country_documentation',
              name: 'Country Documentation',
              description: 'Visa assistance, customs documentation, and country-specific requirements',
              icon: '📋',
              availability: '195+ Countries'
            },
            {
              id: 'pet_friendly_transport',
              name: 'Pet-Friendly Transport',
              description: 'Safe and comfortable pet transportation with all necessary documentation',
              icon: '🐕',
              availability: 'Most Destinations'
            },
            {
              id: 'ground_transfer_driver',
              name: 'Ground Transportation',
              description: 'Luxury ground transportation coordinated with your flight schedule',
              icon: '🚗',
              availability: 'Major Cities'
            },
            {
              id: 'premium_catering',
              name: 'Premium Catering',
              description: 'Gourmet meals and beverages customized to your preferences',
              icon: '🍽️',
              availability: 'All Flights'
            },
            {
              id: 'vip_lounge_fbo',
              name: 'VIP Lounge Access',
              description: 'Access to exclusive FBO lounges and private terminals',
              icon: '👑',
              availability: 'Premium Airports'
            },
            {
              id: 'customs_immigration_assist',
              name: 'Customs & Immigration',
              description: 'Expedited customs and immigration processing assistance',
              icon: '🛂',
              availability: 'Select Airports'
            }
          ]
        },
        cta: {
          title: 'Ready to Book Your Flight?',
          subtitle: 'Get a personalized quote for any of our services',
          button: 'Request Quote'
        }
      },
      es: {
        title: 'Nuestros Servicios',
        subtitle: 'Soluciones integrales de aviación privada adaptadas a tus necesidades',
        categories: [
          {
            id: 'charter',
            name: 'Charter Privado',
            description: 'Vuelos privados exclusivos con total flexibilidad y lujo',
            icon: '✈️',
            features: [
              'Horarios flexibles',
              'Selección premium de aeronaves',
              'Tripulación dedicada',
              'Catering personalizado',
              'Transporte terrestre',
              'Servicios de conserjería'
            ],
            aircraftTypes: ['Jets Ligeros', 'Jets Medianos', 'Jets Pesados', 'Ultra Largo Alcance'],
            routes: [
              { from: 'Buenos Aires', to: 'São Paulo', duration: '2h 15m', priceRange: '$8,000 - $15,000' },
              { from: 'Ciudad de México', to: 'Miami', duration: '3h 30m', priceRange: '$12,000 - $25,000' },
              { from: 'Santiago', to: 'Lima', duration: '2h 45m', priceRange: '$9,000 - $18,000' }
            ],
            pricing: { from: 3000, to: 50000, currency: 'USD', unit: 'por vuelo' }
          },
          {
            id: 'multicity',
            name: 'Tours Multi-Ciudad',
            description: 'Itinerarios complejos con múltiples destinos',
            icon: '🗺️',
            features: [
              'Rutas complejas',
              'Múltiples destinos',
              'Logística coordinada',
              'Horarios flexibles',
              'Arreglos terrestres',
              'Coordinador dedicado'
            ],
            aircraftTypes: ['Jets Medianos', 'Jets Pesados', 'Ultra Largo Alcance'],
            routes: [
              { from: 'Buenos Aires', to: 'Múltiples Ciudades', duration: 'Personalizado', priceRange: '$25,000 - $100,000' },
              { from: 'São Paulo', to: 'Tour Regional', duration: 'Personalizado', priceRange: '$20,000 - $80,000' },
              { from: 'Miami', to: 'Tour Latinoamérica', duration: 'Personalizado', priceRange: '$35,000 - $150,000' }
            ],
            pricing: { from: 20000, to: 200000, currency: 'USD', unit: 'por tour' }
          },
          {
            id: 'helicopter',
            name: 'Servicios de Helicóptero',
            description: 'Vuelos de corto alcance y operaciones especializadas de helicóptero',
            icon: '🚁',
            features: [
              'Traslados urbanos',
              'Tours panorámicos',
              'Emergencias médicas',
              'Operaciones offshore',
              'Producción cinematográfica',
              'Eventos especiales'
            ],
            aircraftTypes: ['Helicópteros Ligeros', 'Helicópteros Medianos', 'Helicópteros Pesados'],
            routes: [
              { from: 'Aeropuerto', to: 'Centro Ciudad', duration: '15m', priceRange: '$500 - $1,500' },
              { from: 'Buenos Aires', to: 'Delta Tigre', duration: '45m', priceRange: '$800 - $2,000' },
              { from: 'São Paulo', to: 'Santos', duration: '30m', priceRange: '$600 - $1,800' }
            ],
            pricing: { from: 500, to: 5000, currency: 'USD', unit: 'por hora' }
          },
          {
            id: 'medical',
            name: 'Transporte Médico',
            description: 'Servicios especializados de evacuación y transporte médico',
            icon: '🏥',
            features: [
              'Equipamiento médico',
              'Tripulación médica entrenada',
              'Respuesta de emergencia',
              'Coordinación hospitalaria',
              'Enlace con seguros',
              'Disponibilidad 24/7'
            ],
            aircraftTypes: ['Ambulancia Aérea', 'Jets Médicos', 'Aeronaves UCI'],
            routes: [
              { from: 'Hospital Regional', to: 'Centro Médico Mayor', duration: 'Variable', priceRange: '$15,000 - $50,000' },
              { from: 'Ubicación Remota', to: 'Centro Trauma', duration: 'Emergencia', priceRange: '$20,000 - $75,000' },
              { from: 'Internacional', to: 'País Origen', duration: 'Largo Alcance', priceRange: '$50,000 - $200,000' }
            ],
            pricing: { from: 15000, to: 200000, currency: 'USD', unit: 'por misión' }
          },
          {
            id: 'cargo',
            name: 'Operaciones de Carga',
            description: 'Transporte especializado de carga y mercancías',
            icon: '📦',
            features: [
              'Carga urgente',
              'Artículos sobredimensionados',
              'Mercancías peligrosas',
              'Control de temperatura',
              'Transporte seguro',
              'Despacho aduanero'
            ],
            aircraftTypes: ['Jets Cargo', 'Aeronaves Cargueras', 'Aeronaves Combi'],
            routes: [
              { from: 'Centro Manufactura', to: 'Centro Distribución', duration: 'Mismo Día', priceRange: '$5,000 - $25,000' },
              { from: 'Puerto Exportación', to: 'Mercado Internacional', duration: 'Día Siguiente', priceRange: '$10,000 - $50,000' },
              { from: 'Suministro Emergencia', to: 'Zona Desastre', duration: 'Inmediato', priceRange: '$15,000 - $75,000' }
            ],
            pricing: { from: 5000, to: 100000, currency: 'USD', unit: 'por envío' }
          }
        ],
        aircraftFleet: {
          title: 'Nuestra Flota',
          subtitle: 'Aeronaves de clase mundial para cada misión',
          categories: [
            {
              category: 'Jets Ligeros',
              name: 'Citation CJ3+',
              capacity: '6-8 pasajeros',
              range: '2,040 mn',
              speed: '478 mph',
              image: '/images/aircrafts/light_jets/CJ 2.pdf',
              description: 'Perfecto para vuelos de corto a mediano alcance con eficiencia excepcional'
            },
            {
              category: 'Jets Medianos',
              name: 'Hawker 850XP',
              capacity: '8-9 pasajeros',
              range: '2,642 mn',
              speed: '447 mph',
              image: '/images/aircrafts/medium_jets/Sovereing.pdf',
              description: 'Balance ideal de alcance, comodidad y rendimiento para viajes de negocios'
            },
            {
              category: 'Jets Pesados',
              name: 'Falcon 7X',
              capacity: '12-16 pasajeros',
              range: '5,950 mn',
              speed: '559 mph',
              image: '/images/aircrafts/heavy_jets/Falcón 900.pdf',
              description: 'Lujo de largo alcance con cabina espaciosa y aviónica avanzada'
            },
            {
              category: 'Ultra Largo Alcance',
              name: 'Gulfstream G650',
              capacity: '14-19 pasajeros',
              range: '7,000 mn',
              speed: '610 mph',
              image: '/images/aircrafts/heavy_jets/Gulfstream 550.pdf',
              description: 'El pináculo de la aviación privada con alcance y lujo incomparables'
            }
          ]
        },
        additionalServices: {
          title: 'Servicios Adicionales',
          subtitle: 'Soporte integral para tu viaje',
          services: [
            {
              id: 'international_support',
              name: 'Apoyo Vuelos Internacionales',
              description: 'Manejo completo de requisitos de vuelos internacionales, permisos y documentación',
              icon: '🌍',
              availability: 'Mundial'
            },
            {
              id: 'country_documentation',
              name: 'Documentación por País',
              description: 'Asistencia con visas, documentación aduanera y requisitos específicos del país',
              icon: '📋',
              availability: '195+ Países'
            },
            {
              id: 'pet_friendly_transport',
              name: 'Transporte Pet-Friendly',
              description: 'Transporte seguro y cómodo de mascotas con toda la documentación necesaria',
              icon: '🐕',
              availability: 'Mayoría Destinos'
            },
            {
              id: 'ground_transfer_driver',
              name: 'Transporte Terrestre',
              description: 'Transporte terrestre de lujo coordinado con tu horario de vuelo',
              icon: '🚗',
              availability: 'Ciudades Principales'
            },
            {
              id: 'premium_catering',
              name: 'Catering Premium',
              description: 'Comidas gourmet y bebidas personalizadas según tus preferencias',
              icon: '🍽️',
              availability: 'Todos los Vuelos'
            },
            {
              id: 'vip_lounge_fbo',
              name: 'Acceso Sala VIP',
              description: 'Acceso a salas exclusivas FBO y terminales privadas',
              icon: '👑',
              availability: 'Aeropuertos Premium'
            },
            {
              id: 'customs_immigration_assist',
              name: 'Asistencia Aduana/Migración',
              description: 'Asistencia para procesamiento acelerado de aduana e inmigración',
              icon: '🛂',
              availability: 'Aeropuertos Selectos'
            }
          ]
        },
        cta: {
          title: '¿Listo para Reservar tu Vuelo?',
          subtitle: 'Obtén una cotización personalizada para cualquiera de nuestros servicios',
          button: 'Solicitar Cotización'
        }
      },
      pt: {
        title: 'Nossos Serviços',
        subtitle: 'Soluções abrangentes de aviação privada adaptadas às suas necessidades',
        categories: [
          {
            id: 'charter',
            name: 'Charter Privado',
            description: 'Voos privados exclusivos com flexibilidade total e luxo',
            icon: '✈️',
            features: [
              'Horários flexíveis',
              'Seleção premium de aeronaves',
              'Tripulação dedicada',
              'Catering personalizado',
              'Transporte terrestre',
              'Serviços de concierge'
            ],
            aircraftTypes: ['Jatos Leves', 'Jatos Médios', 'Jatos Pesados', 'Ultra Longo Alcance'],
            routes: [
              { from: 'Buenos Aires', to: 'São Paulo', duration: '2h 15m', priceRange: '$8,000 - $15,000' },
              { from: 'Cidade do México', to: 'Miami', duration: '3h 30m', priceRange: '$12,000 - $25,000' },
              { from: 'Santiago', to: 'Lima', duration: '2h 45m', priceRange: '$9,000 - $18,000' }
            ],
            pricing: { from: 3000, to: 50000, currency: 'USD', unit: 'por voo' }
          },
          {
            id: 'multicity',
            name: 'Tours Multi-Cidade',
            description: 'Itinerários complexos com múltiplos destinos',
            icon: '🗺️',
            features: [
              'Rotas complexas',
              'Múltiplos destinos',
              'Logística coordenada',
              'Horários flexíveis',
              'Arranjos terrestres',
              'Coordenador dedicado'
            ],
            aircraftTypes: ['Jatos Médios', 'Jatos Pesados', 'Ultra Longo Alcance'],
            routes: [
              { from: 'Buenos Aires', to: 'Múltiplas Cidades', duration: 'Personalizado', priceRange: '$25,000 - $100,000' },
              { from: 'São Paulo', to: 'Tour Regional', duration: 'Personalizado', priceRange: '$20,000 - $80,000' },
              { from: 'Miami', to: 'Tour América Latina', duration: 'Personalizado', priceRange: '$35,000 - $150,000' }
            ],
            pricing: { from: 20000, to: 200000, currency: 'USD', unit: 'por tour' }
          },
          {
            id: 'helicopter',
            name: 'Serviços de Helicóptero',
            description: 'Voos de curto alcance e operações especializadas de helicóptero',
            icon: '🚁',
            features: [
              'Transferências urbanas',
              'Tours panorâmicos',
              'Emergências médicas',
              'Operações offshore',
              'Produção cinematográfica',
              'Eventos especiais'
            ],
            aircraftTypes: ['Helicópteros Leves', 'Helicópteros Médios', 'Helicópteros Pesados'],
            routes: [
              { from: 'Aeroporto', to: 'Centro da Cidade', duration: '15m', priceRange: '$500 - $1,500' },
              { from: 'Buenos Aires', to: 'Delta do Tigre', duration: '45m', priceRange: '$800 - $2,000' },
              { from: 'São Paulo', to: 'Santos', duration: '30m', priceRange: '$600 - $1,800' }
            ],
            pricing: { from: 500, to: 5000, currency: 'USD', unit: 'por hora' }
          },
          {
            id: 'medical',
            name: 'Transporte Médico',
            description: 'Serviços especializados de evacuação e transporte médico',
            icon: '🏥',
            features: [
              'Equipamento médico',
              'Tripulação médica treinada',
              'Resposta de emergência',
              'Coordenação hospitalar',
              'Ligação com seguros',
              'Disponibilidade 24/7'
            ],
            aircraftTypes: ['Ambulância Aérea', 'Jatos Médicos', 'Aeronaves UTI'],
            routes: [
              { from: 'Hospital Regional', to: 'Centro Médico Principal', duration: 'Variável', priceRange: '$15,000 - $50,000' },
              { from: 'Local Remoto', to: 'Centro de Trauma', duration: 'Emergência', priceRange: '$20,000 - $75,000' },
              { from: 'Internacional', to: 'País de Origem', duration: 'Longo Alcance', priceRange: '$50,000 - $200,000' }
            ],
            pricing: { from: 15000, to: 200000, currency: 'USD', unit: 'por missão' }
          },
          {
            id: 'cargo',
            name: 'Operações de Carga',
            description: 'Transporte especializado de carga e mercadorias',
            icon: '📦',
            features: [
              'Carga urgente',
              'Itens grandes',
              'Mercadorias perigosas',
              'Controle de temperatura',
              'Transporte seguro',
              'Desembaraço aduaneiro'
            ],
            aircraftTypes: ['Jatos Cargo', 'Aeronaves Cargueiras', 'Aeronaves Combi'],
            routes: [
              { from: 'Centro de Manufatura', to: 'Centro de Distribuição', duration: 'Mesmo Dia', priceRange: '$5,000 - $25,000' },
              { from: 'Porto de Exportação', to: 'Mercado Internacional', duration: 'Próximo Dia', priceRange: '$10,000 - $50,000' },
              { from: 'Suprimento de Emergência', to: 'Zona de Desastre', duration: 'Imediato', priceRange: '$15,000 - $75,000' }
            ],
            pricing: { from: 5000, to: 100000, currency: 'USD', unit: 'por envio' }
          }
        ],
        aircraftFleet: {
          title: 'Nossa Frota',
          subtitle: 'Aeronaves de classe mundial para cada missão',
          categories: [
            {
              category: 'Jatos Leves',
              name: 'Citation CJ3+',
              capacity: '6-8 passageiros',
              range: '2,040 mn',
              speed: '478 mph',
              image: '/images/aircrafts/light_jets/CJ 2.pdf',
              description: 'Perfeito para voos de curto a médio alcance com eficiência excepcional'
            },
            {
              category: 'Jatos Médios',
              name: 'Hawker 850XP',
              capacity: '8-9 passageiros',
              range: '2,642 mn',
              speed: '447 mph',
              image: '/images/aircrafts/medium_jets/Sovereing.pdf',
              description: 'Equilíbrio ideal de alcance, conforto e desempenho para viagens de negócios'
            },
            {
              category: 'Jatos Pesados',
              name: 'Falcon 7X',
              capacity: '12-16 passageiros',
              range: '5,950 mn',
              speed: '559 mph',
              image: '/images/aircrafts/heavy_jets/Falcón 900.pdf',
              description: 'Luxo de longo alcance com cabine espaçosa e aviônicos avançados'
            },
            {
              category: 'Ultra Longo Alcance',
              name: 'Gulfstream G650',
              capacity: '14-19 passageiros',
              range: '7,000 mn',
              speed: '610 mph',
              image: '/images/aircrafts/heavy_jets/Gulfstream 550.pdf',
              description: 'O auge da aviação privada com alcance e luxo incomparáveis'
            }
          ]
        },
        additionalServices: {
          title: 'Serviços Adicionais',
          subtitle: 'Suporte abrangente para sua jornada',
          services: [
            {
              id: 'international_support',
              name: 'Suporte Voos Internacionais',
              description: 'Manuseio completo de requisitos de voos internacionais, licenças e documentação',
              icon: '🌍',
              availability: 'Mundial'
            },
            {
              id: 'country_documentation',
              name: 'Documentação por País',
              description: 'Assistência com vistos, documentação alfandegária e requisitos específicos do país',
              icon: '📋',
              availability: '195+ Países'
            },
            {
              id: 'pet_friendly_transport',
              name: 'Transporte Pet-Friendly',
              description: 'Transporte seguro e confortável de animais com toda documentação necessária',
              icon: '🐕',
              availability: 'Maioria dos Destinos'
            },
            {
              id: 'ground_transfer_driver',
              name: 'Transporte Terrestre',
              description: 'Transporte terrestre de luxo coordenado com seu horário de voo',
              icon: '🚗',
              availability: 'Cidades Principais'
            },
            {
              id: 'premium_catering',
              name: 'Catering Premium',
              description: 'Refeições gourmet e bebidas personalizadas conforme suas preferências',
              icon: '🍽️',
              availability: 'Todos os Voos'
            },
            {
              id: 'vip_lounge_fbo',
              name: 'Acesso Sala VIP',
              description: 'Acesso a salas exclusivas FBO e terminais privados',
              icon: '👑',
              availability: 'Aeroportos Premium'
            },
            {
              id: 'customs_immigration_assist',
              name: 'Assistência Alfândega/Imigração',
              description: 'Assistência para processamento acelerado de alfândega e imigração',
              icon: '🛂',
              availability: 'Aeroportos Selecionados'
            }
          ]
        },
        cta: {
          title: 'Pronto para Reservar seu Voo?',
          subtitle: 'Obtenha uma cotação personalizada para qualquer um dos nossos serviços',
          button: 'Solicitar Cotação'
        }
      }
    };
    return content[locale as keyof typeof content] || content.en;
  };

  const content = getContent(locale);
  const activeService = content.categories.find(cat => cat.id === activeCategory);

  const handleQuoteClick = (serviceType?: string) => {
    trackCTAClick('quote_button', content.cta.button, 'services_page');
    onQuoteClick?.(serviceType || activeCategory);
  };

  return (
    <main role="main" aria-labelledby="services-title" className={clsx('services-page', className)}>
      {/* Hero Section */}
      <header className="page-header bg-gradient-to-br from-navy-primary to-navy-primary/90 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 id="services-title" className="text-4xl md:text-6xl font-bold mb-6">
              {content.title}
            </h1>
            <p className="page-subtitle text-xl md:text-2xl text-neutral-light max-w-3xl mx-auto">
              {content.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Service Categories Navigation */}
      <section aria-labelledby="categories-heading" className="py-12 bg-white border-b border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="categories-heading" className="sr-only">Service Categories</h2>
          <div className="category-grid flex overflow-x-auto gap-4 pb-2" role="list">
            {content.categories.map((category) => (
              <article key={category.id} className="category-card flex-shrink-0" role="listitem">
                <button
                  onClick={() => setActiveCategory(category.id)}
                  className={clsx(
                    'px-6 py-3 rounded-lg font-semibold transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-navy-primary focus:ring-offset-2',
                    activeCategory === category.id
                      ? 'bg-navy-primary text-white'
                      : 'bg-neutral-light text-navy-primary hover:bg-neutral-medium/20'
                  )}
                  aria-pressed={activeCategory === category.id}
                  aria-label={`Select ${category.name} service category`}
                >
                  <div className="category-icon mr-2" aria-hidden="true">
                    {category.icon}
                  </div>
                  <span>{category.name}</span>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Active Service Details */}
      {activeService && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-navy-primary mb-6 flex items-center">
                  <span className="text-4xl mr-4">{activeService.icon}</span>
                  {activeService.name}
                </h2>
                <p className="text-lg text-neutral-dark mb-8 leading-relaxed">
                  {activeService.description}
                </p>

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-navy-primary mb-4">Key Features</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {activeService.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-neutral-dark">
                        <svg className="w-5 h-5 text-navy-primary mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-navy-primary/10 to-navy-primary/10 rounded-lg p-6">
                  <h4 className="font-semibold text-navy-primary mb-2">Pricing Range</h4>
                  <div className="text-2xl font-bold text-navy-primary">
                    ${activeService.pricing.from.toLocaleString()} - ${activeService.pricing.to.toLocaleString()} {activeService.pricing.currency}
                  </div>
                  <div className="text-sm text-neutral-medium">{activeService.pricing.unit}</div>
                </div>
              </div>

              <div>
                <div className="bg-neutral-light rounded-lg p-8">
                  <h3 className="text-xl font-semibold text-navy-primary mb-6">Sample Routes & Pricing</h3>
                  <div className="space-y-4">
                    {activeService.routes.map((route, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-neutral-medium/20">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-navy-primary">
                            {route.from} → {route.to}
                          </div>
                          <div className="text-sm text-neutral-medium">
                            {route.duration}
                          </div>
                        </div>
                        <div className="text-navy-primary font-semibold">
                          {route.priceRange}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-neutral-medium/20">
                    <p className="text-sm text-neutral-medium mb-4">
                      Prices are estimates and may vary based on availability, seasonality, and specific requirements.
                    </p>
                    <Button
                      onClick={() => handleQuoteClick(activeService.id)}
                      className="w-full bg-navy-primary hover:bg-navy-primary/90 text-white"
                    >
                      Get Exact Quote for {activeService.name}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Aircraft Fleet Section */}
      <section aria-labelledby="aircraft-heading" className="py-24 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="aircraft-heading" className="text-3xl md:text-4xl font-bold text-navy-primary mb-4">
              {content.aircraftFleet.title}
            </h2>
            <p className="text-lg text-neutral-medium max-w-2xl mx-auto">
              {content.aircraftFleet.subtitle}
            </p>
          </div>
          <div className="aircraft-comparison" role="table" aria-label="Aircraft specifications comparison">
            <div className="table-header sr-only" role="rowgroup">
              <div className="table-row" role="row">
                <div role="columnheader">Aircraft Type</div>
                <div role="columnheader">Passengers</div>
                <div role="columnheader">Range</div>
                <div role="columnheader">Speed</div>
                <div role="columnheader">Description</div>
              </div>
            </div>
            <div className="table-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" role="rowgroup">
              {content.aircraftFleet.categories.map((aircraft, index) => (
                <div key={index} className="table-row bg-white rounded-lg overflow-hidden shadow-medium hover:shadow-large transition-shadow duration-300" role="row">
                  <img
                    src={aircraft.image}
                    alt={`${aircraft.name} aircraft`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="p-6">
                    <div className="text-sm text-navy-primary font-semibold mb-2">
                      {aircraft.category}
                    </div>
                    <h3 className="text-xl font-bold text-navy-primary mb-3" role="cell">
                      {aircraft.name}
                    </h3>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex justify-between" role="cell">
                        <span className="text-neutral-medium">Capacity:</span>
                        <span className="font-semibold">{aircraft.capacity}</span>
                      </div>
                      <div className="flex justify-between" role="cell">
                        <span className="text-neutral-medium">Range:</span>
                        <span className="font-semibold">{aircraft.range}</span>
                      </div>
                      <div className="flex justify-between" role="cell">
                        <span className="text-neutral-medium">Speed:</span>
                        <span className="font-semibold">{aircraft.speed}</span>
                      </div>
                    </div>
                    <p className="text-neutral-dark text-sm leading-relaxed" role="cell">
                      {aircraft.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Additional Services Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-navy-primary mb-4">
              {content.additionalServices.title}
            </h2>
            <p className="text-lg text-neutral-medium max-w-2xl mx-auto">
              {content.additionalServices.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.additionalServices.services.map((service, index) => (
              <div key={service.id} className="bg-neutral-light rounded-lg p-6 hover:shadow-large transition-shadow duration-300">
                <div className="text-3xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-navy-primary mb-3">
                  {service.name}
                </h3>
                <p className="text-neutral-dark mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="text-sm text-navy-primary font-semibold">
                  Available: {service.availability}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-navy-primary to-navy-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {content.cta.title}
          </h2>
          <p className="text-xl mb-10 text-neutral-light">
            {content.cta.subtitle}
          </p>
          <Button
            onClick={() => handleQuoteClick()}
            size="lg"
            className="bg-white text-navy-primary hover:bg-neutral-light transition-colors duration-200"
          >
            {content.cta.button}
          </Button>
        </div>
      </section>
    </main>
  );
}