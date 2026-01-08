'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/invoices')
      .then(res => res.json())
      .then(data => {
        setInvoices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">الفواتير</h1>
      
      <div className="card overflow-hidden">
        <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                    <th className="px-6 py-4">رقم الفاتورة</th>
                    <th className="px-6 py-4">ولي الأمر</th>
                    <th className="px-6 py-4">الطالب</th>
                    <th className="px-6 py-4">المبلغ</th>
                    <th className="px-6 py-4">المسدد</th>
                    <th className="px-6 py-4">المتبقي</th>
                    <th className="px-6 py-4">الحالة</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={7} className="text-center py-8">جاري التحميل...</td></tr>
                ) : invoices.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8">لا توجد فواتير</td></tr>
                ) : invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono">
                            <Link href={`/dashboard/invoices/${inv.id}`} className="text-blue-600 hover:underline">
                                {inv.invoiceNumber}
                            </Link>
                        </td>
                        <td className="px-6 py-4">{inv.guardian.name}</td>
                        <td className="px-6 py-4">{inv.student.name} <span className="text-xs text-slate-400">({inv.student.currentGrade})</span></td>
                        <td className="px-6 py-4 font-bold">{Number(inv.amount).toLocaleString()}</td>
                        <td className="px-6 py-4 text-green-600">{Number(inv.amountPaid).toLocaleString()}</td>
                        <td className="px-6 py-4 text-red-600">{Number(inv.amountDue).toLocaleString()}</td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold
                                ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                  inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                            `}>
                                {inv.status === 'paid' ? 'خالص' : inv.status === 'partial' ? 'جزئي' : 'غير مسدد'}
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
