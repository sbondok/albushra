
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function StudentsPage({ searchParams }: { searchParams: any }) {
  // `searchParams` can be a Promise in some Next.js versions; unwrap safely.
  const params = await Promise.resolve(searchParams);
  const query = params?.q || '';

  const students = await prisma.student.findMany({
    where: {
      OR: [
        { name: { contains: query } },
        { nationalId: { contains: query } }
      ]
    },
    include: {
      studentGuardians: {
        include: { guardian: true }
      }
    },
    take: 50,
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-800">قائمة الطلاب</h1>
        
        {/* Search Box */}
        <form className="flex gap-2 w-1/3">
          <input 
            name="q"
            defaultValue={query}
            placeholder="بحث عن طالب..."
            className="flex-1 input"
          />
          <button type="submit" className="btn btn-primary">بحث</button>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-slate-600 font-medium">
            <tr>
              <th className="p-4">اسم الطالب</th>
              <th className="p-4">رقم الهوية</th>
              <th className="p-4">ولي الأمر</th>
              <th className="p-4">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.map(student => (
              <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-medium">{student.name}</td>
                <td className="p-4 text-slate-500">{student.nationalId.startsWith('TEMP') ? '-' : student.nationalId}</td>
                <td className="p-4">
                  {student.studentGuardians.map(sg => (
                    <div key={sg.guardianId} className="text-sm">
                      <Link href={`/dashboard/guardians/${sg.guardianId}`} className="text-blue-600 hover:underline">
                        {sg.guardian.name}
                      </Link>
                      <span className="text-xs text-slate-400 mx-1">({sg.relationshipType})</span>
                    </div>
                  ))}
                </td>
                <td className="p-4">
                   {/* Actions placeholder */}
                </td>
              </tr>
            ))}
            {students.length === 0 && (
               <tr>
                 <td colSpan={4} className="p-8 text-center text-slate-500">لا توجد نتائج</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
