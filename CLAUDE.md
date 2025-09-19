# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fly-Fleet is a private jet charter brokerage platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. The application supports internationalization with English, Spanish, and Portuguese languages.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application with Turbopack
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

## Database Operations

- `npx prisma generate` - Generate Prisma client (outputs to `src/generated/prisma`)
- `npx prisma db push` - Push schema changes to database
- `npx prisma db seed` - Seed database with initial data
- `npx prisma studio` - Open Prisma Studio for database management

## Architecture

### Core Structure
- **Next.js App Router**: Uses the new `app/` directory structure
- **Database**: PostgreSQL with Prisma ORM
- **Internationalization**: next-intl for multi-language support (en, es, pt)
- **Styling**: Tailwind CSS v4 with Headless UI components
- **Forms**: React Hook Form with Zod validation
- **Email**: Resend for transactional emails

### Key Directories

- `src/app/` - Next.js app router pages and API routes
- `src/app/api/` - API endpoints for quotes, contacts, content management, FAQs, webhooks
- `src/components/` - Reusable UI components
- `src/lib/` - Utility functions organized by domain:
  - `content/` - CMS content management
  - `email/` - Email templates and sending
  - `faq/` - FAQ management
  - `recaptcha/` - reCAPTCHA verification
  - `whatsapp/` - WhatsApp integration
  - `validations/` - Zod schemas
- `src/generated/prisma/` - Auto-generated Prisma client
- `prisma/` - Database schema and seed files
- `messages/` - Internationalization message files

### Database Schema

The application manages:
- **Quotes**: Charter requests with status tracking (pending → processing → quoted → converted/closed)
- **Contacts**: General inquiries with status management
- **Content**: Multi-language CMS content (text, HTML, JSON, image URLs)
- **FAQs**: Localized frequently asked questions
- **Service Types**: charter, empty_legs, multicity, helicopter, medical, cargo

### API Architecture

RESTful API endpoints with localization support:
- Content management with locale-specific endpoints
- Quote and contact form processing
- reCAPTCHA verification integration
- Webhook handlers for email service events
- WhatsApp link generation

### Configuration Notes

- TypeScript paths configured with `@/*` alias pointing to `src/*`
- Security headers configured in next.config.ts
- ESLint extends Next.js core-web-vitals and TypeScript configs
- Image optimization configured for `*.fly-fleet.com` domains
- Experimental package imports optimization enabled for performance