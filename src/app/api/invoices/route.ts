
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    const status = searchParams.get('status');
    
    const whereClause: any = {};
    if (status) whereClause.status = status;

    const invoices = await prisma.invoice.findMany({
      where: whereClause,
      take: limit,
      orderBy: { invoiceNumber: 'desc' }, // Latest first
      include: {
        guardian: { select: { name: true, nationalId: true } },
        student: { select: { name: true, currentGrade: true } }
      }
    });

    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
