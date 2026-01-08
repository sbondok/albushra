'use client';
import { useState } from 'react';

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  guardianId: string;
  guardianName: string;
  students?: any[];
};

export default function PaymentModal({ isOpen, onClose, onSuccess, guardianId, guardianName, students = [] }: PaymentModalProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [reference, setReference] = useState('');
  const [studentId, setStudentId] = useState('all');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            guardianId,
            studentId,
            amount,
            method,
            reference,
            notes
        })
      });

      if (!res.ok) throw new Error('فشلت العملية');
      
      onSuccess();
      onClose();
    } catch (err) {
      setError('حدث خطأ أثناء تسجيل الدفعة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800">إضافة دفعة جديدة</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded">{error}</div>}
            
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ولي الأمر</label>
                <input type="text" value={guardianName} disabled className="w-full bg-slate-100 border border-slate-200 rounded px-3 py-2 text-slate-500" />
            </div>

            {students && students.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">تخصيص لطالب محدد (اختياري)</label>
                    <select 
                        className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                    >
                        <option value="all">عام (تلقائي للأقدم)</option>
                        {students.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">المبلغ (ر.س) *</label>
                <input 
                    type="number" 
                    required 
                    min="1"
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">طريقة الدفع</label>
                <select 
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                >
                    <option value="cash">نقداً</option>
                    <option value="transfer">تحويل بنكي</option>
                    <option value="network">شبكة (POS)</option>
                    <option value="jeelpay">جيل باي</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">رقم المرجع (اختياري)</label>
                <input 
                    type="text" 
                    placeholder="رقم الحوالة / إيصال الشبكة"
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ملاحظات</label>
                <textarea 
                    className="w-full border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                ></textarea>
            </div>

            <div className="pt-4 flex gap-3">
                <button type="button" onClick={onClose} className="btn btn-secondary flex-1">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
                    {isSubmitting ? 'جاري الحفظ...' : 'تأكيد الـدفع'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
