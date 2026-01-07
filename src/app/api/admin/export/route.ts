import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { prisma } from '@/lib/database/prisma';
import { QuoteStatusService } from '@/lib/quotes/QuoteStatusService';
import { ContactStatusService } from '@/lib/contacts/ContactStatusService';
import { exportQuotesToCSV, exportContactsToCSV, generateCSVDownload } from '@/lib/export/csvExporter';

// POST /api/admin/export - Export data to CSV
export async function POST(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await req.json();
    const { type, filters, ids } = body;

    // Validate type
    if (!type || !['quotes', 'contacts'].includes(type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid type. Must be "quotes" or "contacts"' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (type === 'quotes') {
      // Export quotes
      let quotes;

      if (ids && Array.isArray(ids) && ids.length > 0) {
        // Export specific quotes by IDs
        quotes = await prisma.quoteRequest.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        // Export with filters
        const where: any = {};

        if (filters) {
          // Date range filter
          if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
              where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
              where.createdAt.lte = new Date(filters.dateTo);
            }
          }

          // Service type filter
          if (filters.serviceType) {
            where.serviceType = filters.serviceType;
          }

          // Search filter
          if (filters.search) {
            where.OR = [
              { fullName: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { origin: { contains: filters.search, mode: 'insensitive' } },
              { destination: { contains: filters.search, mode: 'insensitive' } },
            ];
          }
        }

        quotes = await prisma.quoteRequest.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
      }

      // Get current status for each quote
      const quotesWithStatus = await Promise.all(
        quotes.map(async (quote) => {
          const currentStatus = await QuoteStatusService.getCurrentQuoteStatus(quote.id);
          return {
            ...quote,
            currentStatus,
          };
        })
      );

      // Apply status filter if provided (after fetching current status)
      let filteredQuotes = quotesWithStatus;
      if (filters?.status && !ids) {
        filteredQuotes = quotesWithStatus.filter((quote) => quote.currentStatus === filters.status);
      }

      // Apply stale filter if provided
      if (filters?.staleOnly && !ids) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        filteredQuotes = filteredQuotes.filter(
          (quote) =>
            (quote.currentStatus === 'pending' || quote.currentStatus === 'processing') &&
            new Date(quote.createdAt) <= sevenDaysAgo
        );
      }

      const csv = exportQuotesToCSV(filteredQuotes);
      const filename = `quotes-export-${new Date().toISOString().split('T')[0]}.csv`;

      return generateCSVDownload(csv, filename);
    } else {
      // Export contacts
      let contacts;

      if (ids && Array.isArray(ids) && ids.length > 0) {
        // Export specific contacts by IDs
        contacts = await prisma.contactForm.findMany({
          where: {
            id: {
              in: ids,
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } else {
        // Export with filters
        const where: any = {};

        if (filters) {
          // Date range filter
          if (filters.dateFrom || filters.dateTo) {
            where.createdAt = {};
            if (filters.dateFrom) {
              where.createdAt.gte = new Date(filters.dateFrom);
            }
            if (filters.dateTo) {
              where.createdAt.lte = new Date(filters.dateTo);
            }
          }

          // Search filter
          if (filters.search) {
            where.OR = [
              { fullName: { contains: filters.search, mode: 'insensitive' } },
              { email: { contains: filters.search, mode: 'insensitive' } },
              { subject: { contains: filters.search, mode: 'insensitive' } },
              { message: { contains: filters.search, mode: 'insensitive' } },
            ];
          }
        }

        contacts = await prisma.contactForm.findMany({
          where,
          orderBy: { createdAt: 'desc' },
        });
      }

      // Get current status for each contact
      const contactsWithStatus = await Promise.all(
        contacts.map(async (contact) => {
          const currentStatus = await ContactStatusService.getCurrentContactStatus(contact.id);
          return {
            ...contact,
            currentStatus,
          };
        })
      );

      // Apply status filter if provided (after fetching current status)
      let filteredContacts = contactsWithStatus;
      if (filters?.status && !ids) {
        filteredContacts = contactsWithStatus.filter((contact) => contact.currentStatus === filters.status);
      }

      const csv = exportContactsToCSV(filteredContacts);
      const filename = `contacts-export-${new Date().toISOString().split('T')[0]}.csv`;

      return generateCSVDownload(csv, filename);
    }
  } catch (error) {
    console.error('Export API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
