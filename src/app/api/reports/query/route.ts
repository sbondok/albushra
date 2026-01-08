
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { filters } = body; 
    // filters example: { accountStatus: 'defaulting', minDue: 1000, maxDue: 5000, grade: '5' }

    const whereClause: any = {};

    // 1. Guardian Filters
    if (filters.accountStatus) {
        whereClause.accountStatus = filters.accountStatus;
    }
    
    // 2. Student Filters (Searching Guardians who have students matching criteria)
    if (filters.grade) {
        whereClause.studentGuardians = {
            some: {
                student: {
                    currentGrade: filters.grade
                }
            }
        };
    }

    // 3. Amount Due Range (Needs calculated field filtering, Prisma doesn't support filtering by aggregate easily in one go)
    // approach: fetch results then filter in memory if dataset is small, OR raw query.
    // For small school dataset ( < 10k guardians), in-memory or raw query is fine. 
    // Let's use Prisma findMany and filter in JS for prototype simplicity, or Raw Query for performance. 
    // Since we need to sum invoices, let's keep it simple first: Filter by DB fields, then post-filter amounts.

    // 4. Search Query (Name, ID, Mobile, Student Name)
    if (filters.searchQuery && filters.searchQuery.trim() !== '') {
        const q = filters.searchQuery.trim();
        whereClause.OR = [
            { name: { contains: q } },
            { nationalId: { contains: q } },
            { mobilePrimary: { contains: q } },
            { mobileSecondary: { contains: q } },
            // Searching by Student Name
            { 
                studentGuardians: {
                    some: {
                        student: {
                            name: { contains: q }
                        }
                    }
                }
            }
        ];
    }

    const guardians = await prisma.guardian.findMany({
        where: whereClause,
        include: {
            invoices: {
                select: { amountDue: true }
            },
            studentGuardians: {
                include: { student: true }
            }
        }
    });

    // 5. Post-processing (Calculations)
    let results = guardians.map(g => {
        const totalDue = g.invoices.reduce((acc, inv) => acc + Number(inv.amountDue), 0);
        return {
            id: g.id,
            name: g.name,
            nationalId: g.nationalId,
            mobile: g.mobilePrimary,
            accountStatus: g.accountStatus,
            totalDue,
            studentCount: g.studentGuardians.length,
            gradeList: g.studentGuardians.map(sg => sg.student.currentGrade).join(', ')
        };
    });

    // 6. Apply numeric filters
    if (filters.minDue !== undefined && filters.minDue !== '') {
        results = results.filter(r => r.totalDue >= Number(filters.minDue));
    }
    if (filters.maxDue !== undefined && filters.maxDue !== '') {
        results = results.filter(r => r.totalDue <= Number(filters.maxDue));
    }
    
    // 7. Sort
    if (filters.sortBy === 'amountAsc') {
        results.sort((a, b) => a.totalDue - b.totalDue);
    } else {
        // Default: amountDesc
        results.sort((a, b) => b.totalDue - a.totalDue);
    }

    return NextResponse.json({ count: results.length, data: results });

  } catch (error) {
    console.error("Query Error:", error);
    return NextResponse.json({ error: 'Query execution failed' }, { status: 500 });
  }
}
