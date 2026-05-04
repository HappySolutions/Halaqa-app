/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentForm } from './components/StudentForm';
import { AdminPanel } from './components/AdminPanel';
import { StudentManager } from './components/StudentManager';
import { Student, Report, INITIAL_STUDENTS } from './types';
import { format } from 'date-fns';
import { Settings, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [showSettings, setShowSettings] = useState(false);
  
  // Data State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('quran_students');
    const parsed = saved ? JSON.parse(saved) : [];
    // If we have no students or just the old test students, force the new INITIAL_STUDENTS
    if (parsed.length === 0 || (parsed.length === 5 && parsed[0].name === 'خديجة محمد')) {
      return INITIAL_STUDENTS;
    }
    return parsed;
  });

  const [reports, setReports] = useState<Report[]>(() => {
    const saved = localStorage.getItem('quran_reports');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist Data
  useEffect(() => {
    localStorage.setItem('quran_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('quran_reports', JSON.stringify(reports));
  }, [reports]);

  const handleAddReport = (reportData: Omit<Report, 'id' | 'timestamp' | 'date' | 'isDeferred'>) => {
    const newReport: Report = {
      ...reportData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      date: format(new Date(), 'yyyy-MM-dd'),
      isDeferred: false,
    };
    setReports(prev => [newReport, ...prev]);
  };

  const handleDeleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
  };

  const handleToggleDeferred = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, isDeferred: !r.isDeferred } : r));
  };

  const handleClearToday = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    setReports(prev => prev.filter(r => r.date !== today));
  };

  const handleAddStudent = (name: string) => {
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name,
    };
    setStudents(prev => [...prev, newStudent]);
  };

  const handleRemoveStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-600 selection:text-white">
      <Header view={view} setView={setView} />
      
      <main className="flex-grow py-8 px-4 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {view === 'student' ? (
            <motion.div
              key="student-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <StudentForm students={students} onSubmit={handleAddReport} />
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <AdminPanel 
                reports={reports} 
                students={students} 
                onDeleteReport={handleDeleteReport}
                onToggleDeferred={handleToggleDeferred}
                onClearAll={handleClearToday}
              />
              
              <div className="max-w-4xl mx-auto px-4 sm:px-8">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-all text-sm"
                >
                  <Settings className={cn("w-4 h-4", showSettings ? "rotate-90 transition-transform" : "")} />
                  <span>{showSettings ? 'إخفاء إدارة الأسماء' : 'إدارة قائمة الأسماء'}</span>
                </button>
                
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden mt-4"
                  >
                    <StudentManager 
                      students={students} 
                      onAdd={handleAddStudent} 
                      onRemove={handleRemoveStudent} 
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="py-8 px-4 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-2">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <span>صُنع بصِدق لخدمة أهل القرآن</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            © {new Date().getFullYear()} مُقرِئ - نظام تنظيم حلقات التحفيظ
          </p>
        </div>
      </footer>
    </div>
  );
}
