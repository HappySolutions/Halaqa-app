import React, { useMemo } from 'react';
import { Clipboard, Trash2, Users, Check } from 'lucide-react';
import { Report, Student } from '@/types';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface AdminPanelProps {
  reports: Report[];
  students: Student[];
  onDeleteReport: (id: string) => void;
  onToggleDeferred: (id: string) => void;
  onClearAll: () => void;
}

export function AdminPanel({ reports, students, onDeleteReport, onToggleDeferred, onClearAll }: AdminPanelProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todayReports = useMemo(() => {
    return reports
      .filter(r => r.date === today)
      .sort((a, b) => a.timestamp - b.timestamp); // Oldest first (first registered first)
  }, [reports, today]);

  const stats = useMemo(() => {
    const total = students.length;
    const presentReports = todayReports.filter(r => !r.isAbsent);
    const completed = presentReports.filter(r => r.hasReviewed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalPages = presentReports.reduce((sum, r) => sum + r.pagesReviewed, 0);

    return { total, completed, percentage, totalPages, presentCount: presentReports.length };
  }, [students, todayReports]);

  const generateWhatsAppText = () => {
    const todayDate = new Date();
    
    const dayName = format(todayDate, 'EEEE', { locale: ar });
    const monthName = format(todayDate, 'MMMM', { locale: ar });
    const year = format(todayDate, 'yyyy');
    const dayNum = format(todayDate, 'dd');
    
    // Hijri Date using Intl - Using nu-latn for English numbers
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const formattedHijri = hijriFormatter.format(todayDate);

    const presentReports = todayReports.filter(r => !r.isAbsent);
    const absentReports = todayReports.filter(r => r.isAbsent);

    let text = `يوم ${dayName}\n`;
    text += `التاريخ الهجري: ${formattedHijri}\n`;
    text += `التاريخ الميلادي: ${dayNum} ${monthName} ${year}م\n`;
    text += `.....................\n`;
    text += `عدد الحضور:${stats.presentCount}\n`;
    text += `أوجه المراجعة:${stats.totalPages}\n`;
    text += `عدد أوجه الحفظ:${Math.floor(stats.presentCount / 2)}\n`;
    text += `🖋️ حضور الطالبات حسب بطاقة:\n`;

    if (presentReports.length === 0) {
      text += "لا يوجد تقارير مسجلة لليوم بعد.\n";
    } else {
      presentReports.forEach((r, index) => {
        const checkMark = r.hasReviewed ? '☑️' : '❌';
        const deferredMark = r.isDeferred ? '↩️' : '';
        text += `${index + 1}-${r.studentName}${r.pagesReviewed}${r.surahs}${checkMark}${deferredMark}\n`;
      });
    }

    text += `\nالطالبة الغائبة بعذر📝\n`;
    if (absentReports.length === 0) {
      text += "1-\n2-\n3-\n";
    } else {
      absentReports.forEach((r, index) => {
        text += `${index + 1}-${r.studentName} (${r.absenceReason || 'بدون عذر'})\n`;
      });
    }
    
    text += `\nعلامة ☑️ تعني أن الطالبة راجعت\n`;
    text += `علامة ↩️ تعني أن الطالبة لم يتسع وقت الحلقة لتسميعها وتم ترحيلها الى اليوم التالي`;
    
    return text;
  };

  const handleCopyToClipboard = () => {
    const text = generateWhatsAppText();
    navigator.clipboard.writeText(text).then(() => {
      alert('تم نسخ التقرير بنجاح! يمكنك الآن لصقه في الواتساب.');
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Stats & Management */}
      <div className="lg:col-span-5 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">طالبات الحلقة</div>
            <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">تم المراجعة</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-bold">نسبة الإنجاز</div>
            <div className="text-2xl font-bold text-slate-800">{stats.percentage}%</div>
          </div>
        </div>

        <div className="spiritual-card p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clipboard className="w-5 h-5 text-emerald-600" />
              إدارة تقارير اليوم
            </h3>
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من حذف جميع تقارير اليوم؟')) onClearAll();
              }}
              className="p-2 text-slate-300 hover:text-red-500 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {todayReports.map((report) => (
              <motion.div
                layout
                key={report.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full", 
                      report.isAbsent ? "bg-red-500" : (report.hasReviewed ? "bg-emerald-500" : "bg-slate-300")
                    )} />
                    <span className="font-bold text-slate-800 text-sm">{report.studentName}</span>
                    {report.isAbsent && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-bold">غائبة</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mr-3.5 italic">
                    {report.isAbsent ? (report.absenceReason || 'لا يوجد عذر') : report.surahs}
                  </div>
                </div>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button
                    onClick={() => onToggleDeferred(report.id)}
                    title={report.isDeferred ? "إلغاء الترحيل" : "ترحيل للغد"}
                    className={cn(
                      "p-1.5 rounded transition-all text-lg",
                      report.isDeferred ? "bg-amber-100" : "hover:bg-slate-100"
                    )}
                  >
                    ↩️
                  </button>
                  <button
                    onClick={() => onDeleteReport(report.id)}
                    className="p-1.5 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
            {todayReports.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm italic">
                لم يتم تسجيل أي بطاقات بعد لهذا اليوم
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: WhatsApp Preview */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="bg-whatsapp-bg rounded-2xl border border-slate-200 shadow-inner flex flex-col h-[600px] overflow-hidden">
          {/* WhatsApp Header */}
          <div className="bg-whatsapp-header p-3 text-white flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center text-whatsapp-header">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm">جروب حلقة التحفيظ</div>
              <div className="text-[10px] opacity-80">متصل الآن</div>
            </div>
          </div>

          {/* WhatsApp Messages Area */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto pattern-bg">
            <div className="bg-white p-4 rounded-lg rounded-tr-none shadow-sm max-w-[90%] relative">
              <div className="text-xs font-bold text-whatsapp-header mb-2 flex items-center gap-1">
                <span>تنسيق الرسالة اليومية</span>
                <span className="text-[8px] px-1 bg-slate-100 rounded text-slate-400 font-normal mr-auto">ADMIN</span>
              </div>
              <pre className="text-[13px] leading-relaxed text-slate-700 font-mono whitespace-pre-wrap arabic-text">
                {generateWhatsAppText()}
              </pre>
              <div className="text-[10px] text-slate-400 text-left mt-2 flex items-center justify-end gap-1">
                <span>{format(new Date(), 'hh:mm a')}</span>
                <Check className="w-2 h-2" />
              </div>
            </div>

            {todayReports.length > 0 && (
              <div className="bg-whatsapp-bubble p-3 rounded-lg rounded-tl-none shadow-sm max-w-[85%] mr-auto relative">
                <div className="text-[12px] text-slate-800">
                  تم استلام بطاقة جديدة من: <span className="font-bold">{todayReports[0].studentName}</span> ✅
                </div>
                <div className="text-[9px] text-slate-400 text-left mt-1">
                  {format(new Date(), 'hh:mm a')}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Large Styled Copy Button Match with StudentForm style */}
        <button
          onClick={handleCopyToClipboard}
          disabled={todayReports.length === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all group"
        >
          <span>نسخ القائمة النهائية</span>
          <Clipboard className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
}
