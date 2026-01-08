
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q') || '';

  try {
    const guardians = await prisma.guardian.findMany({
      where: {
        OR: [
            { name: { contains: search } },
            { nationalId: { contains: search } },
            { mobilePrimary: { contains: search } },
            { mobileSecondary: { contains: search } }
        ]
      },
      include: {
        invoices: {
            select: { amountDue: true }
        }
      },
      take: 20
    });

    const data = guardians.map(g => {
        const totalDue = g.invoices.reduce((acc, inv) => acc + Number(inv.amountDue), 0);
        return {
            ...g,
            totalDue
        };
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guardians' }, { status: 500 });
  }
}
