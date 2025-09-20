import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../../../src/app/api/quote/route';
import { prisma } from '../../../src/lib/prisma';

// Mock reCAPTCHA verification
jest.mock('../../../src/lib/recaptcha/verify', () => ({
  verifyRecaptcha: jest.fn().mockResolvedValue(true),
}));

// Mock email sending
jest.mock('../../../src/lib/email/send', () => ({
  sendQuoteConfirmation: jest.fn().mockResolvedValue(true),
  sendQuoteNotification: jest.fn().mockResolvedValue(true),
}));

describe('/api/quote API Integration Tests', () => {
  beforeAll(async () => {
    // Ensure test database is connected
    await prisma.$connect();
  });

  afterAll(async () => {
    // Clean up and disconnect
    await prisma.quote.deleteMany({
      where: {
        email: {
          contains: 'test@',
        },
      },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await prisma.quote.deleteMany({
      where: {
        email: {
          contains: 'test@',
        },
      },
    });
  });

  it('should create a quote with valid data', async () => {
    const validQuoteData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 4,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+1234567890',
      company: 'Test Corp',
      message: 'Test quote request',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validQuoteData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();

    // Verify quote was saved to database
    const savedQuote = await prisma.quote.findUnique({
      where: { id: responseData.id },
    });

    expect(savedQuote).toBeTruthy();
    expect(savedQuote?.serviceType).toBe('charter');
    expect(savedQuote?.departure).toBe('JFK');
    expect(savedQuote?.arrival).toBe('LAX');
    expect(savedQuote?.email).toBe('test@example.com');
    expect(savedQuote?.status).toBe('pending');
  });

  it('should handle round trip quotes', async () => {
    const roundTripData = {
      serviceType: 'charter',
      tripType: 'round-trip',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      returnDate: '2024-12-30',
      passengers: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test.jane@example.com',
      phone: '+9876543210',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roundTripData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    const savedQuote = await prisma.quote.findUnique({
      where: { id: responseData.id },
    });

    expect(savedQuote?.returnDate).toBeTruthy();
    expect(savedQuote?.tripType).toBe('round-trip');
  });

  it('should handle special service types', async () => {
    const medicalData = {
      serviceType: 'medical',
      departure: 'MIA',
      arrival: 'NYC',
      departureDate: '2024-12-25',
      passengers: 1,
      firstName: 'Medical',
      lastName: 'Patient',
      email: 'test.medical@example.com',
      phone: '+1111111111',
      specialRequirements: 'Intensive care transport',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(medicalData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    const savedQuote = await prisma.quote.findUnique({
      where: { id: responseData.id },
    });

    expect(savedQuote?.serviceType).toBe('medical');
    expect(savedQuote?.specialRequirements).toBe('Intensive care transport');
  });

  it('should reject invalid email format', async () => {
    const invalidEmailData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 4,
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid-email-format',
      phone: '+1234567890',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidEmailData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('email');
  });

  it('should reject missing required fields', async () => {
    const incompleteData = {
      serviceType: 'charter',
      departure: 'JFK',
      // Missing arrival, dates, passengers, name, email, etc.
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incompleteData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.errors).toBeDefined();
    expect(Array.isArray(responseData.errors)).toBe(true);
  });

  it('should reject invalid passenger count', async () => {
    const invalidPassengersData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 0, // Invalid
      firstName: 'John',
      lastName: 'Doe',
      email: 'test.invalid@example.com',
      phone: '+1234567890',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPassengersData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should reject without terms acceptance', async () => {
    const noTermsData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 2,
      firstName: 'John',
      lastName: 'Doe',
      email: 'test.noterms@example.com',
      phone: '+1234567890',
      acceptTerms: false, // Not accepted
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noTermsData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should handle rate limiting', async () => {
    const quoteData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 2,
      firstName: 'Rate',
      lastName: 'Limit',
      email: 'test.ratelimit@example.com',
      phone: '+1234567890',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    // Make multiple rapid requests
    const requests = Array.from({ length: 10 }, () =>
      new NextRequest('http://localhost:3000/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify(quoteData),
      })
    );

    const responses = await Promise.all(
      requests.map(request => POST(request))
    );

    // At least some requests should be rate limited
    const rateLimitedResponses = responses.filter(
      response => response.status === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  it('should reject invalid reCAPTCHA', async () => {
    // Mock reCAPTCHA verification to fail
    const { verifyRecaptcha } = require('../../../src/lib/recaptcha/verify');
    verifyRecaptcha.mockResolvedValueOnce(false);

    const invalidCaptchaData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 2,
      firstName: 'Invalid',
      lastName: 'Captcha',
      email: 'test.captcha@example.com',
      phone: '+1234567890',
      acceptTerms: true,
      recaptchaToken: 'invalid-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidCaptchaData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('reCAPTCHA');
  });

  it('should handle database connection errors', async () => {
    // Mock database error
    const originalCreate = prisma.quote.create;
    prisma.quote.create = jest.fn().mockRejectedValue(new Error('Database connection failed'));

    const validData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 2,
      firstName: 'DB',
      lastName: 'Error',
      email: 'test.db@example.com',
      phone: '+1234567890',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('server error');

    // Restore original method
    prisma.quote.create = originalCreate;
  });

  it('should handle malformed JSON requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json{',
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should set correct CORS headers', async () => {
    const validData = {
      serviceType: 'charter',
      departure: 'JFK',
      arrival: 'LAX',
      departureDate: '2024-12-25',
      passengers: 2,
      firstName: 'CORS',
      lastName: 'Test',
      email: 'test.cors@example.com',
      phone: '+1234567890',
      acceptTerms: true,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://example.com',
      },
      body: JSON.stringify(validData),
    });

    const response = await POST(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeTruthy();
    expect(response.headers.get('Access-Control-Allow-Methods')).toBeTruthy();
  });
});