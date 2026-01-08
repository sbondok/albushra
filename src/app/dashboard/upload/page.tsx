'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [fullData, setFullData] = useState<any[]>([]); // Store all data for upload
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setMessage(null);
      readExcel(selectedFile);
    }
  };

  const readExcel = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const bstr = e.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data && data.length > 0) {
        const cols = data[0] as string[];
        const allRows = data.slice(1) as any[];
        const preview = allRows.slice(0, 5); 
        
        setColumns(cols);
        setPreviewData(preview);
        setFullData(data); // Store all rows INCLUDING headers for backend mapping
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!fullData.length) return;
    
    setLoading(true);
    setMessage(null);

    try {
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                rows: fullData,
                mapping: {} // Default mapping
            })
        });

        const result = await response.json();

        if (result.success) {
            setMessage({ type: 'success', text: `تم استيراد ${result.processed} سجل بنجاح!` });
            // Optional: clear file after success
            // setFile(null); setPreviewData([]); setFullData([]);
        } else {
            setMessage({ type: 'error', text: 'حدث خطأ أثناء الاستيراد: ' + (result.error || 'غير معروف') });
        }

    } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'فشل الاتصال بالخادم' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">استيراد البيانات</h1>
          <p className="text-slate-500 mt-1">رفع ملف Excel لتحديث بيانات الطلاب والفواتير</p>
        </div>
        <button className="btn btn-secondary">
          تحميل قالب
        </button>
      </div>

      <div className="card p-8 mb-8">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors relative">
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            {file ? file.name : 'اسحب الملف هنا أو اضغط للاختيار'}
          </h3>
          <p className="text-slate-500 text-sm">يدعم ملفات excel فقط (.xlsx)</p>
        </div>
      </div>

      {previewData.length > 0 && (
        <div className="card p-6 fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            معاينة البيانات (أول 5 صفوف)
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50 text-slate-600 font-medium">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-4 py-3 border-b">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {columns.map((_, cIdx) => (
                       <td key={cIdx} className="px-4 py-3 text-slate-700">
                         {row[cIdx] || '-'}
                       </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end gap-3">
             <button className="btn btn-secondary" onClick={() => { setFile(null); setPreviewData([]); setFullData([]); setMessage(null); }}>إلغاء</button>
             <button 
                className="btn btn-primary" 
                onClick={handleImport}
                disabled={loading}
             >
               {loading ? 'جاري الاستيراد...' : 'تأكيد واستيراد'}
             </button>
          </div>
          
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {message.text}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
