
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

const NavItem = ({ href, icon, label, isActive }: { href: string; icon: React.ReactNode; label: string; isActive: boolean }) => {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
        isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <aside className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col h-screen fixed right-0 top-0 z-50 overflow-y-auto no-print">
      <div className="p-6 border-b border-slate-800 bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="شعار المدرسة" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-blue-900 font-bold text-lg leading-none">مدارس البشرى</h1>
            <p className="text-blue-700 text-xs mt-1">
                {session?.user?.name || 'زائر'} ({isAdmin ? 'مدير' : 'مشاهد'})
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">الرئيسية</p>
          <NavItem href="/dashboard" label="لوحة المعلومات" isActive={pathname === '/dashboard'} icon={
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
          } />
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">إدارة الحسابات</p>
          <NavItem href="/dashboard/guardians" label="أولياء الأمور" isActive={pathname?.startsWith('/dashboard/guardians')} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          } />
          <NavItem href="/dashboard/students" label="الطلاب" isActive={pathname?.startsWith('/dashboard/students')} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          } />
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">المالية</p>
          <NavItem href="/dashboard/invoices" label="الفواتير" isActive={pathname?.startsWith('/dashboard/invoices')} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          } />
          <NavItem href="/dashboard/payments" label="الدفعات" isActive={pathname?.startsWith('/dashboard/payments')} icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
          } />
        </div>

        <div className="mb-6">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">أدوات</p>
           {isAdmin && (
               <NavItem href="/dashboard/upload" label="استيراد Excel" isActive={pathname === '/dashboard/upload'} icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              } />
           )}
          <NavItem href="/dashboard/reports" label="التقارير" isActive={pathname === '/dashboard/reports'} icon={
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          } />
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-4 py-2 rounded transition-colors text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>
          تسجيل خروج
        </button>
      </div>
    </aside>
  );
}
