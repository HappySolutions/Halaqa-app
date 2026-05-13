import React, { useState } from 'react';
import { Plus, Trash2, UserPlus, Users } from 'lucide-react';
import { Student } from '@/types';
import { motion } from 'motion/react';

interface StudentManagerProps {
  students: Student[];
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function StudentManager({ students, onAdd, onRemove }: StudentManagerProps) {
  const [newName, setNewName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-emerald-600" />
          إدارة قائمة الطالبات
        </h2>

        <form onSubmit={handleAdd} className="flex gap-2 mb-8">
          <input
            type="text"
            required
            placeholder="اسم الطالبة الجديدة..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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
          {students.map((student) => (
            <motion.div
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
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

        {students.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            لا توجد أسماء مضافة حالياً
          </div>
        )}
      </div>
    </div>
  );
}
