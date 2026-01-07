import { NextResponse } from 'next/server';

/**
 * Escape special characters for CSV format
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(headers: string[], rows: any[][]): string {
  const headerRow = headers.map(escapeCSVValue).join(',');
  const dataRows = rows.map((row) => row.map(escapeCSVValue).join(','));

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Export quotes to CSV format
 */
export function exportQuotesToCSV(quotes: any[]): string {
  const headers = [
    'ID',
    'Created Date',
    'Service Type',
    'Customer Name',
    'Email',
    'Phone',
    'Origin',
    'Destination',
    'Departure Date',
    'Departure Time',
    'Passengers',
    'Standard Bags',
    'Has Pets',
    'Pet Species',
    'Pet Size',
    'Special Items',
    'Additional Services',
    'Comments',
    'Current Status',
    'Locale',
    'Contact WhatsApp',
    'UTM Source',
    'UTM Medium',
    'UTM Campaign',
  ];

  const rows = quotes.map((quote) => [
    quote.id,
    quote.createdAt ? new Date(quote.createdAt).toLocaleString() : '',
    quote.serviceType || '',
    quote.fullName || '',
    quote.email || '',
    quote.phone || '',
    quote.origin || '',
    quote.destination || '',
    quote.departureDate ? new Date(quote.departureDate).toLocaleDateString() : '',
    quote.departureTime || '',
    quote.passengers || 0,
    quote.standardBagsCount || 0,
    quote.hasPets ? 'Yes' : 'No',
    quote.petSpecies || '',
    quote.petSize || '',
    quote.specialItems || '',
    quote.additionalServices ? JSON.stringify(quote.additionalServices) : '',
    quote.comments || '',
    quote.currentStatus || 'pending',
    quote.locale || '',
    quote.contactWhatsApp ? 'Yes' : 'No',
    quote.utmSource || '',
    quote.utmMedium || '',
    quote.utmCampaign || '',
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Export contacts to CSV format
 */
export function exportContactsToCSV(contacts: any[]): string {
  const headers = [
    'ID',
    'Created Date',
    'Full Name',
    'Email',
    'Phone',
    'Subject',
    'Message',
    'Contact Via WhatsApp',
    'Current Status',
    'Locale',
  ];

  const rows = contacts.map((contact) => [
    contact.id,
    contact.createdAt ? new Date(contact.createdAt).toLocaleString() : '',
    contact.fullName || '',
    contact.email || '',
    contact.phone || '',
    contact.subject || '',
    contact.message || '',
    contact.contactViaWhatsApp ? 'Yes' : 'No',
    contact.currentStatus || 'pending',
    contact.locale || '',
  ]);

  return arrayToCSV(headers, rows);
}

/**
 * Generate CSV download response
 */
export function generateCSVDownload(csvContent: string, filename: string): NextResponse {
  // Add BOM for proper UTF-8 encoding in Excel
  const BOM = '\uFEFF';
  const csvWithBOM = BOM + csvContent;

  return new NextResponse(csvWithBOM, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
}

/**
 * Export analytics data to CSV format
 */
export function exportAnalyticsToCSV(data: any[], headers: string[]): string {
  const rows = data.map((item) => {
    return headers.map((header) => item[header] || '');
  });

  return arrayToCSV(headers, rows);
}
