import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';
import { prisma } from '@/lib/database/prisma';

export async function POST(request: Request) {
  try {
    // Require admin authentication
    const authError = await requireAdmin();
    if (authError) return authError;

    // Get session for logging
    const { getAuthSession } = await import('@/lib/auth/server');
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Seeding test data...');

    // Sample quotes
    const quotesData = [
      {
        fullName: 'John Anderson',
        email: 'john.anderson@example.com',
        phone: '+1-555-0101',
        origin: 'New York (JFK)',
        destination: 'Los Angeles (LAX)',
        departureDate: new Date('2026-02-15'),
        departureTime: new Date('2026-02-15T10:00:00'),
        passengers: 4,
        serviceType: 'charter',
        locale: 'en',
        hasPets: false,
        specialItems: '2 sets of golf clubs',
        comments: 'Prefer a Gulfstream G650 if available',
        status: 'new_request',
      },
      {
        fullName: 'Sarah Martinez',
        email: 'sarah.martinez@example.com',
        phone: '+1-555-0102',
        origin: 'Miami (MIA)',
        destination: 'Aspen (ASE)',
        departureDate: new Date('2026-02-01'),
        departureTime: new Date('2026-02-01T08:30:00'),
        passengers: 6,
        serviceType: 'charter',
        locale: 'en',
        hasPets: true,
        petSpecies: 'dog',
        petSize: 'small',
        petDocuments: true,
        comments: 'Family ski trip, need extra luggage space',
        status: 'reviewing',
      },
      {
        fullName: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1-555-0103',
        origin: 'San Francisco (SFO)',
        destination: 'Las Vegas (LAS)',
        departureDate: new Date('2026-01-25'),
        departureTime: new Date('2026-01-25T14:00:00'),
        passengers: 8,
        serviceType: 'charter',
        locale: 'en',
        hasPets: false,
        comments: 'Corporate event, need WiFi and catering',
        status: 'quote_sent',
      },
      {
        fullName: 'Emma Thompson',
        email: 'emma.thompson@example.com',
        phone: '+1-555-0104',
        origin: 'Chicago (ORD)',
        destination: 'Miami (MIA)',
        departureDate: new Date('2026-02-10'),
        departureTime: new Date('2026-02-10T12:00:00'),
        passengers: 2,
        serviceType: 'charter',
        locale: 'en',
        hasPets: false,
        comments: 'Looking for empty leg deals',
        status: 'awaiting_confirmation',
      },
      {
        fullName: 'David Wilson',
        email: 'david.wilson@example.com',
        phone: '+1-555-0105',
        origin: 'Boston (BOS)',
        destination: 'London (LHR)',
        departureDate: new Date('2026-03-01'),
        departureTime: new Date('2026-03-01T18:00:00'),
        passengers: 3,
        serviceType: 'charter',
        locale: 'en',
        hasPets: false,
        comments: 'International flight, need customs assistance',
        status: 'confirmed',
      },
      {
        fullName: 'Lisa Rodriguez',
        email: 'lisa.rodriguez@example.com',
        phone: '+1-555-0106',
        origin: 'Dallas (DFW)',
        destination: 'Houston (IAH)',
        departureDate: new Date('2026-01-20'),
        departureTime: new Date('2026-01-20T09:00:00'),
        passengers: 5,
        serviceType: 'helicopter',
        locale: 'en',
        hasPets: false,
        comments: 'Same-day round trip for business meeting',
        status: 'payment_pending',
      },
      {
        fullName: 'Robert Taylor',
        email: 'robert.taylor@example.com',
        phone: '+1-555-0107',
        origin: 'Seattle (SEA)',
        destination: 'Portland (PDX)',
        departureDate: new Date('2026-01-18'),
        departureTime: new Date('2026-01-18T07:00:00'),
        passengers: 1,
        serviceType: 'helicopter',
        locale: 'en',
        hasPets: false,
        comments: 'Quick business trip',
        status: 'paid',
      },
      {
        fullName: 'Jennifer Brown',
        email: 'jennifer.brown@example.com',
        phone: '+1-555-0108',
        origin: 'Denver (DEN)',
        destination: 'Phoenix (PHX)',
        departureDate: new Date('2026-01-10'),
        departureTime: new Date('2026-01-10T11:00:00'),
        passengers: 4,
        serviceType: 'charter',
        locale: 'en',
        hasPets: true,
        petSpecies: 'cat',
        petSize: 'medium',
        petDocuments: true,
        comments: 'Relocating, pets must travel in cabin',
        status: 'completed',
      },
      {
        fullName: 'Thomas Garcia',
        email: 'thomas.garcia@example.com',
        phone: '+1-555-0109',
        origin: 'Atlanta (ATL)',
        destination: 'Nashville (BNA)',
        departureDate: new Date('2026-01-05'),
        departureTime: new Date('2026-01-05T16:00:00'),
        passengers: 3,
        serviceType: 'charter',
        locale: 'en',
        hasPets: false,
        specialItems: 'Musical instruments (2 guitars, 1 keyboard)',
        comments: 'Band traveling for concert',
        status: 'cancelled',
      },
      {
        fullName: 'Patricia Lee',
        email: 'patricia.lee@example.com',
        phone: '+1-555-0110',
        origin: 'Los Angeles (LAX)',
        destination: 'San Diego (SAN)',
        departureDate: new Date('2026-02-05'),
        departureTime: new Date('2026-02-05T13:00:00'),
        passengers: 2,
        serviceType: 'medical',
        locale: 'en',
        hasPets: false,
        specialItems: 'Medical equipment and wheelchair',
        comments: 'Patient transport, need medical personnel onboard',
        status: 'new_request',
      },
      {
        fullName: 'James Miller',
        email: 'james.miller@example.com',
        phone: '+1-555-0111',
        origin: 'Philadelphia (PHL)',
        destination: 'Tampa (TPA)',
        departureDate: new Date('2025-12-28'),
        departureTime: new Date('2025-12-28T15:00:00'),
        passengers: 7,
        serviceType: 'charter',
        locale: 'en',
        hasPets: false,
        comments: 'Urgent quote needed',
        status: 'new_request',
      },
    ];

    // Sample contacts
    const contactsData = [
      {
        fullName: 'Mary Johnson',
        email: 'mary.johnson@example.com',
        phone: '+1-555-0201',
        subject: 'Question about pet policies',
        message: 'Hi, I\'m interested in chartering a flight but I have a large dog (85 lbs). What are your pet policies and are there any size restrictions?',
        contactViaWhatsApp: true,
        locale: 'en',
        status: 'pending',
      },
      {
        fullName: 'Christopher Davis',
        email: 'christopher.davis@example.com',
        phone: '+1-555-0202',
        subject: 'Membership program inquiry',
        message: 'Do you offer any membership or frequent flyer programs for regular customers? I travel 2-3 times per month.',
        contactViaWhatsApp: false,
        locale: 'en',
        status: 'responded',
      },
      {
        fullName: 'Amanda White',
        email: 'amanda.white@example.com',
        phone: '+1-555-0203',
        subject: 'International flight documentation',
        message: 'What documents do I need for an international charter flight to Europe? Do you help with customs paperwork?',
        contactViaWhatsApp: true,
        locale: 'en',
        status: 'pending',
      },
      {
        fullName: 'Daniel Harris',
        email: 'daniel.harris@example.com',
        phone: '+1-555-0204',
        subject: 'Group booking discount',
        message: 'We have a group of 12 people traveling to a conference. Do you offer any discounts for large groups?',
        contactViaWhatsApp: false,
        locale: 'en',
        status: 'responded',
      },
      {
        fullName: 'Jessica Martin',
        email: 'jessica.martin@example.com',
        phone: '+1-555-0205',
        subject: 'Catering options',
        message: 'What catering options are available on charter flights? Can you accommodate dietary restrictions (vegetarian, gluten-free)?',
        contactViaWhatsApp: false,
        locale: 'en',
        status: 'closed',
      },
    ];

    console.log('📝 Creating quotes...');
    const createdQuotes = [];
    for (const quoteData of quotesData) {
      const { status, ...quoteFields } = quoteData;
      const quote = await prisma.quoteRequest.create({
        data: quoteFields as any,
      });
      createdQuotes.push(quote);
      console.log(`  ✓ Created quote: ${quote.fullName}`);

      // Create status history - directly create without validation
      if (status !== 'new_request') {
        await prisma.analyticsEvent.create({
          data: {
            eventName: 'quote_status_change',
            eventData: {
              quoteRequestId: quote.id,
              fromStatus: 'new_request',
              toStatus: status,
              adminEmail: session.user.email || 'system',
              adminNote: 'Initial seed status',
              type: 'status_change'
            },
            pagePath: `/admin/quotes/${quote.id}`,
            locale: 'en'
          },
        });
      }
    }

    console.log('\n📧 Creating contacts...');
    const createdContacts = [];
    for (const contactData of contactsData) {
      const { status, ...contactFields } = contactData;
      const contact = await prisma.contactForm.create({
        data: contactFields as any,
      });
      createdContacts.push(contact);
      console.log(`  ✓ Created contact: ${contact.fullName}`);

      // Create status history
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'contact_status_change',
          eventData: {
            contactId: contact.id,
            fromStatus: 'pending',
            toStatus: status,
            adminEmail: session.user.email,
            adminNote: 'Initial status',
            type: 'status_change'
          },
          pagePath: `/admin/contacts/${contact.id}`,
          locale: 'en'
        },
      });
    }

    console.log('\n✨ Test data seeding complete!');

    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully',
      data: {
        quotesCreated: createdQuotes.length,
        contactsCreated: createdContacts.length,
      },
    });
  } catch (error) {
    console.error('Error seeding test data:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed test data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
