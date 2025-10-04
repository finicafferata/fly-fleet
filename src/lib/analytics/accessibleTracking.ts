// Stub functions for analytics tracking
export const trackContactSuccess = (data: any) => {
  console.log('Contact success tracked:', data);
};

export const trackCTAClick = (id: string, text: string, location: string) => {
  console.log('CTA click tracked:', { id, text, location });
};

export const trackWhatsAppClick = (data: any) => {
  console.log('WhatsApp click tracked:', data);
};
