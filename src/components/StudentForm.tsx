import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Check, Send, User, Search, ChevronDown, X, AlertCircle, Users } from 'lucide-react';
import { Student, Report } from '@/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface StudentFormProps {
  students: Student[];
  reports: Report[];
  onSubmit: (report: Omit<Report, 'id' | 'timestamp' | 'date' | 'isDeferred'>) => void;
}

export function StudentForm({ students, reports, onSubmit }: StudentFormProps) {
  const [studentId, setStudentId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pages, setPages] = useState<number>(1);
  const [surahs, setSurahs] = useState('');
  const [hasReviewed, setHasReviewed] = useState(true);
  const [isAbsent, setIsAbsent] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    return students.filter(s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const selectedStudent = useMemo(() =>
    students.find(s => s.id === studentId),
    [students, studentId]);

  const isDuplicate = useMemo(() => {
    if (!studentId) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return reports.some(r => r.studentId === studentId && r.date === today);
  }, [studentId, reports]);

  const isTimeRestricted = useMemo(() => {
    try {
      // Create a date string for KSA timezone and parse it
      const ksaString = new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" });
      const ksaDate = new Date(ksaString);
      const ksaHours = ksaDate.getHours();

      // Restriction: 19:00 (7 PM) to 22:00 (10 PM)
      return ksaHours >= 19 && ksaHours < 23;
    } catch (e) {
      const now = new Date();
      const utcHours = now.getUTCHours();
      const ksaHours = (utcHours + 3) % 24;
      return ksaHours >= 19 && ksaHours < 23;
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || isDuplicate || isTimeRestricted) return;
    if (!isAbsent && !surahs) return;

    onSubmit({
      studentId,
      studentName: selectedStudent?.name || '',
      pagesReviewed: isAbsent ? 0 : pages,
      surahs: isAbsent ? 'غائبة' : surahs,
      hasReviewed: isAbsent ? false : hasReviewed,
      isAbsent,
      absenceReason: isAbsent ? absenceReason : '',
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStudentId('');
      setSearchTerm('');
      setPages(1);
      setSurahs('');
      setIsAbsent(false);
      setAbsenceReason('');
    }, 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-4 sm:p-6">
      <AnimatePresence mode="wait">
        {isTimeRestricted ? (
          <motion.div
            key="restricted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="spiritual-card p-12 text-center border-amber-100 bg-amber-50/30"
          >
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">التسجيل مغلق الآن</h2>
            <p className="text-slate-500 leading-relaxed">
              عذراً، لا يمكن استقبال البطاقات في الوقت الحالي.<br />
              فترة التوقف اليومية: من <span className="font-bold">7:00 مساءً</span> حتى <span className="font-bold">11:00 مساءً</span> بتوقيت مكة المكرمة.
            </p>
            <div className="mt-8 p-4 bg-white rounded-xl border border-amber-100 text-xs text-amber-700 italic">
              نسعد باستقبال بطاقاتكنّ خارج هذه الفترة.
            </div>
          </motion.div>
        ) : submitted ? (
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
            <h2 className="text-2xl font-bold text-slate-800 mb-2">تم التسجيل بنجاح!</h2>
            <p className="text-slate-500">بارك الله في جهودكِ.</p>
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
              <h2 className="text-xl font-bold text-slate-800">تسجيل الحالة اليومية</h2>
              <p className="text-sm text-slate-500 mt-1">يرجى اختيار الاسم وتحديد حالة الحضور</p>
            </div>

            {/* Name Selector (Searchable) */}
            <div className="space-y-2" ref={dropdownRef}>
              <label className="text-sm font-semibold text-slate-700">اسم الطالبة</label>
              <div className="relative">
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={cn(
                    "w-full h-12 bg-slate-50 border rounded-xl px-4 flex items-center justify-between cursor-pointer transition-all",
                    isDropdownOpen ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className={cn("text-sm", !selectedStudent ? "text-slate-400" : "text-slate-800 font-medium")}>
                      {selectedStudent ? selectedStudent.name : "ابحثي عن اسمكِ هنا..."}
                    </span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isDropdownOpen && "rotate-180")} />
                </div>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            autoFocus
                            type="text"
                            placeholder="اكتبي الحرف الأول للبحث..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-10 pr-9 pl-8 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 transition-all"
                          />
                          {searchTerm && (
                            <button
                              type="button"
                              onClick={() => setSearchTerm('')}
                              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              onClick={() => {
                                setStudentId(student.id);
                                setIsDropdownOpen(false);
                                setSearchTerm('');
                              }}
                              className={cn(
                                "px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between",
                                studentId === student.id ? "bg-emerald-50 text-emerald-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                              )}
                            >
                              {student.name}
                              {studentId === student.id && <Check className="w-4 h-4" />}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-slate-400 text-xs italic">
                            لم يتم العثور على هذا الاسم
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <input type="hidden" required value={studentId} />
            </div>

            {isDuplicate && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold block mb-1">تنبيه: سجلتِ من قبل!</span>
                  لقد قمتِ بالتسجيل اليوم بالفعل. لا يمكنكِ إرسال أكثر من بطاقة في نفس اليوم لضمان دقة الإحصائيات.
                </div>
              </motion.div>
            )}

            {!isDuplicate && (
              <>
                {/* Absence Toggle */}
                <div
                  onClick={() => setIsAbsent(!isAbsent)}
                  className={cn(
                    "w-full h-12 flex items-center gap-3 rounded-xl px-4 cursor-pointer transition-all border",
                    isAbsent ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-500"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                    isAbsent ? "bg-red-600 border-red-600 text-white" : "border-slate-300"
                  )}>
                    {isAbsent && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-sm font-bold">الطالبة غائبة اليوم</span>
                </div>

                <AnimatePresence mode="wait">
                  {isAbsent ? (
                    <motion.div
                      key="absence-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">سبب الغياب</label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: إجازة، عذر طبي، سفر..."
                          value={absenceReason}
                          onChange={(e) => setAbsenceReason(e.target.value)}
                          className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-slate-800 focus:ring-2 focus:ring-red-500 outline-none transition-all"
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="review-fields"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-6 overflow-hidden"
                    >
                      {/* Surahs Input */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">السورة / السور التي تمت مراجعتها</label>
                        <input
                          type="text"
                          required={!isAbsent}
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
                            required={!isAbsent}
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={!studentId || isDuplicate || isTimeRestricted}
                className={cn(
                  "w-full text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group",
                  (isDuplicate || isTimeRestricted) ? "bg-slate-300 cursor-not-allowed shadow-none" : (isAbsent ? "bg-red-600 hover:bg-red-700 shadow-red-100" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100")
                )}
              >
                <span>
                  {isDuplicate ? 'تم التسجيل مسبقاً' : (isAbsent ? 'تسجيل الغياب' : 'إرسال وتحديث الجدول')}
                </span>
                {!isDuplicate && !isTimeRestricted && <Send className="w-4 h-4 group-hover:translate-x-[-4px] transition-transform" />}
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
                سيتم إرسال نسخة تلقائية إلى جروب الواتساب الخاص بالمعلمة
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Today's Registration List (Visible to Students) */}
      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            قائمة المسجلات اليوم
          </h3>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
            {reports.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')).length} طالبة
          </span>
        </div>

        <div className="space-y-3">
          {reports
            .filter(r => r.date === format(new Date(), 'yyyy-MM-dd'))
            .sort((a, b) => a.timestamp - b.timestamp)
            .map((r, index) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={r.id}
                className={cn(
                  "spiritual-card p-4 flex items-center justify-between border-slate-100",
                  r.studentId === studentId ? "ring-2 ring-emerald-500/20 bg-emerald-50/30" : ""
                )}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{r.studentName}</div>
                    <div className="text-[10px] text-slate-500">
                      {r.isAbsent ? (
                        <span className="text-red-500 font-bold">غائبة: {r.absenceReason}</span>
                      ) : (
                        <span>{r.pagesReviewed} وجه - {r.surahs}</span>
                      )}
                    </div>
                  </div>
                </div>
                {r.hasReviewed && !r.isAbsent && (
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            ))}
          
          {reports.filter(r => r.date === format(new Date(), 'yyyy-MM-dd')).length === 0 && (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400 italic">لم يتم تسجيل أي طالبة بعد لهذا اليوم</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
