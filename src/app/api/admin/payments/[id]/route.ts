import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/PaymentService';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';
import { PaymentStatus } from '@prisma/client';

// GET /api/admin/payments/[id] - Get single payment
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const payment = await PaymentService.getPaymentById(params.id);

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      action: 'get_payment',
      payment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin payment GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/payments/[id] - Update payment status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const authError = await requireAdmin();
  if (authError) return authError;

  const session = await getAuthSession();
  const adminEmail = session?.user?.email || 'admin';

  try {
    const body = await req.json();
    const { paymentStatus, notes, transactionReference, receiptUrl } = body;

    // Validate required fields
    if (!paymentStatus) {
      return NextResponse.json(
        { error: 'Missing required field: paymentStatus' },
        { status: 400 }
      );
    }

    // Validate payment status
    const validStatuses: PaymentStatus[] = [
      'pending',
      'processing',
      'completed',
      'failed',
      'refunded',
      'partially_refunded'
    ];
    if (!validStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: 'Invalid payment status', validStatuses },
        { status: 400 }
      );
    }

    // Update payment status
    const payment = await PaymentService.updatePaymentStatus({
      paymentId: params.id,
      paymentStatus,
      notes,
      processedBy: adminEmail
    });

    return NextResponse.json({
      success: true,
      action: 'update_payment_status',
      payment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin payment PATCH error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
