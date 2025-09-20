import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {
  generateAirportAriaLabel,
  generateAriaSuccessInfo,
  generateAriaErrorResponse,
  generateKeyboardInstructions,
  type Locale
} from '../../../lib/accessibility/aria-helpers';

const prisma = new PrismaClient();

// Request validation schema
const AirportSearchSchema = z.object({
  q: z.string().min(1).max(50),
  locale: z.enum(['es', 'en', 'pt']).default('es')
});

// Response interface
interface AirportSearchResult {
  code: string;        // IATA code
  name: string;        // Airport name
  city: string;        // City name
  country: string;     // Country name in requested locale
  region: string;      // Region name in requested locale
  isPopular: boolean;  // For boosting popular airports
  accessibility?: {    // ARIA accessibility information
    ariaLabel: string;
    ariaDescription: string;
    ariaRole: string;
    ariaPosInSet?: number;
    ariaSetSize?: number;
  };
}

// In-memory cache with 1 hour TTL
interface CacheItem {
  data: AirportSearchResult[];
  timestamp: number;
}

const searchCache = new Map<string, CacheItem>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Simple fuzzy matching function for typos
const fuzzyMatch = (query: string, text: string): number => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    return textLower.startsWith(queryLower) ? 10 : 8;
  }

  // Simple character distance for fuzzy matching
  let matches = 0;
  for (const char of queryLower) {
    if (textLower.includes(char)) {
      matches++;
    }
  }

  // Return score based on character match ratio
  return (matches / queryLower.length) * 5;
};

// Clean cache entries older than TTL
const cleanCache = () => {
  const now = Date.now();
  for (const [key, value] of searchCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      searchCache.delete(key);
    }
  }
};

// Main search function with database query and joins
const searchAirports = async (query: string, locale: string): Promise<AirportSearchResult[]> => {
  // Generate cache key
  const cacheKey = `${query.toLowerCase()}_${locale}`;

  // Check cache first
  cleanCache();
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Get locale field name for translations
  const localeField = locale === 'en' ? 'entityNameEn' :
                      locale === 'es' ? 'entityNameEs' : 'entityNamePt';

  try {
    // Use Prisma's more reliable findMany with includes for multilingual support
    const airports = await prisma.airport.findMany({
      where: {
        isActive: true,
        OR: [
          { iataCode: { contains: query, mode: 'insensitive' } },
          { cityName: { contains: query, mode: 'insensitive' } },
          { airportName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        iataCode: true,
        airportName: true,
        cityName: true,
        countryCode: true,
        regionCode: true,
        isPopular: true
      },
      take: 20, // Get more results for scoring
      orderBy: [
        { isPopular: 'desc' },
        { cityName: 'asc' }
      ]
    });

    // Get translations for countries and regions
    const countryTranslations = await prisma.airportTranslation.findMany({
      where: {
        entityType: 'country',
        entityCode: { in: [...new Set(airports.map(a => a.countryCode))] }
      }
    });

    const regionTranslations = await prisma.airportTranslation.findMany({
      where: {
        entityType: 'region',
        entityCode: { in: [...new Set(airports.map(a => a.regionCode))] }
      }
    });

    // Create lookup maps for translations
    const countryMap = new Map();
    const regionMap = new Map();

    countryTranslations.forEach(t => {
      const name = locale === 'en' ? t.entityNameEn :
                   locale === 'es' ? t.entityNameEs : t.entityNamePt;
      countryMap.set(t.entityCode, name);
    });

    regionTranslations.forEach(t => {
      const name = locale === 'en' ? t.entityNameEn :
                   locale === 'es' ? t.entityNameEs : t.entityNamePt;
      regionMap.set(t.entityCode, name);
    });

    // Score and sort results
    const scoredResults = airports.map(airport => {
      const queryUpper = query.toUpperCase();
      const codeUpper = airport.iataCode.toUpperCase();
      const cityUpper = airport.cityName.toUpperCase();
      const nameUpper = airport.airportName.toUpperCase();

      // Calculate relevance score
      let score = 0;
      if (codeUpper === queryUpper) score = 100;
      else if (codeUpper.startsWith(queryUpper)) score = 90;
      else if (cityUpper.startsWith(queryUpper)) score = 80;
      else if (nameUpper.startsWith(queryUpper)) score = 70;
      else if (cityUpper.includes(queryUpper)) score = 60;
      else if (nameUpper.includes(queryUpper)) score = 50;
      else score = 40;

      // Boost popular airports (especially in Latin America)
      if (airport.isPopular && airport.regionCode === 'SA') score += 20;
      else if (airport.isPopular) score += 15;

      return {
        ...airport,
        score,
        country: countryMap.get(airport.countryCode) || airport.countryCode,
        region: regionMap.get(airport.regionCode) || airport.regionCode
      };
    });

    // Sort by score and take top 10
    const sortedResults = scoredResults
      .sort((a, b) => b.score - a.score || (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
      .slice(0, 10);

    // Format results with accessibility information
    const airportResults: AirportSearchResult[] = sortedResults.map((airport, index) => {
      const ariaInfo = generateAirportAriaLabel(
        {
          code: airport.iataCode,
          name: airport.airportName,
          city: airport.cityName,
          country: airport.country,
          isPopular: airport.isPopular
        },
        index + 1,
        sortedResults.length,
        locale as any
      );

      return {
        code: airport.iataCode,
        name: airport.airportName,
        city: airport.cityName,
        country: airport.country,
        region: airport.region,
        isPopular: airport.isPopular,
        accessibility: ariaInfo
      };
    });

    // Cache the results
    searchCache.set(cacheKey, {
      data: airportResults,
      timestamp: Date.now()
    });

    return airportResults;

  } catch (error) {
    console.error('Airport search error:', error);

    // Fallback search using Prisma if raw SQL fails
    const airports = await prisma.airport.findMany({
      where: {
        isActive: true,
        OR: [
          { iataCode: { contains: query, mode: 'insensitive' } },
          { cityName: { contains: query, mode: 'insensitive' } },
          { airportName: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        iataCode: true,
        airportName: true,
        cityName: true,
        countryCode: true,
        regionCode: true,
        isPopular: true
      },
      take: 10,
      orderBy: [
        { isPopular: 'desc' },
        { cityName: 'asc' }
      ]
    });

    // Simple mapping for fallback results
    const fallbackResults: AirportSearchResult[] = airports.map(airport => ({
      code: airport.iataCode,
      name: airport.airportName,
      city: airport.cityName,
      country: airport.countryCode,
      region: airport.regionCode,
      isPopular: airport.isPopular
    }));

    return fallbackResults;
  }
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate query parameters
    const validationResult = AirportSearchSchema.safeParse({
      q: searchParams.get('q'),
      locale: searchParams.get('locale') || 'es'
    });

    if (!validationResult.success) {
      const ariaError = generateAriaErrorResponse('validation', 'en'); // Default to English for param validation
      return NextResponse.json(
        {
          ...ariaError,
          details: validationResult.error.issues,
          accessibility: {
            ...ariaError.accessibility,
            fieldTarget: '#airport-search-input',
            searchStatus: 'error'
          }
        },
        { status: 400 }
      );
    }

    const { q: query, locale } = validationResult.data;

    // Perform search
    const results = await searchAirports(query, locale);

    // Generate success response with accessibility information
    const ariaSuccess = generateAriaSuccessInfo('search', locale, { count: results.length });
    const keyboardInstructions = generateKeyboardInstructions('results', locale);

    return NextResponse.json({
      query,
      locale,
      results,
      count: results.length,
      cached: searchCache.has(`${query.toLowerCase()}_${locale}`),
      accessibility: {
        ariaLiveMessage: ariaSuccess.ariaLiveMessage,
        ariaAnnouncement: ariaSuccess.ariaAnnouncement,
        searchStatus: 'completed',
        resultsDescription: `${results.length} airport${results.length !== 1 ? 's' : ''} found for "${query}"`,
        keyboardInstructions: keyboardInstructions.instructions,
        listRole: 'listbox',
        listLabel: `Airport search results for ${query}`,
        hasResults: results.length > 0,
        emptyStateMessage: results.length === 0 ?
          `No airports found for "${query}". Try a different search term.` : undefined,
        screenReaderSummary: `Search for "${query}" returned ${results.length} results. ${keyboardInstructions.instructions}`
      }
    });

  } catch (error) {
    console.error('Airport search API error:', error);

    const ariaError = generateAriaErrorResponse('server', 'en');
    return NextResponse.json(
      {
        ...ariaError,
        accessibility: {
          ...ariaError.accessibility,
          searchStatus: 'error',
          retryInstructions: 'Please try your search again'
        }
      },
      { status: 500 }
    );
  }
}

// Optional: Clear cache endpoint for development
export async function DELETE() {
  searchCache.clear();
  return NextResponse.json({ message: 'Cache cleared' });
}