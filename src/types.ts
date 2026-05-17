export interface Halaqa {
  id: string;
  name: string;
  teacherName?: string;
  timestamp?: number;
  registrationLockTime?: string; // Time to stop registration (HH:MM)
  nextDayRegStartTime?: string; // Time to start next day's registration (HH:MM)
  password?: string; // Optional password for the halaqa's teacher
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
  hasReviewed: boolean;
  isDeferred: boolean;
  isAbsent: boolean;
  absenceReason?: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  turnOrder?: number;
  isDeleted?: boolean;
}

export type UpdateReportData = Partial<Omit<Report, 'id' | 'studentId' | 'studentName' | 'halaqaId'>>;

