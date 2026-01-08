import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="mr-72 min-h-screen">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40">
           <h2 className="text-xl font-semibold text-slate-800">نظام تحصيل الرسوم</h2>
           <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
               👤
             </div>
             <span className="text-sm font-medium text-slate-600">المستخدم المسؤول</span>
           </div>
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
