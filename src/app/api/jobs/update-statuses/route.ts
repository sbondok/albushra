
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const today = new Date();

    // 1. Find expired terms
    const expiredTerms = await prisma.academicTerm.findMany({
      where: {
        endDate: { lt: today }
      }
    });

    const expiredTermIds = expiredTerms.map(t => t.id);

    if (expiredTermIds.length === 0) {
      return NextResponse.json({ success: true, message: 'لا توجد أترام دراسية منتهية حتى الآن.', updatedCount: 0 });
    }

    // 2. Find guardians with UNPAID invoices in these expired terms
    // We want guardians who have at least one invoice where:
    // - termId is in expiredTermIds
    // - status is NOT 'paid' (i.e. 'unpaid' or 'partial')
    const defaultingGuardians = await prisma.guardian.findMany({
      where: {
        invoices: {
          some: {
            termId: { in: expiredTermIds },
            status: { not: 'paid' }
          }
        },
        accountStatus: { not: 'defaulting' } // Only update those not already defaulting
      },
      select: { id: true }
    });

    const guardianIdsToUpdate = defaultingGuardians.map(g => g.id);

    // 3. Update their status
    if (guardianIdsToUpdate.length > 0) {
      await prisma.guardian.updateMany({
        where: { id: { in: guardianIdsToUpdate } },
        data: { accountStatus: 'defaulting' }
      });
      
      // Optional: Add to status history (requires loop or raw query, skipping for simplicity/performance in batch)
    }

    return NextResponse.json({ 
        success: true, 
        message: `تم تحديث ${guardianIdsToUpdate.length} ولي أمر إلى حالة "متعثر"`, 
        updatedIds: guardianIdsToUpdate 
    });

  } catch (error) {
    console.error("Job Error:", error);
    return NextResponse.json({ error: 'Failed to update statuses' }, { status: 500 });
  }
}
