import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

interface QuoteRequest {
  id: string;
  serviceType: string;
  fullName: string;
  email: string;
  phone?: string | null;
  passengers: number;
  origin: string;
  destination: string;
  departureDate: Date;
  departureTime: Date;
  standardBagsCount: number;
  specialItems?: string | null;
  hasPets: boolean;
  petSpecies?: string | null;
  petSize?: string | null;
  petDocuments?: boolean | null;
  additionalServices?: any;
  comments?: string | null;
  locale: string;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
}

interface ContactForm {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  locale: string;
}

export class EmailService {
  private resend: Resend;
  private prisma: PrismaClient;
  private businessEmail: string;
  private noreplyEmail: string;

  constructor() {
    // Initialize Resend with fallback for build time when env vars aren't available
    const apiKey = process.env.RESEND_API_KEY || 're_build_placeholder';
    this.resend = new Resend(apiKey);
    this.prisma = new PrismaClient();
    this.businessEmail = process.env.BUSINESS_EMAIL || 'contact@fly-fleet.com';
    this.noreplyEmail = process.env.NOREPLY_EMAIL || 'noreply@fly-fleet.com';
  }

  private isDevelopment(): boolean {
    return process.env.RESEND_API_KEY === 're_development_placeholder' ||
           process.env.RESEND_API_KEY === 're_build_placeholder' ||
           !process.env.RESEND_API_KEY;
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(process.cwd(), 'src/lib/email/templates', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  private async loadAccessibleTemplate(templateName: string): Promise<string> {
    const templatePath = path.join(process.cwd(), 'src/lib/email/templates', `${templateName}-accessible.html`);
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, 'utf-8');
    }
    // Fallback to regular template
    return this.loadTemplate(templateName);
  }

  private async loadBaseTemplate(): Promise<string> {
    const basePath = path.join(process.cwd(), 'src/lib/email/templates', 'accessible-email-base.html');
    return fs.readFileSync(basePath, 'utf-8');
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let result = template;

    // Replace simple variables {{variable}}
    Object.keys(data).forEach(key => {
      const value = data[key];
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });

    // Handle conditional blocks {{#if variable}}...{{/if}}
    result = result.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
      return data[variable] ? content : '';
    });

    // Handle each loops {{#each array}}...{{/each}}
    result = result.replace(/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g, (match, variable, content) => {
      const array = data[variable];
      if (Array.isArray(array)) {
        return array.map(item => content.replace(/{{this}}/g, item)).join('');
      }
      return '';
    });

    return result;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private translateServiceType(serviceType: string, locale: string): string {
    const translations: Record<string, Record<string, string>> = {
      es: {
        charter: 'Charter',
        multicity: 'Multi-ciudad',
        helicopter: 'Helicóptero',
        medical: 'Médico',
        cargo: 'Carga',
        other: 'Otro'
      },
      en: {
        charter: 'Charter',
        multicity: 'Multi-city',
        helicopter: 'Helicopter',
        medical: 'Medical',
        cargo: 'Cargo',
        other: 'Other'
      },
      pt: {
        charter: 'Charter',
        multicity: 'Multi-cidade',
        helicopter: 'Helicóptero',
        medical: 'Médico',
        cargo: 'Carga',
        other: 'Outro'
      }
    };

    return translations[locale]?.[serviceType] || serviceType;
  }

  private translateAdditionalServices(services: string[], locale: string): string[] {
    const translations: Record<string, Record<string, string>> = {
      es: {
        international_support: 'Apoyo vuelos internacionales',
        country_documentation: 'Documentación por país',
        pet_friendly_transport: 'Transporte pet-friendly',
        ground_transfer_driver: 'Transfer terrestre / chofer',
        premium_catering: 'Catering premium',
        vip_lounge_fbo: 'Sala VIP / FBO específico',
        customs_immigration_assist: 'Asistencia migraciones/aduana'
      },
      en: {
        international_support: 'International flight support',
        country_documentation: 'Country documentation',
        pet_friendly_transport: 'Pet-friendly transport',
        ground_transfer_driver: 'Ground transfer / driver',
        premium_catering: 'Premium catering',
        vip_lounge_fbo: 'VIP lounge / specific FBO',
        customs_immigration_assist: 'Customs/immigration assistance'
      },
      pt: {
        international_support: 'Suporte voos internacionais',
        country_documentation: 'Documentação por país',
        pet_friendly_transport: 'Transporte pet-friendly',
        ground_transfer_driver: 'Transfer terrestre / motorista',
        premium_catering: 'Catering premium',
        vip_lounge_fbo: 'Sala VIP / FBO específico',
        customs_immigration_assist: 'Assistência imigração/alfândega'
      }
    };

    return services.map(service => translations[locale]?.[service] || service);
  }

  private getAccessibilityLabels(locale: string) {
    const labels = {
      es: {
        // Quote notification labels
        requestSummaryTitle: 'Resumen de Solicitud de Cotización',
        customerInfoTitle: 'Información del Cliente',
        flightDetailsTitle: 'Detalles del Vuelo',
        petInfoTitle: 'Información de Mascotas',
        additionalServicesTitle: 'Servicios Adicionales',
        specialItemsTitle: 'Artículos Especiales',
        commentsTitle: 'Comentarios del Cliente',
        trackingInfoTitle: 'Información de Seguimiento',
        nextStepsTitle: 'Próximos Pasos',

        // Form labels
        nameLabel: 'Nombre',
        emailLabel: 'Email',
        phoneLabel: 'Teléfono',
        languageLabel: 'Idioma',
        serviceTypeLabel: 'Tipo de Servicio',
        routeLabel: 'Ruta',
        departureDateLabel: 'Fecha de Salida',
        departureTimeLabel: 'Hora de Salida',
        passengersLabel: 'Pasajeros',
        bagsLabel: 'Equipaje',
        petSpeciesLabel: 'Especie de Mascota',
        petSizeLabel: 'Tamaño de Mascota',
        petDocumentsLabel: 'Documentos de Mascota',

        // ARIA labels
        emailAriaLabel: 'Enviar email a cliente',
        phoneAriaLabel: 'Llamar al cliente',
        toAriaLabel: 'hacia',
        passengersAriaLabel: 'número de pasajeros',
        bagsAriaLabel: 'cantidad de equipaje',
        adminLinkAriaLabel: 'Ir al panel de administración para gestionar esta cotización',
        nextStepsAriaLabel: 'Acciones a seguir',

        // Status and other text
        statusText: 'Nueva Solicitud',
        petDocumentsYes: 'Sí',
        petDocumentsNo: 'No',
        adminLinkText: 'Gestionar Cotización',
        quoteValidityText: 'Esta cotización es válida por 30 días',
        nextStepsInstructions: 'Revise los detalles y contacte al cliente para proporcionar una cotización personalizada.',

        // Screen reader text
        skipToContentText: 'Saltar al contenido principal',
        emailEndMessage: 'Fin del mensaje de email',
        screenReaderSummary: 'Nueva solicitud de cotización recibida y lista para procesar',

        // Table captions
        customerInfoCaption: 'Información de contacto del cliente',
        flightDetailsCaption: 'Detalles del vuelo solicitado',
        petInfoCaption: 'Información sobre mascotas que viajarán',
        trackingInfoCaption: 'Información de seguimiento de marketing',

        // Footer
        footerAddress: 'Servicios de Charter Privado',
        unsubscribeText: 'Darse de baja',
        unsubscribeAriaLabel: 'Darse de baja de notificaciones por email',
        privacyText: 'Privacidad',
        privacyAriaLabel: 'Ver política de privacidad',
        contactText: 'Contacto',
        contactAriaLabel: 'Información de contacto de la empresa'
      },
      en: {
        // Quote notification labels
        requestSummaryTitle: 'Quote Request Summary',
        customerInfoTitle: 'Customer Information',
        flightDetailsTitle: 'Flight Details',
        petInfoTitle: 'Pet Information',
        additionalServicesTitle: 'Additional Services',
        specialItemsTitle: 'Special Items',
        commentsTitle: 'Customer Comments',
        trackingInfoTitle: 'Tracking Information',
        nextStepsTitle: 'Next Steps',

        // Form labels
        nameLabel: 'Name',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        languageLabel: 'Language',
        serviceTypeLabel: 'Service Type',
        routeLabel: 'Route',
        departureDateLabel: 'Departure Date',
        departureTimeLabel: 'Departure Time',
        passengersLabel: 'Passengers',
        bagsLabel: 'Baggage',
        petSpeciesLabel: 'Pet Species',
        petSizeLabel: 'Pet Size',
        petDocumentsLabel: 'Pet Documents',

        // ARIA labels
        emailAriaLabel: 'Send email to customer',
        phoneAriaLabel: 'Call customer',
        toAriaLabel: 'to',
        passengersAriaLabel: 'number of passengers',
        bagsAriaLabel: 'amount of baggage',
        adminLinkAriaLabel: 'Go to admin panel to manage this quote',
        nextStepsAriaLabel: 'Next actions to take',

        // Status and other text
        statusText: 'New Request',
        petDocumentsYes: 'Yes',
        petDocumentsNo: 'No',
        adminLinkText: 'Manage Quote',
        quoteValidityText: 'This quote is valid for 30 days',
        nextStepsInstructions: 'Review the details and contact the customer to provide a personalized quote.',

        // Screen reader text
        skipToContentText: 'Skip to main content',
        emailEndMessage: 'End of email message',
        screenReaderSummary: 'New quote request received and ready for processing',

        // Table captions
        customerInfoCaption: 'Customer contact information',
        flightDetailsCaption: 'Requested flight details',
        petInfoCaption: 'Information about traveling pets',
        trackingInfoCaption: 'Marketing tracking information',

        // Footer
        footerAddress: 'Private Charter Services',
        unsubscribeText: 'Unsubscribe',
        unsubscribeAriaLabel: 'Unsubscribe from email notifications',
        privacyText: 'Privacy',
        privacyAriaLabel: 'View privacy policy',
        contactText: 'Contact',
        contactAriaLabel: 'Company contact information'
      },
      pt: {
        // Quote notification labels
        requestSummaryTitle: 'Resumo da Solicitação de Cotação',
        customerInfoTitle: 'Informações do Cliente',
        flightDetailsTitle: 'Detalhes do Voo',
        petInfoTitle: 'Informações do Animal',
        additionalServicesTitle: 'Serviços Adicionais',
        specialItemsTitle: 'Itens Especiais',
        commentsTitle: 'Comentários do Cliente',
        trackingInfoTitle: 'Informações de Rastreamento',
        nextStepsTitle: 'Próximos Passos',

        // Form labels
        nameLabel: 'Nome',
        emailLabel: 'Email',
        phoneLabel: 'Telefone',
        languageLabel: 'Idioma',
        serviceTypeLabel: 'Tipo de Serviço',
        routeLabel: 'Rota',
        departureDateLabel: 'Data de Partida',
        departureTimeLabel: 'Hora de Partida',
        passengersLabel: 'Passageiros',
        bagsLabel: 'Bagagem',
        petSpeciesLabel: 'Espécie do Animal',
        petSizeLabel: 'Tamanho do Animal',
        petDocumentsLabel: 'Documentos do Animal',

        // ARIA labels
        emailAriaLabel: 'Enviar email para cliente',
        phoneAriaLabel: 'Ligar para cliente',
        toAriaLabel: 'para',
        passengersAriaLabel: 'número de passageiros',
        bagsAriaLabel: 'quantidade de bagagem',
        adminLinkAriaLabel: 'Ir ao painel admin para gerenciar esta cotação',
        nextStepsAriaLabel: 'Próximas ações a tomar',

        // Status and other text
        statusText: 'Nova Solicitação',
        petDocumentsYes: 'Sim',
        petDocumentsNo: 'Não',
        adminLinkText: 'Gerenciar Cotação',
        quoteValidityText: 'Esta cotação é válida por 30 dias',
        nextStepsInstructions: 'Revise os detalhes e entre em contato com o cliente para fornecer uma cotação personalizada.',

        // Screen reader text
        skipToContentText: 'Pular para o conteúdo principal',
        emailEndMessage: 'Fim da mensagem de email',
        screenReaderSummary: 'Nova solicitação de cotação recebida e pronta para processamento',

        // Table captions
        customerInfoCaption: 'Informações de contato do cliente',
        flightDetailsCaption: 'Detalhes do voo solicitado',
        petInfoCaption: 'Informações sobre animais viajantes',
        trackingInfoCaption: 'Informações de rastreamento de marketing',

        // Footer
        footerAddress: 'Serviços de Charter Privado',
        unsubscribeText: 'Cancelar inscrição',
        unsubscribeAriaLabel: 'Cancelar inscrição de notificações por email',
        privacyText: 'Privacidade',
        privacyAriaLabel: 'Ver política de privacidade',
        contactText: 'Contato',
        contactAriaLabel: 'Informações de contato da empresa'
      }
    };

    return labels[locale] || labels.en;
  }

  async sendQuoteNotification(data: {
    quoteData: QuoteRequest;
    subject: string;
    locale: string;
  }): Promise<string> {
    try {
      // Create initial email delivery record
      const emailDelivery = await this.prisma.emailDelivery.create({
        data: {
          quoteRequestId: data.quoteData.id,
          emailType: 'quote_notification',
          recipientEmail: this.businessEmail,
          senderEmail: this.noreplyEmail,
          subject: data.subject,
          status: 'pending'
        }
      });

      // Load accessible template and base
      const baseTemplate = await this.loadBaseTemplate();
      const contentTemplate = await this.loadAccessibleTemplate('quote-notification');
      const labels = this.getAccessibilityLabels(data.locale);

      const templateData = {
        // Base template data
        locale: data.locale,
        textDirection: data.locale === 'ar' ? 'rtl' : 'ltr',
        emailTitle: labels.requestSummaryTitle,
        subtitle: `${data.quoteData.origin} → ${data.quoteData.destination}`,

        // Content data
        ...data.quoteData,
        ...labels,
        serviceType: this.translateServiceType(data.quoteData.serviceType, data.locale),
        departureDate: this.formatDate(data.quoteData.departureDate),
        departureTime: this.formatTime(data.quoteData.departureTime),
        departureDatetime: data.quoteData.departureDate.toISOString().split('T')[0],
        departureTimeDatetime: data.quoteData.departureTime.toISOString().split('T')[1].substring(0, 5),
        submittedDate: this.formatDate(new Date()),
        submittedDatetime: new Date().toISOString(),
        additionalServices: data.quoteData.additionalServices
          ? this.translateAdditionalServices(data.quoteData.additionalServices, data.locale)
          : [],
        hasPets: data.quoteData.hasPets,
        utmSource: data.quoteData.utmSource || 'Directo',
        utmMedium: data.quoteData.utmMedium || 'N/A',
        utmCampaign: data.quoteData.utmCampaign || 'N/A',
        localeDisplay: data.locale === 'es' ? 'Español' : data.locale === 'en' ? 'English' : 'Português',

        // Accessibility metadata
        requestIdLabel: 'ID de Solicitud:',
        submittedLabel: 'Enviado:',
        adminUrl: `${process.env.ADMIN_URL || 'https://admin.fly-fleet.com'}/quotes/${data.quoteData.id}`,
        unsubscribeUrl: `${process.env.FRONTEND_URL || 'https://fly-fleet.com'}/unsubscribe`,
        privacyUrl: `${process.env.FRONTEND_URL || 'https://fly-fleet.com'}/privacy`,
        contactUrl: `${process.env.FRONTEND_URL || 'https://fly-fleet.com'}/contact`,

        // CTA section
        ctaSection: this.replaceTemplateVariables(
          '<h3>{{nextStepsTitle}}</h3><p>{{nextStepsInstructions}}</p><a href="{{adminUrl}}" class="cta-button" role="button" aria-label="{{adminLinkAriaLabel}}">{{adminLinkText}}</a>',
          { ...labels, adminUrl: `${process.env.ADMIN_URL || 'https://admin.fly-fleet.com'}/quotes/${data.quoteData.id}` }
        ),
        ctaAriaLabel: labels.nextStepsAriaLabel
      };

      // Process content template first
      const processedContent = this.replaceTemplateVariables(contentTemplate, templateData);

      // Then inject into base template
      const finalTemplateData = {
        ...templateData,
        content: processedContent
      };

      const html = this.replaceTemplateVariables(baseTemplate, finalTemplateData);

      // Send email
      const response = await this.resend.emails.send({
        from: this.noreplyEmail,
        to: this.businessEmail,
        subject: data.subject,
        html: html
      });

      // Update email delivery record with success
      await this.prisma.emailDelivery.update({
        where: { id: emailDelivery.id },
        data: {
          resendMessageId: response.data?.id,
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log(`Quote notification email sent: ${response.data?.id}`);
      return response.data?.id || '';

    } catch (error) {
      console.error('Failed to send quote notification:', error);

      // Update email delivery record with failure
      await this.prisma.emailDelivery.updateMany({
        where: {
          quoteRequestId: data.quoteData.id,
          emailType: 'quote_notification',
          status: 'pending'
        },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  async sendQuoteAutoResponse(data: {
    email: string;
    fullName: string;
    locale: string;
    quoteData: QuoteRequest;
  }): Promise<string> {
    try {
      // Create initial email delivery record
      const emailDelivery = await this.prisma.emailDelivery.create({
        data: {
          quoteRequestId: data.quoteData.id,
          emailType: 'auto_response',
          recipientEmail: data.email,
          senderEmail: this.noreplyEmail,
          subject: this.getAutoResponseSubject(data.locale),
          status: 'pending'
        }
      });

      // Load and process template
      const template = await this.loadTemplate('quote-autoresponse-external');
      const templateData = {
        fullName: data.fullName,
        origin: data.quoteData.origin,
        destination: data.quoteData.destination,
        departureDate: this.formatDate(data.quoteData.departureDate),
        departureTime: this.formatTime(data.quoteData.departureTime),
        passengers: data.quoteData.passengers,
        serviceType: this.translateServiceType(data.quoteData.serviceType, data.locale)
      };

      const html = this.replaceTemplateVariables(template, templateData);

      // Send email
      const response = await this.resend.emails.send({
        from: this.noreplyEmail,
        to: data.email,
        subject: this.getAutoResponseSubject(data.locale),
        html: html
      });

      // Update email delivery record with success
      await this.prisma.emailDelivery.update({
        where: { id: emailDelivery.id },
        data: {
          resendMessageId: response.data?.id,
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log(`Quote auto-response email sent: ${response.data?.id}`);
      return response.data?.id || '';

    } catch (error) {
      console.error('Failed to send quote auto-response:', error);

      // Update email delivery record with failure
      await this.prisma.emailDelivery.updateMany({
        where: {
          quoteRequestId: data.quoteData.id,
          emailType: 'auto_response',
          status: 'pending'
        },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  async sendContactNotification(data: {
    contactData: ContactForm;
    subject: string;
    locale: string;
  }): Promise<string> {
    try {
      // Create initial email delivery record
      const emailDelivery = await this.prisma.emailDelivery.create({
        data: {
          contactFormId: data.contactData.id,
          emailType: 'contact_notification',
          recipientEmail: this.businessEmail,
          senderEmail: this.noreplyEmail,
          subject: data.subject,
          status: 'pending'
        }
      });

      // Load template
      const template = await this.loadTemplate('contact-notification-internal');

      const templateData = {
        fullName: data.contactData.fullName,
        email: data.contactData.email,
        phone: data.contactData.phone || 'No proporcionado',
        phoneClean: (data.contactData.phone || '').replace(/[^0-9]/g, ''),
        subject: data.contactData.subject,
        message: data.contactData.message,
        contactViaWhatsApp: data.contactData.contactViaWhatsApp,
        utmSource: data.contactData.utmSource || 'Directo',
        utmMedium: data.contactData.utmMedium || 'N/A',
        utmCampaign: data.contactData.utmCampaign || 'N/A',
        localeDisplay: data.locale === 'es' ? 'Español' : data.locale === 'en' ? 'English' : 'Português'
      };

      const html = this.replaceTemplateVariables(template, templateData);

      const response = await this.resend.emails.send({
        from: this.noreplyEmail,
        to: this.businessEmail,
        subject: data.subject,
        html: html
      });

      // Update email delivery record with success
      await this.prisma.emailDelivery.update({
        where: { id: emailDelivery.id },
        data: {
          resendMessageId: response.data?.id,
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log(`Contact notification email sent: ${response.data?.id}`);
      return response.data?.id || '';

    } catch (error) {
      console.error('Failed to send contact notification:', error);

      await this.prisma.emailDelivery.updateMany({
        where: {
          contactFormId: data.contactData.id,
          emailType: 'contact_notification',
          status: 'pending'
        },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  async sendContactAutoResponse(data: {
    email: string;
    fullName: string;
    locale: string;
    contactData: ContactForm;
  }): Promise<string> {
    try {
      // Create initial email delivery record
      const emailDelivery = await this.prisma.emailDelivery.create({
        data: {
          contactFormId: data.contactData.id,
          emailType: 'contact_auto_response',
          recipientEmail: data.email,
          senderEmail: this.noreplyEmail,
          subject: this.getContactAutoResponseSubject(data.locale),
          status: 'pending'
        }
      });

      // Load template
      const template = await this.loadTemplate('contact-autoresponse');

      // Get translations based on locale
      const translations = this.getContactAutoResponseTranslations(data.locale);

      const templateData = {
        fullName: data.fullName,
        subject: data.contactData.subject,
        message: data.contactData.message,
        ...translations
      };

      const html = this.replaceTemplateVariables(template, templateData);

      const response = await this.resend.emails.send({
        from: this.noreplyEmail,
        to: data.email,
        subject: this.getContactAutoResponseSubject(data.locale),
        html: html
      });

      // Update email delivery record with success
      await this.prisma.emailDelivery.update({
        where: { id: emailDelivery.id },
        data: {
          resendMessageId: response.data?.id,
          status: 'sent',
          sentAt: new Date()
        }
      });

      console.log(`Contact auto-response email sent: ${response.data?.id}`);
      return response.data?.id || '';

    } catch (error) {
      console.error('Failed to send contact auto-response:', error);

      await this.prisma.emailDelivery.updateMany({
        where: {
          contactFormId: data.contactData.id,
          emailType: 'contact_auto_response',
          status: 'pending'
        },
        data: {
          status: 'failed',
          failedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  }

  private getAutoResponseSubject(locale: string): string {
    const subjects = {
      es: 'Confirmación de cotización recibida - Fly-Fleet',
      en: 'Quote request confirmation - Fly-Fleet',
      pt: 'Confirmação de cotação recebida - Fly-Fleet'
    };
    return subjects[locale as keyof typeof subjects] || subjects.es;
  }

  private getContactAutoResponseSubject(locale: string): string {
    const subjects = {
      es: 'Mensaje recibido - Fly-Fleet',
      en: 'Message received - Fly-Fleet',
      pt: 'Mensagem recebida - Fly-Fleet'
    };
    return subjects[locale as keyof typeof subjects] || subjects.es;
  }

  private getContactAutoResponseTranslations(locale: string) {
    const translations = {
      es: {
        confirmationTitle: 'Mensaje Recibido',
        thankYouMessage: 'Gracias por contactarnos',
        confirmationMessage: 'Hemos recibido tu mensaje y nuestro equipo se pondrá en contacto contigo lo antes posible.',
        summaryTitle: 'Resumen de tu Mensaje',
        subjectLabel: 'Asunto',
        messageLabel: 'Mensaje',
        nextStepsTitle: '¿Qué sigue?',
        nextStep1: 'Nuestro equipo revisará tu consulta',
        nextStep2: 'Te responderemos por email o teléfono según tu preferencia',
        nextStep3: 'Tiempo estimado de respuesta: 2-4 horas hábiles',
        urgentContactText: '¿Necesitas contactarnos urgentemente?',
        callButtonText: 'Llamar',
        footer24x7: 'Operamos 24/7 para tu tranquilidad',
        privacyPolicy: 'Política de Privacidad',
        termsConditions: 'Términos y Condiciones'
      },
      en: {
        confirmationTitle: 'Message Received',
        thankYouMessage: 'Thank you for contacting us',
        confirmationMessage: 'We have received your message and our team will get back to you as soon as possible.',
        summaryTitle: 'Your Message Summary',
        subjectLabel: 'Subject',
        messageLabel: 'Message',
        nextStepsTitle: 'What\'s next?',
        nextStep1: 'Our team will review your inquiry',
        nextStep2: 'We\'ll respond via email or phone based on your preference',
        nextStep3: 'Estimated response time: 2-4 business hours',
        urgentContactText: 'Need to contact us urgently?',
        callButtonText: 'Call',
        footer24x7: 'We operate 24/7 for your peace of mind',
        privacyPolicy: 'Privacy Policy',
        termsConditions: 'Terms and Conditions'
      },
      pt: {
        confirmationTitle: 'Mensagem Recebida',
        thankYouMessage: 'Obrigado por nos contatar',
        confirmationMessage: 'Recebemos sua mensagem e nossa equipe entrará em contato com você o mais breve possível.',
        summaryTitle: 'Resumo da Sua Mensagem',
        subjectLabel: 'Assunto',
        messageLabel: 'Mensagem',
        nextStepsTitle: 'O que vem a seguir?',
        nextStep1: 'Nossa equipe revisará sua consulta',
        nextStep2: 'Responderemos por e-mail ou telefone conforme sua preferência',
        nextStep3: 'Tempo estimado de resposta: 2-4 horas úteis',
        urgentContactText: 'Precisa nos contatar urgentemente?',
        callButtonText: 'Ligar',
        footer24x7: 'Operamos 24/7 para sua tranquilidade',
        privacyPolicy: 'Política de Privacidade',
        termsConditions: 'Termos e Condições'
      }
    };
    return translations[locale as keyof typeof translations] || translations.es;
  }
}