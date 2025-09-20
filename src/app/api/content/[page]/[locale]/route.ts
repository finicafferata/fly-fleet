import { NextRequest, NextResponse } from 'next/server';
import { contentService } from '../../../../../lib/content/ContentService';

export async function GET(req: NextRequest, { params }: { params: Promise<{ page: string; locale: string }> }) {
  try {
    const { page, locale } = await params;
    const { searchParams } = new URL(req.url);

    // Optional query parameters
    const contentKey = searchParams.get('key');
    const includeMetadata = searchParams.get('metadata') === 'true';

    // If specific content key is requested
    if (contentKey) {
      const contentItem = await contentService.getContentByKey(page, contentKey, locale);

      if (!contentItem) {
        return NextResponse.json(
          { error: 'Content not found', page, locale, key: contentKey },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        page,
        locale,
        key: contentKey,
        content: contentItem,
        timestamp: new Date().toISOString()
      });
    }

    // Get all content for the page
    const pageContent = await contentService.getPageContent(page, locale);

    // Build response
    const response: any = {
      success: true,
      page: pageContent.pageSlug,
      locale: pageContent.locale,
      content: pageContent.content,
      timestamp: new Date().toISOString()
    };

    // Add metadata if requested
    if (includeMetadata) {
      response.metadata = {
        lastUpdated: pageContent.lastUpdated,
        fromCache: pageContent.fromCache,
        fallbackUsed: pageContent.fallbackUsed,
        contentCount: pageContent.content.length
      };
    }

    // Add cache headers
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400', // 1 hour cache, 24 hour stale
      'ETag': `"${page}-${locale}-${pageContent.lastUpdated.getTime()}"`,
      'Last-Modified': pageContent.lastUpdated.toUTCString()
    };

    return NextResponse.json(response, {
      headers: cacheHeaders
    });

  } catch (error) {
    console.error('Content API error:', error);

    // Return appropriate error based on the type
    if (error instanceof Error && error.message.includes('Failed to fetch content')) {
      return NextResponse.json(
        {
          error: 'Content not found',
          page: (await params).page,
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