/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StudentForm } from './components/StudentForm';
import { AdminPanel } from './components/AdminPanel';
import { StudentManager } from './components/StudentManager';
import { Report, Student, Halaqa, UpdateReportData } from './types';
import { format, addDays, getDay, parseISO } from 'date-fns';
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
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem('halaqa_admin_auth') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // Data State
  const [halaqat, setHalaqat] = useState<Halaqa[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle Admin Login
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'الحرم') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('halaqa_admin_auth', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem('halaqa_admin_auth');
    setView('student');
  };

  // Load Data from Firebase
  useEffect(() => {
    // Check if Firebase is configured
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) {
      setLoading(false);
      return;
    }

    const halaqatQuery = query(collection(db, 'halaqat'));
    const unsubscribeHalaqat = onSnapshot(halaqatQuery, (snapshot) => {
      const halaqatData: Halaqa[] = [];
      snapshot.forEach((doc) => {
        halaqatData.push({ id: doc.id, ...doc.data() } as Halaqa);
      });
      setHalaqat(halaqatData);
    });

    const studentsQuery = query(collection(db, 'students'));
    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      const studentsData: Student[] = [];
      snapshot.forEach((doc) => {
        studentsData.push({ id: doc.id, ...doc.data() } as Student);
      });
      // Sort by order first, then name
      studentsData.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name, 'ar');
      });
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
      // Sort: Date, then Category (Present first), then turnOrder/timestamp
      reportsData.sort((a, b) => {
        if (a.date === b.date) {
          // Present (isAbsent=false) should come before Absent (isAbsent=true)
          if (a.isAbsent !== b.isAbsent) return a.isAbsent ? 1 : -1;
          
          const valA = a.turnOrder !== undefined ? a.turnOrder : (1e15 + a.timestamp);
          const valB = b.turnOrder !== undefined ? b.turnOrder : (1e15 + b.timestamp);
          return valA - valB;
        }
        return b.timestamp - a.timestamp;
      });
      setReports(reportsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching reports:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeHalaqat();
      unsubscribeStudents();
      unsubscribeReports();
    };
  }, []);

  const handleAddReport = async (reportData: Omit<Report, 'id' | 'timestamp' | 'date' | 'isDeferred'>) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayReports = reports.filter(r => r.date === today && r.halaqaId === reportData.halaqaId);
      // Find the next logical turn order
      const maxTurn = todayReports.length > 0 ? Math.max(...todayReports.map(r => r.turnOrder ?? 0)) : 0;
      
      await addDoc(collection(db, 'reports'), {
        ...reportData,
        timestamp: serverTimestamp(),
        date: today,
        isDeferred: false,
        turnOrder: maxTurn + 1,
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
      const isNowDeferred = !report.isDeferred;
      let newDate = report.date;

      if (isNowDeferred) {
        // Calculate next working day
        const currentDate = parseISO(report.date);
        let nextDate = addDays(currentDate, 1);
        
        // Skip Friday (5) and Saturday (6)
        while (getDay(nextDate) === 5 || getDay(nextDate) === 6) {
          nextDate = addDays(nextDate, 1);
        }
        newDate = format(nextDate, 'yyyy-MM-dd');
      } else {
        // If un-deferring, move back to actual today
        newDate = format(new Date(), 'yyyy-MM-dd');
      }

      await updateDoc(doc(db, 'reports', id), {
        isDeferred: isNowDeferred,
        date: newDate,
        timestamp: serverTimestamp() // Update timestamp to reflect the move
      });
    } catch (error) {
      console.error("Error updating report: ", error);
    }
  };

  const handleUpdateReport = async (id: string, data: UpdateReportData) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await updateDoc(doc(db, 'reports', id), {
        ...data
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

  const handleResequenceReports = async (halaqaId: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayReports = reports.filter(r => r.date === today && r.halaqaId === halaqaId);
    
    const present = todayReports.filter(r => !r.isAbsent).sort((a, b) => {
      const valA = a.turnOrder !== undefined ? a.turnOrder : (1e15 + a.timestamp);
      const valB = b.turnOrder !== undefined ? b.turnOrder : (1e15 + b.timestamp);
      return valA - valB;
    });
    
    const absent = todayReports.filter(r => r.isAbsent).sort((a, b) => {
      const valA = a.turnOrder !== undefined ? a.turnOrder : (1e15 + a.timestamp);
      const valB = b.turnOrder !== undefined ? b.turnOrder : (1e15 + b.timestamp);
      return valA - valB;
    });

    try {
      // Update present sequence
      for (let i = 0; i < present.length; i++) {
        if (present[i].turnOrder !== i + 1) {
          await updateDoc(doc(db, 'reports', present[i].id), { turnOrder: i + 1 });
        }
      }
      
      // Update absent sequence
      for (let i = 0; i < absent.length; i++) {
        if (absent[i].turnOrder !== i + 1) {
          await updateDoc(doc(db, 'reports', absent[i].id), { turnOrder: i + 1 });
        }
      }
    } catch (error) {
      console.error("Error resequencing reports: ", error);
    }
  };

  const handleAddHalaqa = async (name: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await addDoc(collection(db, 'halaqat'), { 
        name,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding halaqa: ", error);
    }
  };

  const handleDeleteHalaqa = async (id: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      await deleteDoc(doc(db, 'halaqat', id));
    } catch (error) {
      console.error("Error deleting halaqa: ", error);
    }
  };

  const handleAddStudent = async (name: string, halaqaId: string) => {
    if (!import.meta.env.VITE_FIREBASE_PROJECT_ID) return;
    try {
      // Get the highest order for this specific halaqa
      const halaqaStudents = students.filter(s => s.halaqaId === halaqaId);
      const maxOrder = halaqaStudents.length > 0 ? Math.max(...halaqaStudents.map(s => s.order || 0)) : -1;
      await addDoc(collection(db, 'students'), { 
        name,
        halaqaId,
        order: maxOrder + 1
      });
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
              <StudentForm 
                students={students} 
                reports={reports} 
                halaqat={halaqat}
                onSubmit={handleAddReport} 
                onUpdate={handleUpdateReport}
              />
            </motion.div>
          ) : (
            <motion.div
              key="admin-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {!isAdminAuthenticated ? (
                <div className="max-w-md mx-auto pt-12">
                  <motion.form 
                    onSubmit={handleAdminLogin}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="spiritual-card p-8 space-y-6 text-center"
                  >
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Settings className="w-8 h-8 text-slate-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">منطقة الإشراف</h2>
                      <p className="text-sm text-slate-500 mt-1">يرجى إدخال كلمة المرور للمتابعة</p>
                    </div>
                    <div className="space-y-2">
                      <input 
                        autoFocus
                        type="password" 
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="كلمة المرور..."
                        className={cn(
                          "w-full h-12 bg-slate-50 border rounded-xl px-4 text-center text-lg focus:ring-2 outline-none transition-all",
                          passwordError ? "border-red-500 ring-red-100" : "border-slate-200 focus:ring-emerald-500/20 focus:border-emerald-500"
                        )}
                      />
                      {passwordError && (
                        <p className="text-xs text-red-500 font-bold">كلمة المرور غير صحيحة!</p>
                      )}
                    </div>
                    <button 
                      type="submit"
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition-all shadow-lg"
                    >
                      دخول الصلاحيات
                    </button>
                  </motion.form>
                </div>
              ) : (
                <>
                  <div className="max-w-6xl mx-auto flex justify-end px-4 sm:px-8">
                    <button 
                      onClick={handleAdminLogout}
                      className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-all uppercase tracking-widest"
                    >
                      تسجيل خروج المشرفة
                    </button>
                  </div>
                  <AdminPanel 
                    reports={reports} 
                    students={students} 
                    halaqat={halaqat}
                    onDeleteReport={handleDeleteReport}
                    onToggleDeferred={handleToggleDeferred}
                    onUpdateReport={handleUpdateReport}
                    onResequenceReports={handleResequenceReports}
                    onClearAll={handleClearToday}
                  />
                  
                  <div className="max-w-4xl mx-auto px-4 sm:px-8">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold transition-all text-sm"
                    >
                      <Settings className={cn("w-4 h-4", showSettings ? "rotate-90 transition-transform" : "")} />
                      <span>{showSettings ? 'إخفاء إدارة الحلقات والأسماء' : 'إدارة الحلقات والأسماء'}</span>
                    </button>
                    
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 overflow-hidden"
                      >
                         <StudentManager 
                           students={students} 
                           halaqat={halaqat}
                           onAddHalaqa={handleAddHalaqa}
                           onDeleteHalaqa={handleDeleteHalaqa}
                           onAdd={handleAddStudent} 
                           onRemove={handleRemoveStudent} 
                         />
                      </motion.div>
                    )}
                  </div>
                </>
              )}
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
