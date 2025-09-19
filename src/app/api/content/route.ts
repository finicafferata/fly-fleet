import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../../lib/content/ContentService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Query parameters
    const action = searchParams.get('action');
    const page = searchParams.get('page');
    const locale = searchParams.get('locale');

    // Handle different actions
    switch (action) {
      case 'pages':
        // Get available pages with content counts
        const availablePages = await contentService.getAvailablePages();
        return NextResponse.json({
          success: true,
          action: 'pages',
          pages: availablePages,
          total: availablePages.length,
          timestamp: new Date().toISOString()
        });

      case 'page-all-locales':
        // Get content for a page in all locales
        if (!page) {
          return NextResponse.json(
            { error: 'Page parameter is required for page-all-locales action' },
            { status: 400 }
          );
        }

        const allLocalesContent = await contentService.getAllPageContent(page);
        return NextResponse.json({
          success: true,
          action: 'page-all-locales',
          page,
          content: allLocalesContent,
          locales: Object.keys(allLocalesContent),
          timestamp: new Date().toISOString()
        });

      case 'stats':
        // Get cache and service statistics
        const cacheStats = contentService.getCacheStats();
        return NextResponse.json({
          success: true,
          action: 'stats',
          cache: cacheStats,
          supportedLocales: ['es', 'en', 'pt'],
          defaultLocale: 'es',
          timestamp: new Date().toISOString()
        });

      case 'preload':
        // Preload content for better performance
        const pagesToPreload = searchParams.get('pages')?.split(',') || ['homepage', 'services', 'about'];
        const localesToPreload = searchParams.get('locales')?.split(',') || ['es', 'en', 'pt'];

        await contentService.preloadContent(pagesToPreload, localesToPreload);

        return NextResponse.json({
          success: true,
          action: 'preload',
          message: 'Content preloaded successfully',
          pages: pagesToPreload,
          locales: localesToPreload,
          timestamp: new Date().toISOString()
        });

      default:
        // Default behavior - return general information
        const stats = contentService.getCacheStats();
        const pages = await contentService.getAvailablePages();

        return NextResponse.json({
          success: true,
          service: 'Content Management API',
          version: '1.0.0',
          endpoints: {
            'GET /api/content/:page/:locale': 'Get page content for specific locale',
            'GET /api/content/:page/:locale?key=X': 'Get specific content key',
            'GET /api/content/:page/:locale?metadata=true': 'Include metadata in response',
            'GET /api/content?action=pages': 'List all available pages',
            'GET /api/content?action=page-all-locales&page=X': 'Get page in all locales',
            'GET /api/content?action=stats': 'Get service statistics',
            'GET /api/content?action=preload&pages=X&locales=Y': 'Preload content for performance'
          },
          statistics: {
            cache: stats,
            availablePages: pages.length,
            supportedLocales: ['es', 'en', 'pt']
          },
          timestamp: new Date().toISOString()
        });
    }

  } catch (error) {
    console.error('Content API error:', error);
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
        contentService.clearCache();
        return NextResponse.json({
          success: true,
          action: 'clear-cache',
          message: 'Cache cleared successfully',
          timestamp: new Date().toISOString()
        });

      case 'preload-content':
        const { pages = ['homepage'], locales = ['es', 'en', 'pt'] } = body;
        await contentService.preloadContent(pages, locales);

        return NextResponse.json({
          success: true,
          action: 'preload-content',
          message: 'Content preloaded successfully',
          pages,
          locales,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', availableActions: ['clear-cache', 'preload-content'] },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Content API POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}