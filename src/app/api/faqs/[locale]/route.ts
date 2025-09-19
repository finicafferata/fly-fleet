import { NextRequest, NextResponse } from 'next/server';
import { faqService } from '../../../../lib/faq/FAQService';

interface RouteParams {
  params: {
    locale: string;
  };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { locale } = await params;
    const { searchParams } = new URL(req.url);

    // Query parameters
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const grouped = searchParams.get('grouped') === 'true';
    const schema = searchParams.get('schema') === 'true';
    const stats = searchParams.get('stats') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Handle different response types
    if (stats) {
      // Return FAQ statistics
      const statistics = await faqService.getStats(locale);
      return NextResponse.json({
        success: true,
        action: 'stats',
        locale,
        statistics,
        timestamp: new Date().toISOString()
      });
    }

    if (schema) {
      // Return Schema.org structured data
      const schemaData = await faqService.generateSchemaData(locale, category || undefined);
      return NextResponse.json({
        success: true,
        action: 'schema',
        locale,
        category: category || null,
        schema: schemaData,
        timestamp: new Date().toISOString()
      });
    }

    if (grouped) {
      // Return FAQs grouped by category
      const faqsByCategory = await faqService.getFAQsByCategory(locale);
      return NextResponse.json({
        success: true,
        action: 'grouped',
        locale,
        categories: faqsByCategory,
        totalCategories: faqsByCategory.length,
        totalFAQs: faqsByCategory.reduce((sum, cat) => sum + cat.count, 0),
        timestamp: new Date().toISOString()
      });
    }

    // Default: Return filtered/searched FAQs
    const faqData = await faqService.getFAQs(
      locale,
      category || undefined,
      search || undefined,
      limit
    );

    // Build response
    const response: any = {
      success: true,
      action: 'list',
      locale,
      faqs: faqData.faqs,
      total: faqData.total,
      availableCategories: faqData.categories,
      filters: {
        category: category || null,
        search: search || null,
        limit
      },
      timestamp: new Date().toISOString()
    };

    // Add search/filter info if applied
    if (search) {
      response.searchTerm = search;
      response.searchResults = true;
    }

    if (category) {
      response.filteredByCategory = category;
    }

    // Add cache headers for SEO and performance
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1 hour cache, 24 hour stale
      'ETag': `"faqs-${locale}-${category || 'all'}-${search || 'none'}-${Date.now()}"`
    };

    return NextResponse.json(response, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('FAQ API error:', error);

    // Return appropriate error based on the type
    if (error instanceof Error && error.message.includes('Failed to fetch')) {
      return NextResponse.json(
        {
          error: 'FAQs not found',
          locale: (await params).locale,
          message: error.message
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}