Fly-Fleet Complete Development Specification & User Stories
🎯 Project Vision & Overview
Company: Fly-Fleet - Private jet charter brokerage Domain: https://fly-fleet.com/ Contact: contact@fly-fleet.com | WhatsApp: +54 9 11 6660-1927 Primary Goal: Generate qualified leads through quote forms and WhatsApp Target Market: Private aviation customers in Latin America (ES/EN/PT)
Key Success Metrics:
Lead conversion rate target: 5-8%
Form completion rate: >60%
Page load time: <3s
Mobile traffic support: 60%+ expected

📊 Technical Architecture & Story Organization
Story Numbering Convention
DB-X.Y: Database Layer - Data models, schemas, migrations
BE-X.Y: Backend/API Layer - Business logic, API endpoints, integrations 
FE-X.Y: Frontend Layer - UI components, user interactions, client-side logic
US-X.Y: User Stories - New features and enhancements

Where X = Epic number, Y = Story sequence

Priority Levels
P0 - Critical MVP (Week 1-2): Core functionality required for launch
P1 - Essential Features (Week 2-3): Important for user experience and trust
P2 - Enhanced Experience (Week 3-4): Improvements for conversion optimization
P3 - Nice to Have (Post-launch): Additional features for growth

🏗️ Technical Stack Specification
Frontend Framework
Next.js 14+ with App Router
TypeScript for type safety
Tailwind CSS for styling
next-intl for internationalization (ES/EN/PT)
Backend Infrastructure
API Routes: Next.js API Routes
Email Service: Resend
Database: PostgreSQL with Prisma ORM
Security: Google reCAPTCHA v3
Key Integrations
Analytics: Google Analytics 4 with custom events
WhatsApp: Floating widget with pre-filled messages by language
Monitoring: Sentry for error tracking
IP Geolocation: For automatic country code detection
Performance Requirements
Lighthouse Score: ≥90 (desktop), ≥80 (mobile)
Core Web Vitals: Optimized LCP (<2.5s), FID (<100ms), CLS (<0.1)
SEO: Schema markup, multi-language sitemaps, meta tags

🎨 Design System Specification
Color Palette
/* Primary Colors */
--navy: #0B1E3C;           /* Brand color, headers, logo */
--accent-blue: #2F6AEF;    /* CTAs, links, interactive elements */
--neutral-light: #F4F6F8;  /* Backgrounds, subtle elements */
--neutral-medium: #828FA0; /* Secondary text, borders */
--white: #FFFFFF;          /* Base background */
--black: #000000;          /* Primary text */

Typography
Headlines: Soul Gaze BC (elegant, premium feel)
Body Text: Poppins (readable, modern)
Hierarchy: Clear H1-H6 structure with proper sizing
Visual Style
Aesthetic: Elegant, technological, trustworthy
Photography: Lifestyle imagery showing business travelers, aircraft interiors
Icons: Professional aviation and business icons
Accessibility: WCAG 2.1 AA compliance, proper contrast ratios

📍 Site Architecture & URL Structure
URL Structure
/ (Spanish - default)
/en/ (English)
/pt/ (Portuguese/Brazilian)

Pages per language:
├── / (Home)
├── /que-hacemos (/what-we-do, /o-que-fazemos)
├── /cotizar (/quote, /cotacao)
├── /servicios (/services, /servicos)
├── /flota-destinos (/fleet-destinations, /frota-destinos)
├── /faqs
├── /nosotros (/about, /sobre-nos)
├── /contacto (/contact, /contato)
└── /legal/ (terms, privacy, cookies)

Project Structure
/src
├── /app
│   ├── /[locale]          # Internationalized routes
│   │   ├── page.tsx       # Homepage
│   │   ├── /cotizar       # Quote page
│   │   ├── /servicios     # Services
│   │   └── /contacto      # Contact
│   └── /api               # API routes
├── /components
│   ├── /ui                # Reusable UI components
│   ├── /forms             # Form components
│   └── /layout            # Layout components
├── /lib
│   ├── /validations       # Zod schemas
│   └── /utils             # Utility functions
└── /messages              # Translation files
   ├── es.json
   ├── en.json
   └── pt.json


🗄️ DATABASE SCHEMA (DBML FORMAT)
// ================================================================================================
// FLY-FLEET DATABASE SCHEMA - DBML FORMAT
// Private Jet Charter Brokerage Platform
// ================================================================================================

// ENUMS
// ================================================================================================

Enum service_type {
  charter
  empty_legs
  multicity
  helicopter
  medical
  cargo
  other
}

Enum content_type {
  text
  html
  json
  image_url
}

Enum quote_status {
  pending
  processing
  quoted
  converted
  closed
}

Enum contact_status {
  pending
  responded
  closed
}

Enum additional_service {
  international_support     // Apoyo vuelos internacionales
  country_documentation     // Documentación por país
  pet_friendly_transport    // Transporte pet-friendly
  ground_transfer_driver    // Transfer terrestre / chofer
  premium_catering          // Catering premium
  vip_lounge_fbo           // Sala VIP / FBO específico
  customs_immigration_assist // Asistencia migraciones/aduana
}

// TABLES
// ================================================================================================

Table airports {
  id uuid [primary key]
  iata_code varchar(3) [unique, not null]
  icao_code varchar(4)
  airport_name varchar(200) [not null]
  city_name varchar(100) [not null]
  country_code varchar(2) [not null, note: 'ISO 3166-1 alpha-2']
  region_code varchar(10) [not null, note: 'Custom region codes: SA, NA, EU']
  latitude decimal(10,8)
  longitude decimal(11,8)
  is_active boolean [default: true]
  is_popular boolean [default: false]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    iata_code
    city_name
    country_code
    region_code
    (is_popular) [where: 'is_popular = true']
  }
}

Table airport_translations {
  id uuid [primary key]
  entity_type varchar(20) [not null, note: 'country or region']
  entity_code varchar(10) [not null, note: 'AR, BR, SA, NA, etc']
  entity_name_en varchar(100) [not null]
  entity_name_es varchar(100) [not null]
  entity_name_pt varchar(100) [not null]
  created_at timestamp [default: `now()`]
  
  indexes {
    (entity_type, entity_code) [unique, name: 'unique_entity']
    entity_type
    entity_code
  }
}

Table quote_requests {
  id uuid [primary key]
  service_type service_type [not null]
  full_name varchar(100) [not null]
  email varchar(255) [not null]
  phone varchar(20)
  passengers integer [not null, note: 'CHECK: > 0']
  origin varchar(3) [not null]
  destination varchar(3) [not null]
  departure_date date [not null]
  departure_time time [not null]
  standard_bags_count integer [default: 0]
  special_items text
  has_pets boolean [default: false]
  pet_species varchar(50)
  pet_size varchar(20)
  pet_documents boolean
  additional_services json [note: 'Array of additional_service enum values']
  comments text
  locale varchar(5) [not null, note: 'es, en, pt']
  privacy_consent boolean [not null, default: true]
  ip_address varchar(45)
  user_agent text
  utm_source varchar(50)
  utm_medium varchar(50)
  utm_campaign varchar(50)
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    email
    created_at [name: 'idx_created_desc']
    locale
    service_type
    (origin, destination) [name: 'idx_route']
    utm_source
  }
}

Table contact_forms {
  id uuid [primary key]
  full_name varchar(100) [not null]
  email varchar(255) [not null]
  phone varchar(20)
  subject varchar(200)
  message text [not null]
  locale varchar(5) [not null, note: 'es, en, pt']
  ip_address varchar(45)
  user_agent text
  utm_source varchar(50)
  utm_medium varchar(50)
  utm_campaign varchar(50)
  created_at timestamp [default: `now()`]
  
  indexes {
    email
    created_at
    locale
  }
}

Table analytics_events {
  id uuid [primary key]
  event_name varchar(50) [not null]
  user_id varchar(100) [note: 'Anonymous user ID']
  session_id varchar(100)
  event_data json [note: 'Flexible event properties']
  page_path varchar(255)
  referrer varchar(255)
  user_agent text
  ip_address varchar(45)
  locale varchar(5) [note: 'es, en, pt']
  timestamp timestamp [default: `now()`]
  
  indexes {
    event_name
    timestamp [name: 'idx_timestamp_desc']
    locale
    user_id
    session_id
  }
}

Table whatsapp_clicks {
  id uuid [primary key]
  session_id varchar(100)
  page_source varchar(255) [note: 'which page they clicked from']
  utm_source varchar(50)
  utm_medium varchar(50)
  utm_campaign varchar(50)
  ip_address varchar(45)
  locale varchar(5) [note: 'es, en, pt']
  created_at timestamp [default: `now()`]
  
  indexes {
    session_id
    page_source
    created_at [name: 'idx_whatsapp_clicks_created']
    locale
    utm_source
  }
}

Table email_deliveries {
  id uuid [primary key]
  quote_request_id uuid [note: 'references quote_requests(id)']
  contact_form_id uuid [note: 'references contact_forms(id)']
  email_type varchar(50) [not null, note: 'quote_notification, quote_autoresponse, contact_notification, contact_autoresponse']
  recipient_email varchar(255) [not null]
  sender_email varchar(255) [not null]
  subject varchar(500) [not null]
  resend_message_id varchar(100) [note: 'Resend message ID']
  status varchar(50) [default: 'pending', note: 'pending, sent, delivered, bounced, failed']
  sent_at timestamp
  delivered_at timestamp
  bounced_at timestamp
  failed_at timestamp
  error_message text
  webhook_data json
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    quote_request_id
    contact_form_id
    status
    resend_message_id
    created_at
  }
}

Table page_content {
  id uuid [primary key]
  page_slug varchar(100) [not null, note: 'homepage, services, about']
  locale varchar(5) [not null, note: 'es, en, pt']
  content_key varchar(100) [not null, note: 'hero_title, hero_subtitle']
  content_value text [not null]
  content_type content_type [default: 'text']
  is_published boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (page_slug, locale) [name: 'idx_page_locale']
    is_published
    (page_slug, locale, content_key) [unique, name: 'unique_content']
  }
}

Table faqs {
  id uuid [primary key]
  question text [not null]
  answer text [not null]
  category varchar(50) [not null]
  locale varchar(5) [not null, note: 'es, en, pt']
  sort_order integer [default: 0]
  is_published boolean [default: true]
  created_at timestamp [default: `now()`]
  updated_at timestamp [default: `now()`]
  
  indexes {
    (category, locale, sort_order) [name: 'idx_category_locale_order']
    is_published
    locale
  }
}

Table testimonials {
  id uuid [primary key]
  customer_name varchar(100) [not null]
  customer_title varchar(100)
  customer_company varchar(100)
  customer_location varchar(100)
  customer_photo_url varchar(500)
  testimonial_text text [not null]
  rating integer [note: 'CHECK: BETWEEN 1 AND 5']
  service_used varchar(50)
  date_of_service date
  is_featured boolean [default: false]
  is_published boolean [default: true]
  locale varchar(5) [not null, note: 'es, en, pt']
  sort_order integer [default: 0]
  created_at timestamp [default: `now()`]
  
  indexes {
    (is_published, sort_order) [name: 'idx_published_order']
    is_featured
    locale
    rating
  }
}

// RELATIONSHIPS
// ================================================================================================

Ref: quote_requests.origin > airports.iata_code [delete: restrict]
Ref: quote_requests.destination > airports.iata_code [delete: restrict]
Ref: email_deliveries.quote_request_id > quote_requests.id [delete: cascade]
Ref: email_deliveries.contact_form_id > contact_forms.id [delete: cascade]


Epic 1: Foundation & Infrastructure (P0)
⚙️ BACKEND/API LAYER
BE-1.1: Quote Form API Endpoint (FULLY UPDATED)
As a frontend developer I want a robust quote submission API with complete UTM tracking and proper email notifications So that I can reliably submit user quote requests with full attribution tracking
Acceptance Criteria:
[ ] Create POST /api/quote endpoint with UTM parameter extraction
[ ] Implement request validation using corrected Zod schema:
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
  date: z.string().date(),
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

[ ] Extract and store UTM parameters from multiple sources:
// Extract UTM from headers, query params, and request body
const extractUTMParams = (req: Request, body: any) => {
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

[ ] Validate IATA codes against airports table (foreign key constraint)
[ ] Store quote request with proper database field mapping
[ ] Send emails with hardcoded subjects based on locale
[ ] Track email delivery in email_deliveries table
[ ] Return structured response with quote ID and status
[ ] Handle validation errors with proper HTTP status codes
[ ] Implement rate limiting (7 requests per IP per hour)
[ ] Add request logging and monitoring
Database Implementation with proper field mapping:
// Create quote request with CORRECTED field names
const quoteRequest = await prisma.quote_requests.create({
  data: {
    service_type: formData.service,
    full_name: formData.fullName,
    email: formData.email,
    phone: formData.phone,
    passengers: formData.passengers,
    origin: formData.origin,
    destination: formData.destination,
    departure_date: new Date(formData.date),
    departure_time: formData.time,
    // CORRECTED: Use database field names
    standard_bags_count: formData.standardBagsCount,
    special_items: formData.specialItems,
    has_pets: formData.pets,
    pet_species: formData.petSpecies,
    pet_size: formData.petSize,
    pet_documents: formData.petDocuments,
    additional_services: formData.additionalServices, // JSON array of enums
    comments: formData.comments,
    locale: formData.locale,
    privacy_consent: formData.privacyConsent,
    ip_address: getClientIP(req),
    user_agent: req.headers.get('user-agent'),
    // UTM parameters properly extracted
    utm_source: utmParams.utm_source,
    utm_medium: utmParams.utm_medium,
    utm_campaign: utmParams.utm_campaign
  }
});

Email Service with hardcoded subjects:
// Send business notification with locale-specific subject
const subjects = {
  quote: {
    es: `Nueva cotización - ${formData.fullName}`,
    en: `New quote request - ${formData.fullName}`,
    pt: `Nova cotação - ${formData.fullName}`
  }
};

await emailService.sendQuoteNotification({
  quoteData: quoteRequest,
  subject: subjects.quote[formData.locale],
  locale: formData.locale
});

// Send auto-response to customer
await emailService.sendAutoResponse({
  email: formData.email,
  fullName: formData.fullName,
  locale: formData.locale,
  quoteData: quoteRequest
});

Dependencies: Updated database schema, BE-1.2 (Email Service) Estimated Hours: 16-20 hours

BE-1.2: Email Service Integration (FULLY UPDATED)
As a backend developer I want a comprehensive email service with delivery tracking and proper templates So that all email communications are monitored and professionally formatted
Acceptance Criteria:
[ ] Configure Resend with webhook endpoints
[ ] Create email templates for both internal and external communications
[ ] Implement delivery tracking in email_deliveries table
[ ] Create email service class with proper error handling:
class EmailService {
  async sendQuoteNotification(data: {
    quoteData: QuoteRequest;
    subject: string;
    locale: string;
  }): Promise<string> // Returns resend message ID
  
  async sendQuoteAutoResponse(data: {
    email: string;
    fullName: string;
    locale: string;
    quoteData: QuoteRequest;
  }): Promise<string>
  
  async sendContactNotification(data: {
    contactData: ContactForm;
    subject: string;
    locale: string;
  }): Promise<string>
  
  async sendContactAutoResponse(data: {
    email: string;
    fullName: string;
    locale: string;
    contactData: ContactForm;
  }): Promise<string>
}

Email Templates Structure:
1. Internal Quote Notification Template:
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Nueva Cotización - Fly-Fleet</title>
</head>
<body style="font-family: 'Poppins', sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
  <!-- Header with Logo -->
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <div style="background: #0B1E3C; padding: 20px; text-align: center;">
      <img src="https://fly-fleet.com/logo-white.png" alt="Fly-Fleet" style="height: 40px;">
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <h1 style="color: #0B1E3C; margin: 0 0 20px 0;">Nueva Cotización Recibida</h1>
      
      <!-- Customer Info -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #0B1E3C;">Información del Cliente</h3>
        <p><strong>Nombre:</strong> {{fullName}}</p>
        <p><strong>Email:</strong> {{email}}</p>
        <p><strong>Teléfono:</strong> {{phone}}</p>
      </div>
      
      <!-- Flight Details -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #0B1E3C;">Detalles del Vuelo</h3>
        <p><strong>Servicio:</strong> {{serviceType}}</p>
        <p><strong>Ruta:</strong> {{origin}} → {{destination}}</p>
        <p><strong>Fecha:</strong> {{departureDate}}</p>
        <p><strong>Hora:</strong> {{departureTime}}</p>
        <p><strong>Pasajeros:</strong> {{passengers}}</p>
        <p><strong>Equipaje estándar:</strong> {{standardBagsCount}} piezas</p>
        {{#if specialItems}}<p><strong>Artículos especiales:</strong> {{specialItems}}</p>{{/if}}
      </div>
      
      <!-- Additional Services -->
      {{#if additionalServices}}
      <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 15px 0; color: #0B1E3C;">Servicios Adicionales</h3>
        <ul>
          {{#each additionalServices}}
          <li>{{this}}</li>
          {{/each}}
        </ul>
      </div>
      {{/if}}
      
      <!-- UTM Attribution -->
      <div style="background: #e8f4fd; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h4 style="margin: 0 0 10px 0; color: #0B1E3C;">Atribución de Marketing</h4>
        <p style="font-size: 12px; margin: 0;"><strong>Fuente:</strong> {{utmSource}} | <strong>Medio:</strong> {{utmMedium}} | <strong>Campaña:</strong> {{utmCampaign}}</p>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="mailto:{{email}}" style="background: #2F6AEF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Responder al Cliente</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p>Fly-Fleet | Private Jet Charter Brokerage</p>
      <p>contact@fly-fleet.com | +54 9 11 6660-1927</p>
      <p>Este email fue generado automáticamente desde fly-fleet.com</p>
    </div>
  </div>
</body>
</html>

2. External Quote Auto-Response Template:
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Confirmación de Cotización - Fly-Fleet</title>
</head>
<body style="font-family: 'Poppins', sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: #0B1E3C; padding: 20px; text-align: center;">
      <img src="https://fly-fleet.com/logo-white.png" alt="Fly-Fleet" style="height: 40px;">
    </div>
    
    <!-- Content -->
    <div style="padding: 30px;">
      <h1 style="color: #0B1E3C; margin: 0 0 20px 0;">¡Gracias por tu solicitud, {{fullName}}!</h1>
      
      <p style="font-size: 16px; line-height: 1.6; color: #333;">
        Hemos recibido tu solicitud de cotización para un vuelo privado y nuestro equipo ya está trabajando en preparar la mejor propuesta para ti.
      </p>
      
      <!-- Flight Summary -->
      <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #0B1E3C;">Resumen de tu Solicitud</h3>
        <p><strong>Ruta:</strong> {{origin}} → {{destination}}</p>
        <p><strong>Fecha:</strong> {{departureDate}} a las {{departureTime}}</p>
        <p><strong>Pasajeros:</strong> {{passengers}}</p>
        <p><strong>Servicio:</strong> {{serviceType}}</p>
      </div>
      
      <!-- What's Next -->
      <div style="background: #e8f4fd; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin: 0 0 15px 0; color: #0B1E3C;">¿Qué sigue?</h3>
        <ul style="margin: 0; padding-left: 20px;">
          <li>Nuestro equipo analizará tu solicitud en las próximas 2 horas</li>
          <li>Seleccionaremos las mejores opciones de aeronaves y operadores</li>
          <li>Te enviaremos una cotización detallada por email</li>
          <li>Estaremos disponibles para ajustar cualquier detalle</li>
        </ul>
      </div>
      
      <!-- Contact Options -->
      <div style="text-align: center; margin: 30px 0;">
        <p style="font-size: 16px; margin-bottom: 20px;">¿Necesitas contactarnos urgentemente?</p>
        <a href="https://wa.me/5491166601927" style="background: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">WhatsApp</a>
        <a href="tel:+5491166601927" style="background: #2F6AEF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 0 10px;">Llamar</a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
      <p><strong>Fly-Fleet</strong> | Private Jet Charter Brokerage</p>
      <p>contact@fly-fleet.com | +54 9 11 6660-1927</p>
      <p>Operamos 24/7 para tu tranquilidad</p>
      <p style="margin-top: 15px;">
        <a href="https://fly-fleet.com/legal/privacy" style="color: #666;">Política de Privacidad</a> | 
        <a href="https://fly-fleet.com/legal/terms" style="color: #666;">Términos y Condiciones</a>
      </p>
    </div>
  </div>
</body>
</html>

Dependencies: Updated database with email_deliveries table Estimated Hours: 16-20 hours

BE-1.3: Contact Form API Endpoint (FULLY UPDATED)
As a frontend developer I want a contact form submission API with UTM tracking and proper email notifications So that users can send general inquiries with full attribution tracking
Acceptance Criteria:
[ ] Create POST /api/contact endpoint with UTM parameter extraction
[ ] Implement request validation with proper field mapping
[ ] Store contact form in database with UTM attribution
[ ] Send emails with hardcoded subjects: "Nuevo contacto - {fullName}"
[ ] Track email delivery in email_deliveries table
[ ] Implement rate limiting and spam protection
Contact Form Subjects by Locale:
const contactSubjects = {
  es: `Nuevo contacto - ${formData.fullName}`,
  en: `New contact - ${formData.fullName}`,
  pt: `Novo contato - ${formData.fullName}`
};

Dependencies: Updated database, BE-1.2 (Email Service) Estimated Hours: 10-12 hours

BE-1.4: IATA Airport Search API (UPDATED)
As a frontend developer I want an airport search API with multilingual support So that users can easily find and select airports in their language
Acceptance Criteria:
[ ] Create GET /api/airports?q={query}&locale={locale} endpoint
[ ] Implement database-powered search functionality:
interface AirportSearchResult {
  code: string;        // IATA code
  name: string;        // Airport name
  city: string;        // City name
  country: string;     // Country name in requested locale
  region: string;      // Region name in requested locale
  isPopular: boolean;  // For boosting popular airports
}

[ ] Search implementation with joins for multilingual support
[ ] Support search by IATA code, city name, and airport name
[ ] Return results with country/region names in requested locale
[ ] Implement caching (Redis or in-memory, 1 hour TTL)
[ ] Boost popular airports (is_popular = true) in Latin America
[ ] Handle fuzzy search for common typos
[ ] Limit results to 10 most relevant
Dependencies: Updated database with airports and airport_translations tables Estimated Hours: 12-16 hours

BE-1.5: Analytics Events API
As a frontend developer I want an analytics tracking API So that I can send server-side events to supplement GA4
Acceptance Criteria:
[ ] Create POST /api/analytics/event endpoint
[ ] Implement event validation and storage
[ ] Forward events to GA4 Measurement Protocol
[ ] Implement batch processing for performance
[ ] Add request deduplication
[ ] Handle anonymous users
Dependencies: Database analytics_events table Estimated Hours: 8-10 hours

BE-1.6: reCAPTCHA Verification Service
As a backend developer I want a reCAPTCHA verification service So that forms are protected from bots
Acceptance Criteria:
[ ] Create reCAPTCHA verification utility
[ ] Implement Google reCAPTCHA v3 API calls
[ ] Configure score thresholds (0.5 for forms)
[ ] Add action verification
[ ] Implement caching for verified tokens
[ ] Add fallback for service unavailability
[ ] Log suspicious attempts
Estimated Hours: 6-8 hours

BE-1.7: WhatsApp Link Generation (FULLY UPDATED)
As a frontend developer I want WhatsApp link generation with complete UTM tracking and proper click attribution So that all WhatsApp interactions are properly tracked and attributed
Acceptance Criteria:
[ ] Create POST /api/whatsapp/link endpoint with full UTM support
[ ] Store clicks in whatsapp_clicks table with proper attribution
[ ] Generate properly encoded URLs with updated message templates
[ ] Support form data pre-filling in messages
[ ] Return click ID for frontend tracking
Updated WhatsApp Message Templates with Additional Services:
const additionalServicesTranslations = {
  es: {
    international_support: "Apoyo vuelos internacionales",
    country_documentation: "Documentación por país",
    pet_friendly_transport: "Transporte pet-friendly",
    ground_transfer_driver: "Transfer terrestre / chofer",
    premium_catering: "Catering premium",
    vip_lounge_fbo: "Sala VIP / FBO específico",
    customs_immigration_assist: "Asistencia migraciones/aduana"
  },
  en: {
    international_support: "International flight support",
    country_documentation: "Country documentation",
    pet_friendly_transport: "Pet-friendly transport",
    ground_transfer_driver: "Ground transfer / driver",
    premium_catering: "Premium catering",
    vip_lounge_fbo: "VIP lounge / specific FBO",
    customs_immigration_assist: "Customs/immigration assistance"
  },
  pt: {
    international_support: "Suporte para voos internacionais",
    country_documentation: "Documentação por país",
    pet_friendly_transport: "Transporte pet-friendly",
    ground_transfer_driver: "Transfer terrestre / motorista",
    premium_catering: "Catering premium",
    vip_lounge_fbo: "Sala VIP / FBO específico",
    customs_immigration_assist: "Assistência alfândega/imigração"
  }
};

Dependencies: Updated database with whatsapp_clicks table including UTM fields Estimated Hours: 8-10 hours



BE-1.8: Content Management API
As a frontend developer I want an API to fetch page content So that I can display localized content
Acceptance Criteria:
[ ] Create GET /api/content/:page/:locale endpoint
[ ] Return structured content with caching
[ ] Add content versioning support
[ ] Handle missing content gracefully (fallback to default locale)
Dependencies: Database page_content table Estimated Hours: 8-10 hours

BE-1.9: FAQ Management API
As a frontend developer I want an FAQ API So that I can display categorized questions
Acceptance Criteria:
[ ] Create GET /api/faqs/:locale endpoint
[ ] Support category filtering
[ ] Return structured FAQ data
[ ] Implement search within FAQs
[ ] Add caching for FAQ data
[ ] Include Schema.org FAQPage structured data
Dependencies: Database faqs table Estimated Hours: 6-8 hours

BE-1.10: SEO Meta Tags API
As a frontend developer I want dynamic meta tag generation So that each page has optimized SEO
Acceptance Criteria:
[ ] Create GET /api/seo/:page/:locale endpoint
[ ] Generate comprehensive meta tags
[ ] Support custom meta data per page
[ ] Generate structured data (JSON-LD)
[ ] Handle multilingual SEO attributes
Estimated Hours: 10-12 hours

BE-1.11: Quote Status Management API (NEW)
As a business user I want to manage quote request statuses So that I can track the lead pipeline
Acceptance Criteria:
[ ] Create PATCH /api/quotes/:id/status endpoint
[ ] Support status updates: pending → processing → quoted → converted/closed
[ ] Implement status validation and workflow rules
[ ] Add status change logging
[ ] Return updated quote with new status
[ ] Add authentication/authorization for admin access
Dependencies: Updated database with quote_status enum Estimated Hours: 6-8 hours

BE-1.12: Resend Webhook Handler (NEW)
As a system administrator I want to receive and process Resend delivery webhooks So that email delivery status is accurately tracked
Acceptance Criteria:
[ ] Create POST /api/webhooks/resend endpoint
[ ] Verify webhook signature for security
[ ] Update email_deliveries table based on webhook events
[ ] Handle all Resend event types: sent, delivered, bounced, failed
[ ] Log webhook events for debugging
[ ] Return proper HTTP status codes
Estimated Hours: 6-8 hours



🎨 FRONTEND LAYER - FLY-FLEET (v2.0)
Updated with Enhanced Accessibility & Modern Design System
Design System Foundation
Brand Identity: Elegant, technological aesthetic for premium private aviation Color Palette:
Primary Navy: #0B1E3C (backgrounds, text)
Neutral Light: #F4F6F8 (backgrounds, cards)
Neutral Medium: #828FA0 (secondary text, borders)
Accent Blue: #2F6AEF (CTAs, links, focus states)
Pure White: #FFFFFF (content backgrounds)
Typography:
Display/Headlines: Soul Gaze BC (premium, distinctive)
Body/Interface: Poppins (readable, modern)
Accessibility Standards: WCAG 2.1 AA compliance throughout all components

Epic 1: Core Components & Design System (P0)
FE-1.1: Design System Components
As a frontend developer I want a complete design system library So that I can build consistent, accessible UI components
Acceptance Criteria:
[x] Create base components with TypeScript and comprehensive accessibility
[x] Implement design system with navy blue theme:
 :root {  --navy-primary: #0B1E3C;  --neutral-light: #F4F6F8;  --neutral-medium: #828FA0;  --accent-blue: #2F6AEF;  --white: #FFFFFF;  --focus-ring: 0 0 0 3px rgba(47, 106, 239, 0.3);}


[x] Button component with enhanced accessibility:
All variants (primary navy, secondary outline, ghost)
Focus indicators with visible ring (--focus-ring)
ARIA states (aria-pressed, aria-expanded)
Loading and disabled states with aria-disabled
Minimum 44px touch target (mobile)
[x] Input components with accessibility features:
aria-label or aria-labelledby for all inputs
aria-describedby for help text and errors
aria-invalid for validation states
aria-required for mandatory fields
High contrast error states with navy/accent colors
[x] Select with enhanced UX:
role="combobox" for custom selects
aria-expanded, aria-haspopup="listbox"
Keyboard navigation (Arrow keys, Enter, Escape)
aria-activedescendant for active option
[x] Modal/Dialog with complete accessibility:
role="dialog" and aria-modal="true"
Focus trap within modal
aria-labelledby for title, aria-describedby for content
Escape key closure
Focus restoration on close
[x] Toast notifications:
role="alert" for important messages
role="status" for non-critical updates
aria-live="assertive" or aria-live="polite"
Auto-dismiss with pause on hover/focus
[x] Loading components:
aria-label="Loading" for spinners
aria-hidden="true" for decorative elements
aria-live="polite" for status updates
[x] Card layouts with semantic structure:
Proper heading hierarchy (h2, h3, etc.)
role="article" or role="region" when appropriate
Navy blue borders with subtle shadows
[ ] Storybook documentation with accessibility examples (not implemented - future enhancement)
[x] Responsive behavior with mobile-first approach
[x] Color contrast verification (min 4.5:1 for normal text, 3:1 for large text)
[x] Tailwind CSS variants matching design system
Estimated Hours: 32-40 hours

FE-1.2: Quote Form Component (ENHANCED ACCESSIBILITY)
As a user I want an intuitive, accessible quote form with proper field validation and language-specific placeholders So that I can easily request a charter quote regardless of my abilities or device
Acceptance Criteria:
[x] Implement comprehensive accessibility structure:

 <form role="form" aria-labelledby="quote-form-title" noValidate>
  <h2 id="quote-form-title">Request Your Private Charter Quote</h2>
  <div role="group" aria-labelledby="personal-info-heading">
    <h3 id="personal-info-heading">Personal Information</h3>
    // Personal fields with proper labels
  </div>
</form>


[x] IP-based country code detection with accessibility announcements


[x] Enhanced form structure with WCAG compliance:


Service Type: role="group" with aria-labelledby, radio buttons with descriptive labels
Personal Information:
Name: aria-label, autocomplete="name"
Email: type="email", aria-describedby="email-help", autocomplete="email"
Phone: Auto-detected country code with aria-label="Country code, automatically detected"
Trip Details:
IATA search with role="combobox", aria-expanded, live search results
Date/Time: aria-describedby for format hints, min date validation
Baggage Section:
Standard bags counter (0-20) with role="spinbutton", aria-valuemin="0", aria-valuemax="20"
Special items textarea with character count and aria-describedby
Additional Services:
Checkboxes group with role="group" and aria-labelledby
Exact database enum validation with error announcements
Pet Section:
Conditional display with aria-live="polite" announcements
Species/size fields with proper labels
Comments: aria-label, character limit with live count
Privacy Consent: Required checkbox with link to policy, aria-required="true"
[x] Validation with accessibility features:


Error summary at top of form with role="alert"
Individual field errors with aria-invalid="true" and aria-describedby
Success states with aria-live="polite" announcements
Real-time validation feedback without overwhelming screen readers
[x] Enhanced language support with proper labeling:

 const accessiblePlaceholders = {
  es: {
    fullName: "Ingresá tu nombre completo",
    fullNameAriaLabel: "Nombre completo, requerido",
    email: "tu@correo.com", 
    emailAriaLabel: "Dirección de correo electrónico, requerido",
    emailHelp: "Ej: juan@correo.com",
    // ... additional accessible labels
  }
};


[x] Keyboard navigation support:


Tab order optimization
Skip links for long forms
Enter key submission from any field
Escape key to clear current field
[x] Mobile accessibility:


Proper input types (tel, email, date, time)
Adequate touch targets (min 44x44px)
Zoom support without horizontal scroll
Screen reader optimization for mobile
[ ] UTM parameter tracking throughout form interaction (not implemented - backend feature)


[ ] Enhanced analytics with accessibility events (not implemented - analytics feature)


Dependencies: FE-1.1, BE-1.1 (updated), FE-1.3 (updated), IP detection service Estimated Hours: 35-42 hours

FE-1.3: Airport Search Component (ACCESSIBLE)
As a user I want to search airports with multilingual support and full accessibility So that I can easily select locations regardless of my abilities
Acceptance Criteria:
[x] Implement accessible combobox pattern:
 <div className="relative">  <label htmlFor="airport-search" className="sr-only">    Search for airport  </label>  <input    id="airport-search"    role="combobox"    aria-expanded={isOpen}    aria-haspopup="listbox"    aria-activedescendant={activeDescendant}    aria-describedby="airport-help"    aria-label="Search airports by name or IATA code"  />  <div id="airport-help" className="sr-only">    Use arrow keys to navigate results, Enter to select, Escape to close  </div>  {isOpen && (    <ul role="listbox" aria-label="Airport search results">      {results.map((airport, index) => (        <li          key={airport.iata}          role="option"          aria-selected={selectedIndex === index}          id={`airport-option-${index}`}        >          {airport.name} ({airport.iata})        </li>      ))}    </ul>  )}</div>


[x] Keyboard navigation with full accessibility:
Arrow Up/Down: Navigate results with aria-activedescendant
Enter: Select option with confirmation announcement
Escape: Close dropdown with focus restoration
Home/End: Jump to first/last result
[x] Screen reader optimizations:
Result count announcements: "5 results found"
Loading state: aria-live="polite" with "Searching..." message
No results: Clear message "No airports found matching your search"
Selection confirmation: "Selected Buenos Aires Ezeiza International Airport"
[x] Debounced search (300ms) with loading indicators
[x] Enhanced result display with high contrast:
Airport name, IATA code, city clearly separated
Popular airports section with distinct visual hierarchy
Highlight search terms with proper contrast ratios
[x] Mobile-optimized dropdown with:
Large touch targets (min 44px height)
Proper zoom behavior
Native feel with iOS/Android optimizations
[x] Error handling with user-friendly messages:
Network errors with retry options
Rate limiting graceful degradation
Fallback to manual IATA code entry
Dependencies: FE-1.1, BE-1.4 (updated) Estimated Hours: 18-22 hours

FE-1.4: WhatsApp Widget Component (ACCESSIBLE & MULTI-DEVICE)
As a user I want accessible WhatsApp contact available on all devices with proper attribution So that I can get assistance regardless of my abilities or device
Acceptance Criteria:
[x] Implement fully accessible floating widget:
 <button  className="whatsapp-widget"  aria-label={`Contact us on WhatsApp in ${locale === 'es' ? 'Spanish' : locale === 'en' ? 'English' : 'Portuguese'}`}  aria-describedby="whatsapp-help"  onClick={handleWhatsAppClick}>  <span className="sr-only">Open WhatsApp chat</span>  <WhatsAppIcon aria-hidden="true" /></button><div id="whatsapp-help" className="sr-only">  Opens WhatsApp with pre-filled message for immediate assistance</div>


[x] Required: Available on both desktop AND mobile (not just desktop)
[x] Multiple display variants with accessibility:
Floating: Fixed position, high z-index, visible focus ring
Inline: Within content flow, proper heading context
Header: Desktop only, integrated with navigation landmarks
[x] Enhanced keyboard accessibility:
Tab order integration
Enter/Space activation
Focus visible with custom ring matching design system
Escape key dismissal for any popup states
[x] Context-aware messaging with form data:
 const generateAccessibleMessage = (locale, formData) => {  const messages = {    es: `Hola Fly-Fleet, quiero cotizar un vuelo privado.${formData ? ` Origen: ${formData.origin}, Destino: ${formData.destination}` : ''}`,    // ... other languages  };  return encodeURIComponent(messages[locale]);};


[x] Comprehensive tracking with accessibility events:
Click tracking with context (form data available/not available)
Session attribution with UTM parameters
Device type and accessibility features detection
[x] Visual design matching navy theme:
WhatsApp green with navy blue accent overlay
Subtle shadow with navy undertone
Smooth animations respecting prefers-reduced-motion
High contrast mode support
[x] Screen reader announcements:
Status updates when widget state changes
Clear labeling for all interactions
Context about external link behavior
Dependencies: FE-1.1, BE-1.7 (updated), Enhanced analytics Estimated Hours: 14-16 hours

FE-1.5: Language Switcher Component
As a user I want to switch between languages So that I can view content in my preferred language
Acceptance Criteria:
[x] Create language switcher component with flag icons
[x] Dropdown for mobile, inline for desktop
[x] Smooth transitions between languages
[x] Persist selection in localStorage
[x] Update URL path appropriately (parent component responsibility)
[x] Track language switches in analytics
[x] Maintain current page when switching
[x] Add keyboard navigation
Estimated Hours: 8-10 hours

FE-1.6: Navigation Header Component (UPDATED)
As a user I want clear site navigation with accessible WhatsApp contact So that I can easily navigate and contact the business from any device
Acceptance Criteria:
[x] UPDATED: Include WhatsApp CTA button in header for desktop
[x] Create responsive header component with enhanced navigation
[x] Logo with link to homepage
[x] Desktop: horizontal navigation menu + WhatsApp button
[x] Mobile: hamburger menu with slide-out drawer (no WhatsApp in mobile header - use floating)
[x] Sticky behavior with shrink animation
[x] Active page highlighting
[x] Language switcher integrated
[x] Smooth animations and transitions
[x] Accessibility compliant (ARIA, keyboard nav)
Dependencies: FE-1.1, FE-1.5, FE-1.4 (updated WhatsApp widget) Estimated Hours: 14-16 hours

FE-1.7: Footer Component
As a user I want comprehensive footer information So that I can find contact details and legal information
Acceptance Criteria:
[x] Create responsive footer component with all necessary links
[x] Multi-column layout on desktop, stacked on mobile
[x] Include company description, contact info, quick links
[x] Social media links and legal links
[x] Newsletter signup form (optional)
[x] Proper link styling and hover states
Estimated Hours: 8-10 hours

✅ FE-1.8: Homepage Hero Section - COMPLETED
As a visitor I want a compelling hero section So that I immediately understand the value proposition
Acceptance Criteria:
[x] Create hero component with dynamic content by locale
[x] Primary and secondary CTA buttons with analytics tracking
[x] Background image optimization with loading states
[x] Responsive layout and typography scaling
[x] Smooth animations on page load with motion preference respect
[x] CTA buttons track analytics events (GTM integration)
[x] Performance optimized with eager loading for critical images
[x] Accessibility features (ARIA labels, focus management)
[x] Trust indicators and scroll indicator
Estimated Hours: 10-12 hours

✅ FE-1.9: Process Steps Component - COMPLETED
As a visitor I want to understand the booking process So that I know what to expect
Acceptance Criteria:
[x] Create 3-step process visualization with icons
[x] Icons for each step with connecting lines (desktop/mobile)
[x] Responsive grid layout (3 cols desktop, 1 col mobile)
[x] Animation on scroll using intersection observer
[x] Multi-language content support (en, es, pt)
[x] Step numbering and visual hierarchy
[x] Accessibility compliant with proper headings and ARIA
Estimated Hours: 8-10 hours

✅ FE-1.10: Services Grid Component - COMPLETED
As a visitor I want to see available services So that I can understand what's offered
Acceptance Criteria:
[x] Create services overview component with 6 service types
[x] Responsive grid layout with service cards (1/2/3 columns)
[x] Icons for each service type with consistent styling
[x] CTA buttons leading to quote form with analytics tracking
[x] Animation on scroll with staggered entrance effects
[x] Service features lists and descriptions
[x] Hover effects and interactive states
[x] Multi-language support for all service content
Estimated Hours: 10-12 hours


Epic 2: Enhanced User Experience & Tracking (P0)
US-5.1: IP-based Country Code Detection (ACCESSIBLE)
As a user I want my phone country code automatically detected with clear feedback So that I don't have to manually select my country regardless of my technical abilities
Acceptance Criteria:
[ ] Implement accessible IP detection:
 const useAccessibleIPDetection = () => {  const [countryCode, setCountryCode] = useState('+54');  const [isDetecting, setIsDetecting] = useState(true);  const [detectionStatus, setDetectionStatus] = useState('');  useEffect(() => {    const detectCountryWithA11y = async () => {      setDetectionStatus('Detecting your location...');            try {        const response = await fetch('https://ipapi.co/json/');        const data = await response.json();                const phoneCode = COUNTRY_PHONE_CODES[data.country_code];        if (phoneCode) {          setCountryCode(phoneCode);          setDetectionStatus(`Country code ${phoneCode} automatically selected for ${data.country_name}`);        } else {          setDetectionStatus('Using default Argentina country code +54');        }      } catch (error) {        console.error('IP detection failed:', error);        setDetectionStatus('Could not detect location. Using default Argentina country code +54. You can change this manually.');      } finally {        setIsDetecting(false);      }    };    detectCountryWithA11y();  }, []);  return { countryCode, isDetecting, detectionStatus, setCountryCode };};


[ ] Accessible user feedback:
Live region announcements for detection status
Clear visual indicators for auto-detection vs manual selection
Screen reader friendly status messages
Manual override option with clear labeling
[ ] Enhanced country code mapping with accessibility:
 const ACCESSIBLE_COUNTRY_CODES = {  'AR': { code: '+54', name: 'Argentina', flag: '🇦🇷' },  'BR': { code: '+55', name: 'Brazil', flag: '🇧🇷' },  'CL': { code: '+56', name: 'Chile', flag: '🇨🇱' },  'UY': { code: '+598', name: 'Uruguay', flag: '🇺🇾' },  // ... additional countries with accessible labels};


[ ] Fallback mechanisms:
VPN/proxy detection with graceful degradation
Manual country selection with search capability
Default to Argentina (+54) with clear explanation
Error state handling with user-friendly messages
[ ] Privacy considerations:
Clear explanation of location detection
Opt-out mechanism for privacy-conscious users
No storage of location data beyond session
GDPR/LGPD compliance notifications
Estimated Hours: 8-10 hours

US-5.2: Email Delivery Tracking System (ACCESSIBLE DASHBOARD)
As a business owner I want comprehensive email delivery tracking with accessible reporting So that I can monitor email success rates regardless of my technical abilities
Acceptance Criteria:
[ ] Create accessible email tracking database schema
[ ] Implement Resend webhook endpoint with proper error handling
[ ] Build accessible admin dashboard:
 <div className="email-dashboard" role="main" aria-labelledby="dashboard-title">  <h1 id="dashboard-title">Email Delivery Dashboard</h1>    <section aria-labelledby="summary-heading">    <h2 id="summary-heading">Delivery Summary</h2>    <div className="stats-grid" role="list">      <div className="stat-card" role="listitem">        <h3>Total Sent</h3>        <span className="stat-number" aria-label="1,234 emails sent">1,234</span>      </div>      <div className="stat-card" role="listitem">        <h3>Delivered</h3>        <span className="stat-number" aria-label="1,156 emails delivered, 93.7% success rate">          1,156 <small>(93.7%)</small>        </span>      </div>      <div className="stat-card" role="listitem">        <h3>Bounced</h3>        <span className="stat-number" aria-label="78 emails bounced, 6.3% bounce rate">          78 <small>(6.3%)</small>        </span>      </div>    </div>  </section>    <section aria-labelledby="recent-heading">    <h2 id="recent-heading">Recent Email Activity</h2>    <table className="email-table" role="table" aria-describedby="table-desc">      <caption id="table-desc">        Recent email delivery status with timestamps and recipient information      </caption>      <thead>        <tr>          <th scope="col">Recipient</th>          <th scope="col">Subject</th>          <th scope="col">Status</th>          <th scope="col">Timestamp</th>        </tr>      </thead>      <tbody>        {/* Table rows with proper accessibility */}      </tbody>    </table>  </section></div>


[ ] Accessible data visualization:
Screen reader compatible charts with data tables
High contrast colors matching navy theme
Alternative text for graphical elements
Keyboard navigation for interactive charts
[ ] Alert system with accessibility:
Screen reader announcements for critical issues
Visual alerts with proper color contrast
Email notifications with accessible HTML formatting
Configurable alert thresholds with clear descriptions
Estimated Hours: 16-20 hours

US-5.3: Enhanced GA4 Analytics Integration (ACCESSIBLE TRACKING)
As a marketing manager I want comprehensive, accessible conversion funnel tracking So that I can optimize the user journey and measure ROI while respecting user privacy
Acceptance Criteria:
[ ] Implement privacy-respecting analytics:
 // Enhanced GA4 integration with accessibility considerationsconst trackAccessibleEvent = (eventName, parameters) => {  // Check if user has consented to analytics  if (!hasAnalyticsConsent()) return;    // Add accessibility context to all events  const enhancedParams = {    ...parameters,    accessibility_features_used: getActiveA11yFeatures(),    device_type: getDeviceType(),    screen_reader_detected: isScreenReaderActive(),    high_contrast_mode: window.matchMedia('(prefers-contrast: high)').matches,    reduced_motion_preference: window.matchMedia('(prefers-reduced-motion: reduce)').matches,    locale: getCurrentLocale(),    page_path: window.location.pathname  };    gtag('event', eventName, enhancedParams);};// Accessible form trackingconst trackFormInteraction = (action, formData = {}) => {  trackAccessibleEvent('form_interaction', {    event_category: 'conversion',    form_action: action, // 'start', 'field_complete', 'validation_error', 'submit'    form_type: 'quote_request',    service_type: formData.service,    has_accessibility_errors: formData.hasA11yErrors,    completion_method: formData.completionMethod, // 'keyboard', 'mouse', 'touch', 'voice'    utm_source: getUTMParam('utm_source'),    utm_medium: getUTMParam('utm_medium'),    utm_campaign: getUTMParam('utm_campaign')  });};


[ ] Enhanced conversion funnel tracking:
Page view with accessibility context
CTA clicks with interaction method
Form start/completion with accessibility metrics
WhatsApp clicks with context awareness
Success conversions with user journey data
[ ] Accessibility-focused metrics:
Screen reader usage patterns
Keyboard navigation success rates
High contrast mode adoption
Motion preference respect
Form completion rates by accessibility features
[ ] Privacy-compliant implementation:
Consent-based tracking activation
Data anonymization for accessibility features
GDPR/LGPD compliance measures
User opt-out mechanisms
[ ] Reporting dashboard integration:
Accessible analytics dashboard
Screen reader compatible reports
Export functionality with proper formatting
Custom goal tracking with descriptions
Estimated Hours: 12-15 hours

US-5.4: Enhanced Form Validation (ACCESSIBLE)
As a developer I want robust, accessible client-side validation that matches backend validation exactly So that all users get immediate feedback regardless of their abilities
Acceptance Criteria:
[ ] Implement accessible validation framework:
 const useAccessibleValidation = (schema, locale) => {  const [errors, setErrors] = useState({});  const [announcements, setAnnouncements] = useState([]);    const validateFieldAccessibly = (fieldName, value) => {    const fieldResult = schema.validateField(fieldName, value);        if (fieldResult.error) {      const accessibleError = {        id: `${fieldName}-error`,        message: getLocalizedError(fieldResult.error, locale),        field: fieldName,        severity: fieldResult.severity || 'error'      };            setErrors(prev => ({ ...prev, [fieldName]: accessibleError }));            // Announce error to screen readers (debounced)      announceError(accessibleError);    } else {      setErrors(prev => {        const newErrors = { ...prev };        delete newErrors[fieldName];        return newErrors;      });            // Announce success for previously invalid fields      if (errors[fieldName]) {        announceSuccess(fieldName, locale);      }    }  };    return { errors, validateFieldAccessibly, announcements };};


[ ] Enhanced error messaging:
Language-specific error messages matching backend
ARIA live regions for immediate feedback
Error summary component at form top
Individual field error associations
Success confirmations for corrected fields
[ ] Advanced validation features:
IATA code validation against airport database
Additional services enum validation with exact database match
Real-time validation with debouncing
Cross-field validation (date ranges, passenger counts)
Accessibility-specific validation (screen reader compatibility)
[ ] User experience enhancements:
Progressive validation (validate on blur, show success on change)
Clear formatting requirements with examples
Smart error recovery suggestions
Keyboard shortcut for error navigation
High contrast error styling with navy/accent colors
Estimated Hours: 12-15 hours

Epic 3: Content Pages & Trust Building (P1)
FE-2.1: About Page Component
As a visitor I want to learn about Fly-Fleet So that I can trust their services
Acceptance Criteria:
[ ] Create About page layout with company story, team, certifications
[ ] Statistics dashboard with animated counters
[ ] Trust signal components (badges, certificates)
[ ] Call-to-action sections
[ ] Professional photography integration
Estimated Hours: 14-18 hours
FE-2.2: Services Page Component
As a visitor I want detailed service information So that I can understand all offerings
Acceptance Criteria:
[ ] Create Services page with category cards
[ ] Aircraft type comparisons with specs
[ ] Route examples with sample pricing ranges
[ ] Additional services detail
[ ] Fleet showcase with images
Estimated Hours: 16-20 hours
FE-2.3: FAQ Component
As a visitor I want to find answers to common questions So that I can get information without contacting support
Acceptance Criteria:
[ ] Create FAQ component with accordion-style questions
[ ] Category filtering tabs
[ ] Search functionality within FAQs
[ ] Schema.org FAQPage markup for SEO
[ ] Mobile-optimized design
Estimated Hours: 12-15 hours
FE-2.4: Testimonials Component
As a visitor I want to see customer reviews So that I can assess service quality
Acceptance Criteria:
[ ] Create testimonial components (carousel + grid)
[ ] Star rating display
[ ] Customer photo and company info
[ ] Schema.org Review markup for SEO
[ ] Video testimonials support
Estimated Hours: 10-12 hours
FE-2.5: Contact Page Component
As a visitor I want multiple contact options So that I can reach out in my preferred way
Acceptance Criteria:
[ ] Create Contact page with contact form
[ ] Contact information display
[ ] Business hours by timezone
[ ] WhatsApp integration prominent
[ ] Map integration (Google Maps embed)
Estimated Hours: 12-15 hours
FE-2.6: Legal Pages Component
As a visitor I want to understand terms and privacy policies So that I know how my data is handled
Acceptance Criteria:
[ ] Create legal page templates for Terms, Privacy, Cookies
[ ] All pages in 3 languages
[ ] Clear, readable formatting
[ ] Table of contents for navigation
[ ] Mobile-optimized layout
Estimated Hours: 10-12 hours

# Epic 4: SEO & Performance Optimization (P1)

### FE-3.1: SEO Head Component (ACCESSIBLE)
**As a** search engine and user **I want** optimized, accessible meta tags **So that** content is properly indexed and announced to all users

**Acceptance Criteria:**
- [ ] Implement comprehensive SEO with accessibility:
```typescript
const AccessibleSEOHead = ({ page, locale }) => {
  const seoData = getSEOData(page, locale);
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <meta name="author" content="Fly-Fleet" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Language and Accessibility */}
      <html lang={locale} />
      <meta httpEquiv="Content-Language" content={locale} />
      
      {/* Multilingual Support */}
      <link rel="alternate" hrefLang="es" href={`https://fly-fleet.com${seoData.path}`} />
      <link rel="alternate" hrefLang="en" href={`https://fly-fleet.com/en${seoData.path}`} />
      <link rel="alternate" hrefLang="pt" href={`https://fly-fleet.com/pt${seoData.path}`} />
      <link rel="alternate" hrefLang="x-default" href={`https://fly-fleet.com${seoData.path}`} />
      
      {/* Open Graph with Accessibility */}
      <meta property="og:title" content={seoData.ogTitle} />
      <meta property="og:description" content={seoData.ogDescription} />
      <meta property="og:image" content={seoData.ogImage} />
      <meta property="og:image:alt" content={seoData.ogImageAlt} />
      <meta property="og:url" content={seoData.canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={getOGLocale(locale)} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoData.twitterTitle} />
      <meta name="twitter:description" content={seoData.twitterDescription} />
      <meta name="twitter:image" content={seoData.twitterImage} />
      <meta name="twitter:image:alt" content={seoData.twitterImageAlt} />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(seoData.structuredData)
        }}
      />
      
      {/* Canonical and Performance */}
      <link rel="canonical" href={seoData.canonical} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Accessibility Enhancements */}
      <meta name="theme-color" content="#0B1E3C" />
      <meta name="color-scheme" content="light dark" />
      
      {/* Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    </Head>
  );
};
```

- [ ] Enhanced structured data:
  - Organization schema with accessibility features
  - Service schema with detailed descriptions
  - FAQPage schema with proper formatting
  - Review schema with rating information
  - LocalBusiness schema with complete contact info
- [ ] Multilingual SEO optimization:
  - Proper hreflang implementation
  - Language-specific meta descriptions
  - Cultural considerations for each market
  - Regional structured data variations

**SEO Templates by Page:**
```typescript
const seoTemplates = {
  homepage: {
    es: {
      title: "Fly-Fleet | Vuelos privados y chárter – Cotizá en minutos",
      description: "Cotizá tu vuelo privado con operadores certificados. Atención 24/7, soporte internacional, pet-friendly y servicios a medida.",
      keywords: ["vuelos privados", "charter", "jet privado", "aviación"]
    },
    en: {
      title: "Fly-Fleet | Private jet charter – Get a quote in minutes",
      description: "Request your private charter quote. Certified operators, 24/7 support, international handling and pet-friendly services.",
      keywords: ["private jet", "charter", "aviation", "private flights"]
    },
    pt: {
      title: "Fly-Fleet | Voos privados – Peça uma cotação em minutos",
      description: "Peça sua cotação de voo privado. Operadores certificados, suporte 24/7, handling internacional e serviço pet-friendly.",
      keywords: ["voos privados", "charter", "jato privado", "aviação"]
    }
  }
}
```

**Dependencies**: BE-1.10

**Estimated Hours**: 12-15 hours

---

### FE-3.2: Performance Optimization (ACCESSIBLE)
**As a** user **I want** fast-loading, accessible pages **So that** I have a smooth browsing experience regardless of my device or connection

**Acceptance Criteria:**
- [ ] Implement comprehensive performance optimization:
```typescript
// Image optimization with accessibility
const OptimizedImage = ({ src, alt, className, priority = false }) => {
  return (
    <picture>
      <source
        srcSet={generateWebPSrcSet(src)}
        type="image/webp"
        media="(min-width: 768px)"
      />
      <source
        srcSet={generateAVIFSrcSet(src)}
        type="image/avif"
        media="(min-width: 768px)"
      />
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        width="auto"
        height="auto"
      />
    </picture>
  );
};

// Accessible lazy loading
const useLazyLoad = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef();
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: '100px' }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [threshold]);
  
  return [ref, isIntersecting];
};
```

- [ ] Enhanced accessibility optimizations:
  - Proper loading priorities for accessibility features
  - Screen reader compatible lazy loading
  - Focus management during dynamic loading
  - Alternative content for slow connections
  - Proper error boundaries with accessible error messages
- [ ] Advanced performance features:
  - Critical CSS inlining with accessibility styles
  - Code splitting with accessibility considerations
  - Service worker implementation with accessibility awareness
  - Resource hints optimization (preload, prefetch, preconnect)
  - Bundle optimization with tree shaking
- [ ] Performance monitoring with accessibility metrics:
  - Core Web Vitals tracking
  - Accessibility-specific performance metrics
  - Screen reader performance optimization
  - Keyboard navigation responsiveness
  - Focus management performance

**Performance Targets:**
- Lighthouse Performance ≥90 (desktop), ≥80 (mobile)
- Lighthouse Accessibility ≥95 (all devices)
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
- Time to Interactive <3s on 3G connections
- First Contentful Paint <1.5s

**Estimated Hours**: 20-25 hours

---

### FE-3.3: Analytics Integration (PRIVACY-RESPECTING & ACCESSIBLE)
**As a** marketing manager **I want** comprehensive, privacy-compliant analytics tracking **So that** I can measure and optimize conversions while respecting user privacy and accessibility needs

**Acceptance Criteria:**
- [ ] Implement privacy-first analytics:
```typescript
// Privacy-compliant analytics initialization
const initializeAccessibleAnalytics = () => {
  // Check for user consent
  if (!hasAnalyticsConsent()) {
    console.log('Analytics disabled - user has not consented');
    return;
  }
  
  // Initialize GA4 with privacy settings
  gtag('config', 'GA_MEASUREMENT_ID', {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Strict;Secure',
    respect_dnt: true
  });
  
  // Track accessibility features usage
  trackAccessibilityFeatures();
};

// Comprehensive event tracking with accessibility context
const trackAccessibleUserJourney = () => {
  // Page view with accessibility context
  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    locale: getCurrentLocale(),
    accessibility_features: {
      screen_reader: isScreenReaderDetected(),
      high_contrast: window.matchMedia('(prefers-contrast: high)').matches,
      reduced_motion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      keyboard_navigation: isKeyboardUser(),
      zoom_level: getZoomLevel()
    },
    device_type: getDeviceType(),
    connection_speed: getConnectionSpeed(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign')
  });
};

// Form interaction tracking with accessibility metrics
const trackFormAccessibility = (formData, interactionType) => {
  gtag('event', 'form_interaction_accessible', {
    event_category: 'conversion',
    event_label: interactionType, // 'start', 'field_focus', 'validation_error', 'submit'
    form_type: 'quote_request',
    service_type: formData.service,
    completion_method: getInteractionMethod(), // 'keyboard', 'mouse', 'touch', 'voice'
    has_accessibility_errors: hasAccessibilityErrors(formData),
    validation_errors_count: getValidationErrorsCount(formData),
    time_to_complete: getFormCompletionTime(),
    accessibility_features_used: getActiveAccessibilityFeatures(),
    locale: getCurrentLocale(),
    device_type: getDeviceType()
  });
};

// WhatsApp click tracking with context
const trackWhatsAppAccessible = (context = {}) => {
  gtag('event', 'click_whatsapp_accessible', {
    event_category: 'cta',
    event_label: getCurrentLocale(),
    page_path: window.location.pathname,
    widget_variant: context.variant, // 'floating', 'inline', 'header'
    form_data_available: !!context.formData,
    accessibility_method: getInteractionMethod(),
    screen_reader_active: isScreenReaderDetected(),
    utm_source: getUTMParam('utm_source'),
    utm_medium: getUTMParam('utm_medium'),
    utm_campaign: getUTMParam('utm_campaign')
  });
};
```

- [ ] Enhanced user journey tracking:
  - Accessibility-aware conversion funnel
  - Screen reader user behavior patterns
  - Keyboard navigation success rates
  - Form abandonment analysis with accessibility context
  - Mobile accessibility performance metrics
- [ ] Privacy compliance features:
  - GDPR/LGPD compliant consent management
  - Data anonymization for accessibility features
  - User opt-out mechanisms with clear instructions
  - Cookie-less tracking options
  - Accessibility-focused data retention policies
- [ ] Custom conversion goals:
  - Quote form submissions with accessibility metrics
  - WhatsApp contact conversions
  - User journey completion rates
  - Accessibility feature adoption rates
  - Mobile vs desktop accessibility performance

**Event Tracking Examples:**
```typescript
// Form submission
gtag('event', 'form_submit_quote', {
  event_category: 'conversion',
  event_label: locale,
  service_type: formData.service,
  route: `${formData.origin}-${formData.destination}`,
  value: 1
});

// Conversion funnel
gtag('event', 'page_view');      // Landing
gtag('event', 'cta_click');      // Interest
gtag('event', 'form_start');     // Consideration
gtag('event', 'form_submit');    // Conversion
```

**Dependencies**: BE-1.5

**Estimated Hours**: 15-18 hours

---

### FE-3.4: Cookie Consent Banner (FULLY ACCESSIBLE)
**As a** visitor **I want** to control cookie preferences with full accessibility **So that** my privacy choices are respected regardless of my abilities

**Acceptance Criteria:**
- [ ] Implement fully accessible cookie consent:
```typescript
const AccessibleCookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  });

  return (
    <>
      {isVisible && (
        <>
          {/* Backdrop for modal behavior */}
          <div 
            className="cookie-backdrop"
            onClick={() => setShowPreferences(false)}
            aria-hidden="true"
          />
          
          <div 
            className="cookie-consent"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-title"
            aria-describedby="cookie-description"
          >
            <div className="cookie-content">
              <h2 id="cookie-title">Cookie Preferences</h2>
              <p id="cookie-description">
                We use cookies to enhance your experience, analyze site usage, and provide personalized content. 
                You can manage your preferences below.
              </p>
              
              {!showPreferences ? (
                // Simple consent interface
                <div className="cookie-actions">
                  <button
                    className="btn-accept-all"
                    onClick={acceptAllCookies}
                    aria-describedby="accept-all-desc"
                  >
                    Accept All Cookies
                  </button>
                  <div id="accept-all-desc" className="sr-only">
                    Accepts all cookie categories including analytics and marketing
                  </div>
                  
                  <button
                    className="btn-essential-only"
                    onClick={acceptEssentialOnly}
                    aria-describedby="essential-desc"
                  >
                    Essential Cookies Only
                  </button>
                  <div id="essential-desc" className="sr-only">
                    Accepts only necessary cookies required for site functionality
                  </div>
                  
                  <button
                    className="btn-customize"
                    onClick={() => setShowPreferences(true)}
                    aria-describedby="customize-desc"
                  >
                    Customize Preferences
                  </button>
                  <div id="customize-desc" className="sr-only">
                    Opens detailed cookie preferences where you can choose specific categories
                  </div>
                </div>
              ) : (
                // Detailed preferences interface
                <form className="cookie-preferences" onSubmit={savePreferences}>
                  <fieldset>
                    <legend>Cookie Categories</legend>
                    
                    <div className="cookie-category">
                      <div className="category-header">
                        <input
                          type="checkbox"
                          id="necessary-cookies"
                          checked={preferences.necessary}
                          disabled={true}
                          aria-describedby="necessary-desc"
                        />
                        <label htmlFor="necessary-cookies">
                          <strong>Necessary Cookies</strong> (Always Active)
                        </label>
                      </div>
                      <p id="necessary-desc" className="category-description">
                        Essential for website functionality, including navigation, form submission, and security features.
                      </p>
                    </div>
                    
                    <div className="cookie-category">
                      <div className="category-header">
                        <input
                          type="checkbox"
                          id="analytics-cookies"
                          checked={preferences.analytics}
                          onChange={(e) => updatePreference('analytics', e.target.checked)}
                          aria-describedby="analytics-desc"
                        />
                        <label htmlFor="analytics-cookies">
                          <strong>Analytics Cookies</strong>
                        </label>
                      </div>
                      <p id="analytics-desc" className="category-description">
                        Help us understand how visitors interact with our website, including accessibility feature usage.
                      </p>
                    </div>
                    
                    <div className="cookie-category">
                      <div className="category-header">
                        <input
                          type="checkbox"
                          id="marketing-cookies"
                          checked={preferences.marketing}
                          onChange={(e) => updatePreference('marketing', e.target.checked)}
                          aria-describedby="marketing-desc"
                        />
                        <label htmlFor="marketing-cookies">
                          <strong>Marketing Cookies</strong>
                        </label>
                      </div>
                      <p id="marketing-desc" className="category-description">
                        Used to track visitors across websites for marketing purposes and ad personalization.
                      </p>
                    </div>
                    
                    <div className="cookie-category">
                      <div className="category-header">
                        <input
                          type="checkbox"
                          id="functional-cookies"
                          checked={preferences.functional}
                          onChange={(e) => updatePreference('functional', e.target.checked)}
                          aria-describedby="functional-desc"
                        />
                        <label htmlFor="functional-cookies">
                          <strong>Functional Cookies</strong>
                        </label>
                      </div>
                      <p id="functional-desc" className="category-description">
                        Enable enhanced functionality like language preferences and accessibility settings.
                      </p>
                    </div>
                  </fieldset>
                  
                  <div className="preference-actions">
                    <button type="submit" className="btn-save-preferences">
                      Save Preferences
                    </button>
                    <button 
                      type="button"
                      className="btn-back"
                      onClick={() => setShowPreferences(false)}
                    >
                      Back to Simple Options
                    </button>
                  </div>
                </form>
              )}
              
              <div className="cookie-footer">
                <p>
                  <a href="/privacy" className="cookie-policy-link">
                    Read our full Cookie Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Settings button for returning users */}
      {!isVisible && hasSeenConsent && (
        <button
          className="cookie-settings-toggle"
          onClick={() => setIsVisible(true)}
          aria-label="Open cookie preferences"
          title="Cookie Settings"
        >
          🍪
        </button>
      )}
    </>
  );
};
```

- [ ] Enhanced accessibility features:
  - Modal dialog pattern with focus trap
  - Clear keyboard navigation (Tab, Enter, Escape)
  - Screen reader announcements for preference changes
  - Descriptive labels and help text for all options
  - High contrast styling matching navy theme
- [ ] Advanced functionality:
  - Granular cookie category control
  - Persistent preference storage
  - Integration with analytics consent
  - GDPR/LGPD compliance features
  - Clear explanation of each cookie category
- [ ] Visual design integration:
  - Navy blue theme with proper contrast ratios
  - Smooth animations respecting motion preferences
  - Mobile-optimized layout with large touch targets
  - Clear visual hierarchy with proper spacing
  - Professional styling matching brand identity
- [ ] Technical implementation:
  - localStorage preference persistence
  - Dynamic script loading based on consent
  - Integration with Google Tag Manager
  - Consent validation and verification
  - Accessibility testing with screen readers

**Cookie Categories:**
```typescript
interface CookieCategory {
  id: string;
  name: string;
  description: string;
  required: boolean;
  cookies: {
    name: string;
    purpose: string;
    duration: string;
  }[];
}

const cookieCategories = {
  necessary: {
    name: "Necesarias",
    description: "Cookies esenciales para el funcionamiento del sitio",
    required: true
  },
  analytics: {
    name: "Analíticas", 
    description: "Nos ayudan a entender cómo usas el sitio",
    required: false
  }
}
```

**Estimated Hours**: 15-18 hours

---

## 📊 Epic 4 Summary

**Total Estimated Hours**: 62-76 hours

**Key Features:**
- Comprehensive, accessible SEO optimization
- Performance optimization with accessibility considerations
- Privacy-first analytics with accessibility tracking
- Fully accessible cookie consent management
- WCAG 2.1 AA compliance throughout
- Multilingual support for all components
- Integration with Fly-Fleet's navy blue brand theme

**Dependencies:**
- BE-1.5 (Analytics Events API)
- BE-1.10 (SEO Meta Tags API)
- FE-1.1 (Design System Components)

**Success Metrics:**
- Lighthouse Accessibility ≥95
- Lighthouse Performance ≥90 (desktop), ≥80 (mobile)  
- Core Web Vitals compliance
- WCAG 2.1 AA accessibility compliance
- GDPR/LGPD privacy compliance
- Multi-language SEO optimization


Epic 5: Advanced Features & Integrations (P2)
FE-4.1: Advanced Search & Filter System
As a user I want sophisticated search and filtering capabilities with full accessibility So that I can find exactly what I need regardless of my abilities
Acceptance Criteria:
[ ] Implement accessible advanced search:
Multi-criteria search with ARIA live regions
Filter combinations with clear screen reader feedback
Search result count announcements
Keyboard shortcut support (Ctrl+K to focus search)
Search history with accessibility considerations
[ ] Enhanced filtering interface:
Accordion-style filter groups with proper ARIA
Clear filter indicators with removal buttons
Filter count badges with screen reader context
Reset filters functionality with confirmation
Mobile-optimized filter drawer
Estimated Hours: 18-22 hours

FE-4.2: Interactive Map Integration
As a user I want to explore routes and airports on an accessible map So that I can visualize flight options regardless of my abilities
Acceptance Criteria:
[ ] Implement accessible map integration:
Google Maps with accessibility enhancements
Keyboard navigation support
Screen reader compatible markers and info windows
Alternative list view for map content
High contrast mode support
[ ] Enhanced map features:
Airport markers with detailed information
Route visualization with accessibility descriptions
Popular destination highlighting
Mobile-optimized map interactions
Integration with quote form pre-filling
Estimated Hours: 20-25 hours

FE-4.3: Real-time Chat Integration
As a user I want accessible real-time chat support So that I can get immediate assistance regardless of my abilities
Acceptance Criteria:
[ ] Implement accessible chat widget:
Screen reader compatible chat interface
Keyboard navigation for all chat functions
Message status announcements
File upload accessibility
Chat history with proper semantic structure
[ ] Advanced chat features:
Typing indicators with screen reader support
Emoji picker with keyboard navigation
Message timestamps with accessible formatting
Offline message queuing
Integration with WhatsApp handoff
Estimated Hours: 22-28 hours

Epic 5: Testing & Quality Assurance (P0) 
TE-1.1: Unit Testing Suite
As a developer I want comprehensive unit tests So that individual components work correctly
Acceptance Criteria:
[ ] Set up testing framework (Jest + React Testing Library)
[ ] Write unit tests for form validation, utilities, API services
[ ] Achieve 80%+ code coverage
[ ] Test all edge cases and error scenarios
[ ] Mock external dependencies
Estimated Hours: 16-20 hours
TE-1.2: Integration Testing
As a developer I want integration tests for API endpoints So that the full data flow works correctly
Acceptance Criteria:
[ ] Set up test database for integration tests
[ ] Test API endpoints (quote, contact, airport search, email)
[ ] Test error scenarios and rate limiting
[ ] Test database operations
Estimated Hours: 12-16 hours
TE-1.3: End-to-End Testing
As a user I want the complete user journey to work So that I can successfully submit requests
Acceptance Criteria:
[ ] Set up E2E testing framework (Cypress or Playwright)
[ ] Test critical user paths (homepage → quote → success)
[ ] Test error scenarios and mobile responsive behavior
[ ] Test across multiple browsers
[ ] Visual regression testing
Estimated Hours: 20-24 hours
TE-1.4: Accessibility Testing
As a user with disabilities I want to access all features So that I can use the service independently
Acceptance Criteria:
[ ] WCAG 2.1 AA compliance verified
[ ] Screen reader testing
[ ] Keyboard navigation testing
[ ] Color contrast validation
[ ] Form accessibility verification
Estimated Hours: 16-20 hours
TE-1.5: Performance Testing
As a user I want fast page loading So that I have a smooth experience
Acceptance Criteria:
[ ] Lighthouse CI integration for performance monitoring
[ ] Core Web Vitals tracking
[ ] Load testing for API endpoints
[ ] Database query performance testing
[ ] Bundle size monitoring
Estimated Hours: 12-16 hours
