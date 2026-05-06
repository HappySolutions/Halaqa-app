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
import { db } from './lib/firebase';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc,
  query,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState<'student' | 'admin'>('student');
  const [showSettings, setShowSettings] = useState(false);
  
  // Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data from Firebase
  useEffect(() => {
    // Check if Firebase is configured
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      console.warn('Firebase is not configured. Falling back to local state (read-only for demo).');
      setStudents(INITIAL_STUDENTS);
      setLoading(false);
      return;
    }

    const studentsQuery = query(collection(db, 'students'));
    const unsubscribeStudents = onSnapshot(studentsQuery, async (snapshot) => {
      // If students collection is empty, seed it with the initial students list
      if (snapshot.empty) {
        console.log('No students found, seeding Firestore with initial students...');
        for (const student of INITIAL_STUDENTS) {
          await addDoc(collection(db, 'students'), { name: student.name });
        }
        return; // The onSnapshot will fire again after seeding
      }
      const studentsData: Student[] = [];
      snapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as Student);
      });
      // Sort alphabetically by name (Arabic locale)
      studentsData.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
      setStudents(studentsData);
    }, (error) => {
      console.error("Error fetching students:", error);
    });

    // Auto-cleanup: delete reports older than 7 days (client-side filtering, no index needed)
    const cleanupOldReports = async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const cutoffDate = format(sevenDaysAgo, 'yyyy-MM-dd');
      const allReportsSnapshot = await getDocs(collection(db, 'reports'));
      allReportsSnapshot.forEach(async (document) => {
        const data = document.data();
        if (data.date && data.date < cutoffDate) {
          await deleteDoc(doc(db, 'reports', document.id));
        }
      });
    };
    cleanupOldReports();

    // Simple query with no ordering (sort client-side to avoid needing a composite index)
    const unsubscribeReports = onSnapshot(query(collection(db, 'reports')), (snapshot) => {
      const reportsData: Report[] = [];
      snapshot.forEach((document) => {
        const data = document.data();
        reportsData.push({
          ...data,
          id: document.id,
          timestamp: data.timestamp?.toMillis ? data.timestamp.toMillis() : (data.timestamp ?? 0)
        } as Report);
      });
      // Sort newest first client-side
      reportsData.sort((a, b) => b.timestamp - a.timestamp);
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeStudents();
      unsubscribeReports();
    };
  }, []);

  const handleAddReport = async (reportData: Omit<Report, 'id' | 'timestamp' | 'date' | 'isDeferred'>) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;

    try {
      await addDoc(collection(db, 'reports'), {
        ...reportData,
        timestamp: serverTimestamp(),
        date: format(new Date(), 'yyyy-MM-dd'),
        isDeferred: false,
      });
    } catch (error) {
      console.error("Error adding report: ", error);
      alert("حدث خطأ أثناء إرسال التقرير");
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (error) {
      console.error("Error deleting report: ", error);
    }
  };

  const handleToggleDeferred = async (id: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    const report = reports.find(r => r.id === id);
    if (!report) return;

    try {
      await updateDoc(doc(db, 'reports', id), {
        isDeferred: !report.isDeferred
      });
    } catch (error) {
      console.error("Error updating report: ", error);
    }
  };

  const handleClearToday = async () => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayReports = reports.filter(r => r.date === today);
    
    // Delete all reports for today
    for (const report of todayReports) {
      try {
        await deleteDoc(doc(db, 'reports', report.id));
      } catch (error) {
        console.error("Error clearing report: ", error);
      }
    }
  };

  const handleAddStudent = async (name: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await addDoc(collection(db, 'students'), { name });
    } catch (error) {
      console.error("Error adding student: ", error);
    }
  };

  const handleRemoveStudent = async (id: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (error) {
      console.error("Error deleting student: ", error);
    }
  };

  if (loading && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-600 selection:text-white">
      <Header view={view} setView={setView} />
      
      <main className="flex-grow py-8 px-4">
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
