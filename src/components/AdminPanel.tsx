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
  onUpdateReport: (id: string, data: any) => void;
  onClearAll: () => void;
}

export function AdminPanel({ reports, students, onDeleteReport, onToggleDeferred, onUpdateReport, onClearAll }: AdminPanelProps) {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ 
    surahs: '', 
    pagesReviewed: 0, 
    hasReviewed: false,
    isAbsent: false,
    absenceReason: '',
    turnOrder: 0
  });
  const today = format(new Date(), 'yyyy-MM-dd');

  const todayReports = useMemo(() => {
    return reports
      .filter(r => r.date === today)
      .sort((a, b) => (a.turnOrder ?? a.timestamp) - (b.turnOrder ?? b.timestamp));
  }, [reports, today]);

  const stats = useMemo(() => {
    const total = students.length;
    const presentReports = todayReports.filter(r => !r.isAbsent);
    const completed = presentReports.filter(r => r.hasReviewed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalPages = presentReports.reduce((sum, r) => sum + r.pagesReviewed, 0);

    return { total, completed, percentage, totalPages, presentCount: presentReports.length };
  }, [students, todayReports]);

  const handleStartEdit = (report: Report) => {
    setEditingId(report.id);
    setEditForm({ 
      surahs: report.surahs, 
      pagesReviewed: report.pagesReviewed,
      hasReviewed: report.hasReviewed,
      isAbsent: report.isAbsent,
      absenceReason: report.absenceReason || '',
      turnOrder: report.turnOrder ?? 0
    });
  };

  const handleSaveEdit = (id: string) => {
    onUpdateReport(id, editForm);
    setEditingId(null);
  };

  const generateWhatsAppText = () => {
    const todayDate = new Date();

    const dayName = format(todayDate, 'EEEE', { locale: ar });

    // Hijri Date using Intl - Using nu-latn for English numbers
    const hijriFormatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const hijriParts = hijriFormatter.formatToParts(todayDate);
    const hDay = hijriParts.find(p => p.type === 'day')?.value || '';
    const hMonth = hijriParts.find(p => p.type === 'month')?.value || '';
    const hYear = hijriParts.find(p => p.type === 'year')?.value || '';
    const formattedHijri = `${hDay}/${hMonth}/${hYear}`;

    const presentReports = todayReports.filter(r => !r.isAbsent);
    const absentReports = todayReports.filter(r => r.isAbsent);

    let text = `${dayName}\n`;
    text += `${formattedHijri} هـ\n`;
    text += `${format(todayDate, 'dd/MM/yyyy')} م\n`;
    text += `.....................\n`;
    text += `الرقم الوظيفي: 3908\n`;
    text += `عدد الحضور:${stats.presentCount}\n`;
    text += `عدد أوجه الحفظ:${Math.floor(stats.presentCount / 2)}\n`;
    text += `عدد أوجه المراجعة:${stats.totalPages}\n`;
    text += `المعلمة: نور أحمد\n`;
    text += `***********************\n`;

    text += `🖋️ حضور الطالبات حسب بطاقة:\n`;

    if (presentReports.length === 0) {
      text += "لا يوجد تقارير مسجلة لليوم بعد.\n";
    } else {
      presentReports.forEach((r, index) => {
        const checkMark = r.hasReviewed ? '☑️' : '❌';
        const deferredMark = r.isDeferred ? '↩️' : '';
        text += `${index + 1}-${r.studentName}${r.pagesReviewed}${r.surahs}${checkMark}${deferredMark}\n\n`;
      });
    }

    text += `***********************\n`;
    text += `\nالطالبة الغائبة بعذر📝\n`;
    if (absentReports.length === 0) {
      text += "1-\n2-\n3-\n";
    } else {
      absentReports.forEach((r, index) => {
        text += `${index + 1}-${r.studentName} (${r.absenceReason || 'بدون عذر'})\n`;
      });
    }

    text += `\n👇👇\n`;
    text += `م.تعني مراجعه\n`;
    text += `د.يعني درس جديد\n`;
    text += `علامة✅️انها سمعت لدا المعلمه درس اليوم\n`;
    text += `علامة ☑️ تعني أن الطالبة راجعت\n`;
    text += `علامة ↩️ تعني أن الطالبة لم يتسع وقت الحلقة لتسميعها وتم ترحيلها الى اليوم التالي\n`;
    text += `⁉️لم تحضرالحصه\n`;
    text += `❌️غائبه بدون عذر\n`;
    text += `📍🔴اجازه\n`;
    text += `👆👆`;

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
            {todayReports.map((report, index) => (
              <motion.div
                layout
                key={report.id}
                className="flex flex-col p-3 bg-slate-50 rounded-xl border border-slate-100 group"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        report.isAbsent ? "bg-red-500" : (report.hasReviewed ? "bg-emerald-500" : "bg-slate-300")
                      )} />
                      <span className="font-bold text-slate-800 text-sm">{report.studentName}</span>
                      {report.isAbsent && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md font-bold">غائبة</span>}
                    </div>
                    {editingId === report.id ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                          <label className="flex items-center gap-1 text-[10px] cursor-pointer bg-red-50 px-2 py-1 border border-red-100 rounded text-red-700 font-bold">
                            <input
                              type="checkbox"
                              checked={editForm.isAbsent}
                              onChange={(e) => setEditForm({ ...editForm, isAbsent: e.target.checked })}
                              className="w-3 h-3"
                            />
                            طالبة غائبة
                          </label>
                          <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 border border-slate-200 rounded">
                            <span className="text-[10px] text-slate-500 font-bold">رقم الدور:</span>
                            <input
                              type="number"
                              value={editForm.turnOrder}
                              onChange={(e) => setEditForm({ ...editForm, turnOrder: parseInt(e.target.value) || 0 })}
                              className="w-10 text-[10px] font-bold text-center bg-transparent border-none outline-none"
                            />
                          </div>
                        </div>

                        {editForm.isAbsent ? (
                          <input
                            type="text"
                            value={editForm.absenceReason}
                            onChange={(e) => setEditForm({ ...editForm, absenceReason: e.target.value })}
                            className="w-full text-xs p-1 border rounded bg-white"
                            placeholder="سبب الغياب..."
                          />
                        ) : (
                          <>
                            <input
                              type="text"
                              value={editForm.surahs}
                              onChange={(e) => setEditForm({ ...editForm, surahs: e.target.value })}
                              className="w-full text-xs p-1 border rounded bg-white"
                              placeholder="السور المراجعة"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                step="0.5"
                                value={editForm.pagesReviewed}
                                onChange={(e) => setEditForm({ ...editForm, pagesReviewed: parseFloat(e.target.value) })}
                                className="flex-1 text-xs p-1 border rounded bg-white"
                                placeholder="الأوجه"
                              />
                              <label className="flex items-center gap-1 text-[10px] cursor-pointer bg-white px-2 border rounded">
                                <input
                                  type="checkbox"
                                  checked={editForm.hasReviewed}
                                  onChange={(e) => setEditForm({ ...editForm, hasReviewed: e.target.checked })}
                                  className="w-3 h-3"
                                />
                                تمت المراجعة
                              </label>
                            </div>
                          </>
                        )}
                        <div className="flex gap-2 pt-1 border-t border-slate-100 mt-2">
                          <button onClick={() => handleSaveEdit(report.id)} className="text-[10px] font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg shadow-sm">حفظ</button>
                          <button onClick={() => setEditingId(null)} className="text-[10px] font-bold bg-slate-200 text-slate-600 px-3 py-1 rounded-lg">إلغاء</button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500 mr-3.5 italic">
                        {report.isAbsent ? (report.absenceReason || 'لا يوجد عذر') : `${report.pagesReviewed} وجه - ${report.surahs}`}
                      </div>
                    )}
                  </div>


                  <div className="flex items-center gap-1 transition-all">
                    <button
                      onClick={() => handleStartEdit(report)}
                      className="p-1.5 text-slate-400 hover:text-emerald-500 transition-all"
                      title="تعديل"
                    >
                      <span className="text-sm">✏️</span>
                    </button>
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
                  تم استلام بطاقة جديدة من: <span className="font-bold">{todayReports[todayReports.length - 1].studentName}</span> ✅
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
