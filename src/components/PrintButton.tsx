'use client';

export default function PrintButton() {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 no-print flex gap-4">
      <button 
        onClick={() => window.print()} 
        className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg font-bold hover:bg-blue-700 transition-transform hover:-translate-y-1 flex items-center gap-2"
      >
        <span>🖨️</span> طباعة السند
      </button>
      <button 
        onClick={() => window.history.back()} 
        className="bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-full shadow-lg font-bold hover:bg-slate-50 transition-transform hover:-translate-y-1"
      >
        عودة
      </button>
    </div>
  );
}
