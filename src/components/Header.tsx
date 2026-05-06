import React from 'react';
import { BookOpen, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  view: 'student' | 'admin';
  setView: (view: 'student' | 'admin') => void;
}

export function Header({ view, setView }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 h-16 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="hidden sm:inline text-xl font-bold text-slate-800">مُقرِئ | نظام المراجعة اليومي</span>
        <span className="sm:hidden text-base font-bold text-slate-800">مُقرِئ</span>
      </div>
      
      <nav className="flex bg-slate-100 rounded-lg p-1 shrink-0">
        <button
          onClick={() => setView('student')}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-md transition-all text-xs sm:text-sm font-medium",
            view === 'student' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <User className="w-4 h-4 shrink-0" />
          <span className="sm:hidden">تسجيل</span>
          <span className="hidden sm:inline">تسجيل المراجعة</span>
        </button>
        <button
          onClick={() => setView('admin')}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 rounded-md transition-all text-xs sm:text-sm font-medium",
            view === 'admin' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">لوحة الإشراف</span>
          <span className="sm:hidden">الإشراف</span>
        </button>
      </nav>
    </header>
  );
}
