// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TEST123';
process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY = 'test-recaptcha-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.RESEND_API_KEY = 'test-api-key';
process.env.ADMIN_EMAIL = 'test@example.com';
process.env.WHATSAPP_NUMBER = '+1234567890';