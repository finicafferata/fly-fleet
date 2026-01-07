import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding test data...');

  // Sample quotes with various statuses and service types
  const quotes = [
    {
      fullName: 'John Anderson',
      email: 'john.anderson@example.com',
      phone: '+1-555-0101',
      origin: 'New York (JFK)',
      destination: 'Los Angeles (LAX)',
      departureDate: new Date('2026-02-15'),
      returnDate: new Date('2026-02-20'),
      passengers: 4,
      serviceType: 'charter',
      hasPets: false,
      hasSpecialItems: true,
      specialItemsDetails: '2 sets of golf clubs',
      comments: 'Prefer a Gulfstream G650 if available',
      currentStatus: 'new_request',
    },
    {
      fullName: 'Sarah Martinez',
      email: 'sarah.martinez@example.com',
      phone: '+1-555-0102',
      origin: 'Miami (MIA)',
      destination: 'Aspen (ASE)',
      departureDate: new Date('2026-02-01'),
      returnDate: null,
      passengers: 6,
      serviceType: 'charter',
      hasPets: true,
      petDetails: '1 small dog (10 lbs)',
      hasSpecialItems: false,
      comments: 'Family ski trip, need extra luggage space',
      currentStatus: 'reviewing',
    },
    {
      fullName: 'Michael Chen',
      email: 'michael.chen@example.com',
      phone: '+1-555-0103',
      origin: 'San Francisco (SFO)',
      destination: 'Las Vegas (LAS)',
      departureDate: new Date('2026-01-25'),
      returnDate: new Date('2026-01-26'),
      passengers: 8,
      serviceType: 'charter',
      hasPets: false,
      hasSpecialItems: false,
      comments: 'Corporate event, need WiFi and catering',
      currentStatus: 'quote_sent',
    },
    {
      fullName: 'Emma Thompson',
      email: 'emma.thompson@example.com',
      phone: '+1-555-0104',
      origin: 'Chicago (ORD)',
      destination: 'Miami (MIA)',
      departureDate: new Date('2026-02-10'),
      returnDate: null,
      passengers: 2,
      serviceType: 'empty_legs',
      hasPets: false,
      hasSpecialItems: false,
      comments: 'Looking for empty leg deals',
      currentStatus: 'awaiting_confirmation',
    },
    {
      fullName: 'David Wilson',
      email: 'david.wilson@example.com',
      phone: '+1-555-0105',
      origin: 'Boston (BOS)',
      destination: 'London (LHR)',
      departureDate: new Date('2026-03-01'),
      returnDate: new Date('2026-03-15'),
      passengers: 3,
      serviceType: 'charter',
      hasPets: false,
      hasSpecialItems: false,
      comments: 'International flight, need customs assistance',
      currentStatus: 'confirmed',
    },
    {
      fullName: 'Lisa Rodriguez',
      email: 'lisa.rodriguez@example.com',
      phone: '+1-555-0106',
      origin: 'Dallas (DFW)',
      destination: 'Houston (IAH)',
      departureDate: new Date('2026-01-20'),
      returnDate: new Date('2026-01-20'),
      passengers: 5,
      serviceType: 'helicopter',
      hasPets: false,
      hasSpecialItems: false,
      comments: 'Same-day round trip for business meeting',
      currentStatus: 'payment_pending',
    },
    {
      fullName: 'Robert Taylor',
      email: 'robert.taylor@example.com',
      phone: '+1-555-0107',
      origin: 'Seattle (SEA)',
      destination: 'Portland (PDX)',
      departureDate: new Date('2026-01-18'),
      returnDate: null,
      passengers: 1,
      serviceType: 'helicopter',
      hasPets: false,
      hasSpecialItems: false,
      comments: 'Quick business trip',
      currentStatus: 'paid',
    },
    {
      fullName: 'Jennifer Brown',
      email: 'jennifer.brown@example.com',
      phone: '+1-555-0108',
      origin: 'Denver (DEN)',
      destination: 'Phoenix (PHX)',
      departureDate: new Date('2026-01-10'),
      returnDate: new Date('2026-01-12'),
      passengers: 4,
      serviceType: 'charter',
      hasPets: true,
      petDetails: '2 cats in carriers',
      hasSpecialItems: false,
      comments: 'Relocating, pets must travel in cabin',
      currentStatus: 'completed',
    },
    {
      fullName: 'Thomas Garcia',
      email: 'thomas.garcia@example.com',
      phone: '+1-555-0109',
      origin: 'Atlanta (ATL)',
      destination: 'Nashville (BNA)',
      departureDate: new Date('2026-01-05'),
      returnDate: null,
      passengers: 3,
      serviceType: 'charter',
      hasPets: false,
      hasSpecialItems: true,
      specialItemsDetails: 'Musical instruments (2 guitars, 1 keyboard)',
      comments: 'Band traveling for concert',
      currentStatus: 'cancelled',
    },
    {
      fullName: 'Patricia Lee',
      email: 'patricia.lee@example.com',
      phone: '+1-555-0110',
      origin: 'Los Angeles (LAX)',
      destination: 'San Diego (SAN)',
      departureDate: new Date('2026-02-05'),
      returnDate: new Date('2026-02-07'),
      passengers: 2,
      serviceType: 'medical',
      hasPets: false,
      hasSpecialItems: true,
      specialItemsDetails: 'Medical equipment and wheelchair',
      comments: 'Patient transport, need medical personnel onboard',
      currentStatus: 'new_request',
    },
    {
      fullName: 'James Miller',
      email: 'james.miller@example.com',
      phone: '+1-555-0111',
      origin: 'Philadelphia (PHL)',
      destination: 'Tampa (TPA)',
      departureDate: new Date('2025-12-28'),
      returnDate: null,
      passengers: 7,
      serviceType: 'charter',
      hasPets: false,
      hasSpecialItems: false,
      comments: 'Urgent quote needed',
      currentStatus: 'new_request',
    },
  ];

  // Sample contacts
  const contacts = [
    {
      fullName: 'Mary Johnson',
      email: 'mary.johnson@example.com',
      phone: '+1-555-0201',
      subject: 'Question about pet policies',
      message: 'Hi, I\'m interested in chartering a flight but I have a large dog (85 lbs). What are your pet policies and are there any size restrictions?',
      contactViaWhatsApp: true,
      currentStatus: 'pending',
    },
    {
      fullName: 'Christopher Davis',
      email: 'christopher.davis@example.com',
      phone: '+1-555-0202',
      subject: 'Membership program inquiry',
      message: 'Do you offer any membership or frequent flyer programs for regular customers? I travel 2-3 times per month.',
      contactViaWhatsApp: false,
      currentStatus: 'responded',
    },
    {
      fullName: 'Amanda White',
      email: 'amanda.white@example.com',
      phone: '+1-555-0203',
      subject: 'International flight documentation',
      message: 'What documents do I need for an international charter flight to Europe? Do you help with customs paperwork?',
      contactViaWhatsApp: true,
      currentStatus: 'pending',
    },
    {
      fullName: 'Daniel Harris',
      email: 'daniel.harris@example.com',
      phone: '+1-555-0204',
      subject: 'Group booking discount',
      message: 'We have a group of 12 people traveling to a conference. Do you offer any discounts for large groups?',
      contactViaWhatsApp: false,
      currentStatus: 'responded',
    },
    {
      fullName: 'Jessica Martin',
      email: 'jessica.martin@example.com',
      phone: '+1-555-0205',
      subject: 'Catering options',
      message: 'What catering options are available on charter flights? Can you accommodate dietary restrictions (vegetarian, gluten-free)?',
      contactViaWhatsApp: false,
      currentStatus: 'closed',
    },
  ];

  console.log('📝 Creating quotes...');
  const createdQuotes = [];
  for (const quoteData of quotes) {
    const quote = await prisma.quote.create({
      data: quoteData,
    });
    createdQuotes.push(quote);
    console.log(`  ✓ Created quote: ${quote.fullName} (${quote.currentStatus})`);

    // Create status history for each quote
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'quote_status_change',
        entityType: 'quote',
        entityId: quote.id,
        eventData: {
          quoteId: quote.id,
          oldStatus: null,
          newStatus: quoteData.currentStatus,
          changedBy: 'admin@fly-fleet.com',
          note: 'Initial status',
        },
      },
    });

    // Add additional status changes for quotes that have progressed
    if (quote.currentStatus === 'reviewing' || quote.currentStatus === 'quote_sent' || quote.currentStatus === 'confirmed') {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'quote_status_change',
          entityType: 'quote',
          entityId: quote.id,
          eventData: {
            quoteId: quote.id,
            oldStatus: 'new_request',
            newStatus: 'reviewing',
            changedBy: 'admin@fly-fleet.com',
            note: 'Reviewing customer requirements',
          },
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        },
      });
    }

    if (quote.currentStatus === 'quote_sent' || quote.currentStatus === 'confirmed') {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'quote_status_change',
          entityType: 'quote',
          entityId: quote.id,
          eventData: {
            quoteId: quote.id,
            oldStatus: 'reviewing',
            newStatus: 'quote_sent',
            changedBy: 'admin@fly-fleet.com',
            note: 'Quote sent with pricing details',
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      });
    }

    if (quote.currentStatus === 'confirmed') {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'quote_status_change',
          entityType: 'quote',
          entityId: quote.id,
          eventData: {
            quoteId: quote.id,
            oldStatus: 'quote_sent',
            newStatus: 'confirmed',
            changedBy: 'admin@fly-fleet.com',
            note: 'Customer confirmed booking',
          },
          createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // 12 hours ago
        },
      });
    }
  }

  console.log('\n📧 Creating contacts...');
  const createdContacts = [];
  for (const contactData of contacts) {
    const contact = await prisma.contact.create({
      data: contactData,
    });
    createdContacts.push(contact);
    console.log(`  ✓ Created contact: ${contact.fullName} (${contact.currentStatus})`);

    // Create status history for each contact
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'contact_status_change',
        entityType: 'contact',
        entityId: contact.id,
        eventData: {
          contactId: contact.id,
          oldStatus: null,
          newStatus: contactData.currentStatus,
          changedBy: 'admin@fly-fleet.com',
          note: 'Initial status',
        },
      },
    });

    // Add response status change for responded/closed contacts
    if (contact.currentStatus === 'responded' || contact.currentStatus === 'closed') {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'contact_status_change',
          entityType: 'contact',
          entityId: contact.id,
          eventData: {
            contactId: contact.id,
            oldStatus: 'pending',
            newStatus: 'responded',
            changedBy: 'admin@fly-fleet.com',
            note: 'Response sent to customer',
          },
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        },
      });
    }

    if (contact.currentStatus === 'closed') {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'contact_status_change',
          entityType: 'contact',
          entityId: contact.id,
          eventData: {
            contactId: contact.id,
            oldStatus: 'responded',
            newStatus: 'closed',
            changedBy: 'admin@fly-fleet.com',
            note: 'Issue resolved, closing ticket',
          },
          createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000), // 12 hours ago
        },
      });
    }
  }

  console.log('\n✨ Test data seeding complete!');
  console.log(`\n📊 Summary:`);
  console.log(`  • ${createdQuotes.length} quotes created`);
  console.log(`  • ${createdContacts.length} contacts created`);
  console.log(`\nYou can now test the admin dashboard at http://localhost:3000/admin/dashboard`);
}

main()
  .catch((e) => {
    console.error('Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
