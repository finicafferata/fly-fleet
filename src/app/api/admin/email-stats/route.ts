import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get email delivery statistics
    const [totalSent, delivered, bounced, failed] = await Promise.all([
      // Total emails sent
      prisma.emailDelivery.count({
        where: {
          createdAt: {
            gte: dateFrom,
          },
        },
      }),

      // Successfully delivered emails
      prisma.emailDelivery.count({
        where: {
          status: 'delivered',
          createdAt: {
            gte: dateFrom,
          },
        },
      }),

      // Bounced emails
      prisma.emailDelivery.count({
        where: {
          status: 'bounced',
          createdAt: {
            gte: dateFrom,
          },
        },
      }),

      // Failed emails
      prisma.emailDelivery.count({
        where: {
          status: 'failed',
          createdAt: {
            gte: dateFrom,
          },
        },
      }),
    ]);

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (delivered / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (bounced / totalSent) * 100 : 0;

    const stats = {
      totalSent,
      delivered,
      bounced,
      failed,
      deliveryRate: Math.round(deliveryRate * 10) / 10, // Round to 1 decimal
      bounceRate: Math.round(bounceRate * 10) / 10,
      dateRange: {
        from: dateFrom.toISOString(),
        to: new Date().toISOString(),
        days,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching email stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email statistics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}