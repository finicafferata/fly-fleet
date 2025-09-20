import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../../../src/app/api/contact/route';
import { prisma } from '../../../src/lib/prisma';

// Mock reCAPTCHA verification
jest.mock('../../../src/lib/recaptcha/verify', () => ({
  verifyRecaptcha: jest.fn().mockResolvedValue(true),
}));

// Mock email sending
jest.mock('../../../src/lib/email/send', () => ({
  sendContactConfirmation: jest.fn().mockResolvedValue(true),
  sendContactNotification: jest.fn().mockResolvedValue(true),
}));

describe('/api/contact API Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.contact.deleteMany({
      where: {
        email: {
          contains: 'test@',
        },
      },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.contact.deleteMany({
      where: {
        email: {
          contains: 'test@',
        },
      },
    });
  });

  it('should create a contact submission with valid data', async () => {
    const validContactData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test@example.com',
      phone: '+9876543210',
      company: 'Example Inc',
      subject: 'General Inquiry',
      message: 'Hello, I have a question about your services.',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validContactData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.id).toBeDefined();

    const savedContact = await prisma.contact.findUnique({
      where: { id: responseData.id },
    });

    expect(savedContact).toBeTruthy();
    expect(savedContact?.firstName).toBe('Jane');
    expect(savedContact?.lastName).toBe('Smith');
    expect(savedContact?.email).toBe('test@example.com');
    expect(savedContact?.subject).toBe('General Inquiry');
    expect(savedContact?.status).toBe('pending');
  });

  it('should create contact with minimal required fields', async () => {
    const minimalData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'test.minimal@example.com',
      message: 'Just a quick question about pricing.',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    const savedContact = await prisma.contact.findUnique({
      where: { id: responseData.id },
    });

    expect(savedContact?.firstName).toBe('John');
    expect(savedContact?.phone).toBeNull();
    expect(savedContact?.company).toBeNull();
    expect(savedContact?.subject).toBeNull();
  });

  it('should reject invalid email format', async () => {
    const invalidEmailData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'invalid-email-format',
      message: 'Test message',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
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
      firstName: 'Jane',
      // Missing lastName, email, message
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
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

  it('should reject message that is too short', async () => {
    const shortMessageData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test.short@example.com',
      message: 'Hi', // Too short
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shortMessageData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should reject invalid phone format', async () => {
    const invalidPhoneData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'test.phone@example.com',
      phone: '123', // Too short
      message: 'Test message with invalid phone',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPhoneData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should handle different subject categories', async () => {
    const subjects = [
      'General Inquiry',
      'Technical Support',
      'Billing Question',
      'Partnership Inquiry',
      'Media Request',
    ];

    for (const subject of subjects) {
      const contactData = {
        firstName: 'Test',
        lastName: 'User',
        email: `test.${subject.toLowerCase().replace(/\s+/g, '')}@example.com`,
        subject,
        message: `This is a test message for ${subject}`,
        recaptchaToken: 'test-token',
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData),
      });

      const response = await POST(request);
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData.success).toBe(true);

      const savedContact = await prisma.contact.findUnique({
        where: { id: responseData.id },
      });

      expect(savedContact?.subject).toBe(subject);
    }
  });

  it('should handle special characters in message', async () => {
    const specialCharsData = {
      firstName: 'José',
      lastName: 'García',
      email: 'test.special@example.com',
      message: 'Hola! Tengo una pregunta sobre sus servicios. ¿Pueden ayudarme? 🛩️',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(specialCharsData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    const savedContact = await prisma.contact.findUnique({
      where: { id: responseData.id },
    });

    expect(savedContact?.firstName).toBe('José');
    expect(savedContact?.message).toContain('🛩️');
  });

  it('should handle long company names', async () => {
    const longCompanyData = {
      firstName: 'Corporate',
      lastName: 'Executive',
      email: 'test.corporate@example.com',
      company: 'Very Long Corporate Name International Holdings Limited Partnership LLC',
      message: 'Inquiry about corporate charter services',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(longCompanyData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    const savedContact = await prisma.contact.findUnique({
      where: { id: responseData.id },
    });

    expect(savedContact?.company).toBe(longCompanyData.company);
  });

  it('should reject extremely long messages', async () => {
    const veryLongMessage = 'A'.repeat(10000); // 10k characters

    const longMessageData = {
      firstName: 'Long',
      lastName: 'Message',
      email: 'test.long@example.com',
      message: veryLongMessage,
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(longMessageData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should handle duplicate submissions', async () => {
    const contactData = {
      firstName: 'Duplicate',
      lastName: 'Test',
      email: 'test.duplicate@example.com',
      message: 'This is a duplicate submission test',
      recaptchaToken: 'test-token',
    };

    const request1 = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    const request2 = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    // Submit first contact
    const response1 = await POST(request1);
    const responseData1 = await response1.json();

    expect(response1.status).toBe(200);
    expect(responseData1.success).toBe(true);

    // Submit duplicate contact
    const response2 = await POST(request2);
    const responseData2 = await response2.json();

    // Should still succeed (contacts can be duplicated)
    expect(response2.status).toBe(200);
    expect(responseData2.success).toBe(true);

    // Verify both contacts exist
    const contacts = await prisma.contact.findMany({
      where: { email: 'test.duplicate@example.com' },
    });

    expect(contacts.length).toBe(2);
  });

  it('should sanitize input to prevent XSS', async () => {
    const xssData = {
      firstName: '<script>alert("xss")</script>',
      lastName: 'Smith',
      email: 'test.xss@example.com',
      message: 'Test message with <script>alert("evil")</script> embedded',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(xssData),
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);

    const savedContact = await prisma.contact.findUnique({
      where: { id: responseData.id },
    });

    // Check that script tags are not stored as-is
    expect(savedContact?.firstName).not.toContain('<script>');
    expect(savedContact?.message).not.toContain('<script>');
  });

  it('should handle rate limiting from same IP', async () => {
    const contactData = {
      firstName: 'Rate',
      lastName: 'Limit',
      email: 'test.ratelimit@example.com',
      message: 'Testing rate limiting functionality',
      recaptchaToken: 'test-token',
    };

    // Make multiple rapid requests from same IP
    const requests = Array.from({ length: 15 }, (_, i) =>
      new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Forwarded-For': '127.0.0.1',
        },
        body: JSON.stringify({
          ...contactData,
          email: `test.ratelimit${i}@example.com`,
        }),
      })
    );

    const responses = await Promise.all(
      requests.map(request => POST(request))
    );

    // Some requests should be rate limited
    const rateLimitedResponses = responses.filter(
      response => response.status === 429
    );

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
  });

  it('should reject invalid reCAPTCHA token', async () => {
    // Mock reCAPTCHA verification to fail
    const { verifyRecaptcha } = require('../../../src/lib/recaptcha/verify');
    verifyRecaptcha.mockResolvedValueOnce(false);

    const invalidCaptchaData = {
      firstName: 'Invalid',
      lastName: 'Captcha',
      email: 'test.invalidcaptcha@example.com',
      message: 'Testing invalid reCAPTCHA',
      recaptchaToken: 'invalid-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
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

  it('should handle database connection errors gracefully', async () => {
    // Mock database error
    const originalCreate = prisma.contact.create;
    prisma.contact.create = jest.fn().mockRejectedValue(new Error('Database connection failed'));

    const validData = {
      firstName: 'DB',
      lastName: 'Error',
      email: 'test.dberror@example.com',
      message: 'Testing database error handling',
      recaptchaToken: 'test-token',
    };

    const request = new NextRequest('http://localhost:3000/api/contact', {
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
    prisma.contact.create = originalCreate;
  });
});