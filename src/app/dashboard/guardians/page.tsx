'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type GuardianSummary = {
  id: string;
  name: string;
  nationalId: string;
  mobilePrimary: string;
  totalDue: number;
  accountStatus: string;
};

export default function GuardiansPage() {
  const [search, setSearch] = useState('');
  const [guardians, setGuardians] = useState<GuardianSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchGuardians();
  }, []);

  const handleUpdateStatus = async () => {
    if (!confirm('هل أنت متأكد؟ سيقوم النظام بفحص جميع الفواتير المتأخرة وتحديث حالة "متعثر" لأولياء الأمور المتأخرين عن السداد.')) return;
    
    setUpdatingStatus(true);
    try {
        const res = await fetch('/api/jobs/update-statuses', { method: 'POST' });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            fetchGuardians(search);
        } else {
            alert('حدث خطأ: ' + (data.error || 'غير معروف'));
        }
    } catch (err) {
        alert('فشل الاتصال بالخادم');
    } finally {
        setUpdatingStatus(false);
    }
  };

  const fetchGuardians = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/guardians?q=${query}`);
      const data = await res.json();
      setGuardians(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGuardians(search);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">أولياء الأمور</h1>
        <div className="flex gap-3">
             <button 
                onClick={handleUpdateStatus} 
                disabled={updatingStatus}
                className={`btn btn-secondary text-sm flex gap-2 ${updatingStatus ? 'opacity-50' : ''}`}
            >
                {updatingStatus ? 'جاري التحديث...' : '🔄 تحديث حالات التعثر'}
            </button>
            <Link href="/dashboard/upload" className="btn btn-primary text-sm">
            + استيراد جدد
            </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input 
            type="text" 
            placeholder="بحث بالاسم، الهوية، أو الجوال..." 
            className="flex-1 border border-slate-300 rounded px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">بحث</button>
        </form>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
            <tr>
              <th className="px-6 py-4">الاسم</th>
              <th className="px-6 py-4">رقم الهوية</th>
              <th className="px-6 py-4">الجوال</th>
              <th className="px-6 py-4">الرصيد المستحق</th>
              <th className="px-6 py-4">الحالة</th>
              <th className="px-6 py-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-500">جاري التحميل...</td>
              </tr>
            ) : guardians.length === 0 ? (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">لا توجد نتائج</td>
                </tr>
            ) : (
                guardians.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-800">{g.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono">{g.nationalId}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono" dir="ltr">{g.mobilePrimary}</td>
                    <td className="px-6 py-4">
                        <span className={`font-bold ${g.totalDue > 0 ? 'text-red-500' : 'text-green-600'}`}>
                            {g.totalDue.toLocaleString()} ر.س
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold
                            ${g.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 
                              g.accountStatus === 'defaulting' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                        `}>
                            {g.accountStatus === 'active' ? 'نشط' : g.accountStatus === 'defaulting' ? 'متعثر' : g.accountStatus}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <Link href={`/dashboard/guardians/${g.id}`} className="text-blue-600 hover:underline text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            عرض الملف ←
                        </Link>
                    </td>
                </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
