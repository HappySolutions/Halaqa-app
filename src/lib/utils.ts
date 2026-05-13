import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { format, addDays, getDay } from 'date-fns';
import { Halaqa } from '../types';

export const getNextWorkingDay = (currentDate: Date) => {
  let next = addDays(currentDate, 1);
  // Skip Friday (5) and Saturday (6)
  while (getDay(next) === 5 || getDay(next) === 6) {
    next = addDays(next, 1);
  }
  return next;
};

export const getEffectiveDateForHalaqa = (halaqa?: Halaqa) => {
  const ksaString = new Date().toLocaleString("en-US", { timeZone: "Asia/Riyadh" });
  const ksaDate = new Date(ksaString);
  const ksaHours = ksaDate.getHours();
  const ksaMinutes = ksaDate.getMinutes();

  const nextDayStart = halaqa?.nextDayRegStartTime || "22:30";
  const [limitH, limitM] = nextDayStart.split(':').map(Number);

  let effectiveDate = format(ksaDate, 'yyyy-MM-dd');

  if (ksaHours > limitH || (ksaHours === limitH && ksaMinutes >= limitM)) {
    effectiveDate = format(getNextWorkingDay(ksaDate), 'yyyy-MM-dd');
  }

  return effectiveDate;
};

