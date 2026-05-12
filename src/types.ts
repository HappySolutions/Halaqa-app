
export interface Student {
  id: string;
  name: string;
}

export interface Report {
  id: string;
  studentId: string;
  studentName: string;
  pagesReviewed: number;
  surahs: string;
  hasReviewed: boolean;
  isDeferred: boolean;
  isAbsent: boolean;
  absenceReason?: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
}

export type UpdateReportData = Partial<Omit<Report, 'id' | 'studentId' | 'studentName'>>;

export const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'أروى السماني' },
  { id: '2', name: 'أسماء العسكري' },
  { id: '3', name: 'أسماء علي صالح' },
  { id: '4', name: 'أمل بلال الشهاري' },
  { id: '5', name: 'آية حسن محمد' },
  { id: '6', name: 'آية محمد عطيه' },
  { id: '7', name: 'إيمان فوزي علي' },
  { id: '8', name: 'إيمان محمد المجيدي' },
  { id: '9', name: 'بحريه العنزي' },
  { id: '10', name: 'بشرى يوسف الحريري' },
  { id: '11', name: 'تقي حسن' },
  { id: '12', name: 'حسناء سويدان' },
  { id: '13', name: 'حواء مهدي هارون' },
  { id: '14', name: 'خوله عبدالله' },
  { id: '15', name: 'رشا عمر لكبودي' },
  { id: '16', name: 'رميساء قليدو' },
  { id: '17', name: 'زكيه محمد هوساوي' },
  { id: '18', name: 'ساره البلوي' },
  { id: '19', name: 'ساره عبده عمر' },
  { id: '20', name: 'ساره مساعد' },
  { id: '21', name: 'ساره يوسف حسن' },
  { id: '22', name: 'ستنا الامين احمد' },
  { id: '23', name: 'سلام عبد السلام نوفل' },
  { id: '24', name: 'سلمي حافظ' },
  { id: '25', name: 'سميحه الحداد' },
  { id: '26', name: 'سميه يوجين اكرام' },
  { id: '27', name: 'شيخه سعيد المدحاني' },
  { id: '28', name: 'شيرين سامي' },
  { id: '29', name: 'ضحى يوسف بخش' },
  { id: '30', name: 'عبير احمد' },
  { id: '31', name: 'عبير الصعب' },
  { id: '32', name: 'عهود ثامر سياف' },
  { id: '33', name: 'فاطمه الربيع' },
  { id: '34', name: 'كوثر جمال الظاهر' },
  { id: '35', name: 'لطيفه العقيل' },
  { id: '36', name: 'لطيفه المطيري' },
  { id: '37', name: 'لمار بصفر' },
  { id: '38', name: 'لينا قرشي' },
  { id: '39', name: 'مؤته صالح' },
  { id: '40', name: 'مريم سلطان' },
  { id: '41', name: 'مريم مصطفي عمر' },
  { id: '42', name: 'مريم ميرغني' },
  { id: '43', name: 'مني سليمان محمد' },
  { id: '44', name: 'مي حامد سعد' },
  { id: '45', name: 'مياده نجم عبدالله' },
  { id: '46', name: 'ناديه الشلالي' },
  { id: '47', name: 'نوف ثابت' },
  { id: '48', name: 'هاجر محمد جبري احمد' },
  { id: '49', name: 'هبه عبد الماجد' },
  { id: '50', name: 'هدير حامد صقر' },
  { id: '51', name: 'هيفاء عادل' },
  { id: '52', name: 'وعد عمر القلعاوي' },
];
