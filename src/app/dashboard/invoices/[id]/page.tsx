
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import InvoiceHeader from '@/components/InvoiceHeader';
import PrintWrapper from './PrintWrapper';

const prisma = new PrismaClient();

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      guardian: true,
      student: true,
      term: true
    }
  });

  if (!invoice) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen p-8 print:p-0 font-sans text-slate-900">
         <style type="text/css" media="print">{`
            @page { size: A4; margin: 0; }
            body { margin: 0; -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
            .print-container { padding: 40px; }
            .header-image { width: 100%; height: auto; max-height: 200px; object-fit: contain; }
        `}</style>
      
      <div className="max-w-4xl mx-auto border border-slate-200 shadow-lg p-10 rounded-xl print:border-none print:shadow-none print:w-full print:max-w-none print-container bg-white">
        
        {/* Header Section */}
        <div className="mb-8 text-center border-b border-slate-100 pb-4">
             <InvoiceHeader />
        </div>

        {/* Invoice Info */}
        <div className="flex justify-between items-start mb-12">
            <div>
                <h1 className="text-4xl font-bold text-slate-800 mb-2">فاتورة</h1>
                <p className="text-slate-500 font-mono">#{invoice.invoiceNumber}</p>
                <div className="mt-4">
                     <span className={`px-3 py-1 rounded text-sm font-semibold
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' : 
                          invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                    `}>
                        {invoice.status === 'paid' ? 'مدفوعة بالكامل' : invoice.status === 'partial' ? 'مدفوعة جزئياً' : 'غير مسددة'}
                    </span>
                </div>
            </div>
            <div className="text-left">
                <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase">تاريخ الإصدار</p>
                    <p className="font-bold">{new Date().toLocaleDateString('ar-SA')}</p>
                </div>
                <div>
                     <p className="text-xs font-semibold text-slate-400 uppercase">تاريخ الاستحقاق</p>
                    <p className="font-bold text-red-600">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('ar-SA') : 'فوراً'}</p>
                </div>
            </div>
        </div>

        {/* Bill To */}
        <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">معلومات الدفع لـ</p>
                <h3 className="text-xl font-bold text-slate-800">{invoice.guardian.name}</h3>
                <p className="text-slate-600">{invoice.guardian.mobilePrimary}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-2">الطالب</p>
                <h3 className="text-xl font-bold text-slate-800">{invoice.student.name}</h3>
                <p className="text-slate-600">الصف: {invoice.student.currentGrade || '-'}</p>
                 <p className="text-slate-600 text-sm mt-1">{invoice.type === 'term' ? 'رسوم فصل دراسي' : 'قسط دراسي'}</p>
            </div>
        </div>

        {/* Details Table */}
        <div className="mb-12">
             <table className="w-full text-right">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="py-3 px-4 font-semibold text-slate-700">الوصف</th>
                        <th className="py-3 px-4 font-semibold text-slate-700 text-left">المبلغ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    <tr>
                        <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">
                                {invoice.type === 'term' ? `رسوم ${invoice.term?.name || ''}` : 'قسط دراسي'}
                            </p>
                            <p className="text-sm text-slate-500">{invoice.invoiceNumber}</p>
                        </td>
                         <td className="py-4 px-4 text-left font-bold text-slate-800">
                            {Number(invoice.amount).toLocaleString()} ر.س
                         </td>
                    </tr>
                </tbody>
                <tfoot className="border-t-2 border-slate-100">
                    <tr>
                        <td className="py-4 px-4 font-bold text-slate-600">الإجمالي</td>
                         <td className="py-4 px-4 text-left font-bold text-xl text-slate-900">
                            {Number(invoice.amount).toLocaleString()} ر.س
                         </td>
                    </tr>
                     <tr>
                        <td className="py-2 px-4 font-medium text-green-600">الدفعات المستلمة</td>
                         <td className="py-2 px-4 text-left font-medium text-green-600">
                            - {Number(invoice.amountPaid).toLocaleString()} ر.س
                         </td>
                    </tr>
                    <tr className="bg-slate-50">
                        <td className="py-4 px-4 font-bold text-slate-900">المبلغ المستحق (المتبقي)</td>
                         <td className="py-4 px-4 text-left font-bold text-2xl text-red-600">
                            {Number(invoice.amountDue).toLocaleString()} ر.س
                         </td>
                    </tr>
                </tfoot>
             </table>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-slate-200 pt-8 mt-8 text-sm text-slate-500">
            <p className="mb-2 font-bold text-slate-700">ملاحظات وشروط الدفع:</p>
            <ul className="list-disc list-inside space-y-1">
                <li>يرجى تسديد المبلغ المستحق قبل تاريخ الاستحقاق.</li>
                <li>يمكن التحويل للحساب البنكي: SA00000000000000000000</li>
                <li>للاستفسار يرجى التواصل مع الإدارة المالية.</li>
            </ul>
        </div>

         {/* Print Button Wrapper */}
         <PrintWrapper />
      </div>
    </div>
  );
}
