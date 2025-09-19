import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const days = parseInt(searchParams.get('days') || '7');

    // Build where clause
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const whereClause: any = {
      createdAt: {
        gte: dateFrom,
      },
    };

    if (status && status !== 'all') {
      whereClause.status = status;
    }

    // Fetch email activities with pagination
    const activities = await prisma.emailDelivery.findMany({
      where: whereClause,
      select: {
        id: true,
        recipientEmail: true,
        subject: true,
        status: true,
        createdAt: true,
        sentAt: true,
        deliveredAt: true,
        bouncedAt: true,
        failedAt: true,
        errorMessage: true,
        emailType: true,
        resendMessageId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count for pagination
    const totalCount = await prisma.emailDelivery.count({
      where: whereClause,
    });

    const response = {
      activities: activities.map(activity => ({
        id: activity.id,
        recipientEmail: activity.recipientEmail,
        subject: activity.subject,
        status: activity.status,
        emailType: activity.emailType,
        createdAt: activity.createdAt.toISOString(),
        sentAt: activity.sentAt?.toISOString(),
        deliveredAt: activity.deliveredAt?.toISOString(),
        bouncedAt: activity.bouncedAt?.toISOString(),
        failedAt: activity.failedAt?.toISOString(),
        errorMessage: activity.errorMessage,
        resendMessageId: activity.resendMessageId,
      })),
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + activities.length < totalCount,
      },
    };

    return NextResponse.json(response.activities);
  } catch (error) {
    console.error('Error fetching email activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email activities' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}