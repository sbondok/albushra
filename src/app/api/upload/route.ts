
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  if (!['admin','staff','uploader'].includes(session.user.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
  try {
    const body = await request.json();
    const { rows, mapping } = body;
    if (!Array.isArray(rows)) return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    if (rows.length > 10000) return NextResponse.json({ success: false, error: 'Payload too large' }, { status: 413 });

    // TODO: Implement Mapping logic (currently assuming fixed columns for prototype)
    // Expected: [InvoiceNo, GuardianName, NationalID, Mobile, StudentName, Term, Grade, Type, Amount, Paid, Due]

    // 1. Parse Headers (Dynamic Mapping)
    // 1. Parse Headers (Dynamic Mapping)
    const headerRow = rows[0];
    if (process.env.NODE_ENV !== 'production') console.debug("Raw Header Row:", headerRow); // Debug log (dev only)

    const colMap: Record<string, number> = {};
    
    // Normalize headers: trim and lowercase for flexible matching
    if (Array.isArray(headerRow)) {
        headerRow.forEach((col: any, index: number) => {
            if (typeof col === 'string') {
                colMap[col.trim().toLowerCase()] = index;
            }
        });
    }

    if (process.env.NODE_ENV !== 'production') console.debug("Detected Columns Map:", colMap);
    // Critical Columns Check (Lowercased for comparison)
    const requiredCols = [
        'number', 
        'invoice partner display name', 
        'partner/uid', 
        'total signed', 
        'amount due'
    ];
    
    const missingCols = requiredCols.filter(c => colMap[c] === undefined);

    if (missingCols.length > 0) {
        return NextResponse.json({ 
            success: false, 
            error: `Missing required columns: ${missingCols.join(', ')}. Found: ${Object.keys(colMap).join(', ')}` 
        }, { status: 400 });
    }

    let processedCount = 0;
    let errors = [];

    // 2. Process Data Rows (Start from index 1)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        try {
            // Helper to get value safely
            const getVal = (colName: string) => {
                const idx = colMap[colName.toLowerCase()];
                return idx !== undefined ? row[idx] : undefined;
            };

            const invoiceNo = String(getVal('Number'));
            const nationalId = String(getVal('Partner/UID')); // Guardian ID
            const guardianName = String(getVal('Invoice Partner Display Name')); // Guardian Name
            const mobile = String(getVal('Partner/Phone') || '');
            const studentName = String(getVal('Student') || 'Unknown Student'); // Fallback if missing
            const amount = parseFloat(String(getVal('Total Signed'))) || 0;
            const amountDue = parseFloat(String(getVal('Amount Due'))) || 0;

            if (!invoiceNo || !nationalId) continue; // Skip invalid rows

            // 3. Upsert Guardian
            const guardian = await prisma.guardian.upsert({
                where: { nationalId },
                update: { 
                    name: guardianName,
                    mobilePrimary: mobile 
                },
                create: {
                    nationalId,
                    name: guardianName,
                    mobilePrimary: mobile
                }
            });

            // 4. Upsert Student (Using Name + Guardian Logic)
            let student = await prisma.student.findFirst({
                where: { name: studentName, studentGuardians: { some: { guardianId: guardian.id } } }
            });

            if (!student) {
                student = await prisma.student.create({
                    data: {
                        nationalId: `TEMP-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                        name: studentName,
                        studentGuardians: {
                            create: {
                                guardianId: guardian.id,
                                relationshipType: 'Primary',
                                isSponsor: true
                            }
                        }
                    }
                });
            }

            // 5. Upsert Invoice
            await prisma.invoice.upsert({
                where: { invoiceNumber: invoiceNo },
                update: {
                    amountDue: amountDue,
                    status: amountDue === 0 ? 'paid' : (amountDue < amount ? 'partial' : 'unpaid')
                },
                create: {
                    invoiceNumber: invoiceNo,
                    studentId: student.id,
                    guardianId: guardian.id,
                    type: 'term',
                    amount: amount,
                    amountDue: amountDue,
                    status: amountDue === 0 ? 'paid' : 'unpaid',
                }
            });

            processedCount++;

        } catch (e) {
            console.error("Error processing row", i, e);
            errors.push({ row: i, error: String(e) });
        }
    }

    return NextResponse.json({ success: true, processed: processedCount, errors });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
