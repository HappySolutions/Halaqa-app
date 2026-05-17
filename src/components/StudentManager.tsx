import React, { useState } from 'react';
import { Plus, Trash2, UserPlus, Users, LayoutGrid, Settings2, Check, X, Pencil } from 'lucide-react';
import { Student, Halaqa } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface StudentManagerProps {
  students: Student[];
  halaqat: Halaqa[];
  onAddHalaqa: (name: string) => void;
  onUpdateHalaqa: (id: string, data: Partial<Halaqa>) => void;
  onDeleteHalaqa: (id: string) => void;
  onAdd: (name: string, halaqaId: string) => void;
  onRemove: (id: string) => void;
  onUpdateStudent: (id: string, name: string) => void;
  onBulkAdd: (halaqaId: string, names: string[]) => void;
  adminRole: 'master' | 'teacher' | null;
}

export function StudentManager({ 
  students, 
  halaqat, 
  onAddHalaqa, 
  onUpdateHalaqa,
  onDeleteHalaqa, 
  onAdd, 
  onRemove,
  onUpdateStudent,
  onBulkAdd,
  adminRole
}: StudentManagerProps) {
  const [newHalaqaName, setNewHalaqaName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [selectedHalaqaId, setSelectedHalaqaId] = useState<string | null>(null);
  
  // Halaqa Editing State
  const [editingHalaqaId, setEditingHalaqaId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    registrationLockTime: '19:00',
    nextDayRegStartTime: '22:30',
    password: ''
  });

  // Student Editing State
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');

  const [isImporting, setIsImporting] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const handleAddHalaqa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHalaqaName.trim()) return;
    onAddHalaqa(newHalaqaName.trim());
    setNewHalaqaName('');
  };

  const handleStartEditHalaqa = (halaqa: Halaqa) => {
    setEditingHalaqaId(halaqa.id);
    setEditForm({
      name: halaqa.name,
      registrationLockTime: halaqa.registrationLockTime || '19:00',
      nextDayRegStartTime: halaqa.nextDayRegStartTime || '22:30',
      password: halaqa.password || ''
    });
  };

  const handleSaveEditHalaqa = () => {
    if (editingHalaqaId) {
      onUpdateHalaqa(editingHalaqaId, editForm);
      setEditingHalaqaId(null);
    }
  };

  const handleStartEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setEditStudentName(student.name);
  };

  const handleSaveEditStudent = (id: string) => {
    if (editStudentName.trim()) {
      onUpdateStudent(id, editStudentName.trim());
      setEditingStudentId(null);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !selectedHalaqaId) return;
    onAdd(newStudentName.trim(), selectedHalaqaId);
    setNewStudentName('');
  };

  const filteredStudents = students.filter(s => s.halaqaId === selectedHalaqaId);

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Halaqa Management */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-emerald-600" />
          إدارة الحلقات
        </h2>

        {adminRole === 'master' && (
          <form onSubmit={handleAddHalaqa} className="flex gap-2 mb-8">
            <input
              type="text"
              required
              placeholder="اسم الحلقة الجديدة (مثلاً: حلقة المغرب)..."
              value={newHalaqaName}
              onChange={(e) => setNewHalaqaName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl shadow-md transition-all font-bold text-sm"
            >
              إضافة حلقة
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {halaqat.map((halaqa) => (
            <div
              key={halaqa.id}
              className={cn(
                "relative flex flex-col p-4 rounded-xl border transition-all text-right",
                selectedHalaqaId === halaqa.id
                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:border-emerald-300"
              )}
            >
              {editingHalaqaId === halaqa.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-xs font-bold p-1 border rounded bg-white"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[8px] text-slate-400 block mb-0.5">وقت الإغلاق</label>
                      <input
                        type="time"
                        value={editForm.registrationLockTime}
                        onChange={(e) => setEditForm({ ...editForm, registrationLockTime: e.target.value })}
                        className="w-full text-[10px] p-1 border rounded bg-white"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-slate-400 block mb-0.5">فتح اليوم التالي</label>
                      <input
                        type="time"
                        value={editForm.nextDayRegStartTime}
                        onChange={(e) => setEditForm({ ...editForm, nextDayRegStartTime: e.target.value })}
                        className="w-full text-[10px] p-1 border rounded bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">كلمة مرور المشرفة</label>
                    <input
                      type="text"
                      placeholder="اتركيه فارغاً لعدم وضع كلمة مرور"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="w-full text-xs font-mono p-1 border rounded bg-white"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleSaveEditHalaqa} className="bg-emerald-600 text-white p-1 rounded-md shadow-sm">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingHalaqaId(null)} className="bg-slate-200 text-slate-600 p-1 rounded-md">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-800">{halaqa.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleStartEditHalaqa(halaqa)}
                        className="p-1 text-slate-300 hover:text-emerald-500 transition-all"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                      </button>
                      {adminRole === 'master' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('هل أنت متأكد من حذف هذه الحلقة؟')) onDeleteHalaqa(halaqa.id);
                          }}
                          className="p-1 text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedHalaqaId(halaqa.id)}
                    className="text-right"
                  >
                    <div className="text-[10px] text-slate-500">
                      {students.filter(s => s.halaqaId === halaqa.id).length} طالبة
                    </div>
                    <div className="text-[9px] text-emerald-600 mt-1">
                      {halaqa.registrationLockTime || '19:00'} إغلاق / {halaqa.nextDayRegStartTime || '22:30'} فتح
                    </div>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Student Management (Only visible if a Halaqa is selected) */}
      <AnimatePresence mode="wait">
        {selectedHalaqaId ? (
          <motion.div
            key={selectedHalaqaId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                طالبات {halaqat.find(h => h.id === selectedHalaqaId)?.name}
              </h2>
              <button 
                onClick={() => setSelectedHalaqaId(null)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="flex gap-2 mb-8">
              <input
                type="text"
                required
                placeholder="اسم الطالبة الجديدة..."
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-md transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowBulkAdd(!showBulkAdd)}
                className="text-xs text-emerald-600 font-bold hover:underline"
              >
                {showBulkAdd ? 'إغلاق الإضافة الجماعية' : 'إضافة قائمة أسماء جماعية؟'}
              </button>
            </div>

            {showBulkAdd && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-8 p-6 border-2 border-dashed border-emerald-100 rounded-2xl bg-emerald-50/30"
              >
                <label className="block text-sm font-bold text-slate-700 mb-2">انسخي قائمة الأسماء هنا (اسم في كل سطر)</label>
                <textarea
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder="مثال:&#10;خديجة محمد&#10;فاطمة أحمد&#10;عائشة علي"
                  className="w-full h-32 bg-white border border-slate-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all mb-4"
                />
                <button
                  onClick={async () => {
                    const names = bulkText.split('\n').filter(name => name.trim() !== '');
                    if (names.length === 0) return;
                    setIsImporting(true);
                    await onBulkAdd(selectedHalaqaId, names);
                    setIsImporting(false);
                    setBulkText('');
                    setShowBulkAdd(false);
                  }}
                  disabled={isImporting || !bulkText.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isImporting ? 'جاري الإضافة...' : `إضافة ${bulkText.split('\n').filter(n => n.trim()).length} اسم إلى القائمة`}
                </button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredStudents.map((student) => (
                <motion.div
                  layout
                  key={student.id}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 group"
                >
                  {editingStudentId === student.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        autoFocus
                        type="text"
                        value={editStudentName}
                        onChange={(e) => setEditStudentName(e.target.value)}
                        className="flex-1 bg-white border border-emerald-300 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEditStudent(student.id)}
                      />
                      <button onClick={() => handleSaveEditStudent(student.id)} className="text-emerald-600">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingStudentId(null)} className="text-slate-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-slate-700 text-sm font-medium">{student.name}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStartEditStudent(student)}
                          className="p-1 text-slate-400 hover:text-emerald-600 transition-all"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('هل أنت متأكد من حذف هذه الطالبة؟')) onRemove(student.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm italic">
                لا توجد أسماء مضافة لهذه الحلقة حالياً
              </div>
            )}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">الرجاء اختيار حلقة لإدارة طالباتها</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
