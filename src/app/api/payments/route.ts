
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();


export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;

    const payments = await prisma.payment.findMany({
      take: limit,
      orderBy: { paymentDate: 'desc' },
      include: {
        guardian: { select: { name: true, nationalId: true } }
      }
    });

    return NextResponse.json(payments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!['admin','cashier'].includes(session.user.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await request.json();
    const { guardianId, studentId, amount, method, reference, notes } = body;

    if (!guardianId || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    const numericAmount = parseFloat(amount);

    // Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      const payment = await tx.payment.create({
        data: {
            guardian: { connect: { id: guardianId } },
            amount: numericAmount,
            method,
            referenceNo: reference,
            notes,
            createdBy: {
                connect: { id: session.user.id }
            }
        }
      });

      // 2. Fetch Unpaid Invoices (FIFO)
      const whereClause: any = {
            guardianId,
            status: { in: ['unpaid', 'partial'] }
      };
      
      if (studentId && studentId !== 'all') {
          whereClause.studentId = studentId;
      }

      const unpaidInvoices = await tx.invoice.findMany({
        where: whereClause,
        orderBy: { dueDate: 'asc' } // Oldest first
      });

      let remaining = numericAmount;
      const allocations = [];

      for (const inv of unpaidInvoices) {
        if (remaining <= 0) break;

        const owed = Number(inv.amountDue);
        const toPay = Math.min(remaining, owed);

        if (toPay > 0) {
            // Update Invoice
            const newAmountPaid = Number(inv.amountPaid) + toPay;
            const newAmountDue = Number(inv.amountDue) - toPay;
            const newStatus = newAmountDue <= 0.01 ? 'paid' : 'partial'; // epsilon tolerance

            await tx.invoice.update({
                where: { id: inv.id },
                data: {
                    amountPaid: newAmountPaid,
                    amountDue: newAmountDue,
                    status: newStatus
                }
            });

            // Create Allocation Record
            await tx.paymentAllocation.create({
                data: {
                    paymentId: payment.id,
                    invoiceId: inv.id,
                    amount: toPay
                }
            });

            remaining -= toPay;
        }
      }

      // 3. Return result
      return { payment, remaining };
    });

    return NextResponse.json({ success: true, data: result });

  } catch (error) {
    console.error("Payment Error:", error);
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
  }
}
