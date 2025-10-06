import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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
}

// Custom airport list as specified
const mockAirports: AirportSearchResult[] = [
  { code: 'EZE', name: 'Aeropuerto Internacional Ministro Pistarini – Ezeiza', city: 'Buenos Aires', country: 'Argentina', region: 'South America', isPopular: true },
  { code: 'AEP', name: 'Aeroparque Jorge Newbery', city: 'Buenos Aires', country: 'Argentina', region: 'South America', isPopular: true },
  { code: 'FDO', name: 'Aeropuerto de San Fernando', city: 'Buenos Aires / San Fernando', country: 'Argentina', region: 'South America', isPopular: false },
  { code: 'GRU', name: 'Aeroporto Internacional de São Paulo-Guarulhos', city: 'São Paulo', country: 'Brazil', region: 'South America', isPopular: true },
  { code: 'CGH', name: 'Aeroporto de Congonhas', city: 'São Paulo', country: 'Brazil', region: 'South America', isPopular: true },
  { code: 'VCP', name: 'Aeroporto Internacional de Viracopos – Campinas', city: 'São Paulo', country: 'Brazil', region: 'South America', isPopular: false },
  { code: 'GIG', name: 'Aeroporto Internacional Tom Jobim – Galeão', city: 'Río de Janeiro', country: 'Brazil', region: 'South America', isPopular: true },
  { code: 'SDU', name: 'Aeroporto Santos Dumont', city: 'Río de Janeiro', country: 'Brazil', region: 'South America', isPopular: true },
  { code: 'PDP', name: 'Aeropuerto Internacional de Laguna del Sauce', city: 'Punta del Este', country: 'Uruguay', region: 'South America', isPopular: true },
  { code: 'MVD', name: 'Aeropuerto Internacional de Carrasco', city: 'Montevideo', country: 'Uruguay', region: 'South America', isPopular: false },
  { code: 'SCL', name: 'Aeropuerto Internacional Arturo Merino Benítez', city: 'Santiago de Chile', country: 'Chile', region: 'South America', isPopular: true },
  { code: 'PTY', name: 'Aeropuerto Internacional de Tocumen', city: 'Ciudad de Panamá', country: 'Panama', region: 'Central America', isPopular: true },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', region: 'North America', isPopular: true },
  { code: 'BOG', name: 'Aeropuerto Internacional El Dorado', city: 'Bogotá', country: 'Colombia', region: 'South America', isPopular: true },
  { code: 'MEX', name: 'Aeropuerto Internacional Benito Juárez', city: 'Ciudad de México', country: 'Mexico', region: 'North America', isPopular: true },
  { code: 'CUN', name: 'Aeropuerto Internacional de Cancún', city: 'Cancún', country: 'Mexico', region: 'North America', isPopular: true },
  { code: 'PUJ', name: 'Aeropuerto Internacional de Punta Cana', city: 'Punta Cana', country: 'Dominican Republic', region: 'Caribbean', isPopular: true },
  { code: 'NAS', name: 'Aeropuerto Internacional Lynden Pindling', city: 'Nassau', country: 'Bahamas', region: 'Caribbean', isPopular: false },
];

// Simple search function without database dependency
const searchAirports = async (query: string, locale: string): Promise<AirportSearchResult[]> => {
  const queryLower = query.toLowerCase();

  // Filter airports based on search query
  const matchingAirports = mockAirports.filter(airport => {
    return (
      airport.code.toLowerCase().includes(queryLower) ||
      airport.name.toLowerCase().includes(queryLower) ||
      airport.city.toLowerCase().includes(queryLower) ||
      airport.country.toLowerCase().includes(queryLower)
    );
  });

  // Score and sort results
  const scoredResults = matchingAirports.map(airport => {
    const queryUpper = query.toUpperCase();
    const codeUpper = airport.code.toUpperCase();
    const cityUpper = airport.city.toUpperCase();
    const nameUpper = airport.name.toUpperCase();

    // Calculate relevance score
    let score = 0;
    if (codeUpper === queryUpper) score = 100;
    else if (codeUpper.startsWith(queryUpper)) score = 90;
    else if (cityUpper.startsWith(queryUpper)) score = 80;
    else if (nameUpper.startsWith(queryUpper)) score = 70;
    else if (cityUpper.includes(queryUpper)) score = 60;
    else if (nameUpper.includes(queryUpper)) score = 50;
    else score = 40;

    // Boost popular airports
    if (airport.isPopular) score += 15;

    return { ...airport, score };
  });

  // Sort by score and take top 10
  return scoredResults
    .sort((a, b) => b.score - a.score || (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0))
    .slice(0, 10);
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
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          details: validationResult.error.issues,
          accessibility: {
            ariaLiveMessage: 'Search parameters are invalid',
            searchStatus: 'error'
          }
        },
        { status: 400 }
      );
    }

    const { q: query, locale } = validationResult.data;

    // Perform search
    const results = await searchAirports(query, locale);

    return NextResponse.json({
      query,
      locale,
      results,
      count: results.length,
      cached: false,
      accessibility: {
        ariaLiveMessage: `${results.length} airport${results.length !== 1 ? 's' : ''} found for "${query}"`,
        ariaAnnouncement: `Search completed. ${results.length} results found.`,
        searchStatus: 'completed',
        resultsDescription: `${results.length} airport${results.length !== 1 ? 's' : ''} found for "${query}"`,
        keyboardInstructions: 'Use arrow keys to navigate results, Enter to select, Escape to close.',
        listRole: 'listbox',
        listLabel: `Airport search results for ${query}`,
        hasResults: results.length > 0,
        emptyStateMessage: results.length === 0 ?
          `No airports found for "${query}". Try a different search term.` : undefined,
        screenReaderSummary: `Search for "${query}" returned ${results.length} results. Use arrow keys to navigate.`
      }
    });

  } catch (error) {
    console.error('Airport search API error:', error);

    return NextResponse.json(
      {
        error: 'Search failed',
        accessibility: {
          ariaLiveMessage: 'Search failed. Please try again.',
          searchStatus: 'error',
          retryInstructions: 'Please try your search again'
        }
      },
      { status: 500 }
    );
  }
}