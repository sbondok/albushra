'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import PaymentModal from '@/components/PaymentModal';

export default function GuardianProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'students'>('invoices');
  const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/guardians/${id}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الملف...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">لم يتم العثور على ولي الأمر</div>;

  return (
    <div>
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSuccess={() => { fetchData(); }}
        guardianId={data.id}
        guardianName={data.name}
        students={data.studentGuardians?.map((sg: any) => sg.student) || []}
      />

      {/* Header Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex justify-between items-start">
            <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl">
                    👤
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
                    <div className="text-slate-500 flex gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">🆔 {data.nationalId}</span>
                        <span className="flex items-center gap-1" dir="ltr">📞 {data.mobilePrimary}</span>
                        {data.email && <span className="flex items-center gap-1">✉️ {data.email}</span>}
                    </div>
                </div>
            </div>
            <div className="text-left">
                 <span className={`inline-block px-3 py-1 rounded text-sm font-semibold mb-2
                        ${data.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 
                          data.accountStatus === 'defaulting' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                    `}>
                        {data.accountStatus === 'active' ? 'نشط' : data.accountStatus === 'defaulting' ? 'متعثر' : data.accountStatus}
                </span>
            </div>
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-100">
            <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-600 text-sm font-medium mb-1">إجمالي المستحق</p>
                <p className="text-2xl font-bold text-blue-900">{data.summary.totalDue.toLocaleString()} ر.س</p>
            </div>
             <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-600 text-sm font-medium mb-1">إجمالي المدفوع</p>
                <p className="text-2xl font-bold text-green-900">{data.summary.totalPaid.toLocaleString()} ر.س</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg flex flex-col justify-center items-center">
                 <button onClick={() => setPaymentModalOpen(true)} className="btn btn-primary w-full justify-center">
                    + تسجيل دفعة جديدة
                 </button>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <div className="flex gap-8">
            <button 
                onClick={() => setActiveTab('invoices')}
                className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'invoices' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                الفواتير ({data.invoices.length})
            </button>
            <button 
                onClick={() => setActiveTab('payments')}
                className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                الدفعات ({data.payments.length})
            </button>
             <button 
                onClick={() => setActiveTab('students')}
                className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'students' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                الأبناء ({data.studentGuardians.length})
            </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'invoices' && (
            <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-600 text-sm font-medium border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-3">رقم الفاتورة</th>
                        <th className="px-6 py-3">الطالب</th>
                        <th className="px-6 py-3">المبلغ</th>
                        <th className="px-6 py-3">المتبقي</th>
                        <th className="px-6 py-3">تاريخ الاستحقاق</th>
                        <th className="px-6 py-3">الحالة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {data.invoices.map((inv: any) => (
                        <tr key={inv.id}>
                            <td className="px-6 py-4 font-mono text-slate-600">#{inv.invoiceNumber}</td>
                            <td className="px-6 py-4">{inv.student.name}</td>
                            <td className="px-6 py-4">{Number(inv.amount).toLocaleString()}</td>
                            <td className="px-6 py-4 font-bold text-slate-800">{Number(inv.amountDue).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('ar-SA') : '-'}</td>
                             <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-semibold
                                    ${inv.status === 'paid' ? 'bg-green-100 text-green-700' : 
                                      inv.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}
                                `}>
                                    {inv.status === 'paid' ? 'مسدد' : inv.status === 'partial' ? 'جزئي' : 'غير مسدد'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

        {activeTab === 'payments' && (
            <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-600 text-sm font-medium border-b border-slate-200">
                     <tr>
                        <th className="px-6 py-3">رقم المرجع</th>
                        <th className="px-6 py-3">التاريخ</th>
                        <th className="px-6 py-3">المبلغ</th>
                        <th className="px-6 py-3">الطريقة</th>
                         <th className="px-6 py-3">ملاحظات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                     {data.payments.length === 0 ? <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد دفعات مسجلة</td></tr> : 
                        data.payments.map((p: any) => (
                        <tr key={p.id}>
                            <td className="px-6 py-4 font-mono text-slate-600">
                                {p.referenceNo || '-'}
                                <Link href={`/receipts/${p.id}`} className="block text-xs text-blue-600 hover:underline mt-1">عرض السند ↗</Link>
                            </td>
                            <td className="px-6 py-4 text-sm">{new Date(p.paymentDate).toLocaleDateString('ar-SA')}</td>
                            <td className="px-6 py-4 font-bold text-green-600">{Number(p.amount).toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm">{p.method}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{p.notes}</td>
                        </tr>
                     ))}
                </tbody>
            </table>
        )}

         {activeTab === 'students' && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.studentGuardians.map((sg: any) => (
                    <div key={sg.id} className="border border-slate-200 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                            ط
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800">{sg.student.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">الصف: {sg.student.currentGrade || 'غير محدد'}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
