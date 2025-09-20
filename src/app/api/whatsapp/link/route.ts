import { NextRequest, NextResponse } from 'next/server';
import { whatsappService, WhatsAppLinkRequest } from '../../../../lib/whatsapp/WhatsAppService';

// Get client IP address
const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
};

// Extract UTM parameters from request
const extractUTMParams = (req: NextRequest, body: any) => {
  const url = new URL(req.url);
  const headers = req.headers;

  return {
    utm_source:
      body.utm_source ||
      url.searchParams.get('utm_source') ||
      headers.get('utm-source') ||
      headers.get('referer')?.includes('google') ? 'google' :
      headers.get('referer')?.includes('facebook') ? 'facebook' : null,
    utm_medium:
      body.utm_medium ||
      url.searchParams.get('utm_medium') ||
      headers.get('utm-medium') || null,
    utm_campaign:
      body.utm_campaign ||
      url.searchParams.get('utm_campaign') ||
      headers.get('utm-campaign') || null
  };
};

// Validate request body
const validateRequest = (body: any): { valid: boolean; error?: string; data?: WhatsAppLinkRequest } => {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  // Required fields
  if (!body.type || !['general', 'quote', 'contact'].includes(body.type)) {
    return { valid: false, error: 'Type must be one of: general, quote, contact' };
  }

  if (!body.locale || !['es', 'en', 'pt'].includes(body.locale)) {
    return { valid: false, error: 'Locale must be one of: es, en, pt' };
  }

  // Type-specific validation
  if (body.type === 'quote') {
    if (!body.origin || typeof body.origin !== 'string') {
      return { valid: false, error: 'Origin is required for quote type' };
    }
    if (!body.destination || typeof body.destination !== 'string') {
      return { valid: false, error: 'Destination is required for quote type' };
    }
    if (!body.date || typeof body.date !== 'string') {
      return { valid: false, error: 'Date is required for quote type' };
    }
    if (!body.passengers || typeof body.passengers !== 'number' || body.passengers < 1) {
      return { valid: false, error: 'Valid passenger count is required for quote type' };
    }
  }

  if (body.type === 'contact') {
    if (!body.message || typeof body.message !== 'string' || body.message.length === 0) {
      return { valid: false, error: 'Message is required for contact type' };
    }
  }

  return {
    valid: true,
    data: {
      type: body.type,
      locale: body.locale,
      pageSource: body.pageSource,
      sessionId: body.sessionId,

      // Contact info
      email: body.email,
      phone: body.phone,
      fullName: body.fullName,

      // Quote-specific fields
      origin: body.origin,
      destination: body.destination,
      date: body.date,
      time: body.time,
      passengers: body.passengers,
      serviceType: body.serviceType,
      bags: body.bags || 0,
      specialItems: body.specialItems,
      additionalServices: Array.isArray(body.additionalServices) ? body.additionalServices : [],
      comments: body.comments,

      // Contact-specific fields
      subject: body.subject,
      message: body.message
    }
  };
};

// Simple rate limiting (in-memory store)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 20; // Allow more requests than forms as this is just link generation

  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
};

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Rate limiting check
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 20 WhatsApp link requests per hour.' },
        { status: 429 }
      );
    }

    let body;

    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const requestData = validation.data!;
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // Extract UTM parameters
    const utmParams = extractUTMParams(req, body);

    // Add UTM parameters to request data
    requestData.utmSource = utmParams.utm_source || undefined;
    requestData.utmMedium = utmParams.utm_medium || undefined;
    requestData.utmCampaign = utmParams.utm_campaign || undefined;

    // Generate WhatsApp link and store click
    const result = await whatsappService.generateWhatsAppLink(
      requestData,
      clientIP,
      userAgent
    );

    return NextResponse.json({
      success: true,
      clickId: result.clickId,
      whatsappUrl: result.whatsappUrl,
      message: result.message,
      metadata: {
        type: requestData.type,
        locale: requestData.locale,
        clientIP,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('WhatsApp link generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check and statistics endpoint
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') as 'today' | 'week' | 'month' || 'today';
    const clickId = searchParams.get('clickId');

    // If clickId is provided, return specific click data
    if (clickId) {
      const clickData = await whatsappService.getClick(clickId);
      if (!clickData) {
        return NextResponse.json(
          { error: 'Click not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        click: clickData
      });
    }

    // Otherwise return statistics
    const stats = await whatsappService.getClickStats(timeframe);

    return NextResponse.json({
      status: 'healthy',
      timeframe,
      statistics: stats
    });

  } catch (error) {
    console.error('WhatsApp API GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}