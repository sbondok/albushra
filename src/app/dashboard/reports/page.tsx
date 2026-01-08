'use client';
import { useState } from 'react';

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    searchQuery: '',
    sortBy: 'amountDesc',
    accountStatus: '',
    minDue: '',
    maxDue: '',
    grade: ''
  });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch('/api/reports/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      const json = await res.json();
      setResults(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;
    
    // Simple CSV Export Logic
    const headers = ['الاسم', 'الهوية', 'الجوال', 'الحالة', 'الصفوف', 'الرصيد المستحق'];
    const csvContent = [
        headers.join(','),
        ...results.map(r => [
            `"${r.name}"`, 
            `"${r.nationalId}"`, 
            `"${r.mobile}"`, 
            r.accountStatus, 
            `"${r.gradeList}"`, 
            r.totalDue
        ].join(','))
    ].join('\n');

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'report_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">التقارير والاستعلامات</h1>

      {/* Filters (Query Builder) */}
      <div className="card p-6 mb-8">
        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
            <span>🔍</span> معايير البحث
        </h3>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">بحث عام (الاسم، الهوية، الجوال، الطالب)</label>
                <input 
                    type="text" 
                    className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ابحث هنا..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
                />
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">الترتيب حسب</label>
                 <select 
                    className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                 >
                    <option value="amountDesc">الأكثر مديونية ⬇</option>
                    <option value="amountAsc">الأقل مديونية ⬆</option>
                 </select>
            </div>

            <div className="flex items-end">
                <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                    {loading ? 'جاري البحث...' : 'عرض النتائج'}
                </button>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">حالة الحساب</label>
                <select 
                    className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.accountStatus}
                    onChange={(e) => setFilters({...filters, accountStatus: e.target.value})}
                >
                    <option value="">(الكل)</option>
                    <option value="active">نشط / متعاون</option>
                    <option value="defaulting">متعثر</option>
                    <option value="refusing">ممتنع</option>
                </select>
            </div>
            
             <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">المبلغ المستحق (من)</label>
                <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    value={filters.minDue}
                    onChange={(e) => setFilters({...filters, minDue: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">المبلغ المستحق (إلى)</label>
                <input 
                    type="number" 
                    className="w-full border border-slate-300 rounded px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="∞"
                    value={filters.maxDue}
                    onChange={(e) => setFilters({...filters, maxDue: e.target.value})}
                />
            </div>
        </form>
      </div>

      {/* Results */}
        {hasSearched && (
            <div className="card overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">نتائج البحث ({results.length})</h3>
                    {results.length > 0 && (
                        <button onClick={exportToCSV} className="text-sm text-green-600 hover:text-green-800 font-medium flex items-center gap-1">
                            📄 تصدير CSV
                        </button>
                    )}
                </div>
                
                <table className="w-full text-right text-sm">
                    <thead className="bg-white text-slate-500 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">الاسم</th>
                            <th className="px-6 py-3">الهوية</th>
                            <th className="px-6 py-3">الجوال</th>
                            <th className="px-6 py-3">الحالة</th>
                            <th className="px-6 py-3">إجمالي المستحق</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-slate-700">
                        {results.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-slate-400">لا توجد نتائج تطابق المعايير</td></tr>
                        ) : results.map((r: any) => (
                            <tr key={r.id} className="hover:bg-blue-50 transition-colors">
                                <td className="px-6 py-4 font-medium">{r.name}</td>
                                <td className="px-6 py-4 font-mono">{r.nationalId}</td>
                                <td className="px-6 py-4 font-mono" dir="ltr">{r.mobile}</td>
                                <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded text-xs font-semibold
                                        ${r.accountStatus === 'active' ? 'bg-green-100 text-green-700' : 
                                          r.accountStatus === 'defaulting' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                                    `}>
                                        {r.accountStatus === 'active' ? 'نشط' : r.accountStatus === 'defaulting' ? 'متعثر' : r.accountStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-900">{r.totalDue.toLocaleString()} ر.س</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
  );
}
