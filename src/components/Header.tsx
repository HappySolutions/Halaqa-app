import React from 'react';
import { BookOpen, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  view: 'student' | 'admin';
  setView: (view: 'student' | 'admin') => void;
}

export function Header({ view, setView }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-8 h-16 flex items-center justify-between shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800">مُقرِئ | نظام المراجعة اليومي</span>
      </div>
      
      <nav className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setView('student')}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm font-medium",
            view === 'student' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <User className="w-4 h-4" />
          <span>تسجيل المراجعة</span>
        </button>
        <button
          onClick={() => setView('admin')}
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm font-medium",
            view === 'admin' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>لوحة الإشراف</span>
        </button>
      </nav>
    </header>
  );
}
