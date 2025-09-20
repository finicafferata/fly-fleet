import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../../lib/email/EmailService';
import { recaptchaService } from '../../../lib/recaptcha/RecaptchaService';
import {
  generateAriaValidationResponse,
  generateAriaSuccessInfo,
  generateAriaErrorResponse,
  generateAriaLoadingInfo,
  type Locale
} from '../../../lib/accessibility/aria-helpers';

const prisma = new PrismaClient();
const emailService = new EmailService();

// Additional Services Enum (EXACT match to database enum)
const AdditionalService = z.enum([
  'international_support',     // Apoyo vuelos internacionales
  'country_documentation',     // Documentación por país
  'pet_friendly_transport',    // Transporte pet-friendly
  'ground_transfer_driver',    // Transfer terrestre / chofer
  'premium_catering',          // Catering premium
  'vip_lounge_fbo',           // Sala VIP / FBO específico
  'customs_immigration_assist' // Asistencia migraciones/aduana
]);

const QuoteRequestSchema = z.object({
  service: z.enum(['charter', 'empty_legs', 'multicity', 'helicopter', 'medical', 'cargo', 'other']),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  passengers: z.number().int().min(1).max(50),
  origin: z.string().length(3), // IATA code - validated against airports table
  destination: z.string().length(3), // IATA code - validated against airports table
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  time: z.string().regex(/^\d{2}:\d{2}$/),

  // CORRECTED: Database field names
  standardBagsCount: z.number().int().min(0).max(20).default(0),
  specialItems: z.string().max(500).optional(),

  // Pet information
  pets: z.boolean().default(false),
  petSpecies: z.string().max(50).optional(),
  petSize: z.string().max(20).optional(),
  petDocuments: z.boolean().optional(),

  // Additional services using enum
  additionalServices: z.array(AdditionalService).optional().default([]),
  comments: z.string().max(1000).optional(),
  privacyConsent: z.boolean().refine(val => val === true),
  locale: z.enum(['es', 'en', 'pt']),
  recaptchaToken: z.string()
});

// Extract UTM from headers, query params, and request body
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

// Email service with dynamic subjects
const getQuoteSubject = (locale: string, origin: string, destination: string, date: string) => {
  const subjects = {
    es: `Nueva cotización – ${origin}-${destination} / ${date}`,
    en: `New quote request – ${origin}-${destination} / ${date}`,
    pt: `Nova cotação – ${origin}-${destination} / ${date}`
  };
  return subjects[locale as keyof typeof subjects] || subjects.es;
};

const autoResponseSubjects = {
  es: `Confirmación de cotización recibida`,
  en: `Quote request confirmation`,
  pt: `Confirmação de cotação recebida`
};

// Simple rate limiting (in-memory store)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 7;

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
      const ariaError = generateAriaErrorResponse('rateLimit', 'en'); // Default to English, will be enhanced with locale detection
      return NextResponse.json(
        {
          ...ariaError,
          accessibility: {
            ...ariaError.accessibility,
            formStatus: 'error',
            nextSteps: 'Please wait before submitting another request'
          }
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = QuoteRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const locale = (body.locale as Locale) || 'en';
      const ariaValidation = generateAriaValidationResponse(
        validationResult.error.issues,
        locale,
        'quote'
      );

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
          accessibility: ariaValidation,
          ariaLiveMessage: ariaValidation.ariaLiveRegion,
          ariaAnnouncement: ariaValidation.globalError?.screenReaderAnnouncement,
          focusTarget: '#quote-form',
          fieldErrors: ariaValidation.fieldErrors
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // Verify reCAPTCHA token
    const recaptchaResult = await recaptchaService.verifyToken(
      formData.recaptchaToken,
      'quote_request',
      clientIP
    );

    if (!recaptchaResult.success) {
      console.warn('reCAPTCHA verification failed for quote request:', {
        ip: clientIP,
        errors: recaptchaResult.errors,
        score: recaptchaResult.score
      });

      const ariaError = generateAriaErrorResponse('recaptcha', formData.locale);
      return NextResponse.json(
        {
          ...ariaError,
          details: recaptchaResult.errors,
          accessibility: {
            ...ariaError.accessibility,
            formStatus: 'error',
            nextSteps: 'Please refresh the page and try again',
            fieldTarget: '#recaptcha-field'
          }
        },
        { status: 400 }
      );
    }

    // Validate IATA codes against airports table
    const [originAirport, destinationAirport] = await Promise.all([
      prisma.airport.findUnique({ where: { iataCode: formData.origin } }),
      prisma.airport.findUnique({ where: { iataCode: formData.destination } })
    ]);

    if (!originAirport) {
      const ariaError = generateAriaErrorResponse('validation', formData.locale);
      return NextResponse.json(
        {
          ...ariaError,
          error: `Origin airport code '${formData.origin}' is not valid`,
          fieldErrors: {
            origin: {
              ariaLabel: `Origin airport - Invalid airport code ${formData.origin}`,
              ariaDescribedBy: 'origin-error',
              ariaInvalid: true,
              ariaErrorMessage: `Airport code ${formData.origin} is not valid`,
              screenReaderAnnouncement: `Error in origin field: Airport code ${formData.origin} is not valid`
            }
          },
          accessibility: {
            ...ariaError.accessibility,
            fieldTarget: '#origin-field'
          }
        },
        { status: 400 }
      );
    }

    if (!destinationAirport) {
      const ariaError = generateAriaErrorResponse('validation', formData.locale);
      return NextResponse.json(
        {
          ...ariaError,
          error: `Destination airport code '${formData.destination}' is not valid`,
          fieldErrors: {
            destination: {
              ariaLabel: `Destination airport - Invalid airport code ${formData.destination}`,
              ariaDescribedBy: 'destination-error',
              ariaInvalid: true,
              ariaErrorMessage: `Airport code ${formData.destination} is not valid`,
              screenReaderAnnouncement: `Error in destination field: Airport code ${formData.destination} is not valid`
            }
          },
          accessibility: {
            ...ariaError.accessibility,
            fieldTarget: '#destination-field'
          }
        },
        { status: 400 }
      );
    }

    // Extract UTM parameters
    const utmParams = extractUTMParams(req, body);

    // Parse date and time - convert time to DateTime for Prisma
    const departureDateTime = new Date(`${formData.date}T${formData.time}:00`);

    // Create quote request with CORRECTED field names
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        serviceType: formData.service,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        passengers: formData.passengers,
        origin: formData.origin,
        destination: formData.destination,
        departureDate: new Date(formData.date),
        departureTime: departureDateTime,
        // CORRECTED: Use database field names
        standardBagsCount: formData.standardBagsCount,
        specialItems: formData.specialItems,
        hasPets: formData.pets,
        petSpecies: formData.petSpecies,
        petSize: formData.petSize,
        petDocuments: formData.petDocuments,
        additionalServices: formData.additionalServices, // JSON array of enums
        comments: formData.comments,
        locale: formData.locale,
        privacyConsent: formData.privacyConsent,
        ipAddress: clientIP,
        userAgent: req.headers.get('user-agent'),
        // UTM parameters properly extracted
        utmSource: utmParams.utm_source,
        utmMedium: utmParams.utm_medium,
        utmCampaign: utmParams.utm_campaign
      }
    });

    // Send business notification email
    try {
      await emailService.sendQuoteNotification({
        quoteData: quoteRequest,
        subject: getQuoteSubject(formData.locale, formData.origin, formData.destination, formData.date),
        locale: formData.locale
      });

      // Send auto-response to customer
      await emailService.sendQuoteAutoResponse({
        email: formData.email,
        fullName: formData.fullName,
        locale: formData.locale,
        quoteData: quoteRequest
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue execution - don't fail the entire request if email fails
    }

    // Log successful request
    console.log(`Quote request created: ${quoteRequest.id} from IP: ${clientIP}`);

    // Generate success response with ARIA information
    const ariaSuccess = generateAriaSuccessInfo('quote', formData.locale, { id: quoteRequest.id });

    return NextResponse.json({
      success: true,
      quoteId: quoteRequest.id,
      message: 'Quote request submitted successfully',
      accessibility: {
        ariaLiveMessage: ariaSuccess.ariaLiveMessage,
        ariaAnnouncement: ariaSuccess.ariaAnnouncement,
        focusTarget: ariaSuccess.focusTarget,
        nextAction: ariaSuccess.nextAction,
        formStatus: 'submitted',
        screenReaderText: `Quote request ${quoteRequest.id} submitted successfully for ${formData.origin} to ${formData.destination} on ${formData.date}`,
        politenessLevel: 'assertive',
        confirmationId: quoteRequest.id
      },
      quoteDetails: {
        route: `${formData.origin} to ${formData.destination}`,
        date: formData.date,
        passengers: formData.passengers,
        service: formData.service,
        ariaDescription: `Quote request for ${formData.service} service from ${originAirport.cityName} to ${destinationAirport.cityName} on ${formData.date} for ${formData.passengers} passengers`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Quote API error:', error);

    const ariaError = generateAriaErrorResponse('server', 'en'); // Default locale for server errors
    return NextResponse.json(
      {
        ...ariaError,
        accessibility: {
          ...ariaError.accessibility,
          formStatus: 'error',
          retryInstructions: 'Please check your connection and try again',
          supportContact: 'If the problem persists, contact support'
        }
      },
      { status: 500 }
    );
  }
}

