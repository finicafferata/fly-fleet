import { PrismaClient } from '../../generated/prisma';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface FAQCategory {
  category: string;
  count: number;
  faqs: FAQ[];
}

export interface FAQSearchResult {
  faqs: FAQ[];
  total: number;
  categories: string[];
  searchTerm?: string;
  category?: string;
}

export interface FAQSchemaData {
  "@context": string;
  "@type": string;
  mainEntity: Array<{
    "@type": string;
    name: string;
    acceptedAnswer: {
      "@type": string;
      text: string;
    };
  }>;
}

interface CacheItem {
  data: any;
  timestamp: number;
}

export class FAQService {
  private prisma: PrismaClient;
  private cache: Map<string, CacheItem>;
  private cacheTTL: number;
  private supportedLocales: string[];

  constructor() {
    this.prisma = new PrismaClient();
    this.cache = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 hour
    this.supportedLocales = ['es', 'en', 'pt'];
  }

  /**
   * Get FAQs by locale with optional category filtering and search
   */
  async getFAQs(
    locale: string,
    category?: string,
    search?: string,
    limit: number = 50
  ): Promise<FAQSearchResult> {
    try {
      // Validate and normalize locale
      if (!this.isValidLocale(locale)) {
        locale = 'es'; // fallback to Spanish
      }

      const cacheKey = `faqs_${locale}_${category || 'all'}_${search || 'none'}_${limit}`;

      // Check cache first
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      // Build where conditions
      const whereConditions: any = {
        locale,
        isPublished: true
      };

      if (category) {
        whereConditions.category = category;
      }

      if (search) {
        whereConditions.OR = [
          {
            question: {
              contains: search,
              mode: 'insensitive'
            }
          },
          {
            answer: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ];
      }

      // Fetch FAQs
      const faqs = await this.prisma.faq.findMany({
        where: whereConditions,
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
          sortOrder: true,
          isPublished: true
        },
        orderBy: [
          { category: 'asc' },
          { sortOrder: 'asc' },
          { question: 'asc' }
        ],
        take: limit
      });

      // Get all categories for this locale (for filter options)
      const allCategories = await this.prisma.faq.groupBy({
        by: ['category'],
        where: {
          locale,
          isPublished: true
        },
        orderBy: {
          category: 'asc'
        }
      });

      const result: FAQSearchResult = {
        faqs: faqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          isPublished: faq.isPublished
        })),
        total: faqs.length,
        categories: allCategories.map(cat => cat.category),
        searchTerm: search,
        category
      };

      // Cache the result
      this.setCache(cacheKey, result);

      return result;

    } catch (error) {
      console.error('Error fetching FAQs:', error);
      throw new Error(`Failed to fetch FAQs for locale: ${locale}`);
    }
  }

  /**
   * Get FAQs grouped by category
   */
  async getFAQsByCategory(locale: string): Promise<FAQCategory[]> {
    try {
      if (!this.isValidLocale(locale)) {
        locale = 'es';
      }

      const cacheKey = `faqs_by_category_${locale}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const faqs = await this.prisma.faq.findMany({
        where: {
          locale,
          isPublished: true
        },
        select: {
          id: true,
          question: true,
          answer: true,
          category: true,
          sortOrder: true,
          isPublished: true
        },
        orderBy: [
          { category: 'asc' },
          { sortOrder: 'asc' },
          { question: 'asc' }
        ]
      });

      // Group by category
      const groupedFAQs = faqs.reduce((acc, faq) => {
        const category = faq.category;
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          sortOrder: faq.sortOrder,
          isPublished: faq.isPublished
        });
        return acc;
      }, {} as Record<string, FAQ[]>);

      const result: FAQCategory[] = Object.entries(groupedFAQs).map(([category, faqs]) => ({
        category,
        count: faqs.length,
        faqs
      }));

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching FAQs by category:', error);
      throw new Error(`Failed to fetch FAQs by category for locale: ${locale}`);
    }
  }

  /**
   * Generate Schema.org FAQPage structured data
   */
  async generateSchemaData(locale: string, category?: string): Promise<FAQSchemaData> {
    try {
      const faqData = await this.getFAQs(locale, category);

      return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqData.faqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        }))
      };

    } catch (error) {
      console.error('Error generating schema data:', error);
      throw new Error('Failed to generate FAQ schema data');
    }
  }

  /**
   * Get available categories for a locale
   */
  async getCategories(locale: string): Promise<string[]> {
    try {
      if (!this.isValidLocale(locale)) {
        locale = 'es';
      }

      const cacheKey = `categories_${locale}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const categories = await this.prisma.faq.groupBy({
        by: ['category'],
        where: {
          locale,
          isPublished: true
        },
        orderBy: {
          category: 'asc'
        }
      });

      const result = categories.map(cat => cat.category);
      this.setCache(cacheKey, result);

      return result;

    } catch (error) {
      console.error('Error fetching categories:', error);
      throw new Error(`Failed to fetch categories for locale: ${locale}`);
    }
  }

  /**
   * Get FAQ statistics
   */
  async getStats(locale?: string): Promise<{
    totalFAQs: number;
    totalCategories: number;
    faqsByLocale: Record<string, number>;
    categoriesCount: Record<string, number>;
  }> {
    try {
      const cacheKey = `faq_stats_${locale || 'all'}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }

      const whereCondition = locale ? { locale, isPublished: true } : { isPublished: true };

      // Total FAQs
      const totalFAQs = await this.prisma.faq.count({
        where: whereCondition
      });

      // FAQs by locale
      const faqsByLocaleData = await this.prisma.faq.groupBy({
        by: ['locale'],
        where: { isPublished: true },
        _count: {
          id: true
        }
      });

      const faqsByLocale = faqsByLocaleData.reduce((acc, item) => {
        acc[item.locale] = item._count.id;
        return acc;
      }, {} as Record<string, number>);

      // Categories count
      const categoriesData = await this.prisma.faq.groupBy({
        by: ['category'],
        where: whereCondition,
        _count: {
          id: true
        }
      });

      const categoriesCount = categoriesData.reduce((acc, item) => {
        acc[item.category] = item._count.id;
        return acc;
      }, {} as Record<string, number>);

      const result = {
        totalFAQs,
        totalCategories: categoriesData.length,
        faqsByLocale,
        categoriesCount
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching FAQ stats:', error);
      throw new Error('Failed to fetch FAQ statistics');
    }
  }

  /**
   * Clear FAQ cache
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
   * Validate locale
   */
  private isValidLocale(locale: string): boolean {
    return this.supportedLocales.includes(locale);
  }

  /**
   * Get content from cache
   */
  private getFromCache(cacheKey: string): any | null {
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
  private setCache(cacheKey: string, data: any): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Clean old entries periodically
    if (this.cache.size > 100) {
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
}

// Export a singleton instance
export const faqService = new FAQService();