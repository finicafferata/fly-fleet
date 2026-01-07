import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/lib/payments/PaymentService';
import { requireAdmin, getAuthSession } from '@/lib/auth/server';

// POST /api/admin/payments/[id]/refund - Process refund
export async function POST(
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
    const { refundAmount, refundReason } = body;

    // Validate required fields
    if (!refundAmount || !refundReason) {
      return NextResponse.json(
        { error: 'Missing required fields: refundAmount, refundReason' },
        { status: 400 }
      );
    }

    // Validate refund amount
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid refund amount' },
        { status: 400 }
      );
    }

    // Process refund
    const payment = await PaymentService.recordRefund({
      paymentId: params.id,
      refundAmount: amount,
      refundReason: refundReason.trim(),
      processedBy: adminEmail
    });

    return NextResponse.json({
      success: true,
      action: 'process_refund',
      payment,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin payment refund error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
