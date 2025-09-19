import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Sample airports for testing
  const airports = [
    {
      iataCode: 'EZE',
      icaoCode: 'SAEZ',
      airportName: 'Ezeiza International Airport',
      cityName: 'Buenos Aires',
      countryCode: 'AR',
      regionCode: 'SA',
      latitude: -34.8222,
      longitude: -58.5358,
      isActive: true,
      isPopular: true
    },
    {
      iataCode: 'JFK',
      icaoCode: 'KJFK',
      airportName: 'John F. Kennedy International Airport',
      cityName: 'New York',
      countryCode: 'US',
      regionCode: 'NA',
      latitude: 40.6413,
      longitude: -73.7781,
      isActive: true,
      isPopular: true
    },
    {
      iataCode: 'MAD',
      icaoCode: 'LEMD',
      airportName: 'Madrid-Barajas Airport',
      cityName: 'Madrid',
      countryCode: 'ES',
      regionCode: 'EU',
      latitude: 40.4936,
      longitude: -3.5668,
      isActive: true,
      isPopular: true
    },
    {
      iataCode: 'MIA',
      icaoCode: 'KMIA',
      airportName: 'Miami International Airport',
      cityName: 'Miami',
      countryCode: 'US',
      regionCode: 'NA',
      latitude: 25.7959,
      longitude: -80.2870,
      isActive: true,
      isPopular: true
    },
    {
      iataCode: 'GIG',
      icaoCode: 'SBGL',
      airportName: 'Tom Jobim International Airport',
      cityName: 'Rio de Janeiro',
      countryCode: 'BR',
      regionCode: 'SA',
      latitude: -22.8056,
      longitude: -43.2508,
      isActive: true,
      isPopular: true
    },
    {
      iataCode: 'SCL',
      icaoCode: 'SCEL',
      airportName: 'Santiago International Airport',
      cityName: 'Santiago',
      countryCode: 'CL',
      regionCode: 'SA',
      latitude: -33.3928,
      longitude: -70.7856,
      isActive: true,
      isPopular: false
    },
    {
      iataCode: 'LHR',
      icaoCode: 'EGLL',
      airportName: 'London Heathrow Airport',
      cityName: 'London',
      countryCode: 'GB',
      regionCode: 'EU',
      latitude: 51.4700,
      longitude: -0.4543,
      isActive: true,
      isPopular: true
    },
    {
      iataCode: 'CDG',
      icaoCode: 'LFPG',
      airportName: 'Charles de Gaulle Airport',
      cityName: 'Paris',
      countryCode: 'FR',
      regionCode: 'EU',
      latitude: 49.0097,
      longitude: 2.5479,
      isActive: true,
      isPopular: true
    }
  ];

  // Insert airports
  for (const airport of airports) {
    await prisma.airport.upsert({
      where: { iataCode: airport.iataCode },
      update: airport,
      create: airport
    });
  }

  console.log(`✅ Created ${airports.length} airports`);

  // Sample airport translations
  const translations = [
    {
      entityType: 'airport',
      entityCode: 'EZE',
      entityNameEn: 'Buenos Aires',
      entityNameEs: 'Buenos Aires',
      entityNamePt: 'Buenos Aires'
    },
    {
      entityType: 'airport',
      entityCode: 'JFK',
      entityNameEn: 'New York',
      entityNameEs: 'Nueva York',
      entityNamePt: 'Nova York'
    },
    {
      entityType: 'airport',
      entityCode: 'MAD',
      entityNameEn: 'Madrid',
      entityNameEs: 'Madrid',
      entityNamePt: 'Madrid'
    },
    {
      entityType: 'airport',
      entityCode: 'MIA',
      entityNameEn: 'Miami',
      entityNameEs: 'Miami',
      entityNamePt: 'Miami'
    }
  ];

  // Insert translations
  for (const translation of translations) {
    await prisma.airportTranslation.upsert({
      where: {
        unique_entity: {
          entityType: translation.entityType,
          entityCode: translation.entityCode
        }
      },
      update: translation,
      create: translation
    });
  }

  console.log(`✅ Created ${translations.length} airport translations`);
  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });