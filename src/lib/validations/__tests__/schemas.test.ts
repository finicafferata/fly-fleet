import { describe, it, expect } from '@jest/globals';
import {
  quoteFormSchema,
  contactFormSchema,
  faqSchema,
  contentSchema,
} from '../schemas';

describe('Validation Schemas', () => {
  describe('quoteFormSchema', () => {
    it('should validate a complete valid quote form', () => {
      const validData = {
        serviceType: 'charter' as const,
        departure: 'JFK',
        arrival: 'LAX',
        departureDate: '2024-12-25',
        returnDate: '2024-12-30',
        passengers: 4,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        company: 'Test Corp',
        message: 'Test message',
        acceptTerms: true,
        recaptchaToken: 'test-token',
      };

      const result = quoteFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid email', () => {
      const invalidData = {
        serviceType: 'charter' as const,
        departure: 'JFK',
        arrival: 'LAX',
        departureDate: '2024-12-25',
        passengers: 4,
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '+1234567890',
        acceptTerms: true,
        recaptchaToken: 'test-token',
      };

      const result = quoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toContain('email');
      }
    });

    it('should fail validation for missing required fields', () => {
      const incompleteData = {
        serviceType: 'charter' as const,
        departure: 'JFK',
        // Missing arrival, dates, passengers, name, email, etc.
      };

      const result = quoteFormSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
      }
    });

    it('should validate different service types', () => {
      const serviceTypes = ['charter', 'empty_legs', 'multicity', 'helicopter', 'medical', 'cargo'] as const;

      serviceTypes.forEach(serviceType => {
        const data = {
          serviceType,
          departure: 'JFK',
          arrival: 'LAX',
          departureDate: '2024-12-25',
          passengers: 2,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          acceptTerms: true,
          recaptchaToken: 'test-token',
        };

        const result = quoteFormSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should fail for invalid passenger count', () => {
      const invalidData = {
        serviceType: 'charter' as const,
        departure: 'JFK',
        arrival: 'LAX',
        departureDate: '2024-12-25',
        passengers: 0, // Invalid: must be at least 1
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        acceptTerms: true,
        recaptchaToken: 'test-token',
      };

      const result = quoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail without accepting terms', () => {
      const invalidData = {
        serviceType: 'charter' as const,
        departure: 'JFK',
        arrival: 'LAX',
        departureDate: '2024-12-25',
        passengers: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        acceptTerms: false, // Invalid: must be true
        recaptchaToken: 'test-token',
      };

      const result = quoteFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('contactFormSchema', () => {
    it('should validate a complete contact form', () => {
      const validData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+9876543210',
        company: 'Example Inc',
        subject: 'General Inquiry',
        message: 'Hello, I have a question about your services.',
        recaptchaToken: 'test-token',
      };

      const result = contactFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with minimal required fields', () => {
      const minimalData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        message: 'Test message',
        recaptchaToken: 'test-token',
      };

      const result = contactFormSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid phone format', () => {
      const invalidData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '123', // Invalid: too short
        message: 'Test message',
        recaptchaToken: 'test-token',
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with too short message', () => {
      const invalidData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        message: 'Hi', // Invalid: too short
        recaptchaToken: 'test-token',
      };

      const result = contactFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('faqSchema', () => {
    it('should validate a complete FAQ entry', () => {
      const validData = {
        question: 'What services do you offer?',
        answer: 'We offer charter flights, empty legs, and more.',
        category: 'services',
        locale: 'en',
        order: 1,
        isPublished: true,
      };

      const result = faqSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate with minimal fields', () => {
      const minimalData = {
        question: 'Test question?',
        answer: 'Test answer.',
        category: 'general',
        locale: 'en',
      };

      const result = faqSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should fail with empty question or answer', () => {
      const invalidData = {
        question: '', // Invalid: empty
        answer: 'Test answer.',
        category: 'general',
        locale: 'en',
      };

      const result = faqSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate different locales', () => {
      const locales = ['en', 'es', 'pt'];

      locales.forEach(locale => {
        const data = {
          question: 'Test question?',
          answer: 'Test answer.',
          category: 'general',
          locale,
        };

        const result = faqSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('contentSchema', () => {
    it('should validate text content', () => {
      const validData = {
        key: 'homepage.title',
        type: 'text' as const,
        value: 'Welcome to Fly Fleet',
        locale: 'en',
      };

      const result = contentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate HTML content', () => {
      const validData = {
        key: 'homepage.description',
        type: 'html' as const,
        value: '<p>Premium charter services</p>',
        locale: 'en',
      };

      const result = contentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate JSON content', () => {
      const validData = {
        key: 'services.list',
        type: 'json' as const,
        value: JSON.stringify({ services: ['charter', 'empty_legs'] }),
        locale: 'en',
      };

      const result = contentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate URL content', () => {
      const validData = {
        key: 'hero.image',
        type: 'url' as const,
        value: 'https://example.com/image.jpg',
        locale: 'en',
      };

      const result = contentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail with invalid URL format', () => {
      const invalidData = {
        key: 'hero.image',
        type: 'url' as const,
        value: 'not-a-url',
        locale: 'en',
      };

      const result = contentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid locale', () => {
      const invalidData = {
        key: 'test.key',
        type: 'text' as const,
        value: 'Test value',
        locale: 'invalid', // Invalid locale
      };

      const result = contentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});