
export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">لوحة المعلومات</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'إجمالي التحصيلات (شهر)', value: '0 ر.س', color: 'bg-green-500' },
          { label: 'المبالغ المستحقة', value: '0 ر.س', color: 'bg-blue-500' },
          { label: 'المتعثرون', value: '0', color: 'bg-red-500' },
          { label: 'الحالات القانونية', value: '0', color: 'bg-orange-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
              <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder Charts/Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold text-slate-800 mb-4">الأداء المالي (قريباً)</h3>
          <div className="flex items-center justify-center h-full text-slate-400">
            مساحة للرسم البياني
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">آخر النشاطات</h3>
          <div className="space-y-4">
            <div className="text-sm text-slate-500 text-center py-8">لا توجد نشاطات حديثة</div>
          </div>
        </div>
      </div>
    </div>
  );
}
