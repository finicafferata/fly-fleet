'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { businessConfig } from '@/config';

type LegalPageType = 'terms' | 'privacy' | 'cookies';

interface LegalPagesProps {
  pageType: LegalPageType;
}

export default function LegalPages({ pageType }: LegalPagesProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [activeSection, setActiveSection] = useState<string>('');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  const getPageContent = () => {
    switch (pageType) {
      case 'terms':
        return getTermsContent();
      case 'privacy':
        return getPrivacyContent();
      case 'cookies':
        return getCookiesContent();
      default:
        return getTermsContent();
    }
  };

  const getTermsContent = () => {
    const content = {
      en: {
        title: 'Terms and Conditions',
        lastUpdated: 'Last updated: January 2025',
        sections: [
          {
            id: 'acceptance',
            title: '1. Acceptance of Terms',
            content: `By accessing and using Fly-Fleet services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
          },
          {
            id: 'services',
            title: '2. Services Description',
            content: `Fly-Fleet operates as a private jet charter brokerage platform. We connect passengers with certified aircraft operators and do not operate aircraft directly. Our services include:
            • Charter flight arrangement and booking
            • Aircraft selection and operator matching
            • 24/7 customer support
            • Flight coordination and logistics`
          },
          {
            id: 'booking',
            title: '3. Booking and Payment',
            content: `All bookings are subject to aircraft availability and operator confirmation. Payment terms and cancellation policies are determined by the individual aircraft operator. Fly-Fleet acts as an intermediary and facilitates the booking process.`
          },
          {
            id: 'liability',
            title: '4. Limitation of Liability',
            content: `Fly-Fleet acts as a broker and is not liable for the performance of third-party aircraft operators. Our liability is limited to the brokerage services provided. All flights are operated by certified third-party operators who maintain their own insurance and liability coverage.`
          },
          {
            id: 'privacy',
            title: '5. Privacy and Data Protection',
            content: `Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information.`
          },
          {
            id: 'modifications',
            title: '6. Modifications to Terms',
            content: `Fly-Fleet reserves the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of modified terms.`
          },
          {
            id: 'contact',
            title: '7. Contact Information',
            content: `For questions about these Terms and Conditions, please contact us at ${businessConfig.email} or ${businessConfig.phone}.`
          }
        ]
      },
      es: {
        title: 'Términos y Condiciones',
        lastUpdated: 'Última actualización: Enero 2025',
        sections: [
          {
            id: 'acceptance',
            title: '1. Aceptación de los Términos',
            content: `Al acceder y utilizar los servicios de Fly-Fleet, usted acepta y se compromete a cumplir con los términos y disposiciones de este acuerdo. Si no está de acuerdo en cumplir con lo anterior, por favor no utilice este servicio.`
          },
          {
            id: 'services',
            title: '2. Descripción de Servicios',
            content: `Fly-Fleet opera como una plataforma de intermediación de vuelos chárter privados. Conectamos pasajeros con operadores de aeronaves certificados y no operamos aeronaves directamente. Nuestros servicios incluyen:
            • Organización y reserva de vuelos chárter
            • Selección de aeronaves y conexión con operadores
            • Soporte al cliente 24/7
            • Coordinación y logística de vuelos`
          },
          {
            id: 'booking',
            title: '3. Reservas y Pagos',
            content: `Todas las reservas están sujetas a disponibilidad de aeronaves y confirmación del operador. Los términos de pago y políticas de cancelación son determinados por el operador individual de la aeronave. Fly-Fleet actúa como intermediario y facilita el proceso de reserva.`
          },
          {
            id: 'liability',
            title: '4. Limitación de Responsabilidad',
            content: `Fly-Fleet actúa como intermediario y no es responsable del desempeño de operadores de aeronaves terceros. Nuestra responsabilidad se limita a los servicios de intermediación proporcionados. Todos los vuelos son operados por operadores terceros certificados que mantienen su propia cobertura de seguro y responsabilidad.`
          },
          {
            id: 'privacy',
            title: '5. Privacidad y Protección de Datos',
            content: `Su privacidad es importante para nosotros. Por favor revise nuestra Política de Privacidad para entender cómo recolectamos, usamos y protegemos su información personal.`
          },
          {
            id: 'modifications',
            title: '6. Modificaciones a los Términos',
            content: `Fly-Fleet se reserva el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación en nuestro sitio web. El uso continuado de nuestros servicios constituye la aceptación de los términos modificados.`
          },
          {
            id: 'contact',
            title: '7. Información de Contacto',
            content: `Para preguntas sobre estos Términos y Condiciones, por favor contáctenos en ${businessConfig.email} o ${businessConfig.phone}.`
          }
        ]
      },
      pt: {
        title: 'Termos e Condições',
        lastUpdated: 'Última atualização: Janeiro 2025',
        sections: [
          {
            id: 'acceptance',
            title: '1. Aceitação dos Termos',
            content: `Ao acessar e usar os serviços da Fly-Fleet, você aceita e concorda em estar vinculado aos termos e disposições deste acordo. Se você não concordar em cumprir o acima exposto, por favor não use este serviço.`
          },
          {
            id: 'services',
            title: '2. Descrição dos Serviços',
            content: `A Fly-Fleet opera como uma plataforma de intermediação de voos charter privados. Conectamos passageiros com operadores de aeronaves certificados e não operamos aeronaves diretamente. Nossos serviços incluem:
            • Organização e reserva de voos charter
            • Seleção de aeronaves e conexão com operadores
            • Suporte ao cliente 24/7
            • Coordenação e logística de voos`
          },
          {
            id: 'booking',
            title: '3. Reservas e Pagamentos',
            content: `Todas as reservas estão sujeitas à disponibilidade de aeronaves e confirmação do operador. Os termos de pagamento e políticas de cancelamento são determinados pelo operador individual da aeronave. A Fly-Fleet atua como intermediária e facilita o processo de reserva.`
          },
          {
            id: 'liability',
            title: '4. Limitação de Responsabilidade',
            content: `A Fly-Fleet atua como intermediária e não é responsável pelo desempenho de operadores de aeronaves terceiros. Nossa responsabilidade se limita aos serviços de intermediação fornecidos. Todos os voos são operados por operadores terceiros certificados que mantêm sua própria cobertura de seguro e responsabilidade.`
          },
          {
            id: 'privacy',
            title: '5. Privacidade e Proteção de Dados',
            content: `Sua privacidade é importante para nós. Por favor, revise nossa Política de Privacidade para entender como coletamos, usamos e protegemos suas informações pessoais.`
          },
          {
            id: 'modifications',
            title: '6. Modificações aos Termos',
            content: `A Fly-Fleet se reserva o direito de modificar estes termos a qualquer momento. As mudanças serão efetivas imediatamente após a publicação em nosso site. O uso continuado de nossos serviços constitui aceitação dos termos modificados.`
          },
          {
            id: 'contact',
            title: '7. Informações de Contato',
            content: `Para perguntas sobre estes Termos e Condições, entre em contato conosco em ${businessConfig.email} ou ${businessConfig.phone}.`
          }
        ]
      }
    };

    return content[locale as keyof typeof content] || content.en;
  };

  const getPrivacyContent = () => {
    const content = {
      en: {
        title: 'Privacy Policy',
        lastUpdated: 'Last updated: January 2025',
        sections: [
          {
            id: 'introduction',
            title: '1. Introduction',
            content: `This Privacy Policy describes how Fly-Fleet ("we," "our," or "us") collects, uses, and protects your personal information when you use our services. We are committed to protecting your privacy and ensuring the security of your personal data.`
          },
          {
            id: 'collection',
            title: '2. Information We Collect',
            content: `We collect information you provide directly to us, such as:
            • Personal identification information (name, email address, phone number)
            • Travel preferences and flight requirements
            • Payment information (processed securely by third-party providers)
            • Communication records and support requests
            • Website usage data and analytics`
          },
          {
            id: 'usage',
            title: '3. How We Use Your Information',
            content: `We use your information to:
            • Provide and improve our charter brokerage services
            • Communicate with you about your bookings and requests
            • Send you relevant updates and promotional materials (with consent)
            • Ensure safety and security of our services
            • Comply with legal and regulatory requirements`
          },
          {
            id: 'sharing',
            title: '4. Information Sharing',
            content: `We may share your information with:
            • Certified aircraft operators to fulfill your charter requests
            • Payment processors to handle transactions
            • Service providers who assist in our operations
            • Legal authorities when required by law
            We do not sell or rent your personal information to third parties.`
          },
          {
            id: 'security',
            title: '5. Data Security',
            content: `We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.`
          },
          {
            id: 'rights',
            title: '6. Your Rights',
            content: `You have the right to:
            • Access and update your personal information
            • Request deletion of your data
            • Opt-out of marketing communications
            • Request data portability
            • Lodge a complaint with relevant authorities`
          },
          {
            id: 'contact',
            title: '7. Contact Us',
            content: `For questions about this Privacy Policy or your personal data, contact us at ${businessConfig.email} or ${businessConfig.phone}.`
          }
        ]
      },
      es: {
        title: 'Política de Privacidad',
        lastUpdated: 'Última actualización: Enero 2025',
        sections: [
          {
            id: 'introduction',
            title: '1. Introducción',
            content: `Esta Política de Privacidad describe cómo Fly-Fleet ("nosotros," "nuestro," o "nos") recopila, usa y protege su información personal cuando utiliza nuestros servicios. Estamos comprometidos a proteger su privacidad y garantizar la seguridad de sus datos personales.`
          },
          {
            id: 'collection',
            title: '2. Información que Recopilamos',
            content: `Recopilamos información que usted nos proporciona directamente, como:
            • Información de identificación personal (nombre, dirección de correo electrónico, número de teléfono)
            • Preferencias de viaje y requisitos de vuelo
            • Información de pago (procesada de forma segura por proveedores terceros)
            • Registros de comunicación y solicitudes de soporte
            • Datos de uso del sitio web y análisis`
          },
          {
            id: 'usage',
            title: '3. Cómo Usamos Su Información',
            content: `Usamos su información para:
            • Proporcionar y mejorar nuestros servicios de intermediación de chárter
            • Comunicarnos con usted sobre sus reservas y solicitudes
            • Enviarle actualizaciones relevantes y materiales promocionales (con consentimiento)
            • Garantizar la seguridad de nuestros servicios
            • Cumplir con requisitos legales y regulatorios`
          },
          {
            id: 'sharing',
            title: '4. Compartir Información',
            content: `Podemos compartir su información con:
            • Operadores de aeronaves certificados para cumplir con sus solicitudes de chárter
            • Procesadores de pagos para manejar transacciones
            • Proveedores de servicios que asisten en nuestras operaciones
            • Autoridades legales cuando sea requerido por ley
            No vendemos ni alquilamos su información personal a terceros.`
          },
          {
            id: 'security',
            title: '5. Seguridad de Datos',
            content: `Implementamos medidas técnicas y organizacionales apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por internet es 100% seguro.`
          },
          {
            id: 'rights',
            title: '6. Sus Derechos',
            content: `Usted tiene el derecho de:
            • Acceder y actualizar su información personal
            • Solicitar eliminación de sus datos
            • Optar por no recibir comunicaciones de marketing
            • Solicitar portabilidad de datos
            • Presentar una queja ante las autoridades relevantes`
          },
          {
            id: 'contact',
            title: '7. Contáctenos',
            content: `Para preguntas sobre esta Política de Privacidad o sus datos personales, contáctenos en ${businessConfig.email} o ${businessConfig.phone}.`
          }
        ]
      },
      pt: {
        title: 'Política de Privacidade',
        lastUpdated: 'Última atualização: Janeiro 2025',
        sections: [
          {
            id: 'introduction',
            title: '1. Introdução',
            content: `Esta Política de Privacidade descreve como a Fly-Fleet ("nós," "nosso," ou "nos") coleta, usa e protege suas informações pessoais quando você usa nossos serviços. Estamos comprometidos em proteger sua privacidade e garantir a segurança de seus dados pessoais.`
          },
          {
            id: 'collection',
            title: '2. Informações que Coletamos',
            content: `Coletamos informações que você nos fornece diretamente, como:
            • Informações de identificação pessoal (nome, endereço de e-mail, número de telefone)
            • Preferências de viagem e requisitos de voo
            • Informações de pagamento (processadas com segurança por provedores terceiros)
            • Registros de comunicação e solicitações de suporte
            • Dados de uso do site e análises`
          },
          {
            id: 'usage',
            title: '3. Como Usamos Suas Informações',
            content: `Usamos suas informações para:
            • Fornecer e melhorar nossos serviços de intermediação de charter
            • Comunicar com você sobre suas reservas e solicitações
            • Enviar atualizações relevantes e materiais promocionais (com consentimento)
            • Garantir a segurança de nossos serviços
            • Cumprir com requisitos legais e regulamentares`
          },
          {
            id: 'sharing',
            title: '4. Compartilhamento de Informações',
            content: `Podemos compartilhar suas informações com:
            • Operadores de aeronaves certificados para atender suas solicitações de charter
            • Processadores de pagamento para lidar com transações
            • Provedores de serviços que auxiliam em nossas operações
            • Autoridades legais quando exigido por lei
            Não vendemos ou alugamos suas informações pessoais para terceiros.`
          },
          {
            id: 'security',
            title: '5. Segurança de Dados',
            content: `Implementamos medidas técnicas e organizacionais apropriadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, nenhum método de transmissão pela internet é 100% seguro.`
          },
          {
            id: 'rights',
            title: '6. Seus Direitos',
            content: `Você tem o direito de:
            • Acessar e atualizar suas informações pessoais
            • Solicitar exclusão de seus dados
            • Optar por não receber comunicações de marketing
            • Solicitar portabilidade de dados
            • Registrar uma reclamação com autoridades relevantes`
          },
          {
            id: 'contact',
            title: '7. Entre em Contato',
            content: `Para perguntas sobre esta Política de Privacidade ou seus dados pessoais, entre em contato conosco em ${businessConfig.email} ou ${businessConfig.phone}.`
          }
        ]
      }
    };

    return content[locale as keyof typeof content] || content.en;
  };

  const getCookiesContent = () => {
    const content = {
      en: {
        title: 'Cookie Policy',
        lastUpdated: 'Last updated: January 2025',
        sections: [
          {
            id: 'what-are-cookies',
            title: '1. What Are Cookies',
            content: `Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.`
          },
          {
            id: 'types-of-cookies',
            title: '2. Types of Cookies We Use',
            content: `We use several types of cookies:
            • Essential Cookies: Required for basic website functionality
            • Analytics Cookies: Help us understand how visitors use our site
            • Functional Cookies: Remember your preferences and settings
            • Marketing Cookies: Used to deliver relevant advertisements (with consent)`
          },
          {
            id: 'third-party-cookies',
            title: '3. Third-Party Cookies',
            content: `We may use third-party services that set cookies on our behalf:
            • Google Analytics for website analytics
            • Google reCAPTCHA for security
            • Payment processors for secure transactions
            These services have their own privacy policies governing their use of cookies.`
          },
          {
            id: 'managing-cookies',
            title: '4. Managing Cookies',
            content: `You can control cookies through your browser settings:
            • Block all cookies (may affect website functionality)
            • Delete existing cookies
            • Set preferences for future cookies
            • Receive notifications when cookies are set
            Most browsers allow you to refuse cookies or delete them.`
          },
          {
            id: 'cookie-consent',
            title: '5. Cookie Consent',
            content: `When you first visit our website, we'll ask for your consent to use non-essential cookies. You can withdraw your consent at any time by updating your cookie preferences or contacting us.`
          },
          {
            id: 'updates',
            title: '6. Updates to This Policy',
            content: `We may update this Cookie Policy from time to time. We'll notify you of any significant changes by posting the updated policy on our website.`
          },
          {
            id: 'contact',
            title: '7. Contact Us',
            content: `If you have questions about our use of cookies, please contact us at ${businessConfig.email} or ${businessConfig.phone}.`
          }
        ]
      },
      es: {
        title: 'Política de Cookies',
        lastUpdated: 'Última actualización: Enero 2025',
        sections: [
          {
            id: 'what-are-cookies',
            title: '1. Qué Son las Cookies',
            content: `Las cookies son pequeños archivos de texto almacenados en su dispositivo cuando visita nuestro sitio web. Nos ayudan a brindarle una mejor experiencia al recordar sus preferencias y analizar cómo usa nuestro sitio.`
          },
          {
            id: 'types-of-cookies',
            title: '2. Tipos de Cookies que Usamos',
            content: `Usamos varios tipos de cookies:
            • Cookies Esenciales: Requeridas para la funcionalidad básica del sitio web
            • Cookies de Análisis: Nos ayudan a entender cómo los visitantes usan nuestro sitio
            • Cookies Funcionales: Recuerdan sus preferencias y configuraciones
            • Cookies de Marketing: Usadas para entregar anuncios relevantes (con consentimiento)`
          },
          {
            id: 'third-party-cookies',
            title: '3. Cookies de Terceros',
            content: `Podemos usar servicios de terceros que establecen cookies en nuestro nombre:
            • Google Analytics para análisis del sitio web
            • Google reCAPTCHA para seguridad
            • Procesadores de pagos para transacciones seguras
            Estos servicios tienen sus propias políticas de privacidad que rigen su uso de cookies.`
          },
          {
            id: 'managing-cookies',
            title: '4. Gestión de Cookies',
            content: `Puede controlar las cookies a través de la configuración de su navegador:
            • Bloquear todas las cookies (puede afectar la funcionalidad del sitio web)
            • Eliminar cookies existentes
            • Establecer preferencias para cookies futuras
            • Recibir notificaciones cuando se establezcan cookies
            La mayoría de navegadores le permiten rechazar cookies o eliminarlas.`
          },
          {
            id: 'cookie-consent',
            title: '5. Consentimiento de Cookies',
            content: `Cuando visite nuestro sitio web por primera vez, le pediremos su consentimiento para usar cookies no esenciales. Puede retirar su consentimiento en cualquier momento actualizando sus preferencias de cookies o contactándonos.`
          },
          {
            id: 'updates',
            title: '6. Actualizaciones a Esta Política',
            content: `Podemos actualizar esta Política de Cookies de vez en cuando. Le notificaremos de cualquier cambio significativo publicando la política actualizada en nuestro sitio web.`
          },
          {
            id: 'contact',
            title: '7. Contáctenos',
            content: `Si tiene preguntas sobre nuestro uso de cookies, contáctenos en ${businessConfig.email} o ${businessConfig.phone}.`
          }
        ]
      },
      pt: {
        title: 'Política de Cookies',
        lastUpdated: 'Última atualização: Janeiro 2025',
        sections: [
          {
            id: 'what-are-cookies',
            title: '1. O que São Cookies',
            content: `Cookies são pequenos arquivos de texto armazenados em seu dispositivo quando você visita nosso site. Eles nos ajudam a fornecer uma melhor experiência lembrando suas preferências e analisando como você usa nosso site.`
          },
          {
            id: 'types-of-cookies',
            title: '2. Tipos de Cookies que Usamos',
            content: `Usamos vários tipos de cookies:
            • Cookies Essenciais: Necessários para funcionalidade básica do site
            • Cookies de Análise: Nos ajudam a entender como os visitantes usam nosso site
            • Cookies Funcionais: Lembram suas preferências e configurações
            • Cookies de Marketing: Usados para entregar anúncios relevantes (com consentimento)`
          },
          {
            id: 'third-party-cookies',
            title: '3. Cookies de Terceiros',
            content: `Podemos usar serviços de terceiros que estabelecem cookies em nosso nome:
            • Google Analytics para análise do site
            • Google reCAPTCHA para segurança
            • Processadores de pagamento para transações seguras
            Estes serviços têm suas próprias políticas de privacidade que regem seu uso de cookies.`
          },
          {
            id: 'managing-cookies',
            title: '4. Gerenciando Cookies',
            content: `Você pode controlar cookies através das configurações do seu navegador:
            • Bloquear todos os cookies (pode afetar a funcionalidade do site)
            • Excluir cookies existentes
            • Definir preferências para cookies futuros
            • Receber notificações quando cookies forem definidos
            A maioria dos navegadores permite recusar cookies ou excluí-los.`
          },
          {
            id: 'cookie-consent',
            title: '5. Consentimento de Cookies',
            content: `Quando você visitar nosso site pela primeira vez, pediremos seu consentimento para usar cookies não essenciais. Você pode retirar seu consentimento a qualquer momento atualizando suas preferências de cookies ou entrando em contato conosco.`
          },
          {
            id: 'updates',
            title: '6. Atualizações desta Política',
            content: `Podemos atualizar esta Política de Cookies periodicamente. Notificaremos você sobre quaisquer mudanças significativas publicando a política atualizada em nosso site.`
          },
          {
            id: 'contact',
            title: '7. Entre em Contato',
            content: `Se você tem perguntas sobre nosso uso de cookies, entre em contato conosco em ${businessConfig.email} ou ${businessConfig.phone}.`
          }
        ]
      }
    };

    return content[locale as keyof typeof content] || content.en;
  };

  const content = getPageContent();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-navy-primary text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold">{content.title}</h1>
          <p className="text-neutral-medium mt-2">{content.lastUpdated}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents */}
          <aside className="lg:w-1/4">
            <div className="sticky top-8">
              <h2 className="text-xl font-semibold text-navy-primary mb-4">
                {locale === 'es' ? 'Índice' : locale === 'pt' ? 'Índice' : 'Table of Contents'}
              </h2>
              <nav className="space-y-2">
                {content.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-navy-primary text-white'
                        : 'text-neutral-medium hover:text-navy-primary hover:bg-neutral-light'
                    }`}
                    aria-label={`Navigate to ${section.title}`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:w-3/4">
            <div className="prose prose-lg max-w-none">
              {content.sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="mb-8 scroll-mt-8"
                >
                  <h2 className="text-2xl font-semibold text-navy-primary mb-4">
                    {section.title}
                  </h2>
                  <div className="text-neutral-medium leading-relaxed whitespace-pre-line">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-6 bg-neutral-light rounded-lg border">
              <h3 className="text-xl font-semibold text-navy-primary mb-4">
                {locale === 'es'
                  ? '¿Preguntas sobre esta política?'
                  : locale === 'pt'
                  ? 'Perguntas sobre esta política?'
                  : 'Questions about this policy?'
                }
              </h3>
              <p className="text-neutral-medium mb-4">
                {locale === 'es'
                  ? 'Si tienes alguna pregunta sobre esta política, no dudes en contactarnos.'
                  : locale === 'pt'
                  ? 'Se você tem alguma pergunta sobre esta política, não hesite em nos contatar.'
                  : 'If you have any questions about this policy, please don\'t hesitate to contact us.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`mailto:${businessConfig.email}`}
                  className="inline-flex items-center px-4 py-2 bg-navy-primary text-white rounded-md hover:opacity-90 transition-colors"
                  aria-label={`Send email to ${businessConfig.email}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {businessConfig.email}
                </a>
                <a
                  href={`tel:${businessConfig.phone}`}
                  className="inline-flex items-center px-4 py-2 bg-navy-primary text-white rounded-md hover:opacity-90 transition-colors"
                  aria-label={`Call ${businessConfig.phone}`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {businessConfig.phone}
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}