export interface Halaqa {
  id: string;
  name: string;
  teacherName?: string;
  timestamp?: number;
  registrationLockTime?: string; // e.g. "19:00"
  nextDayRegStartTime?: string; // e.g. "22:30"
}

export interface Student {
  id: string;
  name: string;
  halaqaId: string;
  order?: number;
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  halaqaId: string;
  pagesReviewed: number;
  surahs: string;
  newSurah?: string;
  newPagesCount?: number;
  hasReviewed: boolean;
  isDeferred: boolean;
  isAbsent: boolean;
  absenceReason?: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  turnOrder?: number;
}

export type UpdateReportData = Partial<Omit<Report, 'id' | 'studentId' | 'studentName' | 'halaqaId'>>;

