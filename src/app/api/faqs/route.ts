import { NextRequest, NextResponse } from 'next/server';
import { faqService } from '../../../lib/faq/FAQService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const locale = searchParams.get('locale');

    // Handle different actions
    switch (action) {
      case 'categories':
        // Get available categories for a locale
        if (!locale) {
          return NextResponse.json(
            { error: 'Locale parameter is required for categories action' },
            { status: 400 }
          );
        }

        const categories = await faqService.getCategories(locale);
        return NextResponse.json({
          success: true,
          action: 'categories',
          locale,
          categories,
          total: categories.length,
          timestamp: new Date().toISOString()
        });

      case 'stats':
        // Get FAQ statistics
        const stats = await faqService.getStats(locale || undefined);
        return NextResponse.json({
          success: true,
          action: 'stats',
          statistics: stats,
          locale: locale || 'all',
          timestamp: new Date().toISOString()
        });

      case 'cache-stats':
        // Get cache statistics
        const cacheStats = faqService.getCacheStats();
        return NextResponse.json({
          success: true,
          action: 'cache-stats',
          cache: cacheStats,
          timestamp: new Date().toISOString()
        });

      default:
        // Default behavior - return service information
        const allStats = await faqService.getStats();
        return NextResponse.json({
          success: true,
          service: 'FAQ Management API',
          version: '1.0.0',
          endpoints: {
            'GET /api/faqs/:locale': 'Get FAQs for specific locale',
            'GET /api/faqs/:locale?category=X': 'Filter FAQs by category',
            'GET /api/faqs/:locale?search=X': 'Search within FAQs',
            'GET /api/faqs/:locale?grouped=true': 'Get FAQs grouped by category',
            'GET /api/faqs/:locale?schema=true': 'Get Schema.org structured data',
            'GET /api/faqs/:locale?stats=true': 'Get FAQ statistics for locale',
            'GET /api/faqs?action=categories&locale=X': 'Get available categories',
            'GET /api/faqs?action=stats': 'Get overall FAQ statistics',
            'GET /api/faqs?action=cache-stats': 'Get cache statistics',
            'POST /api/faqs': 'Clear cache (action: clear-cache)'
          },
          statistics: allStats,
          supportedLocales: ['es', 'en', 'pt'],
          features: [
            'Category filtering',
            'Full-text search',
            'Grouped by category',
            'Schema.org structured data',
            'Caching with 1-hour TTL',
            'Multilingual support'
          ],
          timestamp: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('FAQ API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST endpoint for cache management
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case 'clear-cache':
        faqService.clearCache();
        return NextResponse.json({
          success: true,
          action: 'clear-cache',
          message: 'FAQ cache cleared successfully',
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', availableActions: ['clear-cache'] },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('FAQ API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}