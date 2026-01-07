import { prisma } from '../database/prisma';
import { PaymentMethod, PaymentStatus } from '@prisma/client';

export interface CreatePaymentData {
  quoteRequestId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  receiptUrl?: string;
  notes?: string;
  processedBy: string;
}

export interface UpdatePaymentStatusData {
  paymentId: string;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  notes?: string;
  processedBy?: string;
}

export interface RecordRefundData {
  paymentId: string;
  refundAmount: number;
  refundReason: string;
  processedBy: string;
}

export interface PaymentWithQuote {
  id: string;
  quoteRequestId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;
  receiptUrl?: string;
  notes?: string;
  paidAt?: Date;
  processedBy?: string;
  refundAmount?: number;
  refundedAt?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
  quoteRequest?: {
    id: string;
    fullName: string;
    email: string;
    serviceType: string;
    origin: string;
    destination: string;
  };
}

export class PaymentService {

  // Create a new payment record
  static async createPayment(data: CreatePaymentData): Promise<PaymentWithQuote> {
    // Verify quote exists
    const quote = await prisma.quoteRequest.findUnique({
      where: { id: data.quoteRequestId }
    });

    if (!quote) {
      throw new Error(`Quote request ${data.quoteRequestId} not found`);
    }

    const payment = await prisma.payment.create({
      data: {
        quoteRequestId: data.quoteRequestId,
        amount: data.amount,
        currency: data.currency || 'USD',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending',
        transactionReference: data.transactionReference,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
        processedBy: data.processedBy,
      },
      include: {
        quoteRequest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            serviceType: true,
            origin: true,
            destination: true,
          }
        }
      }
    });

    return this.mapPaymentToPaymentWithQuote(payment);
  }

  // Update payment status
  static async updatePaymentStatus(data: UpdatePaymentStatusData): Promise<PaymentWithQuote> {
    const existingPayment = await prisma.payment.findUnique({
      where: { id: data.paymentId }
    });

    if (!existingPayment) {
      throw new Error(`Payment ${data.paymentId} not found`);
    }

    const updateData: any = {
      paymentStatus: data.paymentStatus,
      updatedAt: new Date(),
    };

    // Set paidAt when status changes to 'completed'
    if (data.paymentStatus === 'completed' && !existingPayment.paidAt) {
      updateData.paidAt = data.paidAt || new Date();
    }

    if (data.notes) {
      updateData.notes = data.notes;
    }

    if (data.processedBy) {
      updateData.processedBy = data.processedBy;
    }

    const payment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: updateData,
      include: {
        quoteRequest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            serviceType: true,
            origin: true,
            destination: true,
          }
        }
      }
    });

    return this.mapPaymentToPaymentWithQuote(payment);
  }

  // Record a refund (full or partial)
  static async recordRefund(data: RecordRefundData): Promise<PaymentWithQuote> {
    const existingPayment = await prisma.payment.findUnique({
      where: { id: data.paymentId }
    });

    if (!existingPayment) {
      throw new Error(`Payment ${data.paymentId} not found`);
    }

    if (existingPayment.paymentStatus !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    if (data.refundAmount > Number(existingPayment.amount)) {
      throw new Error('Refund amount cannot exceed payment amount');
    }

    const isPartialRefund = data.refundAmount < Number(existingPayment.amount);

    const payment = await prisma.payment.update({
      where: { id: data.paymentId },
      data: {
        paymentStatus: isPartialRefund ? 'partially_refunded' : 'refunded',
        refundAmount: data.refundAmount,
        refundedAt: new Date(),
        refundReason: data.refundReason,
        processedBy: data.processedBy,
        updatedAt: new Date(),
      },
      include: {
        quoteRequest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            serviceType: true,
            origin: true,
            destination: true,
          }
        }
      }
    });

    return this.mapPaymentToPaymentWithQuote(payment);
  }

  // Get all payments for a specific quote
  static async getPaymentsByQuote(quoteRequestId: string): Promise<PaymentWithQuote[]> {
    const payments = await prisma.payment.findMany({
      where: { quoteRequestId },
      include: {
        quoteRequest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            serviceType: true,
            origin: true,
            destination: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return payments.map(payment => this.mapPaymentToPaymentWithQuote(payment));
  }

  // Get a single payment by ID
  static async getPaymentById(paymentId: string): Promise<PaymentWithQuote | null> {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        quoteRequest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            serviceType: true,
            origin: true,
            destination: true,
          }
        }
      }
    });

    if (!payment) return null;

    return this.mapPaymentToPaymentWithQuote(payment);
  }

  // Get payment statistics
  static async getPaymentStatistics(): Promise<{
    totalPayments: number;
    totalRevenue: number;
    byStatus: Record<PaymentStatus, number>;
    byMethod: Record<PaymentMethod, number>;
    pendingAmount: number;
    completedAmount: number;
    refundedAmount: number;
  }> {
    const allPayments = await prisma.payment.findMany({
      select: {
        amount: true,
        paymentStatus: true,
        paymentMethod: true,
        refundAmount: true,
      }
    });

    const stats = {
      totalPayments: allPayments.length,
      totalRevenue: 0,
      byStatus: {
        pending: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        refunded: 0,
        partially_refunded: 0,
      } as Record<PaymentStatus, number>,
      byMethod: {
        credit_card: 0,
        wire_transfer: 0,
        bank_transfer: 0,
        check: 0,
        cash: 0,
        other: 0,
      } as Record<PaymentMethod, number>,
      pendingAmount: 0,
      completedAmount: 0,
      refundedAmount: 0,
    };

    allPayments.forEach(payment => {
      const amount = Number(payment.amount);
      const refundAmount = payment.refundAmount ? Number(payment.refundAmount) : 0;

      // Count by status
      stats.byStatus[payment.paymentStatus]++;

      // Count by method
      stats.byMethod[payment.paymentMethod]++;

      // Calculate amounts
      if (payment.paymentStatus === 'completed') {
        stats.completedAmount += amount;
        stats.totalRevenue += amount;
      } else if (payment.paymentStatus === 'pending' || payment.paymentStatus === 'processing') {
        stats.pendingAmount += amount;
      } else if (payment.paymentStatus === 'refunded') {
        stats.refundedAmount += amount;
      } else if (payment.paymentStatus === 'partially_refunded') {
        stats.refundedAmount += refundAmount;
        stats.completedAmount += (amount - refundAmount);
        stats.totalRevenue += (amount - refundAmount);
      }
    });

    return stats;
  }

  // Get recent payments with pagination
  static async getRecentPayments(
    limit: number = 50,
    offset: number = 0,
    filters?: {
      status?: PaymentStatus;
      method?: PaymentMethod;
      quoteRequestId?: string;
    }
  ): Promise<PaymentWithQuote[]> {
    const where: any = {};

    if (filters?.status) {
      where.paymentStatus = filters.status;
    }

    if (filters?.method) {
      where.paymentMethod = filters.method;
    }

    if (filters?.quoteRequestId) {
      where.quoteRequestId = filters.quoteRequestId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        quoteRequest: {
          select: {
            id: true,
            fullName: true,
            email: true,
            serviceType: true,
            origin: true,
            destination: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    });

    return payments.map(payment => this.mapPaymentToPaymentWithQuote(payment));
  }

  // Helper to map Prisma payment to PaymentWithQuote interface
  private static mapPaymentToPaymentWithQuote(payment: any): PaymentWithQuote {
    return {
      id: payment.id,
      quoteRequestId: payment.quoteRequestId,
      amount: Number(payment.amount),
      currency: payment.currency,
      paymentMethod: payment.paymentMethod,
      paymentStatus: payment.paymentStatus,
      transactionReference: payment.transactionReference || undefined,
      receiptUrl: payment.receiptUrl || undefined,
      notes: payment.notes || undefined,
      paidAt: payment.paidAt || undefined,
      processedBy: payment.processedBy || undefined,
      refundAmount: payment.refundAmount ? Number(payment.refundAmount) : undefined,
      refundedAt: payment.refundedAt || undefined,
      refundReason: payment.refundReason || undefined,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      quoteRequest: payment.quoteRequest ? {
        id: payment.quoteRequest.id,
        fullName: payment.quoteRequest.fullName,
        email: payment.quoteRequest.email,
        serviceType: payment.quoteRequest.serviceType,
        origin: payment.quoteRequest.origin,
        destination: payment.quoteRequest.destination,
      } : undefined,
    };
  }
}
