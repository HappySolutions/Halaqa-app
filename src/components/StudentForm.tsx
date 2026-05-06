import React, { useState } from 'react';
import { Check, Send, User } from 'lucide-react';
import { Student, Report } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface StudentFormProps {
  students: Student[];
  onSubmit: (report: Omit<Report, 'id' | 'timestamp' | 'date' | 'isDeferred'>) => void;
}

export function StudentForm({ students, onSubmit }: StudentFormProps) {
  const [studentId, setStudentId] = useState('');
  const [pages, setPages] = useState<number>(1);
  const [surahs, setSurahs] = useState('');
  const [hasReviewed, setHasReviewed] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !surahs) return;

    const student = students.find(s => s.id === studentId);
    if (!student) return;

    onSubmit({
      studentId,
      studentName: student.name,
      pagesReviewed: pages,
      surahs,
      hasReviewed,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStudentId('');
      setPages(1);
      setSurahs('');
    }, 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="spiritual-card p-12 text-center"
          >
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">تم الإرسال بنجاح!</h2>
            <p className="text-slate-500">بارك الله في جهودكِ ونفع بكِ.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="spiritual-card p-8 sm:p-10 space-y-6"
          >
            <div className="border-b border-slate-100 pb-6 text-center">
              <h2 className="text-xl font-bold text-slate-800">تسجيل المراجعة</h2>
              <p className="text-sm text-slate-500 mt-1">يرجى إدخال بيانات الورد اليومي بدقة</p>
            </div>

            {/* Name Selector */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">اسم الطالبة</label>
              <div className="relative">
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none appearance-none transition-all"
                >
                  <option value="">اختر الاسم من القائمة...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Surahs Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">السورة / السور</label>
              <input
                type="text"
                required
                placeholder="مثال: البقرة (١-٥٠)"
                value={surahs}
                onChange={(e) => setSurahs(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Pages & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">عدد أوجه المراجعة</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  required
                  value={pages}
                  onChange={(e) => setPages(parseFloat(e.target.value))}
                  className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">مراجعة</label>
                <div
                  onClick={() => setHasReviewed(!hasReviewed)}
                  className={cn(
                    "w-full h-12 flex items-center gap-2 rounded-xl px-4 cursor-pointer transition-all border",
                    hasReviewed ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded border flex items-center justify-center transition-all",
                    hasReviewed ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300"
                  )}>
                    {hasReviewed && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-sm font-medium">تمت المراجعة</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 group"
              >
                <span>إرسال وتحديث الجدول</span>
                <Send className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
                سيتم إرسال نسخة تلقائية إلى جروب الواتساب الخاص بالمعلمة
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
