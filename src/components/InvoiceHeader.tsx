'use client';

export default function InvoiceHeader() {
  return (
    <div className="w-full mb-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
            src="/heading.png" 
            onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
                // Show fallback text
                const fallback = document.getElementById('header-fallback');
                if (fallback) fallback.classList.remove('hidden');
            }}
            alt="ترويسة المدرسة" 
            className="header-image mx-auto w-full max-h-[200px] object-contain"
        />
        
        {/* Fallback Header Text */}
        <div id="header-fallback" className="hidden mt-4 text-center">
            <h1 className="text-2xl font-bold text-blue-900">مدارس البشرى - مكة المكرمة</h1>
            <p className="text-slate-500">فاتورة رسوم دراسية</p>
        </div>
    </div>
  );
}
