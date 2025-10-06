# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fly-Fleet is a private jet charter brokerage platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL. The application supports internationalization with English, Spanish, and Portuguese languages.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application with Turbopack (includes API docs generation)
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Testing
- `npm test` - Run all Jest unit tests
- `npm run test:watch` - Run Jest in watch mode for TDD
- `npm run test:coverage` - Generate test coverage report (80% threshold required)
- `npm run test:unit` - Run unit tests only (src/ directory)
- `npm run test:integration` - Run integration tests (tests/integration/)
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run test:e2e:headed` - Run E2E tests in headed mode (visible browser)
- `npm run test:accessibility` - Run accessibility tests with axe-core
- `npm run test:performance` - Run performance tests
- `npm run test:lighthouse` - Run Lighthouse CI for performance auditing
- `npm run test:all` - Run all tests (unit + integration + E2E)
- `npm run test:ci` - Full CI test suite (coverage + E2E + Lighthouse)

### API Documentation
- `npm run docs:generate` - Generate OpenAPI documentation from code
- `npm run docs:watch` - Auto-regenerate docs on changes
- `npm run docs:validate` - Validate OpenAPI schema
- `npm run docs:serve` - Serve API docs locally
- `npm run docs:serve-dev` - Serve docs on port 8080
- `npm run docs:build-static` - Build static HTML API documentation

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
- Security headers configured in next.config.ts (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- ESLint extends Next.js core-web-vitals and TypeScript configs
- Image optimization configured for `*.fly-fleet.com` and `*.railway.app` domains
- Experimental package imports optimization enabled for `@headlessui/react` and `react-hook-form`
- Production build configured for Railway deployment with standalone output
- Build checks: ESLint and TypeScript errors ignored during production builds (must be caught in development/CI)

### Testing Architecture

- **Unit Tests**: Jest with React Testing Library, jsdom environment
- **E2E Tests**: Playwright with multi-browser support (Chromium, Firefox, WebKit, Mobile)
- **Test Coverage**: 80% threshold required for branches, functions, lines, and statements
- **Test Locations**:
  - Unit tests: `src/**/__tests__/` or `src/**/*.{test,spec}.{js,jsx,ts,tsx}`
  - Integration tests: `tests/integration/`
  - E2E tests: `tests/e2e/`
  - Performance tests: `tests/performance/`
- **E2E Configuration**:
  - Base URL: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
  - Includes global setup/teardown scripts
  - Auto-starts dev server if not in CI
  - Takes screenshots/videos on failure

### Internationalization (i18n)

- Uses `next-intl` for translations
- Supported locales: `en` (English), `es` (Spanish), `pt` (Portuguese)
- Translation files in `messages/` directory
- Locale routing via Next.js App Router `[locale]` dynamic segment
- All user-facing content, forms, and API responses are localized