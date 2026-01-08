'use client';

export default function PrintWrapper() {
    return (
        <div className="mt-12 text-center no-print flex justify-center gap-4">
            <button 
                onClick={() => window.print()}
                className="btn btn-primary flex items-center gap-2 px-8"
            >
                🖨️ طباعة الفاتورة
            </button>
            <button 
                onClick={() => window.history.back()}
                className="btn btn-secondary"
            >
                عودة
            </button>
        </div>
    )
}
