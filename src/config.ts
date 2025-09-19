export const locales = ['es', 'en', 'pt'] as const;
export const defaultLocale = 'es' as const;

export type Locale = typeof locales[number];

// Business configuration
export const businessConfig = {
  name: 'Fly-Fleet',
  phone: '+54 9 11 6660-1927',
  email: 'contact@fly-fleet.com',
  whatsapp: '5491166601927',
  domain: 'https://fly-fleet.com',

  // Social media (if applicable)
  social: {
    // instagram: 'https://instagram.com/flyfleet',
    // linkedin: 'https://linkedin.com/company/flyfleet'
  }
};