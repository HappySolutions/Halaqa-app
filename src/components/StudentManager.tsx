import React, { useState } from 'react';
import { Plus, Trash2, UserPlus, Users, LayoutGrid } from 'lucide-react';
import { Student, Halaqa } from '@/types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface StudentManagerProps {
  students: Student[];
  halaqat: Halaqa[];
  onAddHalaqa: (name: string) => void;
  onDeleteHalaqa: (id: string) => void;
  onAdd: (name: string, halaqaId: string) => void;
  onRemove: (id: string) => void;
}

export function StudentManager({ students, halaqat, onAddHalaqa, onDeleteHalaqa, onAdd, onRemove }: StudentManagerProps) {
  const [newHalaqaName, setNewHalaqaName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedHalaqaId, setSelectedHalaqaId] = useState<string | null>(null);

  const handleAddHalaqa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHalaqaName.trim()) return;
    onAddHalaqa(newHalaqaName.trim());
    setNewHalaqaName('');
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {halaqat.map((halaqa) => (
            <button
              key={halaqa.id}
              onClick={() => setSelectedHalaqaId(halaqa.id)}
              className={cn(
                "relative flex flex-col p-4 rounded-xl border transition-all text-right",
                selectedHalaqaId === halaqa.id
                  ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                  : "bg-white border-slate-200 hover:border-emerald-300"
              )}
            >
              <span className="text-sm font-bold text-slate-800">{halaqa.name}</span>
              <span className="text-[10px] text-slate-500 mt-1">
                {students.filter(s => s.halaqaId === halaqa.id).length} طالبة
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('هل أنت متأكد من حذف هذه الحلقة؟ سيتم فصل الطالبات عنها.')) onDeleteHalaqa(halaqa.id);
                }}
                className="absolute top-2 left-2 p-1 text-slate-300 hover:text-red-500"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </button>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredStudents.map((student) => (
                <motion.div
                  layout
                  key={student.id}
                  className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 group"
                >
                  <span className="text-slate-700 text-sm font-medium">{student.name}</span>
                  <button
                    onClick={() => onRemove(student.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
