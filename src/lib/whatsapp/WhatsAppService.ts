import { PrismaClient } from '@prisma/client';

// Additional services translations for WhatsApp messages
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

// Service type translations
const serviceTypeTranslations = {
  es: {
    charter: "Charter",
    multicity: "Multi-ciudad",
    helicopter: "Helicóptero",
    medical: "Médico",
    cargo: "Carga",
    other: "Otro"
  },
  en: {
    charter: "Charter",
    multicity: "Multi-city",
    helicopter: "Helicopter",
    medical: "Medical",
    cargo: "Cargo",
    other: "Other"
  },
  pt: {
    charter: "Charter",
    multicity: "Multi-cidade",
    helicopter: "Helicóptero",
    medical: "Médico",
    cargo: "Carga",
    other: "Outro"
  }
};

// WhatsApp message templates
const messageTemplates = {
  general: {
    es: `¡Hola! Me interesa cotizar un vuelo privado.

Mis datos de contacto:
📧 Email: {email}
📞 Teléfono: {phone}

¡Gracias por la atención!`,
    en: `Hello! I'm interested in getting a quote for a private flight.

My contact information:
📧 Email: {email}
📞 Phone: {phone}

Thank you for your attention!`,
    pt: `Olá! Estou interessado em cotar um voo privado.

Minhas informações de contato:
📧 Email: {email}
📞 Telefone: {phone}

Obrigado pela atenção!`
  },
  quote: {
    es: `¡Hola! Me interesa cotizar un vuelo privado con los siguientes detalles:

✈️ **DETALLES DEL VUELO**
🛫 Origen: {origin}
🛬 Destino: {destination}
📅 Fecha: {date}
🕐 Hora: {time}
👥 Pasajeros: {passengers}
🎯 Servicio: {serviceType}

👤 **MIS DATOS**
📧 Email: {email}
📞 Teléfono: {phone}
🧳 Equipaje estándar: {bags} piezas{specialItems}

{additionalServices}{comments}

¡Espero su cotización!`,
    en: `Hello! I'm interested in getting a quote for a private flight with the following details:

✈️ **FLIGHT DETAILS**
🛫 Origin: {origin}
🛬 Destination: {destination}
📅 Date: {date}
🕐 Time: {time}
👥 Passengers: {passengers}
🎯 Service: {serviceType}

👤 **MY DETAILS**
📧 Email: {email}
📞 Phone: {phone}
🧳 Standard bags: {bags} pieces{specialItems}

{additionalServices}{comments}

Looking forward to your quote!`,
    pt: `Olá! Estou interessado em cotar um voo privado com os seguintes detalhes:

✈️ **DETALHES DO VOO**
🛫 Origem: {origin}
🛬 Destino: {destination}
📅 Data: {date}
🕐 Hora: {time}
👥 Passageiros: {passengers}
🎯 Serviço: {serviceType}

👤 **MEUS DADOS**
📧 Email: {email}
📞 Telefone: {phone}
🧳 Bagagem padrão: {bags} peças{specialItems}

{additionalServices}{comments}

Aguardo sua cotação!`
  },
  contact: {
    es: `¡Hola! Tengo una consulta sobre sus servicios de aviación privada.

📋 **ASUNTO**: {subject}

💬 **MENSAJE**:
{message}

👤 **MIS DATOS**
📧 Email: {email}
📞 Teléfono: {phone}

¡Gracias por la atención!`,
    en: `Hello! I have a question about your private aviation services.

📋 **SUBJECT**: {subject}

💬 **MESSAGE**:
{message}

👤 **MY DETAILS**
📧 Email: {email}
📞 Phone: {phone}

Thank you for your attention!`,
    pt: `Olá! Tenho uma consulta sobre seus serviços de aviação privada.

📋 **ASSUNTO**: {subject}

💬 **MENSAGEM**:
{message}

👤 **MEUS DADOS**
📧 Email: {email}
📞 Telefone: {phone}

Obrigado pela atenção!`
  }
};

// Interface for WhatsApp link request
export interface WhatsAppLinkRequest {
  type: 'general' | 'quote' | 'contact';
  locale: 'es' | 'en' | 'pt';
  pageSource?: string;
  sessionId?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Contact info (always present)
  email?: string;
  phone?: string;
  fullName?: string;

  // Quote-specific fields
  origin?: string;
  destination?: string;
  date?: string;
  time?: string;
  passengers?: number;
  serviceType?: string;
  bags?: number;
  specialItems?: string;
  additionalServices?: string[];
  comments?: string;

  // Contact-specific fields
  subject?: string;
  message?: string;
}

// Interface for WhatsApp click record
export interface WhatsAppClickResult {
  clickId: string;
  whatsappUrl: string;
  message: string;
}

export class WhatsAppService {
  private prisma: PrismaClient;
  private businessPhone: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.businessPhone = process.env.WHATSAPP_BUSINESS_PHONE || '5491166601927'; // Default to Fly-Fleet number
  }

  /**
   * Generate WhatsApp link with message and track click
   */
  async generateWhatsAppLink(
    request: WhatsAppLinkRequest,
    clientIP?: string,
    userAgent?: string
  ): Promise<WhatsAppClickResult> {
    try {
      // Generate the message based on type and data
      const message = this.generateMessage(request);

      // Create WhatsApp URL with encoded message
      const whatsappUrl = `https://wa.me/${this.businessPhone}?text=${encodeURIComponent(message)}`;

      // Store click in database
      const whatsappClick = await this.prisma.whatsappClick.create({
        data: {
          sessionId: request.sessionId || null,
          pageSource: request.pageSource || null,
          utmSource: request.utmSource || null,
          utmMedium: request.utmMedium || null,
          utmCampaign: request.utmCampaign || null,
          ipAddress: clientIP || null,
          locale: request.locale
        }
      });

      return {
        clickId: whatsappClick.id,
        whatsappUrl,
        message
      };

    } catch (error) {
      console.error('Error generating WhatsApp link:', error);
      throw new Error('Failed to generate WhatsApp link');
    }
  }

  /**
   * Generate message based on request type and data
   */
  private generateMessage(request: WhatsAppLinkRequest): string {
    const template = messageTemplates[request.type][request.locale];
    let message = template;

    // Replace basic placeholders
    message = message.replace(/{email}/g, request.email || '');
    message = message.replace(/{phone}/g, request.phone || '');
    message = message.replace(/{fullName}/g, request.fullName || '');

    // Quote-specific replacements
    if (request.type === 'quote') {
      message = message.replace(/{origin}/g, request.origin || '');
      message = message.replace(/{destination}/g, request.destination || '');
      message = message.replace(/{date}/g, request.date || '');
      message = message.replace(/{time}/g, request.time || '');
      message = message.replace(/{passengers}/g, request.passengers?.toString() || '');
      message = message.replace(/{bags}/g, request.bags?.toString() || '0');

      // Translate service type
      const serviceType = request.serviceType && serviceTypeTranslations[request.locale]?.[request.serviceType]
        ? serviceTypeTranslations[request.locale][request.serviceType]
        : request.serviceType || '';
      message = message.replace(/{serviceType}/g, serviceType);

      // Handle special items
      const specialItems = request.specialItems
        ? `\n🎒 Artículos especiales: ${request.specialItems}`
        : '';
      message = message.replace(/{specialItems}/g, specialItems);

      // Handle additional services
      const additionalServices = this.formatAdditionalServices(request.additionalServices, request.locale);
      message = message.replace(/{additionalServices}/g, additionalServices);

      // Handle comments
      const comments = request.comments
        ? `\n\n💬 **COMENTARIOS ADICIONALES**\n${request.comments}`
        : '';
      message = message.replace(/{comments}/g, comments);
    }

    // Contact-specific replacements
    if (request.type === 'contact') {
      message = message.replace(/{subject}/g, request.subject || '');
      message = message.replace(/{message}/g, request.message || '');
    }

    return message;
  }

  /**
   * Format additional services for WhatsApp message
   */
  private formatAdditionalServices(services: string[] | undefined, locale: string): string {
    if (!services || services.length === 0) {
      return '';
    }

    const translations = additionalServicesTranslations[locale];
    const translatedServices = services.map(service =>
      translations[service] || service
    );

    const serviceLabel = {
      es: '\n\n🛎️ **SERVICIOS ADICIONALES**',
      en: '\n\n🛎️ **ADDITIONAL SERVICES**',
      pt: '\n\n🛎️ **SERVIÇOS ADICIONAIS**'
    };

    return `${serviceLabel[locale]}\n${translatedServices.map(s => `• ${s}`).join('\n')}`;
  }

  /**
   * Get click statistics for monitoring
   */
  async getClickStats(timeframe: 'today' | 'week' | 'month' = 'today'): Promise<{
    totalClicks: number;
    clicksByLocale: Record<string, number>;
    clicksBySource: Record<string, number>;
    topPages: Array<{ page: string; clicks: number }>;
  }> {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    try {
      // Get total clicks
      const totalClicks = await this.prisma.whatsappClick.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      });

      // Get clicks by locale
      const localeStats = await this.prisma.whatsappClick.groupBy({
        by: ['locale'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          id: true
        }
      });

      const clicksByLocale = localeStats.reduce((acc, stat) => {
        acc[stat.locale || 'unknown'] = stat._count.id;
        return acc;
      }, {} as Record<string, number>);

      // Get clicks by UTM source
      const sourceStats = await this.prisma.whatsappClick.groupBy({
        by: ['utmSource'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          id: true
        }
      });

      const clicksBySource = sourceStats.reduce((acc, stat) => {
        acc[stat.utmSource || 'direct'] = stat._count.id;
        return acc;
      }, {} as Record<string, number>);

      // Get top pages
      const pageStats = await this.prisma.whatsappClick.groupBy({
        by: ['pageSource'],
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      });

      const topPages = pageStats.map(stat => ({
        page: stat.pageSource || 'unknown',
        clicks: stat._count.id
      }));

      return {
        totalClicks,
        clicksByLocale,
        clicksBySource,
        topPages
      };

    } catch (error) {
      console.error('Error getting WhatsApp click stats:', error);
      throw new Error('Failed to get click statistics');
    }
  }

  /**
   * Get a specific click record
   */
  async getClick(clickId: string) {
    try {
      return await this.prisma.whatsappClick.findUnique({
        where: { id: clickId }
      });
    } catch (error) {
      console.error('Error getting WhatsApp click:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const whatsappService = new WhatsAppService();