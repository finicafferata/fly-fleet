import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '../../../generated/prisma';
import { EmailService } from '../../../lib/email/EmailService';
import { recaptchaService } from '../../../lib/recaptcha/RecaptchaService';
import {
  generateAriaValidationResponse,
  generateAriaSuccessInfo,
  generateAriaErrorResponse,
  type Locale
} from '../../../lib/accessibility/aria-helpers';

const prisma = new PrismaClient();
const emailService = new EmailService();

const ContactFormSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(1000),
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

  return req.ip || 'unknown';
};

// Contact form subjects by locale
const contactSubjects = {
  es: (fullName: string) => `Nuevo contacto - ${fullName}`,
  en: (fullName: string) => `New contact - ${fullName}`,
  pt: (fullName: string) => `Novo contato - ${fullName}`
};

// Simple rate limiting (in-memory store)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (ip: string): boolean => {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5; // Lower than quote form for spam protection

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
            nextSteps: 'Please wait before submitting another contact request'
          }
        },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = ContactFormSchema.safeParse(body);

    if (!validationResult.success) {
      const locale = (body.locale as Locale) || 'en';
      const ariaValidation = generateAriaValidationResponse(
        validationResult.error.errors,
        locale,
        'contact'
      );

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors,
          accessibility: ariaValidation,
          ariaLiveMessage: ariaValidation.ariaLiveRegion,
          ariaAnnouncement: ariaValidation.globalError?.screenReaderAnnouncement,
          focusTarget: '#contact-form',
          fieldErrors: ariaValidation.fieldErrors
        },
        { status: 400 }
      );
    }

    const formData = validationResult.data;

    // Verify reCAPTCHA token
    const recaptchaResult = await recaptchaService.verifyToken(
      formData.recaptchaToken,
      'contact_form',
      clientIP
    );

    if (!recaptchaResult.success) {
      console.warn('reCAPTCHA verification failed for contact form:', {
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

    // Extract UTM parameters
    const utmParams = extractUTMParams(req, body);

    // Create contact form submission
    const contactForm = await prisma.contactForm.create({
      data: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        locale: formData.locale,
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
      await emailService.sendContactNotification({
        contactData: contactForm,
        subject: contactSubjects[formData.locale](formData.fullName),
        locale: formData.locale
      });

      // Send auto-response to customer
      await emailService.sendContactAutoResponse({
        email: formData.email,
        fullName: formData.fullName,
        locale: formData.locale,
        contactData: contactForm
      });

    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue execution - don't fail the entire request if email fails
    }

    // Log successful request
    console.log(`Contact form submitted: ${contactForm.id} from IP: ${clientIP}`);

    // Generate success response with ARIA information
    const ariaSuccess = generateAriaSuccessInfo('contact', formData.locale, { id: contactForm.id });

    return NextResponse.json({
      success: true,
      contactId: contactForm.id,
      message: 'Contact form submitted successfully',
      accessibility: {
        ariaLiveMessage: ariaSuccess.ariaLiveMessage,
        ariaAnnouncement: ariaSuccess.ariaAnnouncement,
        focusTarget: ariaSuccess.focusTarget,
        nextAction: ariaSuccess.nextAction,
        formStatus: 'submitted',
        screenReaderText: `Contact message submitted successfully. Reference ID: ${contactForm.id}`,
        politenessLevel: 'assertive',
        confirmationId: contactForm.id
      },
      contactDetails: {
        subject: formData.subject || 'General inquiry',
        messageLength: formData.message.length,
        hasPhone: !!formData.phone,
        ariaDescription: `Contact form submitted${formData.subject ? ` about ${formData.subject}` : ''}`
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Contact API error:', error);

    const ariaError = generateAriaErrorResponse('server', 'en'); // Default locale for server errors
    return NextResponse.json(
      {
        ...ariaError,
        accessibility: {
          ...ariaError.accessibility,
          formStatus: 'error',
          retryInstructions: 'Please check your connection and try again',
          supportContact: 'If the problem persists, contact support directly'
        }
      },
      { status: 500 }
    );
  }
}