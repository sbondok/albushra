
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const guardian = await prisma.guardian.findUnique({
      where: { id },
      include: {
        invoices: {
            orderBy: { dueDate: 'desc' },
            include: { term: true, student: true }
        },
        payments: {
            orderBy: { paymentDate: 'desc' }
        },
        studentGuardians: {
            include: { student: true }
        }
      }
    });

    if (!guardian) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    // Calculate Summaries
    const totalDue = guardian.invoices.reduce((acc, inv) => acc + Number(inv.amountDue), 0);
    const totalPaid = guardian.payments.reduce((acc, p) => acc + Number(p.amount), 0);

    return NextResponse.json({
        ...guardian,
        summary: {
            totalDue,
            totalPaid
        }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guardian details' }, { status: 500 });
  }
}
