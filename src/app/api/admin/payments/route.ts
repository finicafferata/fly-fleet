import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/PaymentService';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

// GET /api/admin/payments - List payments with filtering
export async function GET(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    // Extract query parameters
    const status = searchParams.get('status') as PaymentStatus | null;
    const method = searchParams.get('method') as PaymentMethod | null;
    const quoteRequestId = searchParams.get('quoteRequestId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const stats = searchParams.get('stats') === 'true';

    // Handle statistics request
    if (stats) {
      const statistics = await PaymentService.getPaymentStatistics();
      return NextResponse.json({
        success: true,
        action: 'statistics',
        statistics,
        timestamp: new Date().toISOString()
      });
    }

    // Get payments with filters
    const payments = await PaymentService.getRecentPayments(
      limit,
      offset,
      {
        status: status || undefined,
        method: method || undefined,
        quoteRequestId
      }
    );

    return NextResponse.json({
      success: true,
      action: 'list_payments',
      payments,
      total: payments.length,
      pagination: {
        limit,
        offset,
        hasMore: payments.length === limit
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin payments GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payments - Create new payment
export async function POST(req: NextRequest) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const body = await req.json();
    const {
      quoteRequestId,
      amount,
      currency,
      paymentMethod,
      transactionReference,
      receiptUrl,
      notes
    } = body;

    // Validate required fields
    if (!quoteRequestId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields: quoteRequestId, amount, paymentMethod' },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods: PaymentMethod[] = [
      'wire_transfer',
      'credit_card',
      'bank_transfer',
      'check',
      'cash',
      'other'
    ];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method', validMethods },
        { status: 400 }
      );
    }

    // Create payment
    const payment = await PaymentService.createPayment({
      quoteRequestId,
      amount: parseFloat(amount),
      currency: currency || 'USD',
      paymentMethod,
      transactionReference,
      receiptUrl,
      notes,
      processedBy: adminEmail
    });

    return NextResponse.json({
      success: true,
      action: 'create_payment',
      payment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin payments POST error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
