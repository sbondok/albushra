
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      guardian: true,
      allocations: {
        include: {
            invoice: {
                include: { student: true, term: true }
            }
        }
      }, 
      createdBy: true
    }
  });

  if (!payment) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen p-8 print:p-0 font-sans text-slate-900">
        <style type="text/css" media="print">{`
            @page { size: A4; margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
            .print-container { padding: 40px; }
        `}</style>

        <div className="max-w-3xl mx-auto border border-slate-200 shadow-lg p-10 rounded-xl print:border-none print:shadow-none print:w-full print:max-w-none print-container bg-white">
            
            {/* Header */}
            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-8 mb-8">
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-blue-900 mb-2">مدارس البشرى - مكة المكرمة</h2>
                    <p className="text-slate-500 text-sm">قسم الحسابات والرسوم الدراسية</p>
                    <p className="text-slate-500 text-sm">المملكة العربية السعودية</p>
                </div>
                <div className="w-32 h-32 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.png" alt="شعار المدرسة" className="max-w-full max-h-full object-contain" />
                </div>
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2 uppercase tracking-wide">سند قبض</h1>
                    <p className="text-slate-500 font-mono text-sm">#{payment.referenceNo || payment.id.slice(0, 8)}</p>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">استلمنا من السيد/ة</p>
                    <p className="text-lg font-bold text-slate-800">{payment.guardian.name}</p>
                    <p className="text-sm text-slate-500 mt-1">هوية رقم: {payment.guardian.nationalId}</p>
                </div>
                <div className="text-left pl-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase mb-1">تاريخ السند</p>
                    <p className="text-lg font-bold text-slate-800">{new Date(payment.paymentDate).toLocaleDateString('ar-SA')}</p>
                    <p className="text-sm text-slate-500 mt-1">طريقة الدفع: {
                        payment.method === 'cash' ? 'نقداً' : 
                        payment.method === 'transfer' ? 'تحويل بنكي' : 
                        payment.method === 'network' ? 'شبكة' : payment.method
                    }</p>
                </div>
            </div>

            {/* Amount Box */}
            <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8 text-center">
                <p className="text-slate-500 text-sm mb-2">مبلغ وقدره</p>
                <h3 className="text-4xl font-bold text-blue-600 mb-2">{Number(payment.amount).toLocaleString()} <span className="text-xl text-slate-400 font-normal">ر.س</span></h3>
                {/* TODO: Add Tafqeet (Number to Words) here if needed package */}
            </div>

            {/* Allocations Table */}
            <div className="mb-12">
                <h4 className="font-bold text-slate-700 mb-4 border-b border-slate-200 pb-2">تفاصيل السداد (توزيع المبلغ)</h4>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-slate-500 border-b border-slate-100">
                            <th className="text-right py-2">البند / الفاتورة</th>
                            <th className="text-right py-2">الطالب</th>
                            <th className="text-left py-2">المبلغ المخصص</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {payment.allocations.map(alloc => (
                            <tr key={alloc.id}>
                                <td className="py-3">فاتورة رقم #{alloc.invoice.invoiceNumber} <span className="text-slate-400 text-xs">({alloc.invoice.type === 'term' ? 'ترم كامل' : 'قسط'})</span></td>
                                <td className="py-3">{alloc.invoice.student.name}</td>
                                <td className="py-3 text-left font-bold">{Number(alloc.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                         {payment.allocations.length === 0 && (
                            <tr>
                                <td colSpan={3} className="py-4 text-center text-slate-400">دفعة عامة (رصيد دائن)</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end mt-12 pt-8 border-t border-slate-200">
                <div className="text-center w-1/3">
                    <p className="text-sm text-slate-500 mb-12">المحاسب</p>
                    <p className="font-bold text-slate-800">{payment.createdBy.username}</p>
                </div>
                 <div className="text-center w-1/3">
                    <p className="text-sm text-slate-500 mb-12">الختم</p>
                    <div className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-full mx-auto"></div>
                </div>
            </div>

             {/* Print Button (Screen Only) - Handled by Client Component below */}
             <div className="mt-12 text-center no-print">
                <div className="mt-4">
                     <a href={`/dashboard/guardians/${payment.guardianId}`} className="text-blue-600 hover:underline">← عودة للملف</a>
                </div>
            </div>
             {/* Simple Script for print button as this is server component (inline script is risky in Next?) 
                 Better to use a Client Component for the button. */}
        </div>
        <PrintButton />
    </div>
  );
}

// Client Component for Print Button
import PrintButton from '@/components/PrintButton';

