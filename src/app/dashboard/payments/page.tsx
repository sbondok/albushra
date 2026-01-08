'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">الدفعات والتحصيلات</h1>
        <Link href="/dashboard/guardians" className="btn btn-primary text-sm">
            + تسجيل دفعة جديدة
        </Link>
      </div>
      
      <div className="card overflow-hidden">
        <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                    <th className="px-6 py-4">ولي الأمر</th>
                    <th className="px-6 py-4">طريقة الدفع</th>
                    <th className="px-6 py-4">المبلغ</th>
                    <th className="px-6 py-4">التاريخ</th>
                    <th className="px-6 py-4">المرجع</th>
                    <th className="px-6 py-4">إجراءات</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {loading ? (
                    <tr><td colSpan={6} className="text-center py-8">جاري التحميل...</td></tr>
                ) : payments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8">لا توجد دفعات</td></tr>
                ) : payments.map((pay: any) => (
                    <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                            <div className="font-medium">{pay.guardian.name}</div>
                            <div className="text-xs text-slate-400 font-mono">{pay.guardian.nationalId}</div>
                        </td>
                        <td className="px-6 py-4">{pay.method}</td>
                        <td className="px-6 py-4 font-bold text-green-600">{Number(pay.amount).toLocaleString()} ر.س</td>
                        <td className="px-6 py-4 text-slate-500 font-mono" dir="ltr">{new Date(pay.paymentDate).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-mono text-xs">{pay.referenceNo || '-'}</td>
                        <td className="px-6 py-4">
                             <Link href={`/receipts/${pay.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                🧾 عرض السند
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}
