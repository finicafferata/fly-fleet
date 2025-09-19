import { PrismaClient } from '../../generated/prisma';

// Content interface
export interface ContentItem {
  key: string;
  value: string;
  type: 'text' | 'html' | 'json' | 'image_url';
}

export interface PageContent {
  pageSlug: string;
  locale: string;
  content: ContentItem[];
  lastUpdated: Date;
  fromCache?: boolean;
  fallbackUsed?: boolean;
}

// Cache interface
interface CacheItem {
  data: PageContent;
  timestamp: number;
}

export class ContentService {
  private prisma: PrismaClient;
  private cache: Map<string, CacheItem>;
  private cacheTTL: number;
  private supportedLocales: string[];
  private defaultLocale: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.cache = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 hour
    this.supportedLocales = ['es', 'en', 'pt'];
    this.defaultLocale = 'es'; // Spanish as default for Fly-Fleet
  }

  /**
   * Get page content for a specific page and locale
   */
  async getPageContent(pageSlug: string, locale: string): Promise<PageContent> {
    try {
      // Validate inputs
      if (!this.isValidLocale(locale)) {
        locale = this.defaultLocale;
      }

      const normalizedPageSlug = this.normalizePageSlug(pageSlug);
      const cacheKey = `${normalizedPageSlug}_${locale}`;

      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return { ...cached, fromCache: true };
      }

      // Try to get content for requested locale
      let content = await this.fetchContentFromDatabase(normalizedPageSlug, locale);
      let fallbackUsed = false;

      // If no content found and not default locale, try fallback
      if (content.length === 0 && locale !== this.defaultLocale) {
        content = await this.fetchContentFromDatabase(normalizedPageSlug, this.defaultLocale);
        fallbackUsed = true;
        console.log(`Content fallback used for page: ${normalizedPageSlug}, locale: ${locale} -> ${this.defaultLocale}`);
      }

      // Create page content object
      const pageContent: PageContent = {
        pageSlug: normalizedPageSlug,
        locale: fallbackUsed ? this.defaultLocale : locale,
        content,
        lastUpdated: new Date(),
        fallbackUsed
      };

      // Cache the result
      this.setCache(cacheKey, pageContent);

      return pageContent;

    } catch (error) {
      console.error('Error fetching page content:', error);
      throw new Error(`Failed to fetch content for page: ${pageSlug}`);
    }
  }

  /**
   * Get all content for a page across all locales
   */
  async getAllPageContent(pageSlug: string): Promise<Record<string, PageContent>> {
    const normalizedPageSlug = this.normalizePageSlug(pageSlug);
    const result: Record<string, PageContent> = {};

    try {
      // Fetch content for all supported locales
      const promises = this.supportedLocales.map(async (locale) => {
        try {
          const content = await this.getPageContent(normalizedPageSlug, locale);
          result[locale] = content;
        } catch (error) {
          console.error(`Error fetching content for ${normalizedPageSlug}:${locale}`, error);
          // Don't fail the entire request if one locale fails
        }
      });

      await Promise.all(promises);
      return result;

    } catch (error) {
      console.error('Error fetching all page content:', error);
      throw new Error(`Failed to fetch all content for page: ${pageSlug}`);
    }
  }

  /**
   * Get content by specific key
   */
  async getContentByKey(
    pageSlug: string,
    contentKey: string,
    locale: string
  ): Promise<ContentItem | null> {
    try {
      const pageContent = await this.getPageContent(pageSlug, locale);
      const item = pageContent.content.find(item => item.key === contentKey);
      return item || null;
    } catch (error) {
      console.error('Error fetching content by key:', error);
      return null;
    }
  }

  /**
   * Get available pages with content counts
   */
  async getAvailablePages(): Promise<Array<{
    pageSlug: string;
    locales: Record<string, number>; // locale -> content count
    totalItems: number;
    lastUpdated: Date;
  }>> {
    try {
      const pages = await this.prisma.pageContent.groupBy({
        by: ['pageSlug', 'locale'],
        where: {
          isPublished: true
        },
        _count: {
          id: true
        },
        _max: {
          updatedAt: true
        }
      });

      // Group by page slug
      const pageMap = new Map<string, {
        locales: Record<string, number>;
        totalItems: number;
        lastUpdated: Date;
      }>();

      pages.forEach(page => {
        const slug = page.pageSlug;
        const locale = page.locale;
        const count = page._count.id;
        const updated = page._max.updatedAt || new Date();

        if (!pageMap.has(slug)) {
          pageMap.set(slug, {
            locales: {},
            totalItems: 0,
            lastUpdated: updated
          });
        }

        const pageData = pageMap.get(slug)!;
        pageData.locales[locale] = count;
        pageData.totalItems += count;

        // Update last updated if this is newer
        if (updated > pageData.lastUpdated) {
          pageData.lastUpdated = updated;
        }
      });

      // Convert to array
      return Array.from(pageMap.entries()).map(([pageSlug, data]) => ({
        pageSlug,
        ...data
      }));

    } catch (error) {
      console.error('Error getting available pages:', error);
      throw new Error('Failed to get available pages');
    }
  }

  /**
   * Fetch content from database
   */
  private async fetchContentFromDatabase(pageSlug: string, locale: string): Promise<ContentItem[]> {
    const contentItems = await this.prisma.pageContent.findMany({
      where: {
        pageSlug,
        locale,
        isPublished: true
      },
      select: {
        contentKey: true,
        contentValue: true,
        contentType: true
      },
      orderBy: {
        contentKey: 'asc'
      }
    });

    return contentItems.map(item => ({
      key: item.contentKey,
      value: item.contentValue,
      type: item.contentType as 'text' | 'html' | 'json' | 'image_url'
    }));
  }

  /**
   * Normalize page slug for consistent lookup
   */
  private normalizePageSlug(pageSlug: string): string {
    return pageSlug.toLowerCase().trim().replace(/^\/+|\/+$/g, '');
  }

  /**
   * Validate locale
   */
  private isValidLocale(locale: string): boolean {
    return this.supportedLocales.includes(locale);
  }

  /**
   * Get content from cache
   */
  private getFromCache(cacheKey: string): PageContent | null {
    const cached = this.cache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.cacheTTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Set content in cache
   */
  private setCache(cacheKey: string, content: PageContent): void {
    this.cache.set(cacheKey, {
      data: content,
      timestamp: Date.now()
    });

    // Clean old entries periodically
    if (this.cache.size > 100) { // Arbitrary limit
      this.cleanCache();
    }
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.cacheTTL) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxAge: number;
    hitRate?: number;
  } {
    this.cleanCache();
    const now = Date.now();
    let maxAge = 0;

    for (const item of this.cache.values()) {
      const age = now - item.timestamp;
      if (age > maxAge) {
        maxAge = age;
      }
    }

    return {
      size: this.cache.size,
      maxAge: Math.round(maxAge / 1000) // in seconds
    };
  }

  /**
   * Preload content for better performance
   */
  async preloadContent(pages: string[], locales: string[] = this.supportedLocales): Promise<void> {
    try {
      const promises: Promise<void>[] = [];

      for (const page of pages) {
        for (const locale of locales) {
          promises.push(
            this.getPageContent(page, locale).then(() => {
              // Just preload, don't need to handle result
            }).catch((error) => {
              console.warn(`Failed to preload content for ${page}:${locale}`, error);
            })
          );
        }
      }

      await Promise.all(promises);
      console.log(`Preloaded content for ${pages.length} pages in ${locales.length} locales`);

    } catch (error) {
      console.error('Error preloading content:', error);
    }
  }
}

// Export a singleton instance
export const contentService = new ContentService();