import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database/prisma';
import { EmailService } from '../../../lib/email/EmailService';
import { recaptchaService } from '../../../lib/recaptcha/RecaptchaService';
import { contactRateLimiter, getRateLimitHeaders } from '@/lib/redis/rate-limiter';
import {
  generateAriaValidationResponse,
  generateAriaSuccessInfo,
  generateAriaErrorResponse,
  type Locale
} from '../../../lib/accessibility/aria-helpers';
const emailService = new EmailService();

const ContactFormSchema = z.object({
  // Support both old and new formats
  fullName: z.string().min(2).max(100).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  contactViaWhatsApp: z.boolean().optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(1000),
  locale: z.enum(['es', 'en', 'pt']),
  recaptchaToken: z.string().optional(),
  inquiryType: z.string().optional()
}).refine(data => data.fullName || (data.firstName && data.lastName), {
  message: "Either fullName or both firstName and lastName are required"
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

// Contact form subjects by locale
const contactSubjects = {
  es: (fullName: string) => `Nuevo contacto - ${fullName}`,
  en: (fullName: string) => `New contact - ${fullName}`,
  pt: (fullName: string) => `Novo contato - ${fullName}`
};

// Distributed rate limiting using Redis (5 requests/hour per IP)

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);

    // Distributed rate limiting check (Redis-based)
    const rateLimitResult = await contactRateLimiter.limit(clientIP);

    if (!rateLimitResult.success) {
      const ariaError = generateAriaErrorResponse('rateLimit', 'en');
      return NextResponse.json(
        {
          ...ariaError,
          accessibility: {
            ...ariaError.accessibility,
            formStatus: 'error',
            nextSteps: 'Please wait before submitting another contact request'
          }
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult)
        }
      );
    }

    const body = await req.json();

    // Validate request body
    const validationResult = ContactFormSchema.safeParse(body);

    if (!validationResult.success) {
      const locale = (body.locale as Locale) || 'en';
      const ariaValidation = generateAriaValidationResponse(
        validationResult.error.issues,
        locale,
        'contact'
      );

      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.issues,
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

    // Combine firstName and lastName if they exist separately
    const fullName = formData.fullName || `${formData.firstName} ${formData.lastName}`;

    // Verify reCAPTCHA token (optional for simplified form)
    if (formData.recaptchaToken) {
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
    }

    // Extract UTM parameters
    const utmParams = extractUTMParams(req, body);

    // Create contact form submission
    const contactForm = await prisma.contactForm.create({
      data: {
        fullName: fullName,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        locale: formData.locale,
        contactViaWhatsApp: formData.contactViaWhatsApp || false,
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
        subject: contactSubjects[formData.locale](fullName),
        locale: formData.locale
      });

      // Send auto-response to customer
      await emailService.sendContactAutoResponse({
        email: formData.email,
        fullName: fullName,
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